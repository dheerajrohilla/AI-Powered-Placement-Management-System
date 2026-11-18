import { generateJSON, isGeminiConfigured } from './geminiService.js';
import {
  generateCompanyMockInterview as fallbackGenerateInterview,
  evaluateAnswer as fallbackEvaluateAnswer,
  calculatePlacementScore as fallbackCalculatePlacementScore
} from '../utils/mockInterviewEngine.js';

/**
 * Generates an initial interview question set tailored to the company, role, and JD
 */
export const generateInterviewSessionWithAI = async (drive = {}, customRole = 'Software Engineer') => {
  const baseResult = fallbackGenerateInterview(drive, customRole);

  if (!isGeminiConfigured()) {
    return { ...baseResult, isAiPowered: false };
  }

  const companyName = drive?.company?.companyName || drive?.title || 'Tech Enterprise';
  const requirements = drive?.requirements || ['DSA', 'OOP', 'SQL', 'System Design'];
  const jobRole = customRole || drive?.jobRole || 'Software Development Engineer';

  const prompt = `
Generate a structured, realistic campus placement interview question set for a candidate interviewing for "${jobRole}" at "${companyName}".

Company / Drive Details:
- Requirements: ${requirements.join(', ')}
- Description: ${drive?.description || 'Campus hiring for engineering graduate'}

Generate 5 progressive interview questions:
1. One Icebreaker / Resume Project Deep Dive (category: "behavioral")
2. One Core Programming / OOP / Language Internals question (category: "technical", topic: "Core CS")
3. One DSA / Problem Solving scenario (category: "coding", topic: "DSA")
4. One Database / SQL / Backend Architecture question (category: "sql_problem" or "technical", topic: "DBMS")
5. One System Design or Situational / Behavioral question (category: "system_design" or "behavioral")

For each question, provide:
- questionId: unique string (e.g. "q1", "q2")
- question: clear, professional prompt as asked by an experienced interviewer
- category: "technical" | "behavioral" | "coding" | "sql_problem" | "system_design"
- topic: string (e.g. "DSA", "Java", "SQL", "Projects")
- difficulty: "easy" | "medium" | "hard"
- expectedKeyPoints: array of 4-6 key concepts the interviewer looks for
- modelAnswer: complete, articulate model response

Return JSON in this format:
{
  "targetRole": "${jobRole}",
  "companyName": "${companyName}",
  "jdRequirements": ${JSON.stringify(requirements)},
  "questions": [
    {
      "questionId": "q1",
      "question": "...",
      "category": "...",
      "topic": "...",
      "difficulty": "medium",
      "expectedKeyPoints": ["..."],
      "modelAnswer": "..."
    }
  ]
}
`;

  try {
    const aiResult = await generateJSON({
      prompt,
      systemInstruction: 'You are an executive technical interviewer from a top tech company conducting campus placement interviews.'
    });

    if (Array.isArray(aiResult.questions) && aiResult.questions.length > 0) {
      return {
        targetRole: aiResult.targetRole || jobRole,
        companyName: aiResult.companyName || companyName,
        jdRequirements: aiResult.jdRequirements || requirements,
        questions: aiResult.questions.map((q, i) => ({
          questionId: q.questionId || `q-${i + 1}`,
          question: q.question,
          category: q.category || 'technical',
          topic: q.topic || 'General',
          difficulty: q.difficulty || 'medium',
          expectedKeyPoints: q.expectedKeyPoints || [],
          modelAnswer: q.modelAnswer || '',
          studentAnswer: '',
          score: 0,
          feedback: '',
          strengths: [],
          missingPoints: [],
          isAnswered: false
        })),
        isAiPowered: true
      };
    }
    return { ...baseResult, isAiPowered: false };
  } catch (err) {
    console.warn(`[Interview Service] Gemini question generation failed (${err.message}). Using fallback question bank.`);
    return { ...baseResult, isAiPowered: false };
  }
};

/**
 * Evaluates candidate answer in real-time, providing immediate feedback and selecting follow-up
 */
export const evaluateInterviewAnswerWithAI = async ({
  question = {},
  studentAnswer = '',
  conversationHistory = [],
  companyName = 'Company'
}) => {
  const answer = (studentAnswer || '').trim();
  const baseResult = fallbackEvaluateAnswer(question, studentAnswer);

  if (!isGeminiConfigured() || !answer || answer.length < 5) {
    return { ...baseResult, isAiPowered: false };
  }

  const prompt = `
You are the lead technical interviewer at ${companyName}. Evaluate this candidate's live answer to the question below:

Question: "${question.question}"
Topic: ${question.topic || 'General'}
Category: ${question.category || 'technical'}
Expected Key Points: ${JSON.stringify(question.expectedKeyPoints || [])}
Model Answer Reference: "${question.modelAnswer || ''}"

Candidate Answer:
"""
${answer}
"""

Evaluation Criteria:
1. Technical correctness and accuracy.
2. Clarity, articulation, and problem-solving reasoning.
3. Depth of explanation and awareness of trade-offs.
4. Score out of 100 based on realistic technical interview standards.
5. Identify specific strengths and critical missing points.
6. Generate 1 relevant conversational follow-up question to probe deeper (or test an edge case).

Return JSON in this format:
{
  "score": <number 0-100>,
  "feedback": "Constructive 2-3 sentence interview feedback",
  "strengths": ["..."],
  "missingPoints": ["..."],
  "followUpQuestion": "...",
  "interviewerNotes": "Internal assessment note"
}
`;

  try {
    const aiEval = await generateJSON({
      prompt,
      systemInstruction: 'You are an empathetic yet rigorous technical interviewer evaluating campus job candidates.'
    });

    return {
      score: Math.max(0, Math.min(100, Number(aiEval.score) || baseResult.score)),
      feedback: aiEval.feedback || baseResult.feedback,
      strengths: Array.isArray(aiEval.strengths) ? aiEval.strengths : baseResult.strengths,
      missingPoints: Array.isArray(aiEval.missingPoints) ? aiEval.missingPoints : baseResult.missingPoints,
      followUpQuestion: aiEval.followUpQuestion || null,
      modelAnswer: question.modelAnswer || baseResult.modelAnswer,
      isAiPowered: true
    };
  } catch (err) {
    console.warn(`[Interview Service] Gemini answer evaluation failed (${err.message}). Using rubric fallback.`);
    return { ...baseResult, isAiPowered: false };
  }
};

/**
 * Calculates final interview report, topic breakdown, and readiness summary
 */
export const calculateFinalInterviewReportWithAI = async (interviewDoc = {}) => {
  const baseScores = fallbackCalculatePlacementScore(interviewDoc);

  if (!isGeminiConfigured()) {
    return { ...baseScores, isAiPowered: false };
  }

  const answeredQuestions = (interviewDoc.questions || []).filter(q => q.isAnswered);
  if (answeredQuestions.length === 0) {
    return { ...baseScores, isAiPowered: false };
  }

  const prompt = `
Generate a comprehensive final interview performance evaluation report for this candidate:

Target Role: ${interviewDoc.targetRole || 'Software Engineer'}
Company: ${interviewDoc.companyName || 'Campus Placement'}
Average Score: ${baseScores.overallScore}/100

Detailed Question Performance:
${answeredQuestions.map((q, i) => `Q${i + 1} (${q.topic}): "${q.question}"\nCandidate Score: ${q.score}/100\nFeedback: ${q.feedback}\nStrengths: ${(q.strengths || []).join(', ')}\nMissing: ${(q.missingPoints || []).join(', ')}`).join('\n\n')}

Requirements:
1. Provide a professional overall readiness status: "Ready for Technical Rounds" (score >= 78), "Moderate Readiness - Target Gaps" (60-77), or "Needs Practice" (< 60).
2. Synthesize overarching strengths observed throughout the interview.
3. Formulate an actionable, high-priority improvement roadmap (3-5 steps).
4. Summarize interview advice to succeed in actual company technical rounds.

Return JSON in this format:
{
  "readinessStatus": "Ready for Technical Rounds" | "Moderate Readiness - Target Gaps" | "Needs Practice",
  "executiveSummary": "...",
  "strengthsSummary": ["..."],
  "improvementRoadmap": ["..."],
  "recommendedStudyTopics": ["..."]
}
`;

  try {
    const aiReport = await generateJSON({ prompt });

    return {
      ...baseScores,
      readinessStatus: aiReport.readinessStatus || baseScores.readinessStatus,
      strengthsSummary: aiReport.strengthsSummary || baseScores.strengthsSummary,
      improvementRoadmap: aiReport.improvementRoadmap || baseScores.improvementRoadmap,
      executiveSummary: aiReport.executiveSummary,
      recommendedStudyTopics: aiReport.recommendedStudyTopics || [],
      isAiPowered: true
    };
  } catch (err) {
    console.warn(`[Interview Service] Gemini final report failed (${err.message}). Using base scoring.`);
    return { ...baseScores, isAiPowered: false };
  }
};
