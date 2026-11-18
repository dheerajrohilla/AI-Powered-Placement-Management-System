import { getGeminiClient, isGeminiConfigured, getGeminiModel, GeminiConfigError } from '../config/gemini.js';

/**
 * Ordered candidate models for automatic failover when a model's free quota is exhausted or deprecated
 */
export const CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.8-flash'
];

/**
 * Cleans markdown code fences (```json ... ```) and extracts valid JSON
 */
export const cleanAndParseJSON = (rawText) => {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Invalid or empty text response for JSON parsing');
  }

  let text = rawText.trim();

  // Strip markdown code fences if present
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '').trim();
  }

  // Find first { or [ and last } or ]
  let startIndex = text.indexOf('{');
  let endIndex = text.lastIndexOf('}');
  const arrayStart = text.indexOf('[');

  if (arrayStart !== -1 && (startIndex === -1 || arrayStart < startIndex)) {
    startIndex = arrayStart;
    endIndex = text.lastIndexOf(']');
  }

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    text = text.slice(startIndex, endIndex + 1);
  }

  try {
    return JSON.parse(text);
  } catch (parseErr) {
    // Attempt cleaning trailing commas and smart quotes
    const fixed = text
      .replace(/,\s*([}\]])/g, '$1')
      .replace(/[\u201C\u201D]/g, '"');
    try {
      return JSON.parse(fixed);
    } catch {
      throw new Error(`Failed to parse structured JSON from Gemini response: ${parseErr.message}\nRaw Text snippet: ${rawText.slice(0, 150)}...`);
    }
  }
};

/**
 * Retry helper with exponential backoff for transient API errors
 */
async function callWithRetry(fn, maxRetries = 2, initialDelayMs = 1000) {
  let delay = initialDelayMs;
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const status = error?.status || error?.statusCode || error?.response?.status;
      const msg = (error?.message || '').toLowerCase();

      const isRateLimit = status === 429 || msg.includes('quota') || msg.includes('rate limit') || msg.includes('resource_exhausted');
      const isTransient = status === 503 || status === 500 || msg.includes('overloaded') || msg.includes('econnreset') || msg.includes('etimedout');

      if ((isRateLimit || isTransient) && attempt < maxRetries) {
        console.warn(`[Gemini API] Transient error (${status || msg}). Retrying attempt ${attempt + 1}/${maxRetries} in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
        continue;
      }

      break;
    }
  }

  throw lastError;
}

/**
 * Helper to build candidate list with preferred model first
 */
function getModelCandidateList(preferredModel = null) {
  const primary = preferredModel || getGeminiModel();
  const others = CANDIDATE_MODELS.filter(m => m !== primary);
  return [primary, ...others];
}

/**
 * Generates plain text response using Gemini with automatic model failover
 */
export const generateText = async ({
  prompt,
  systemInstruction = 'You are an expert AI Placement Officer and technical interview coach.',
  model = null,
  temperature = 0.7,
  maxOutputTokens = 2048,
  timeoutMs = 45000
}) => {
  if (!isGeminiConfigured()) {
    throw new GeminiConfigError();
  }

  const ai = getGeminiClient();
  const candidates = getModelCandidateList(model);
  let lastError;

  for (const selectedModel of candidates) {
    try {
      return await callWithRetry(async () => {
        const config = {
          systemInstruction,
          temperature,
          maxOutputTokens
        };

        const res = await Promise.race([
          ai.models.generateContent({
            model: selectedModel,
            contents: prompt,
            config
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Gemini API request timed out after ${timeoutMs}ms`)), timeoutMs)
          )
        ]);

        const output = (res.text || '').trim();
        if (!output) {
          throw new Error('Gemini API returned an empty text response');
        }

        return output;
      });
    } catch (err) {
      lastError = err;
      const msg = (err?.message || '').toLowerCase();
      const isQuotaOrNotFound = err?.status === 429 || err?.status === 404 || msg.includes('quota') || msg.includes('not_found') || msg.includes('resource_exhausted');
      if (isQuotaOrNotFound && selectedModel !== candidates[candidates.length - 1]) {
        console.warn(`[Gemini Service] Model ${selectedModel} returned ${err?.status || 'quota/availability error'}. Failing over to next candidate...`);
        continue;
      }
      throw err;
    }
  }

  throw lastError;
};

/**
 * Generates validated JSON output using Gemini with automatic model failover
 */
export const generateJSON = async ({
  prompt,
  systemInstruction = 'You are an expert AI Placement Officer and technical recruiter. Output ONLY strictly valid JSON matching the requested structure.',
  model = null,
  temperature = 0.2,
  maxOutputTokens = 4096,
  timeoutMs = 45000
}) => {
  if (!isGeminiConfigured()) {
    throw new GeminiConfigError();
  }

  const ai = getGeminiClient();
  const candidates = getModelCandidateList(model);
  let lastError;

  for (const selectedModel of candidates) {
    try {
      return await callWithRetry(async () => {
        const config = {
          systemInstruction,
          temperature,
          maxOutputTokens,
          responseMimeType: 'application/json'
        };

        const res = await Promise.race([
          ai.models.generateContent({
            model: selectedModel,
            contents: prompt,
            config
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Gemini API request timed out after ${timeoutMs}ms`)), timeoutMs)
          )
        ]);

        const output = (res.text || '').trim();
        return cleanAndParseJSON(output);
      });
    } catch (err) {
      lastError = err;
      const msg = (err?.message || '').toLowerCase();
      const isQuotaOrNotFound = err?.status === 429 || err?.status === 404 || msg.includes('quota') || msg.includes('not_found') || msg.includes('resource_exhausted');
      if (isQuotaOrNotFound && selectedModel !== candidates[candidates.length - 1]) {
        console.warn(`[Gemini Service] Model ${selectedModel} returned ${err?.status || 'quota/availability error'}. Failing over to next candidate for JSON...`);
        continue;
      }
      throw err;
    }
  }

  throw lastError;
};

/**
 * Chat conversation helper for multi-turn dialogues (AI Copilot)
 */
export const generateChatReply = async ({
  messages = [], // [{ role: 'user' | 'model' | 'assistant', text: string }]
  systemInstruction = 'You are CampusAI Copilot, an intelligent placement and learning assistant.',
  model = null,
  temperature = 0.5,
  maxOutputTokens = 2048,
  timeoutMs = 15000
}) => {
  if (!isGeminiConfigured()) {
    throw new GeminiConfigError();
  }

  const ai = getGeminiClient();
  const candidates = getModelCandidateList(model);
  let lastError;

  // Sanitize and alternate messages for Google GenAI:
  // Must start with 'user' and alternate between 'user' and 'model'
  const sanitizedContents = [];
  for (const m of messages) {
    const role = (m.role === 'assistant' || m.role === 'model') ? 'model' : 'user';
    const text = (m.text || '').trim();
    if (!text) continue;

    if (sanitizedContents.length === 0) {
      if (role === 'user') {
        sanitizedContents.push({ role: 'user', parts: [{ text }] });
      }
    } else {
      const prev = sanitizedContents[sanitizedContents.length - 1];
      if (prev.role === role) {
        prev.parts[0].text += `\n\n${text}`;
      } else {
        sanitizedContents.push({ role, parts: [{ text }] });
      }
    }
  }

  if (sanitizedContents.length === 0) {
    throw new Error('Chat messages array cannot be empty');
  }

  for (const selectedModel of candidates) {
    try {
      return await callWithRetry(async () => {
        const config = {
          systemInstruction,
          temperature,
          maxOutputTokens
        };

        const res = await Promise.race([
          ai.models.generateContent({
            model: selectedModel,
            contents: sanitizedContents,
            config
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Gemini API request timed out after ${timeoutMs}ms`)), timeoutMs)
          )
        ]);

        const output = (res.text || '').trim();
        if (!output) {
          throw new Error('Gemini API returned an empty text response');
        }
        return output;
      }, 1, 500);
    } catch (err) {
      lastError = err;
      const msg = (err?.message || '').toLowerCase();
      const isQuotaOrNotFound = err?.status === 429 || err?.status === 404 || msg.includes('quota') || msg.includes('not_found') || msg.includes('resource_exhausted');
      if (isQuotaOrNotFound && selectedModel !== candidates[candidates.length - 1]) {
        console.warn(`[Gemini Service] Model ${selectedModel} returned ${err?.status || 'quota error'}. Failing over for chat reply...`);
        continue;
      }
      throw err;
    }
  }

  throw lastError;
};

export { isGeminiConfigured, getGeminiModel };
