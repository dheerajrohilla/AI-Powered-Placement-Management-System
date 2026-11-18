import AssessmentSession from '../models/AssessmentSession.js';
import Student from '../models/Student.js';
import {
  generateAssessmentQuestions,
  evaluateQuestionAnswer,
  generateComprehensiveReport,
  adjustAdaptiveDifficulty
} from '../utils/aiPrepEngine.js';
import {
  generateQuestionsWithAI,
  generateFollowUpQuestion
} from '../services/assessmentService.js';
import { executeJavaScriptCode } from '../utils/codeExecutionService.js';
import { COMPANY_RECRUITMENT_PATTERNS } from '../utils/aiPrepBank.js';

/**
 * Strips secret answer keys and solutions for active/in-progress assessment sessions
 */
export const sanitizeSessionForStudent = (sessionDoc) => {
  const isCompleted = sessionDoc.status === 'completed';
  const revealImmediate = sessionDoc.revealMode === 'immediate';

  const questions = (sessionDoc.questions || []).map(q => {
    const qObj = q.toObject ? q.toObject() : { ...q };

    const qType = qObj.type || qObj.questionType || (qObj.options && qObj.options.length > 0 ? 'mcq' : 'short_answer');
    qObj.type = qType;
    qObj.questionType = qType;

    // If not completed and not revealed immediately, strip answers and solutions
    if (!isCompleted && (!revealImmediate || !qObj.isAnswered)) {
      delete qObj.correctAnswer;
      delete qObj.modelAnswer;
      delete qObj.explanation;
      delete qObj.sqlExpectedQuery;

      // Filter out hidden test cases
      if (qObj.testCases && Array.isArray(qObj.testCases)) {
        qObj.testCases = qObj.testCases
          .filter(tc => !tc.isHidden)
          .map(tc => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            weight: tc.weight,
            isHidden: false
          }));
      }
    }

    return qObj;
  });

  const sessionObj = sessionDoc.toObject ? sessionDoc.toObject() : { ...sessionDoc };
  sessionObj.questions = questions;
  return sessionObj;
};

/**
 * 1. Create a new Assessment Session
 */
export const createSession = async (req, res) => {
  try {
    const {
      category = 'technical',
      topics = [],
      targetCompany = null,
      targetRole = 'Software Engineer',
      difficulty = 'medium',
      questionMix = 'mixed',
      questionCount = 10,
      durationMinutes = 30,
      revealMode = 'end',
      negativeMarking = false
    } = req.body;

    let student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      student = await Student.create({
        userId: req.user.id,
        rollNumber: `ROLL-${Date.now().toString().slice(-6)}`,
        department: 'General',
        batch: new Date().getFullYear().toString()
      });
    }

    // Generate questions matching configuration (Gemini AI powered when configured)
    const questions = await generateQuestionsWithAI({
      category,
      topics,
      company: targetCompany,
      targetRole,
      difficulty,
      questionCount: Math.min(25, Math.max(3, parseInt(questionCount) || 10)),
      questionMix
    });

    const titleCategory = category.charAt(0).toUpperCase() + category.slice(1);
    const title = targetCompany
      ? `${targetCompany} Recruitment Assessment — ${targetRole}`
      : `${titleCategory} Placement Assessment (${difficulty.toUpperCase()})`;

    const duration = Math.min(180, Math.max(5, parseInt(durationMinutes) || 30));
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + duration * 60 * 1000);

    const session = await AssessmentSession.create({
      student: student._id,
      title,
      category,
      topics: topics.length > 0 ? topics : [titleCategory],
      targetCompany,
      targetRole,
      difficulty,
      questionMix,
      durationMinutes: duration,
      revealMode,
      negativeMarking,
      status: 'in_progress',
      startedAt,
      expiresAt,
      questions
    });

    const sanitized = sanitizeSessionForStudent(session);
    res.status(201).json({
      session: sanitized,
      ...sanitized
    });
  } catch (error) {
    console.error('createSession error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 2. Get Assessment Session by ID
 */
export const getSession = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const session = await AssessmentSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Assessment session not found' });

    if (session.student.toString() !== student._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized access to this assessment' });
    }

    // Check timer expiration
    if (session.status === 'in_progress' && session.expiresAt && new Date() > new Date(session.expiresAt)) {
      // Auto-submit expired assessment
      const report = await generateComprehensiveReport(session);
      session.status = 'completed';
      session.completedAt = new Date();
      session.results = report;
      await session.save();
    }

    const sanitized = sanitizeSessionForStudent(session);
    res.json({ session: sanitized, ...sanitized });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 3. Autosave Question Answer (Does not finalize)
 */
export const saveAnswer = async (req, res) => {
  try {
    const { questionId } = req.body;
    const studentAnswer = req.body.studentAnswer !== undefined
      ? req.body.studentAnswer
      : (req.body.answer !== undefined ? req.body.answer : '');

    const student = await Student.findOne({ userId: req.user.id });
    const session = await AssessmentSession.findById(req.params.id);

    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.student.toString() !== student._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    if (session.status === 'completed') {
      return res.status(400).json({ error: 'Assessment has already been submitted.' });
    }

    const q = session.questions.find(item => item.questionId === questionId);
    if (!q) return res.status(404).json({ error: 'Question not found' });

    q.studentAnswer = studentAnswer || '';
    q.isAnswered = Boolean(studentAnswer && studentAnswer.toString().trim().length > 0);
    q.answeredAt = new Date();
    await session.save();

    res.json({ message: 'Answer saved', questionId, isAnswered: q.isAnswered, savedAt: q.answeredAt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 4. Submit Answer (Evaluates if in immediate mode)
 */
export const submitAnswer = async (req, res) => {
  try {
    const { questionId } = req.body;
    const studentAnswer = req.body.studentAnswer !== undefined
      ? req.body.studentAnswer
      : (req.body.answer !== undefined ? req.body.answer : '');

    const student = await Student.findOne({ userId: req.user.id });
    const session = await AssessmentSession.findById(req.params.id);

    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.student.toString() !== student._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    if (session.status === 'completed') {
      return res.status(400).json({ error: 'Assessment has already been submitted.' });
    }

    const q = session.questions.find(item => item.questionId === questionId);
    if (!q) return res.status(404).json({ error: 'Question not found' });

    q.studentAnswer = studentAnswer || '';
    q.isAnswered = true;
    q.answeredAt = new Date();

    // Evaluate response
    const evaluation = await evaluateQuestionAnswer(q, studentAnswer, { negativeMarking: session.negativeMarking });
    q.marksAwarded = evaluation.marksAwarded || 0;
    q.percentageScore = evaluation.percentage || evaluation.percentageScore || 0;
    q.feedback = evaluation.feedback || '';
    q.rubricScores = evaluation.rubricScores || [];
    q.coveredPoints = evaluation.coveredPoints || [];
    q.missingPoints = evaluation.missingPoints || [];
    q.incorrectStatements = evaluation.incorrectStatements || [];
    q.testCaseResults = evaluation.testCaseResults || [];

    // Adaptive hint if applicable
    let adaptiveNextDifficulty = null;
    if (session.difficulty === 'adaptive') {
      const answeredScores = session.questions
        .filter(item => item.isAnswered && item.percentageScore != null)
        .map(item => item.percentageScore);
      adaptiveNextDifficulty = adjustAdaptiveDifficulty(q.difficulty, answeredScores);
    }

    // Generate targeted follow-up question for partial or incorrect answers
    let followUp = null;
    if (q.percentageScore < 70 && q.questionType !== 'coding') {
      try {
        followUp = await generateFollowUpQuestion({
          previousQuestion: q,
          studentAnswer,
          evaluation
        });
        q.followUpQuestion = followUp.questionText;
      } catch (fErr) {
        console.warn('Follow-up generation warning:', fErr.message);
      }
    }

    await session.save();

    res.json({
      questionId,
      evaluation: {
        marksAwarded: q.marksAwarded,
        maxMarks: q.maxMarks,
        percentageScore: q.percentageScore,
        feedback: q.feedback,
        rubricScores: q.rubricScores,
        coveredPoints: q.coveredPoints,
        missingPoints: q.missingPoints,
        incorrectStatements: q.incorrectStatements,
        explanation: session.revealMode === 'immediate' ? q.explanation : undefined,
        modelAnswer: session.revealMode === 'immediate' ? q.modelAnswer : undefined,
        testCaseResults: q.testCaseResults,
        followUpQuestion: followUp?.questionText || q.followUpQuestion
      },
      followUp,
      adaptiveNextDifficulty
    });
  } catch (error) {
    console.error('submitAnswer error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 4b. On-demand AI Follow-up Question Generator
 */
export const getSessionFollowUp = async (req, res) => {
  try {
    const { questionId } = req.body;
    const session = await AssessmentSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const q = session.questions.find(item => item.questionId === questionId);
    if (!q) return res.status(404).json({ error: 'Question not found' });

    const followUp = await generateFollowUpQuestion({
      previousQuestion: q,
      studentAnswer: q.studentAnswer || '',
      evaluation: {
        missingPoints: q.missingPoints,
        feedback: q.feedback
      }
    });

    q.followUpQuestion = followUp.questionText;
    await session.save();

    res.json({
      questionId,
      followUp
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 5. Run Sample Tests for Coding Questions (Without saving final answer)
 */
export const runSampleCode = async (req, res) => {
  try {
    const { questionId, code } = req.body;
    const session = await AssessmentSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const q = session.questions.find(item => item.questionId === questionId);
    if (!q) return res.status(404).json({ error: 'Question not found' });
    if (q.questionType !== 'coding') {
      return res.status(400).json({ error: 'Question is not a coding problem.' });
    }

    // Only run against non-hidden sample test cases
    const visibleTestCases = (q.testCases || []).filter(tc => !tc.isHidden);
    const result = executeJavaScriptCode(code, visibleTestCases);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 6. Finalize & Submit Complete Assessment (Idempotent)
 */
export const submitSession = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    const session = await AssessmentSession.findById(req.params.id);

    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.student.toString() !== student._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Idempotent: If already completed, return existing results directly
    if (session.status === 'completed' && session.results) {
      const sanitized = sanitizeSessionForStudent(session);
      return res.json({ alreadySubmitted: true, session: sanitized, ...sanitized });
    }

    // Generate full comprehensive report
    const report = await generateComprehensiveReport(session);
    session.status = 'completed';
    session.completedAt = new Date();
    session.results = report;
    await session.save();

    // Update student's placement readiness and skills
    if (student) {
      const currentStrength = student.profileStrength || 60;
      student.profileStrength = Math.min(100, Math.max(currentStrength, report.overallPercentage));
      await student.save();
    }

    const sanitized = sanitizeSessionForStudent(session);
    res.json({ session: sanitized, ...sanitized });
  } catch (error) {
    console.error('submitSession error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 7. Get Full Assessment Results Report
 */
export const getSessionReport = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    const session = await AssessmentSession.findById(req.params.id);

    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.student.toString() !== student._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (session.status !== 'completed' || !session.results) {
      // Complete now if unfinished
      const report = await generateComprehensiveReport(session);
      session.status = 'completed';
      session.completedAt = new Date();
      session.results = report;
      await session.save();
    }

    res.json({
      sessionId: session._id,
      title: session.title,
      category: session.category,
      topics: session.topics,
      targetCompany: session.targetCompany,
      targetRole: session.targetRole,
      difficulty: session.difficulty,
      completedAt: session.completedAt,
      report: session.results,
      questions: session.questions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 8. Get Past Assessment History for Student
 */
export const getHistory = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const sessions = await AssessmentSession.find({
      student: student._id,
      status: 'completed'
    }).sort({ completedAt: -1 }).limit(30);

    // Compute progress metrics
    const totalTaken = sessions.length;
    const avgScore = totalTaken > 0
      ? Math.round(sessions.reduce((acc, s) => acc + (s.results?.overallPercentage || 0), 0) / totalTaken)
      : 0;

    const weakTopicsMap = {};
    for (const s of sessions) {
      if (s.results?.topicPerformance) {
        for (const tp of s.results.topicPerformance) {
          if (tp.percentage < 60) {
            weakTopicsMap[tp.topic] = (weakTopicsMap[tp.topic] || 0) + 1;
          }
        }
      }
    }

    const priorityRevisionTopics = Object.entries(weakTopicsMap)
      .sort((a, b) => b[1] - a[1])
      .map(([topic, occurrences]) => ({ topic, occurrences }));

    res.json({
      history: sessions.map(s => ({
        id: s._id.toString(),
        _id: s._id,
        sessionId: s._id,
        title: s.title,
        category: s.category,
        topics: s.topics,
        targetCompany: s.targetCompany,
        difficulty: s.difficulty,
        completedAt: s.completedAt,
        score: s.results?.totalScore || 0,
        maxScore: s.results?.maxPossibleScore || 0,
        percentage: s.results?.overallPercentage || 0,
        readinessStatus: s.results?.readinessStatus || 'Evaluated'
      })),
      metrics: {
        totalAssessmentsTaken: totalTaken,
        averagePercentage: avgScore,
        priorityRevisionTopics
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 9. Get Company Recruitment Patterns
 */
export const getRecruitmentPatterns = async (req, res) => {
  try {
    res.json(COMPANY_RECRUITMENT_PATTERNS);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
