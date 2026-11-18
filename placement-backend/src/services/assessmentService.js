import { generateJSON, isGeminiConfigured } from './geminiService.js';
import { generateAssessmentQuestions as fallbackGenerateQuestions } from '../utils/aiPrepEngine.js';
import { evaluateSubjectiveAnswer as fallbackEvaluateSubjective } from '../utils/subjectiveEvaluator.js';

/**
 * Validates generated questions schema to ensure consistency and reliability
 */
export const validateGeneratedQuestion = (q, idx = 0) => {
  if (!q || typeof q !== 'object') {
    throw new Error(`Question at index ${idx} is not a valid object`);
  }

  const questionText = (q.questionText || q.question || '').trim();
  if (!questionText || questionText.length < 8) {
    throw new Error(`Question at index ${idx} has missing or empty question text`);
  }

  const qType = (q.questionType || q.type || 'mcq').toLowerCase();
  const maxMarks = Number(q.maxMarks) || (qType === 'mcq' ? 2 : 10);

  const clean = {
    questionId: q.questionId || `q-gemini-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
    questionText,
    category: q.category || 'technical',
    topic: q.topic || 'General Tech',
    subtopic: q.subtopic || '',
    difficulty: (q.difficulty || 'medium').toLowerCase(),
    questionType: qType,
    type: qType,
    maxMarks,
    timeAllocationSeconds: Number(q.timeAllocationSeconds) || (qType === 'mcq' ? 60 : 180),
    explanation: q.explanation || q.modelAnswer || '',
    modelAnswer: q.modelAnswer || q.explanation || '',
    expectedKeyPoints: Array.isArray(q.expectedKeyPoints) ? q.expectedKeyPoints : [],
    rubric: Array.isArray(q.rubric) && q.rubric.length > 0
      ? q.rubric.map(r => ({
          criterion: r.criterion || 'Criterion',
          weight: Number(r.weight) || 25,
          description: r.description || ''
        }))
      : [
          { criterion: 'Technical Correctness', weight: 40, description: 'Accuracy of concepts and statements' },
          { criterion: 'Concept Coverage', weight: 30, description: 'Coverage of fundamental mechanisms' },
          { criterion: 'Reasoning & Clarity', weight: 30, description: 'Depth of trade-offs and structure' }
        ]
  };

  if (qType === 'mcq') {
    let options = Array.isArray(q.options) ? q.options.map(String) : [];
    if (options.length < 2) {
      options = ['Option A', 'Option B', 'Option C', 'Option D'];
    }
    clean.options = options;
    clean.correctAnswer = q.correctAnswer || options[0];
  } else if (qType === 'numerical') {
    clean.correctAnswer = String(q.correctAnswer ?? '0');
    clean.numericalTolerance = Number(q.numericalTolerance) || 0.05;
  }

  return clean;
};

/**
 * Generate questions using Gemini or fallback to offline question bank
 */
export const generateQuestionsWithAI = async (config = {}) => {
  const {
    category = 'technical',
    topics = [],
    company = null,
    targetRole = 'Software Engineer',
    difficulty = 'medium',
    questionCount = 10,
    questionMix = 'mixed'
  } = config;

  if (!isGeminiConfigured()) {
    return fallbackGenerateQuestions(config);
  }

  const prompt = `
Generate ${questionCount} realistic campus placement assessment questions tailored for a "${targetRole}" position${company ? ` at ${company}` : ''}.

Configuration:
- Category: ${category} (can include aptitude, technical, HR, company patterns)
- Topics: ${topics.length > 0 ? topics.join(', ') : 'DSA, Java, Python, JavaScript, SQL, DBMS, OS, Computer Networks, OOP'}
- Difficulty: ${difficulty} (beginner/easy, intermediate/medium, or advanced/hard)
- Question Mix: ${questionMix} (objective/mcq, subjective, or mixed)

Requirements for each question:
1. If "mcq": Must provide exactly 4 distinct options, 1 explicitly correct answer (matching one option string exactly), and a clear step-by-step explanation. Max marks: 2.
2. If "subjective": Provide expectedKeyPoints (array of 3-5 fundamental phrases/concepts), a high quality modelAnswer, and a weighted scoring rubric summing to 100%. Max marks: 10.
3. Validate each question to be technically accurate, realistic for campus recruitment drives, and clear.

Return JSON in this format:
{
  "questions": [
    {
      "questionText": "...",
      "category": "${category}",
      "topic": "...",
      "subtopic": "...",
      "difficulty": "${difficulty}",
      "questionType": "mcq" | "subjective",
      "options": ["...", "...", "...", "..."], // only for mcq
      "correctAnswer": "...", // for mcq: string matching one option; for numerical: numeric string
      "explanation": "...",
      "modelAnswer": "...",
      "expectedKeyPoints": ["..."],
      "maxMarks": 2 | 10,
      "timeAllocationSeconds": 90,
      "rubric": [
        { "criterion": "Technical Correctness", "weight": 40, "description": "..." },
        { "criterion": "Concept Coverage", "weight": 30, "description": "..." },
        { "criterion": "Reasoning & Clarity", "weight": 30, "description": "..." }
      ]
    }
  ]
}
`;

  try {
    const response = await generateJSON({
      prompt,
      systemInstruction: 'You are an expert technical interviewer and placement examiner for university campus placements. You generate rigorously validated assessment questions.'
    });

    const rawList = Array.isArray(response.questions) ? response.questions : (Array.isArray(response) ? response : []);
    if (rawList.length === 0) {
      throw new Error('Gemini returned an empty question list');
    }

    return rawList.map((q, idx) => validateGeneratedQuestion(q, idx));
  } catch (err) {
    console.warn(`[Assessment Service] Gemini generation failed (${err.message}). Falling back to internal question bank.`);
    return fallbackGenerateQuestions(config);
  }
};

/**
 * Evaluates a subjective candidate answer using Gemini or rubric fallback
 */
export const evaluateSubjectiveWithAI = async (question = {}, studentAnswer = '') => {
  const answer = (studentAnswer || '').toString().trim();
  const maxMarks = Number(question.maxMarks) || 10;

  // Handle empty or trivial answers directly
  if (!answer || answer.length < 5) {
    return fallbackEvaluateSubjective(question, studentAnswer);
  }

  if (!isGeminiConfigured()) {
    return fallbackEvaluateSubjective(question, studentAnswer);
  }

  const prompt = `
Evaluate this student's response to the following placement interview question.

Question:
"${question.questionText || question.question}"

Topic: ${question.topic || 'General'}
Category: ${question.category || 'technical'}
Difficulty: ${question.difficulty || 'medium'}
Max Marks: ${maxMarks}

Expected Key Points:
${JSON.stringify(question.expectedKeyPoints || [])}

Model Answer:
"${question.modelAnswer || question.explanation || 'Accurate, well-structured explanation'}"

Scoring Rubric:
${JSON.stringify(question.rubric || [])}

Student Answer:
"""
${answer}
"""

Evaluation Guidelines:
1. Assess technical correctness, conceptual depth, presence of misconceptions or fallacies, and clarity.
2. Award partial marks strictly proportional to the rubric. Max score can never exceed ${maxMarks}.
3. List which expected points were covered vs missing.
4. If the student makes technical fallacies (e.g. claiming HashMap lookup is always O(1) in worst case), flag them in "incorrectStatements".
5. Give actionable, constructive improvement suggestions.

Return JSON in this format:
{
  "scoreAwarded": <number between 0 and ${maxMarks}>,
  "maxMarks": ${maxMarks},
  "percentage": <number between 0 and 100>,
  "coveredPoints": ["..."],
  "missingPoints": ["..."],
  "incorrectStatements": ["..."],
  "strengths": ["..."],
  "weaknesses": ["..."],
  "feedback": "...",
  "improvementSuggestions": ["..."],
  "rubricScores": [
    {
      "criterion": "...",
      "weight": <number>,
      "scoreAwarded": <number out of weight>,
      "maxScore": <number equal to weight>,
      "feedback": "..."
    }
  ]
}
`;

  try {
    const result = await generateJSON({
      prompt,
      systemInstruction: 'You are a senior technical interviewer. Evaluate student answers fairly, providing proportional rubric marks and actionable feedback.'
    });

    const score = Math.max(0, Math.min(maxMarks, Number(result.scoreAwarded) || 0));
    const percentage = Math.round((score / maxMarks) * 100);

    return {
      scoreAwarded: score,
      maxMarks,
      percentage,
      coveredPoints: Array.isArray(result.coveredPoints) ? result.coveredPoints : [],
      missingPoints: Array.isArray(result.missingPoints) ? result.missingPoints : [],
      incorrectStatements: Array.isArray(result.incorrectStatements) ? result.incorrectStatements : [],
      strengths: Array.isArray(result.strengths) ? result.strengths : [],
      weaknesses: Array.isArray(result.weaknesses) ? result.weaknesses : [],
      feedback: result.feedback || 'Answer evaluated successfully.',
      improvementSuggestions: Array.isArray(result.improvementSuggestions) ? result.improvementSuggestions : [],
      rubricScores: Array.isArray(result.rubricScores) ? result.rubricScores : [],
      modelAnswer: question.modelAnswer || question.explanation || ''
    };
  } catch (err) {
    console.warn(`[Assessment Service] Gemini subjective evaluation failed (${err.message}). Using rubric fallback.`);
    return fallbackEvaluateSubjective(question, studentAnswer);
  }
};

/**
 * Generate an adaptive follow-up question when candidate struggled on a previous question
 */
export const generateFollowUpQuestion = async ({
  previousQuestion = {},
  studentAnswer = '',
  evaluation = {}
}) => {
  if (!isGeminiConfigured()) {
    return {
      questionText: `Could you clarify how you would handle edge cases or optimize the approach you described in: "${previousQuestion.questionText || previousQuestion.question}"?`,
      topic: previousQuestion.topic || 'General',
      category: previousQuestion.category || 'technical',
      difficulty: 'medium',
      questionType: 'subjective',
      maxMarks: 5,
      expectedKeyPoints: ['Edge case handling', 'Optimization', 'Trade-offs']
    };
  }

  const prompt = `
A candidate gave this answer to a question in a placement assessment:

Original Question: "${previousQuestion.questionText || previousQuestion.question}"
Candidate Answer: "${studentAnswer}"
Identified Weaknesses / Missing Points: ${JSON.stringify(evaluation.missingPoints || evaluation.weaknesses || [])}

Generate 1 targeted, constructive follow-up question that helps the student bridge their conceptual gap or explore the missing trade-offs.

Return JSON in this format:
{
  "questionText": "...",
  "topic": "${previousQuestion.topic || 'Technical'}",
  "category": "${previousQuestion.category || 'technical'}",
  "difficulty": "medium",
  "questionType": "subjective",
  "maxMarks": 5,
  "expectedKeyPoints": ["...", "..."],
  "modelAnswer": "...",
  "explanation": "..."
}
`;

  try {
    return await generateJSON({ prompt });
  } catch (err) {
    return {
      questionText: `Can you elaborate on the practical trade-offs and edge cases for "${previousQuestion.topic || 'this concept'}"?`,
      topic: previousQuestion.topic || 'Technical',
      category: previousQuestion.category || 'technical',
      difficulty: 'medium',
      questionType: 'subjective',
      maxMarks: 5,
      expectedKeyPoints: ['Trade-offs', 'Best practices']
    };
  }
};
