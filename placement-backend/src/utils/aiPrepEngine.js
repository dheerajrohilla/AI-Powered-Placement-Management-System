import {
  APTITUDE_QUESTIONS,
  TECHNICAL_QUESTIONS,
  HR_QUESTIONS,
  COMPANY_RECRUITMENT_PATTERNS
} from './aiPrepBank.js';
import { evaluateObjectiveQuestion } from './objectiveEvaluator.js';
import { evaluateSubjectiveAnswer } from './subjectiveEvaluator.js';
import { evaluateCodingQuestion } from './codeExecutionService.js';
import { evaluateSQLQuery } from './sqlEvaluator.js';
import { evaluateSubjectiveWithAI } from '../services/assessmentService.js';

/**
 * Shuffles an array of options while returning the updated correct answer string
 */
export const shuffleOptions = (options = [], correctAnswer = '') => {
  if (!options || options.length <= 1) return { shuffledOptions: options, newCorrectAnswer: correctAnswer };
  const arr = [...options];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return {
    shuffledOptions: arr,
    newCorrectAnswer: correctAnswer // correct answer text remains identical
  };
};

/**
 * Question Generation Engine
 * Creates a tailored question set based on category, topics, company, difficulty, count, and mix
 */
export const generateAssessmentQuestions = (config = {}) => {
  const {
    category = 'technical', // 'aptitude' | 'technical' | 'hr' | 'company'
    topics = [],
    company = null,
    targetRole = 'Software Engineer',
    difficulty = 'medium', // 'easy' | 'medium' | 'hard' | 'adaptive'
    questionCount = 10,
    questionMix = 'mixed' // 'objective' | 'subjective' | 'mixed'
  } = config;

  // 1. Select initial candidate pool by category
  let rawPool = [];
  if (category === 'aptitude') {
    rawPool = [...APTITUDE_QUESTIONS];
  } else if (category === 'hr') {
    rawPool = [...HR_QUESTIONS];
  } else if (category === 'company') {
    // Company specific combines company pattern aptitude, technical, and HR
    const companyKey = (company || '').toLowerCase();
    const pattern = COMPANY_RECRUITMENT_PATTERNS[companyKey] || COMPANY_RECRUITMENT_PATTERNS.tcs;

    // Pick a blend matching company pattern
    rawPool = [
      ...APTITUDE_QUESTIONS,
      ...TECHNICAL_QUESTIONS,
      ...HR_QUESTIONS
    ];
  } else {
    // Default: technical
    rawPool = [...TECHNICAL_QUESTIONS];
  }

  // 2. Filter by topics if specified
  if (topics.length > 0) {
    const lowerTopics = topics.map(t => t.toLowerCase());
    const topicFiltered = rawPool.filter(q =>
      lowerTopics.some(t => q.topic.toLowerCase().includes(t) || t.includes(q.topic.toLowerCase()))
    );
    if (topicFiltered.length >= 3) {
      rawPool = topicFiltered;
    }
  }

  // 3. Filter by questionMix (objective vs subjective vs mixed)
  let candidateList = [];
  if (questionMix === 'objective') {
    candidateList = rawPool.filter(q => q.questionType === 'mcq' || q.questionType === 'numerical');
    if (candidateList.length === 0) candidateList = rawPool;
  } else if (questionMix === 'subjective') {
    candidateList = rawPool.filter(q => q.questionType !== 'mcq' && q.questionType !== 'numerical');
    if (candidateList.length === 0) candidateList = rawPool;
  } else {
    // Mixed: balanced combination of objective and subjective
    let objList = rawPool.filter(q => q.questionType === 'mcq' || q.questionType === 'numerical');
    let subList = rawPool.filter(q => q.questionType !== 'mcq' && q.questionType !== 'numerical');

    const categoryPool = (category === 'aptitude' ? APTITUDE_QUESTIONS : category === 'hr' ? HR_QUESTIONS : TECHNICAL_QUESTIONS);
    if (objList.length < 2) {
      objList = [...objList, ...categoryPool.filter(q => q.questionType === 'mcq' || q.questionType === 'numerical')];
    }
    if (subList.length < 2) {
      subList = [...subList, ...categoryPool.filter(q => q.questionType !== 'mcq' && q.questionType !== 'numerical')];
    }

    const half = Math.max(1, Math.floor(questionCount / 2));
    const selectedObj = objList.slice(0, half);
    const selectedSub = subList.slice(0, questionCount - selectedObj.length);
    candidateList = [...selectedObj, ...selectedSub];

    // If still short, backfill from rawPool
    if (candidateList.length < questionCount) {
      for (const q of [...rawPool, ...categoryPool]) {
        if (!candidateList.some(c => c.id === q.id)) {
          candidateList.push(q);
        }
        if (candidateList.length >= questionCount) break;
      }
    }
  }

  // 4. Sort / filter by difficulty when not adaptive (preserve mixed balance)
  if (difficulty !== 'adaptive' && questionMix !== 'mixed') {
    candidateList.sort((a, b) => {
      if (a.difficulty === difficulty && b.difficulty !== difficulty) return -1;
      if (b.difficulty === difficulty && a.difficulty !== difficulty) return 1;
      return 0;
    });
  }

  // 5. Deduplicate and format final questions
  const finalCount = Math.min(questionCount, candidateList.length);
  const selected = candidateList.slice(0, finalCount);

  return selected.map((q, idx) => {
    let options = q.options ? [...q.options] : undefined;
    let correctAnswer = q.correctAnswer;

    if (options && options.length > 0) {
      const shuffled = shuffleOptions(options, correctAnswer);
      options = shuffled.shuffledOptions;
      correctAnswer = shuffled.newCorrectAnswer;
    }

    return {
      questionId: `Q-${idx + 1}-${q.id}`,
      originalId: q.id,
      questionText: q.questionText,
      category: q.category,
      topic: q.topic,
      subtopic: q.subtopic,
      difficulty: q.difficulty,
      type: q.questionType,
      questionType: q.questionType,
      options,
      correctAnswer, // Server-only, stripped in getSession
      numericalTolerance: q.numericalTolerance,
      maxMarks: q.maxMarks || (q.questionType === 'mcq' ? 2 : 10),
      timeAllocationSeconds: q.timeAllocationSeconds || 120,
      rubric: q.rubric,
      expectedKeyPoints: q.expectedKeyPoints,
      modelAnswer: q.modelAnswer,
      explanation: q.explanation,
      codeTemplate: q.codeTemplate,
      codeLanguage: q.codeLanguage,
      testCases: q.testCases,
      sqlSchema: q.sqlSchema,
      sqlExpectedQuery: q.sqlExpectedQuery,
      studentAnswer: '',
      isAnswered: false,
      marksAwarded: 0,
      percentageScore: 0,
      feedback: ''
    };
  });
};

/**
 * Adaptive Difficulty Resolver
 * Evaluates performance on recent questions and dynamically adjusts upcoming difficulty
 */
export const adjustAdaptiveDifficulty = (currentDifficulty = 'medium', recentQuestionScores = [], maxPossible = null) => {
  let avgRecent = 50;
  if (typeof recentQuestionScores === 'number') {
    const max = maxPossible || 10;
    avgRecent = (recentQuestionScores / max) * 100;
  } else if (Array.isArray(recentQuestionScores) && recentQuestionScores.length > 0) {
    const lastTwo = recentQuestionScores.slice(-2);
    avgRecent = lastTwo.reduce((a, b) => a + b, 0) / lastTwo.length;
  } else {
    return currentDifficulty;
  }

  if (avgRecent >= 75) {
    if (currentDifficulty === 'easy') return 'medium';
    if (currentDifficulty === 'medium') return 'hard';
    return 'hard';
  } else if (avgRecent <= 40) {
    if (currentDifficulty === 'hard') return 'medium';
    if (currentDifficulty === 'medium') return 'easy';
    return 'easy';
  }

  return currentDifficulty;
};

/**
 * Evaluates a single answer according to question type
 */
export const evaluateQuestionAnswer = async (question = {}, studentAnswer = '', options = {}) => {
  const type = question.questionType;

  if (type === 'mcq' || type === 'numerical') {
    return evaluateObjectiveQuestion(question, studentAnswer, options);
  }

  if (type === 'coding') {
    return evaluateCodingQuestion(question, studentAnswer);
  }

  if (type === 'sql') {
    return evaluateSQLQuery(question, studentAnswer);
  }

  // Default: subjective short or long answer
  return await evaluateSubjectiveWithAI(question, studentAnswer);
};

/**
 * Generates the Final Comprehensive Assessment Report
 */
export const generateComprehensiveReport = async (sessionDoc) => {
  const questions = sessionDoc.questions || [];
  let totalScoreAwarded = 0;
  let maxPossibleScore = 0;

  let objCorrect = 0;
  let objIncorrect = 0;
  let objUnanswered = 0;
  let objScore = 0;
  let objMax = 0;

  let subEvaluated = 0;
  let subScore = 0;
  let subMax = 0;

  let codingTestsPassed = 0;
  let codingTestsTotal = 0;
  let codingScore = 0;
  let codingMax = 0;

  const topicMap = {};
  const difficultyMap = {};

  // Evaluate each question if not already evaluated
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const max = q.maxMarks || (q.questionType === 'mcq' ? 2 : 10);
    maxPossibleScore += max;

    // Run evaluation if not evaluated
    if (q.isAnswered && (q.marksAwarded == null || (q.marksAwarded === 0 && !q.feedback))) {
      const evalRes = await evaluateQuestionAnswer(q, q.studentAnswer, { negativeMarking: sessionDoc.negativeMarking });
      const rawAwarded = evalRes.marksAwarded != null ? evalRes.marksAwarded : (evalRes.scoreAwarded != null ? evalRes.scoreAwarded : 0);
      q.marksAwarded = Math.min(max, Math.max(0, rawAwarded));
      q.percentageScore = evalRes.percentage != null ? evalRes.percentage : (evalRes.percentageScore || 0);
      q.feedback = evalRes.feedback || '';
      q.rubricScores = evalRes.rubricScores || [];
      q.coveredPoints = evalRes.coveredPoints || [];
      q.missingPoints = evalRes.missingPoints || [];
      q.incorrectStatements = evalRes.incorrectStatements || [];
      q.testCaseResults = evalRes.testCaseResults || [];
    }

    const marks = Math.min(max, Math.max(0, q.marksAwarded || 0));
    totalScoreAwarded += marks;

    // Track statistics by type
    if (q.questionType === 'mcq' || q.questionType === 'numerical') {
      objMax += max;
      objScore += marks;
      if (!q.isAnswered || !q.studentAnswer) {
        objUnanswered++;
      } else if (q.marksAwarded > 0) {
        objCorrect++;
      } else {
        objIncorrect++;
      }
    } else if (q.questionType === 'coding') {
      codingMax += max;
      codingScore += marks;
      if (q.testCaseResults) {
        codingTestsPassed += q.testCaseResults.filter(t => t.passed).length;
        codingTestsTotal += q.testCaseResults.length;
      }
    } else {
      subMax += max;
      subScore += marks;
      if (q.isAnswered) subEvaluated++;
    }

    // Topic tracker
    const t = q.topic || 'General';
    if (!topicMap[t]) topicMap[t] = { score: 0, max: 0, count: 0 };
    topicMap[t].score += marks;
    topicMap[t].max += max;
    topicMap[t].count += 1;

    // Difficulty tracker
    const d = q.difficulty || 'medium';
    if (!difficultyMap[d]) difficultyMap[d] = { score: 0, max: 0, count: 0 };
    difficultyMap[d].score += marks;
    difficultyMap[d].max += max;
    difficultyMap[d].count += 1;
  }

  totalScoreAwarded = Math.min(maxPossibleScore, Math.round(totalScoreAwarded * 10) / 10);
  const overallPercentage = maxPossibleScore > 0
    ? Math.round((totalScoreAwarded / maxPossibleScore) * 100)
    : 0;

  const topicPerformance = Object.entries(topicMap).map(([topic, data]) => ({
    topic,
    score: Math.round(data.score * 10) / 10,
    maxScore: data.max,
    percentage: data.max > 0 ? Math.round((data.score / data.max) * 100) : 0,
    count: data.count
  }));

  const topicBreakdown = {};
  for (const tp of topicPerformance) {
    topicBreakdown[tp.topic] = { score: tp.score, maxScore: tp.maxScore, percentage: tp.percentage };
  }

  const difficultyPerformance = Object.entries(difficultyMap).map(([diff, data]) => ({
    difficulty: diff,
    score: Math.round(data.score * 10) / 10,
    maxScore: data.max,
    percentage: data.max > 0 ? Math.round((data.score / data.max) * 100) : 0,
    count: data.count
  }));

  const difficultyBreakdown = {};
  for (const dp of difficultyPerformance) {
    difficultyBreakdown[dp.difficulty] = { score: dp.score, maxScore: dp.maxScore, percentage: dp.percentage };
  }

  // Strengths, weaknesses & revision recommendations
  const strengths = [];
  const weaknesses = [];
  const commonMistakes = [];
  const personalizedRecommendations = [];

  for (const tp of topicPerformance) {
    if (tp.percentage >= 75) {
      strengths.push(`High proficiency in ${tp.topic} (${tp.percentage}% score).`);
    } else if (tp.percentage < 55) {
      weaknesses.push(`Requires reinforcement in ${tp.topic} (${tp.percentage}% score).`);
      personalizedRecommendations.push(`Dedicate targeted practice to ${tp.topic} core fundamentals and standard interview patterns.`);
    }
  }

  // Scan common mistakes from questions
  for (const q of questions) {
    if (q.incorrectStatements && q.incorrectStatements.length > 0) {
      commonMistakes.push(...q.incorrectStatements);
    }
    if (q.missingPoints && q.missingPoints.length > 0 && q.percentageScore < 60) {
      commonMistakes.push(`In ${q.topic}: Missed critical concepts (${q.missingPoints.slice(0, 2).join(', ')}).`);
    }
  }

  if (strengths.length === 0) {
    strengths.push("Attempted diverse question formats across objective, subjective, and analytical domains.");
  }
  if (weaknesses.length === 0) {
    weaknesses.push("Consistent performance with minor scope for edge-case optimization.");
  }
  if (personalizedRecommendations.length === 0) {
    personalizedRecommendations.push("Maintain competitive readiness by taking timed adaptive assessments weekly.");
  }

  let readinessStatus = "Needs Practice";
  if (overallPercentage >= 80) readinessStatus = "Placement Ready (Top Tier)";
  else if (overallPercentage >= 65) readinessStatus = "Competent (Target Weak Topics)";
  else if (overallPercentage >= 45) readinessStatus = "Foundational (Active Revision Required)";

  // Recommended next assessment
  const weakTopic = topicPerformance.find(t => t.percentage < 65)?.topic || sessionDoc.topics?.[0] || 'Data Structures';
  const recommendedNextAssessment = {
    category: sessionDoc.category || 'technical',
    topic: weakTopic,
    suggestedDifficulty: overallPercentage >= 75 ? 'hard' : overallPercentage >= 50 ? 'medium' : 'easy',
    rationale: `Targeted revision in ${weakTopic} to push placement readiness above 80%.`
  };

  const timeTakenSeconds = sessionDoc.startedAt
    ? Math.max(1, Math.round((Date.now() - new Date(sessionDoc.startedAt).getTime()) / 1000))
    : 0;

  const questionReviews = questions.map((q, idx) => ({
    questionIndex: idx + 1,
    questionId: q.questionId,
    questionText: q.questionText,
    topic: q.topic,
    difficulty: q.difficulty,
    questionType: q.questionType,
    maxMarks: q.maxMarks,
    scoreAwarded: q.marksAwarded || 0,
    studentAnswer: q.studentAnswer || '',
    isCorrect: (q.marksAwarded || 0) === q.maxMarks,
    correctAnswer: q.correctAnswer || null,
    modelAnswer: q.modelAnswer || null,
    explanation: q.explanation || null,
    feedback: q.feedback || '',
    rubricScores: q.rubricScores || [],
    coveredPoints: q.coveredPoints || [],
    missingPoints: q.missingPoints || [],
    testCaseResults: q.testCaseResults || []
  }));

  return {
    totalScore: totalScoreAwarded,
    maxScore: maxPossibleScore,
    maxPossibleScore,
    overallPercentage,
    readinessStatus,
    readinessGrade: readinessStatus,
    totalQuestions: questions.length,
    objectiveTotalCount: objCorrect + objIncorrect + objUnanswered,
    objectiveCorrectCount: objCorrect,
    objectiveIncorrectCount: objIncorrect,
    unansweredCount: objUnanswered,
    subjectiveScore: Math.round(subScore * 10) / 10,
    subjectiveMaxScore: subMax,
    codingPassedCount: codingTestsPassed,
    codingTotalCount: codingTestsTotal,
    questionReviews,
    topicPerformance,
    topicBreakdown,
    difficultyPerformance,
    difficultyBreakdown,
    timeTakenSeconds,
    strengths,
    weaknesses,
    commonMistakes: Array.from(new Set(commonMistakes)).slice(0, 5),
    personalizedRecommendations,
    recommendedNextAssessment
  };
};
