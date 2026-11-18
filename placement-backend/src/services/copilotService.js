import { generateChatReply, generateText, isGeminiConfigured } from './geminiService.js';
import { processChatQuery as fallbackProcessChat } from '../utils/placementChatbot.js';

/**
 * AI Chatbot Copilot: Context-aware conversational assistant powered by Gemini.
 * Follows strict production principles:
 * - Direct, precise answers (main point first, 2-6 sentences for standard queries)
 * - Multi-turn conversational memory with follow-up awareness
 * - Verified campus database ground truth without hallucination
 * - Rich markdown formatting (code blocks with syntax highlighting, bullet points)
 * - Accurate code, calculations, and structured comparisons
 */
export const answerCopilotQuery = async ({
  message = '',
  chatHistory = [],
  student = null,
  user = null,
  drives = [],
  applications = [],
  interviews = []
}) => {
  const query = (message || '').trim();

  // If Gemini is not configured, route directly to the deterministic knowledge engine
  if (!isGeminiConfigured()) {
    return await fallbackProcessChat({
      message: query,
      student,
      user,
      drives,
      applications,
      interviews
    });
  }

  const studentName = user?.name || 'Student';
  const department = student?.department || 'Engineering';
  const cgpa = student?.cgpa !== undefined && student?.cgpa !== null ? student.cgpa : 'Not provided';
  const skills = (student?.skills || []).join(', ') || 'None listed yet';
  const atsScore = student?.atsScore !== undefined ? `${student.atsScore}%` : 'Not evaluated';
  const hasResume = Boolean(student?.resume);
  const targetRole = student?.targetRole || 'Software Development Engineer';

  // Build verified portal data strings
  const activeDrivesList = (drives || []).map(d => {
    const pkg = d.salary ? `₹${(d.salary / 100000).toFixed(1)} LPA` : 'Competitive';
    const minCgpa = d.eligibility?.minCGPA || 0;
    const depts = (d.eligibility?.departments || []).join(', ') || 'All Branches';
    const deadline = d.registrationDeadline ? new Date(d.registrationDeadline).toLocaleDateString() : 'Open';
    const location = d.location || 'Pan India';
    const reqs = (d.requirements || []).join(', ') || 'General CS fundamentals';
    return `• Company: ${d.company?.companyName || 'Recruiter'} | Role: ${d.jobRole || d.title} | Package: ${pkg} | Location: ${location} | Min CGPA: ${minCgpa} | Eligible Branches: ${depts} | Key Skills: ${reqs} | Deadline: ${deadline}`;
  });

  const driveContext = activeDrivesList.length > 0
    ? activeDrivesList.join('\n')
    : 'No active placement drives currently posted in the campus portal database.';

  const activeApplicationsList = (applications || []).map(a => {
    const comp = a.company?.companyName || 'Company';
    const role = a.placementDrive?.jobRole || a.placementDrive?.title || 'Role';
    return `• Company: ${comp} | Role: ${role} | Status: "${a.status}"`;
  });

  const applicationContext = activeApplicationsList.length > 0
    ? activeApplicationsList.join('\n')
    : 'No applications submitted by this student yet.';

  const activeInterviewsList = (interviews || []).map(i => {
    const comp = i.company?.companyName || 'Company';
    const dateStr = i.scheduledDate ? new Date(i.scheduledDate).toLocaleString() : 'Date TBD';
    const round = i.round ? i.round.toUpperCase() : 'TECHNICAL';
    const linkStr = i.joinLink ? ` (Meeting Link: ${i.joinLink})` : '';
    return `• Company: ${comp} | Round: ${round} | Scheduled: ${dateStr} | Status: "${i.status || 'scheduled'}"${linkStr}`;
  });

  const interviewContext = activeInterviewsList.length > 0
    ? activeInterviewsList.join('\n')
    : 'No scheduled interviews for this student in the portal database.';

  const systemInstruction = `You are CampusAI Copilot, an intelligent campus placement and learning assistant in an AI-Powered Placement Management System.

Your primary goal is to provide accurate, reliable, direct, and conversational responses to students.

### RESPONSE RULES:
1. **Answer Directness**: Answer the exact question asked. Always give the main answer in the very first sentence or paragraph.
2. **Conciseness**: For ordinary conceptual or conversational questions, keep your answer crisp and focused (typically 2 to 6 sentences). Do NOT add redundant fluff, boilerplate intros ("Sure, I can help with that"), or repetitive summaries.
3. **Structured Explanations**: Use clean bullet points or numbered lists for multi-step processes, key components, or comparisons.
4. **Code & Technical Answers**: For coding questions, provide clean, runnable code in markdown code blocks (\`\`\`language ... \`\`\`), followed by 1–3 bullet points explaining the core mechanism and big-O time/space complexity.
5. **Mathematical & Aptitude Questions**: State the final numerical answer first, then provide clear, step-by-step calculations.
6. **Yes/No Questions**: Begin explicitly with "Yes" or "No", followed by a brief 1-2 sentence justification.
7. **Detailed Requests**: When a user explicitly asks for "detailed", "in-depth", or "comprehensive" explanations or roadmaps, provide a complete, well-structured breakdown.
8. **Follow-ups & Context**: Use conversation history to understand follow-up questions ("explain the second point", "give an example", "why?", "how does it work?").
9. **Truthfulness & Data Integrity**:
   - For campus placement queries (drives, eligibility, applications, interviews, ATS score), rely STRICTLY on the Verified Portal Data below.
   - NEVER fabricate placement statistics, companies, packages, deadlines, or student records.
   - If information is not in the database or outside your scope, state the limitation clearly: "This information is not recorded in the campus placement portal."
10. **Follow-up Suggestions**: At the very end of your response, always provide 3 brief, highly relevant next-step suggestions formatted strictly as:
[SUGGESTIONS]
- Suggestion 1
- Suggestion 2
- Suggestion 3
[/SUGGESTIONS]

### VERIFIED PORTAL DATA (GROUND TRUTH):
- Student Profile: Name: ${studentName} | Department: ${department} | CGPA: ${cgpa} | Target Role: ${targetRole} | Registered Skills: ${skills} | ATS Score: ${atsScore} | Resume Uploaded: ${hasResume}
- Active Campus Placement Drives (${drives.length} total):
${driveContext}
- Student Active Applications (${applications.length} total):
${applicationContext}
- Student Upcoming Interviews (${interviews.length} total):
${interviewContext}
`;

  // Format clean multi-turn messages array from conversation history
  const cleanMessages = [];
  (chatHistory || [])
    .filter(m => {
      const text = (m.text || '').trim();
      return !text.startsWith('### 👋 Welcome') && !text.startsWith('### 👋 Hello');
    })
    .slice(-6)
    .forEach(m => {
      // Clean previous suggestion tags from history so they don't clutter context
      let cleanText = (m.text || '')
        .replace(/\[SUGGESTIONS\][\s\S]*?\[\/SUGGESTIONS\]/gi, '')
        .replace(/---SUGGESTIONS---[\s\S]*$/gi, '')
        .trim();
      if (cleanText) {
        cleanMessages.push({
          role: m.sender === 'user' ? 'user' : 'model',
          text: cleanText
        });
      }
    });

  // Append current user message
  cleanMessages.push({
    role: 'user',
    text: query
  });

  try {
    const rawReply = await generateChatReply({
      messages: cleanMessages,
      systemInstruction,
      temperature: 0.4,
      timeoutMs: 15000
    });

    let reply = rawReply;
    let suggestions = [];

    // Parse [SUGGESTIONS] ... [/SUGGESTIONS] (or variations/typos)
    const suggestionsMatch = rawReply.match(/\[SUGGESTIONS?\]([\s\S]*?)(?:\[\/?SUG[a-z]*\]|$)/i);
    if (suggestionsMatch) {
      reply = rawReply.replace(/\[SUGGESTIONS?\][\s\S]*$/i, '').trim();
      suggestions = suggestionsMatch[1]
        .split('\n')
        .map(s => s.replace(/^[-*•\d.]+\s*/, '').replace(/\[\/?SUG[a-z]*\]/i, '').trim())
        .filter(Boolean)
        .slice(0, 3);
    } else if (rawReply.includes('---SUGGESTIONS---')) {
      const parts = rawReply.split('---SUGGESTIONS---');
      reply = parts[0].trim();
      suggestions = parts[1]
        .split('\n')
        .map(s => s.replace(/^[-*•\d.]+\s*/, '').trim())
        .filter(Boolean)
        .slice(0, 3);
    }

    if (suggestions.length === 0) {
      suggestions = [
        'How can I improve my resume ATS score?',
        'Give me 5 medium-level DSA practice questions',
        'Am I eligible for active placement drives?'
      ];
    }

    return {
      reply,
      suggestions,
      isAiPowered: true
    };
  } catch (err) {
    console.warn(`[Copilot Service] Gemini call failed (${err.message}). Using fallback placement knowledge engine.`);
    return await fallbackProcessChat({
      message: query,
      student,
      user,
      drives,
      applications,
      interviews
    });
  }
};
