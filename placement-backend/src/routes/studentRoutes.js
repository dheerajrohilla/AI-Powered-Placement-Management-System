import express from 'express';
import {
  getDashboard,
  getProfile,
  uploadResume,
  getATSAnalysis,
  checkResumeText,
  getSkillAnalysis,
  syncSkills,
  chatWithBot,
  getChatHistory,
  clearChatHistory,
  updateProfile,
  getPlacementDrives,
  applyForDrive,
  getApplications,
  getInterviews,
  getCredibilityAnalysis,
  getPlacementJourney,
  getRejectionAnalysis,
  getCompanyPrepMode,
  generateMockInterview,
  submitMockAnswer,
  completeMockInterview,
  getMockInterviews,
  getMockInterviewById,
  getPeerBenchmark,
  getCollaborationMatches,
  sendCollaborationRequest,
  getCollaborationRequests,
  updateCollaborationRequest,
  getStudentNotifications,
  markStudentNotificationRead,
  testEmailDelivery
} from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const resumeDirectory = path.join(process.cwd(), 'uploads/resumes');
fs.mkdirSync(resumeDirectory, { recursive: true });
const uploadResumeFile = multer({
  storage: multer.diskStorage({
    destination: resumeDirectory,
    filename: (req, file, callback) => callback(null, `${req.user.id}-${Date.now()}.pdf`)
  }),
  fileFilter: (req, file, callback) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;
    if (ext === '.pdf' && mime === 'application/pdf') {
      return callback(null, true);
    }
    return callback(null, false);
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

const router = express.Router();

router.use(protect);
router.use(authorize('student'));

// Dashboard & Profile
router.get('/dashboard', getDashboard);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Feature 1: AI Resume Consistency / Credibility Checker
router.get('/credibility-analysis', getCredibilityAnalysis);

// Feature 3: Placement Journey & Skill Roadmap
router.get('/placement-journey', getPlacementJourney);

// Feature 4: "Why Am I Not Getting Shortlisted?" Analyzer
router.get('/rejection-analysis', getRejectionAnalysis);

// Feature 5: Company-Specific Preparation Mode
router.get('/company-prep/:driveId?', getCompanyPrepMode);

// Feature 2: AI Mock Interview → Placement Score
router.post('/mock-interview/generate', generateMockInterview);
router.post('/mock-interview/:id/answer', submitMockAnswer);
router.post('/mock-interview/:id/complete', completeMockInterview);
router.get('/mock-interviews', getMockInterviews);
router.get('/mock-interview/:id', getMockInterviewById);

// Feature 6: Anonymous Peer Benchmarking
router.get('/peer-benchmark', getPeerBenchmark);

// Feature 7: Skill-Based Student Collaboration
router.get('/collaborate/matches', getCollaborationMatches);
router.post('/collaborate/request', sendCollaborationRequest);
router.get('/collaborate/requests', getCollaborationRequests);
router.patch('/collaborate/request/:id', updateCollaborationRequest);

// Real ATS & Resume Endpoints
router.post('/resume', uploadResumeFile.single('resume'), uploadResume);
router.get('/ats-analysis', getATSAnalysis);
router.post('/ats-check-text', checkResumeText);

// Real-Time Skill Analysis & Sync
router.get('/skill-analysis', getSkillAnalysis);
router.post('/sync-skills', syncSkills);

// Real-Time Placement Assistant Chatbot
router.post('/chatbot', chatWithBot);
router.get('/chatbot/history', getChatHistory);
router.delete('/chatbot/history', clearChatHistory);

// Drives, Applications & Interviews
router.get('/drives', getPlacementDrives);
router.post('/apply', applyForDrive);
router.get('/applications', getApplications);
router.get('/interviews', getInterviews);

// Student Notifications & Diagnostics
router.get('/notifications', getStudentNotifications);
router.patch('/notifications/:notificationId/read', markStudentNotificationRead);
router.post('/test-email', testEmailDelivery);

export default router;
