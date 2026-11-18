import mongoose from 'mongoose';
import SubjectQuestion from '../models/SubjectQuestionBank.js';
import SubjectQuizAttempt from '../models/SubjectQuizAttempt.js';
import Student from '../models/Student.js';
import { STATIC_QUESTION_BANK, SUBJECT_METADATA } from '../utils/subjectQuizBank.js';
import { isGeminiConfigured, getGeminiClient, getGeminiModel } from '../config/gemini.js';

/**
 * Initialize and seed the Question Bank into MongoDB if needed.
 */
export const seedQuestionBank = async () => {
  try {
    const existingCount = await SubjectQuestion.countDocuments();
    let shouldSeed = existingCount < STATIC_QUESTION_BANK.length;

    if (!shouldSeed) {
      // Check if any registered subject is missing from DB
      const subjects = Object.keys(SUBJECT_METADATA);
      for (const sub of subjects) {
        const subCount = await SubjectQuestion.countDocuments({ subject: sub, isActive: true });
        if (subCount === 0) {
          shouldSeed = true;
          break;
        }
      }
    }

    if (shouldSeed) {
      console.log(`[QuizService] Seeding question bank (${existingCount} found, syncing ${STATIC_QUESTION_BANK.length} curated questions)...`);
      for (const q of STATIC_QUESTION_BANK) {
        await SubjectQuestion.findOneAndUpdate(
          { subject: q.subject, questionText: q.questionText },
          { ...q, source: 'curated', isActive: true },
          { upsert: true, new: true }
        );
      }
      console.log('[QuizService] Question bank seeded successfully.');
    }
  } catch (error) {
    console.error('[QuizService] Error seeding question bank:', error.message);
  }
};

/**
 * Get available subjects, difficulty levels, and default quiz configuration.
 */
export const getQuizConfig = async () => {
  const subjectsList = Object.values(SUBJECT_METADATA);

  // Get question counts per subject and difficulty
  const countMap = {};
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      const counts = await SubjectQuestion.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: { subject: '$subject', difficulty: '$difficulty' }, count: { $sum: 1 } } }
      ]);
      for (const c of counts) {
        const key = `${c._id.subject}_${c._id.difficulty}`;
        countMap[key] = c.count;
      }
    } catch {
      // Gracefully fall back to static bank counts
    }
  }

  const enrichedSubjects = subjectsList.map(s => {
    return {
      ...s,
      easyCount: countMap[`${s.id}_easy`] || STATIC_QUESTION_BANK.filter(q => q.subject === s.id && q.difficulty === 'easy').length,
      mediumCount: countMap[`${s.id}_medium`] || STATIC_QUESTION_BANK.filter(q => q.subject === s.id && q.difficulty === 'medium').length,
      hardCount: countMap[`${s.id}_hard`] || STATIC_QUESTION_BANK.filter(q => q.subject === s.id && q.difficulty === 'hard').length
    };
  });

  return {
    subjects: enrichedSubjects,
    difficulties: [
      {
        id: 'easy',
        name: 'Easy',
        description: 'Tests fundamental concepts and basic definitions. Ideal for beginners building confidence.',
        badgeColor: '#10B981',
        composition: '15 Easy Questions'
      },
      {
        id: 'medium',
        name: 'Medium',
        description: 'Tests conceptual understanding, practical applications, and logical reasoning.',
        badgeColor: '#F59E0B',
        composition: '15 Medium Questions'
      },
      {
        id: 'hard',
        name: 'Hard (Placement Mock)',
        description: 'Comprehensive placement simulation with advanced concepts, challenging scenarios, and a blended difficulty mix.',
        badgeColor: '#EF4444',
        composition: 'Mixture of Easy + Medium + Hard Questions'
      }
    ],
    config: {
      defaultQuestionsPerQuiz: 15,
      marksPerCorrectAnswer: 1,
      marksPerIncorrectAnswer: 0,
      marksPerUnanswered: 0,
      negativeMarking: false,
      durationMinutes: 20
    }
  };
};

/**
 * Shuffle an array using Fisher-Yates algorithm.
 */
const shuffle = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

/**
 * Sample questions adhering strictly to user difficulty rules:
 * - Easy: 15 Easy questions only.
 * - Medium: 15 Medium questions only.
 * - Hard: Mixture of Easy + Medium + Hard questions.
 */
export const sampleQuestions = async (subject, difficulty, targetCount = 15) => {
  const normSubject = subject.toLowerCase().trim();
  const normDifficulty = difficulty.toLowerCase().trim();

  let selectedDocs = [];

  // Helper to fetch from DB with fallback to static bank
  const fetchPool = async (sub, diff) => {
    let pool = [];
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        pool = await SubjectQuestion.find({ subject: sub, difficulty: diff, isActive: true }).lean();
      } catch {
        pool = [];
      }
    }
    if (!pool || pool.length === 0) {
      pool = STATIC_QUESTION_BANK.filter(q => q.subject === sub && q.difficulty === diff);
    }
    return shuffle(pool);
  };

  const fillPoolStrictly = (pool, count, diffLabel) => {
    if (!pool || pool.length === 0) return [];
    const results = [];
    let idx = 0;
    while (results.length < count) {
      const item = { ...pool[idx % pool.length] };
      // Ensure difficulty is tagged accurately
      item.difficulty = diffLabel;
      results.push(item);
      idx++;
    }
    return results;
  };

  if (normDifficulty === 'easy') {
    // Strictly Easy questions only
    const easyPool = await fetchPool(normSubject, 'easy');
    selectedDocs = fillPoolStrictly(easyPool, targetCount, 'easy');
  } else if (normDifficulty === 'medium') {
    // Strictly Medium questions only
    const medPool = await fetchPool(normSubject, 'medium');
    selectedDocs = fillPoolStrictly(medPool, targetCount, 'medium');
  } else {
    // HARD LEVEL: Mixture of Easy + Medium + Hard questions
    // Desired mixture: 3 Easy, 5 Medium, 7 Hard = 15 total
    const easyPool = await fetchPool(normSubject, 'easy');
    const medPool = await fetchPool(normSubject, 'medium');
    const hardPool = await fetchPool(normSubject, 'hard');

    const sampleEasy = fillPoolStrictly(easyPool, 3, 'easy');
    const sampleMed = fillPoolStrictly(medPool, 5, 'medium');
    const sampleHard = fillPoolStrictly(hardPool, 7, 'hard');

    selectedDocs = [...sampleEasy, ...sampleMed, ...sampleHard];
  }

  // Shuffle final question set so questions appear in randomized order
  selectedDocs = shuffle(selectedDocs);

  // Normalize into standard question schema with unique session question IDs
  return selectedDocs.map((doc, idx) => {
    return {
      questionId: `${doc._id || 'q'}_${idx}_${Date.now()}`,
      questionText: doc.questionText,
      options: doc.options,
      correctOption: doc.correctOption,
      selectedOption: -1,
      isAnswered: false,
      isCorrect: false,
      explanation: doc.explanation || 'Verified conceptual solution.',
      topic: doc.topic || 'General',
      difficulty: doc.difficulty || normDifficulty
    };
  });
};

/**
 * Start a new quiz attempt session.
 * Strips correct answers before returning questions to frontend.
 */
export const startQuiz = async (userId, subject, difficulty) => {
  const normSubject = subject.toLowerCase().trim();
  const normDifficulty = difficulty.toLowerCase().trim();

  if (!SUBJECT_METADATA[normSubject]) {
    throw new Error(`Invalid subject '${subject}'. Must be one of: oops, dsa, daa, coa, os, dbms, cn.`);
  }

  if (!['easy', 'medium', 'hard'].includes(normDifficulty)) {
    throw new Error(`Invalid difficulty '${difficulty}'. Must be one of: easy, medium, hard.`);
  }

  const student = await Student.findOne({ userId });

  // Sample questions adhering to the difficulty mix rules
  const questions = await sampleQuestions(normSubject, normDifficulty, 15);

  const attempt = new SubjectQuizAttempt({
    user: userId,
    student: student ? student._id : null,
    subject: normSubject,
    subjectName: SUBJECT_METADATA[normSubject].name,
    difficulty: normDifficulty,
    status: 'in_progress',
    totalQuestions: questions.length,
    score: 0,
    percentage: 0,
    durationMinutes: 20,
    questions,
    startedAt: new Date()
  });

  await attempt.save();

  // Strip correct answer and explanation for frontend
  const secureQuestions = questions.map((q, idx) => ({
    id: q.questionId,
    index: idx + 1,
    questionText: q.questionText,
    options: q.options,
    topic: q.topic,
    difficulty: q.difficulty
  }));

  return {
    quizSessionId: attempt._id.toString(),
    subject: attempt.subject,
    subjectName: attempt.subjectName,
    difficulty: attempt.difficulty,
    totalQuestions: attempt.totalQuestions,
    durationMinutes: attempt.durationMinutes,
    startedAt: attempt.startedAt,
    questions: secureQuestions
  };
};

/**
 * Evaluate submitted answers securely on backend.
 */
export const submitQuiz = async (userId, { quizSessionId, answers = {}, timeSpentSeconds = 0 }) => {
  const attempt = await SubjectQuizAttempt.findOne({
    _id: quizSessionId,
    user: userId
  });

  if (!attempt) {
    throw new Error('Quiz session not found or you do not have permission to access it.');
  }

  if (attempt.status === 'completed') {
    return formatQuizResult(attempt);
  }

  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  // Grade each question
  for (const q of attempt.questions) {
    const studentAns = answers[q.questionId];

    if (studentAns !== undefined && studentAns !== null && studentAns !== -1 && studentAns !== '') {
      const selectedIndex = parseInt(studentAns, 10);
      q.selectedOption = selectedIndex;
      q.isAnswered = true;

      if (selectedIndex === q.correctOption) {
        q.isCorrect = true;
        correctCount += 1;
      } else {
        q.isCorrect = false;
        incorrectCount += 1;
      }
    } else {
      q.selectedOption = -1;
      q.isAnswered = false;
      q.isCorrect = false;
      unansweredCount += 1;
    }
  }

  const score = correctCount; // 1 mark per correct answer
  const totalQuestions = attempt.totalQuestions || attempt.questions.length;
  const percentage = Math.round((score / totalQuestions) * 100);

  // Performance categories per requirement specifications
  let performanceCategory = '';
  let performanceMessage = '';

  if (percentage >= 90) {
    performanceCategory = 'Outstanding performance!';
    performanceMessage = `Outstanding! You have demonstrated exceptional mastery of ${attempt.subjectName}. Your technical foundation is interview-ready.`;
  } else if (percentage >= 80) {
    performanceCategory = 'Excellent work! Keep it up!';
    performanceMessage = `Excellent work! Your preparation in ${attempt.subjectName} is robust. Keep up this consistency for top-tier placement rounds.`;
  } else if (percentage >= 70) {
    performanceCategory = "Good job! You're making great progress.";
    performanceMessage = `Good job! You're making great progress in ${attempt.subjectName}. Review the missed concepts to push into the 90%+ tier.`;
  } else if (percentage >= 60) {
    performanceCategory = 'Nice effort! Keep practising.';
    performanceMessage = `Nice effort! You have a solid starting grasp of ${attempt.subjectName}. Practice more medium and hard scenarios to build speed and accuracy.`;
  } else if (percentage >= 40) {
    performanceCategory = 'You can improve. Revise the concepts and try again.';
    performanceMessage = `You can improve. Revisit your study notes for ${attempt.subjectName}, strengthen the core principles, and attempt another quiz.`;
  } else {
    performanceCategory = "Don't give up! Focus on understanding the fundamentals and attempt the quiz again.";
    performanceMessage = `Don't give up! Every attempt is a step forward. Review the detailed explanations below and consult the study materials before retaking.`;
  }

  // Update attempt record
  attempt.status = 'completed';
  attempt.score = score;
  attempt.percentage = percentage;
  attempt.correctCount = correctCount;
  attempt.incorrectCount = incorrectCount;
  attempt.unansweredCount = unansweredCount;
  attempt.timeSpentSeconds = Math.max(1, parseInt(timeSpentSeconds, 10) || 0);
  attempt.performanceCategory = performanceCategory;
  attempt.performanceMessage = performanceMessage;
  attempt.completedAt = new Date();

  await attempt.save();

  return formatQuizResult(attempt);
};

/**
 * Format full evaluated quiz result with review answers and explanations.
 */
export const formatQuizResult = (attempt) => {
  return {
    quizSessionId: attempt._id.toString(),
    subject: attempt.subject,
    subjectName: attempt.subjectName,
    difficulty: attempt.difficulty,
    score: attempt.score,
    totalQuestions: attempt.totalQuestions,
    percentage: attempt.percentage,
    correctCount: attempt.correctCount,
    incorrectCount: attempt.incorrectCount,
    unansweredCount: attempt.unansweredCount,
    timeSpentSeconds: attempt.timeSpentSeconds,
    performanceCategory: attempt.performanceCategory,
    performanceMessage: attempt.performanceMessage,
    startedAt: attempt.startedAt,
    completedAt: attempt.completedAt,
    questions: attempt.questions.map((q, idx) => ({
      index: idx + 1,
      questionId: q.questionId,
      questionText: q.questionText,
      options: q.options,
      selectedOption: q.selectedOption,
      correctOption: q.correctOption,
      isCorrect: q.isCorrect,
      isAnswered: q.isAnswered,
      explanation: q.explanation,
      topic: q.topic,
      difficulty: q.difficulty
    }))
  };
};

/**
 * Get detailed result for a single historical quiz attempt.
 */
export const getAttemptDetails = async (userId, attemptId) => {
  const attempt = await SubjectQuizAttempt.findOne({
    _id: attemptId,
    user: userId
  });

  if (!attempt) {
    throw new Error('Quiz attempt not found or unauthorized.');
  }

  return formatQuizResult(attempt);
};

/**
 * Comprehensive Student Quiz Performance Dashboard
 */
export const getStudentDashboardStats = async (userId) => {
  const attempts = await SubjectQuizAttempt.find({
    user: userId,
    status: 'completed'
  }).sort({ completedAt: -1 }).lean();

  const totalQuizzes = attempts.length;
  const totalQuestions = attempts.reduce((acc, a) => acc + (a.totalQuestions || 0), 0);
  const totalScore = attempts.reduce((acc, a) => acc + (a.score || 0), 0);
  const totalCorrect = attempts.reduce((acc, a) => acc + (a.correctCount || 0), 0);
  const totalIncorrect = attempts.reduce((acc, a) => acc + (a.incorrectCount || 0), 0);
  const totalUnanswered = attempts.reduce((acc, a) => acc + (a.unansweredCount || 0), 0);
  const totalTimeSeconds = attempts.reduce((acc, a) => acc + (a.timeSpentSeconds || 0), 0);

  const overallAvgScore = totalQuizzes > 0 ? parseFloat((totalScore / totalQuizzes).toFixed(1)) : 0;
  const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const bestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0;

  // Subject-wise performance across the 6 subjects
  const subjectStats = {};
  for (const [key, meta] of Object.entries(SUBJECT_METADATA)) {
    subjectStats[key] = {
      subject: key,
      subjectName: meta.name,
      code: meta.code,
      attempts: 0,
      totalScore: 0,
      totalPossible: 0,
      bestScore: 0,
      avgPercentage: 0,
      category: 'Not Attempted'
    };
  }

  for (const a of attempts) {
    if (subjectStats[a.subject]) {
      subjectStats[a.subject].attempts += 1;
      subjectStats[a.subject].totalScore += a.score;
      subjectStats[a.subject].totalPossible += a.totalQuestions;
      if (a.score > subjectStats[a.subject].bestScore) {
        subjectStats[a.subject].bestScore = a.score;
      }
    }
  }

  for (const key of Object.keys(subjectStats)) {
    const s = subjectStats[key];
    if (s.attempts > 0 && s.totalPossible > 0) {
      s.avgPercentage = Math.round((s.totalScore / s.totalPossible) * 100);
      s.category = s.avgPercentage >= 85 ? 'Mastery' : s.avgPercentage >= 70 ? 'Proficient' : s.avgPercentage >= 50 ? 'Developing' : 'Needs Practice';
    }
  }

  // Difficulty-wise performance
  const difficultyStats = {
    easy: { attempts: 0, totalScore: 0, totalQuestions: 0, avgPercentage: 0 },
    medium: { attempts: 0, totalScore: 0, totalQuestions: 0, avgPercentage: 0 },
    hard: { attempts: 0, totalScore: 0, totalQuestions: 0, avgPercentage: 0 }
  };

  for (const a of attempts) {
    if (difficultyStats[a.difficulty]) {
      difficultyStats[a.difficulty].attempts += 1;
      difficultyStats[a.difficulty].totalScore += a.score;
      difficultyStats[a.difficulty].totalQuestions += a.totalQuestions;
    }
  }

  for (const d of Object.keys(difficultyStats)) {
    const diff = difficultyStats[d];
    if (diff.attempts > 0 && diff.totalQuestions > 0) {
      diff.avgPercentage = Math.round((diff.totalScore / diff.totalQuestions) * 100);
    }
  }

  // Visual Analytics: Score improvement over time (chronological)
  const scoreTrend = [...attempts].reverse().map((a, idx) => ({
    attemptIndex: idx + 1,
    date: a.completedAt ? new Date(a.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `Quiz ${idx + 1}`,
    score: a.score,
    percentage: a.percentage,
    subject: a.subject.toUpperCase(),
    difficulty: a.difficulty
  }));

  // Identify strongest and weakest subjects
  const attemptedSubjects = Object.values(subjectStats).filter(s => s.attempts > 0);
  let strongestSubject = null;
  let weakestSubject = null;

  if (attemptedSubjects.length > 0) {
    attemptedSubjects.sort((a, b) => b.avgPercentage - a.avgPercentage);
    strongestSubject = attemptedSubjects[0];
    weakestSubject = attemptedSubjects[attemptedSubjects.length - 1];
  }

  // Identify best performing difficulty level
  const attemptedDifficulties = Object.entries(difficultyStats).filter(([_, v]) => v.attempts > 0);
  let bestDifficulty = null;
  if (attemptedDifficulties.length > 0) {
    attemptedDifficulties.sort((a, b) => b[1].avgPercentage - a[1].avgPercentage);
    bestDifficulty = attemptedDifficulties[0][0];
  }

  // Context-aware performance recommendations
  const recommendations = [];
  if (totalQuizzes === 0) {
    recommendations.push({
      type: 'start',
      title: 'Begin Your Subject Assessments',
      message: 'Start with an Easy quiz in DSA or OOPS to establish your baseline placement readiness score.'
    });
  } else {
    if (strongestSubject) {
      recommendations.push({
        type: 'strength',
        title: `Strong Command: ${strongestSubject.code}`,
        message: `Excellent performance! Your average score in ${strongestSubject.subjectName} is ${strongestSubject.avgPercentage}%. Challenge yourself with Hard placement mock quizzes.`
      });
    }

    if (weakestSubject && weakestSubject.code !== strongestSubject?.code) {
      recommendations.push({
        type: 'improvement',
        title: `Focus Area: ${weakestSubject.code}`,
        message: `Your score in ${weakestSubject.subjectName} currently averages ${weakestSubject.avgPercentage}%. Revisit the study materials and take 2-3 focused Easy & Medium quizzes.`
      });
    }

    const unattempted = Object.values(subjectStats).filter(s => s.attempts === 0);
    if (unattempted.length > 0) {
      recommendations.push({
        type: 'unattempted',
        title: 'Complete Syllabus Coverage',
        message: `You haven't attempted quizzes in: ${unattempted.map(u => u.code).join(', ')}. Comprehensive coverage is critical for online screening tests.`
      });
    }
  }

  // Recent quiz attempts list
  const recentAttempts = attempts.slice(0, 15).map(a => ({
    id: a._id.toString(),
    subject: a.subject,
    subjectName: a.subjectName,
    difficulty: a.difficulty,
    score: a.score,
    totalQuestions: a.totalQuestions,
    percentage: a.percentage,
    correctCount: a.correctCount,
    incorrectCount: a.incorrectCount,
    timeSpentSeconds: a.timeSpentSeconds,
    performanceCategory: a.performanceCategory,
    completedAt: a.completedAt
  }));

  return {
    overall: {
      totalQuizzes,
      totalQuestions,
      overallAvgScore,
      overallAccuracy,
      bestScore,
      totalTimeSeconds,
      totalCorrect,
      totalIncorrect,
      totalUnanswered
    },
    subjectWise: Object.values(subjectStats),
    difficultyWise: difficultyStats,
    visualAnalytics: {
      scoreTrend,
      subjectBarData: Object.values(subjectStats).map(s => ({
        subject: s.code,
        avgPercentage: s.avgPercentage,
        attempts: s.attempts
      })),
      answersBreakdown: {
        correct: totalCorrect,
        incorrect: totalIncorrect,
        unanswered: totalUnanswered
      }
    },
    recommendations,
    recentAttempts
  };
};

/**
 * Optional Gemini AI Question Generator to expand the bank dynamically.
 */
export const generateAIQuestions = async (subject, difficulty, count = 5) => {
  if (!isGeminiConfigured()) {
    throw new Error('Gemini API is not configured on the server.');
  }

  const normSubject = subject.toLowerCase().trim();
  const meta = SUBJECT_METADATA[normSubject];
  if (!meta) {
    throw new Error(`Invalid subject '${subject}'.`);
  }

  const prompt = `You are a Senior Technical Campus Placement Examiner.
Generate exactly ${count} Multiple Choice Questions (MCQs) for the technical subject: "${meta.name}" (${meta.code}).
Target Difficulty: ${difficulty.toUpperCase()}.

Rules:
1. Every question must be objective-type with exactly four options.
2. Exactly one option must be unambiguously correct.
3. Include plausible, realistic distractors.
4. Provide a clear technical explanation.
5. Format your output as a valid JSON array of objects with the exact schema:
[
  {
    "questionText": "Question string...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctOption": 0, // integer 0, 1, 2, or 3 representing the correct index in options
    "explanation": "Detailed explanation...",
    "topic": "Specific Topic"
  }
]
Output ONLY raw JSON. No markdown backticks, no markdown blocks.`;

  const ai = getGeminiClient();
  const model = getGeminiModel();
  const response = await ai.models.generateContent({
    model,
    contents: prompt
  });

  let raw = (response.text || '').trim();
  if (raw.startsWith('```json')) raw = raw.replace(/^```json/, '').replace(/```$/, '').trim();
  if (raw.startsWith('```')) raw = raw.replace(/^```/, '').replace(/```$/, '').trim();

  const parsed = JSON.parse(raw);
  const saved = [];

  for (const item of parsed) {
    if (item.questionText && Array.isArray(item.options) && item.options.length === 4 && typeof item.correctOption === 'number') {
      const q = new SubjectQuestion({
        subject: normSubject,
        difficulty,
        topic: item.topic || 'AI Curated',
        questionText: item.questionText,
        options: item.options,
        correctOption: item.correctOption,
        explanation: item.explanation || 'Verified technical explanation.',
        source: 'ai_generated'
      });
      await q.save();
      saved.push(q);
    }
  }

  return saved;
};
