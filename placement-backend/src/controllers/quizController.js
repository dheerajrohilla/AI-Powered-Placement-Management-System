import * as quizService from '../services/quizService.js';

/**
 * Controller: Get quiz configuration and subject metadata.
 * GET /api/quiz/config
 */
export const getQuizConfig = async (req, res) => {
  try {
    const config = await quizService.getQuizConfig();
    res.json({
      success: true,
      ...config
    });
  } catch (error) {
    console.error('[QuizController] getQuizConfig error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve quiz configuration.',
      details: error.message
    });
  }
};

/**
 * Controller: Start a new quiz attempt session.
 * POST /api/quiz/start
 * Body: { subject: 'dsa', difficulty: 'easy' | 'medium' | 'hard' }
 */
export const startQuizSession = async (req, res) => {
  try {
    const { subject, difficulty } = req.body;

    if (!subject || !difficulty) {
      return res.status(400).json({
        success: false,
        error: 'Both subject and difficulty level are required.'
      });
    }

    const session = await quizService.startQuiz(req.user.id, subject, difficulty);

    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('[QuizController] startQuizSession error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Controller: Submit answers and evaluate score securely.
 * POST /api/quiz/submit
 * Body: { quizSessionId, answers: { [questionId]: selectedOptionIndex }, timeSpentSeconds }
 */
export const submitQuizAnswers = async (req, res) => {
  try {
    const { quizSessionId, answers, timeSpentSeconds } = req.body;

    if (!quizSessionId) {
      return res.status(400).json({
        success: false,
        error: 'Quiz session ID is required for submission.'
      });
    }

    const result = await quizService.submitQuiz(req.user.id, {
      quizSessionId,
      answers: answers || {},
      timeSpentSeconds: timeSpentSeconds || 0
    });

    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('[QuizController] submitQuizAnswers error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Controller: Get full review answers for a single attempt.
 * GET /api/quiz/attempts/:attemptId
 */
export const getAttemptDetails = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const result = await quizService.getAttemptDetails(req.user.id, attemptId);

    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('[QuizController] getAttemptDetails error:', error);
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Controller: Get comprehensive student quiz performance dashboard stats.
 * GET /api/quiz/dashboard
 */
export const getStudentDashboard = async (req, res) => {
  try {
    const stats = await quizService.getStudentDashboardStats(req.user.id);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('[QuizController] getStudentDashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load quiz performance analytics.',
      details: error.message
    });
  }
};

/**
 * Controller: Generate AI questions using Gemini (optional).
 * POST /api/quiz/generate-ai
 */
export const generateAIQuestions = async (req, res) => {
  try {
    const { subject, difficulty, count } = req.body;
    const questions = await quizService.generateAIQuestions(subject, difficulty, count || 5);

    res.json({
      success: true,
      count: questions.length,
      questions
    });
  } catch (error) {
    console.error('[QuizController] generateAIQuestions error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
