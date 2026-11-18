import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
if (!process.env.GEMINI_API_KEY) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

export class GeminiConfigError extends Error {
  constructor(message = 'Gemini API key is not configured. Please set GEMINI_API_KEY in placement-backend/.env') {
    super(message);
    this.name = 'GeminiConfigError';
    this.code = 'GEMINI_KEY_MISSING';
    this.statusCode = 503;
  }
}

let cachedClient = null;
let lastApiKey = null;

/**
 * Checks whether GEMINI_API_KEY is defined and non-empty
 */
export const isGeminiConfigured = () => {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key.trim().length > 0 && key !== 'your_api_key_here');
};

/**
 * Returns the configured Gemini model name
 * Supported models: 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash', etc.
 */
export const getGeminiModel = () => {
  return process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
};

/**
 * Returns the singleton GoogleGenAI client instance
 * Throws GeminiConfigError if API key is not set
 */
export const getGeminiClient = () => {
  if (!isGeminiConfigured()) {
    throw new GeminiConfigError();
  }

  const currentKey = process.env.GEMINI_API_KEY.trim();
  if (!cachedClient || lastApiKey !== currentKey) {
    cachedClient = new GoogleGenAI({ apiKey: currentKey });
    lastApiKey = currentKey;
  }

  return cachedClient;
};

/**
 * Diagnostics and Health Check
 */
export const checkGeminiHealth = async (overrideModel = null) => {
  const model = overrideModel || getGeminiModel();
  if (!isGeminiConfigured()) {
    return {
      configured: false,
      model,
      message: 'GEMINI_API_KEY is not set in backend environment variables'
    };
  }

  try {
    const ai = getGeminiClient();
    const res = await ai.models.generateContent({
      model,
      contents: 'Respond with the single word "OK" for health check.'
    });

    const responseText = (res.text || '').trim();
    return {
      configured: true,
      model,
      healthy: true,
      sampleResponse: responseText
    };
  } catch (error) {
    return {
      configured: true,
      model,
      healthy: false,
      error: error.message
    };
  }
};
