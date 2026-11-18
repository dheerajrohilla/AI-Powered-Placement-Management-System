import express from 'express';
import {
  getQuizConfig,
  startQuizSession,
  submitQuizAnswers,
  getAttemptDetails,
  getStudentDashboard,
  generateAIQuestions
} from '../controllers/quizController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All quiz operations require authentication
router.use(protect);

// Quiz configuration & subject catalog
router.get('/config', getQuizConfig);

// Quiz lifecycle
router.post('/start', startQuizSession);
router.post('/submit', submitQuizAnswers);

// Performance analytics & review
router.get('/dashboard', getStudentDashboard);
router.get('/attempts/:attemptId', getAttemptDetails);

// Optional AI Question Generator
router.post('/generate-ai', generateAIQuestions);

export default router;
