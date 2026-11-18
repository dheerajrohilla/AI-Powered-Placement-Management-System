import express from 'express';
import {
  getDashboard,
  getProfile,
  uploadProfilePhoto,
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
  withdrawApplication,
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
  testEmailDelivery,
  getAiDashboardSummary,
  generateCoverLetter,
  generateRecruiterEmail,
  summarizePlacementDrive,
  generateCollaborationExercise,
  getGeminiDiagnosticStatus
} from '../controllers/studentController.js';
import {
  getWorkspaces,
  createWorkspace,
  getWorkspaceById,
  getWorkspaceMembers,
  updateWorkspace,
  deleteWorkspace,
  joinWorkspace,
  inviteToWorkspace,
  getMyInvitations,
  respondToInvitation,
  getChannelMessages,
  postMessageHttp,
  editMessage,
  deleteMessage,
  getWorkspaceTasks,
  createWorkspaceTask,
  updateWorkspaceTaskStatus,
  getWorkspaceResources,
  createWorkspaceResource,
  getCodeSession,
  updateCodeSession,
  runCollaborativeCode
} from '../controllers/workspaceController.js';
import {
  createSession,
  getSession,
  saveAnswer,
  submitAnswer,
  getSessionFollowUp,
  runSampleCode,
  submitSession,
  getSessionReport,
  getHistory,
  getRecruitmentPatterns
} from '../controllers/aiPrepController.js';
import { protect, authorize } from '../middleware/auth.js';
import { handleAvatarUpload } from '../middleware/upload.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '../..');
const resumeDirectory = path.join(backendRoot, 'uploads/resumes');
fs.mkdirSync(resumeDirectory, { recursive: true });

const uploadResumeFile = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      fs.mkdirSync(resumeDirectory, { recursive: true });
      cb(null, resumeDirectory);
    },
    filename: (req, file, callback) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.pdf';
      callback(null, `${req.user.id}-${Date.now()}${ext}`);
    }
  }),
  fileFilter: (req, file, callback) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype || '';
    const isPdf = ext === '.pdf' || mime.includes('pdf');
    const isDocx = ext === '.docx' || ext === '.doc' ||
      mime.includes('wordprocessingml') ||
      mime.includes('msword') ||
      mime.includes('officedocument');

    if (isPdf || isDocx) {
      return callback(null, true);
    }
    return callback(new Error('Only PDF (.pdf) and Word (.docx, .doc) resume files are allowed'));
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

const router = express.Router();

router.use(protect);
router.use(authorize('student'));

// Dashboard & Profile
router.get('/dashboard', getDashboard);
router.get('/dashboard/ai-summary', getAiDashboardSummary);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile/photo', handleAvatarUpload, uploadProfilePhoto);
router.get('/gemini-status', getGeminiDiagnosticStatus);

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

// Master AI Preparation & Placement Assessment System
router.get('/ai-prep/patterns', getRecruitmentPatterns);
router.post('/ai-prep/create', createSession);
router.get('/ai-prep/history', getHistory);
router.get('/ai-prep/session/:id', getSession);
router.post('/ai-prep/session/:id/save-answer', saveAnswer);
router.post('/ai-prep/session/:id/submit-answer', submitAnswer);
router.post('/ai-prep/session/:id/follow-up', getSessionFollowUp);
router.post('/ai-prep/session/:id/run-code', runSampleCode);
router.post('/ai-prep/session/:id/submit', submitSession);
router.get('/ai-prep/session/:id/report', getSessionReport);

// Feature 6: Anonymous Peer Benchmarking
router.get('/peer-benchmark', getPeerBenchmark);

// Feature 7: Skill-Based Student Collaboration & Workspaces
router.get('/collaborate/matches', getCollaborationMatches);
router.post('/collaborate/request', sendCollaborationRequest);
router.get('/collaborate/requests', getCollaborationRequests);
router.patch('/collaborate/request/:id', updateCollaborationRequest);
router.post('/collaborate/exercise', generateCollaborationExercise);

// Industry-Grade Peer Collaboration Workspaces
router.get('/workspaces', getWorkspaces);
router.post('/workspaces', createWorkspace);
router.get('/workspaces/invitations', getMyInvitations);
router.post('/workspaces/invitations/:invitationId/respond', respondToInvitation);
router.get('/workspaces/:id', getWorkspaceById);
router.get('/workspaces/:id/members', getWorkspaceMembers);
router.put('/workspaces/:id', updateWorkspace);
router.delete('/workspaces/:id', deleteWorkspace);
router.post('/workspaces/:id/join', joinWorkspace);
router.post('/workspaces/:id/invite', inviteToWorkspace);
router.get('/workspaces/:id/channels/:channelId/messages', getChannelMessages);
router.post('/workspaces/:id/channels/:channelId/messages', postMessageHttp);
router.put('/workspaces/:id/messages/:messageId', editMessage);
router.delete('/workspaces/:id/messages/:messageId', deleteMessage);
router.get('/workspaces/:id/tasks', getWorkspaceTasks);
router.post('/workspaces/:id/tasks', createWorkspaceTask);
router.patch('/workspaces/:id/tasks/:taskId', updateWorkspaceTaskStatus);
router.patch('/workspaces/:id/tasks/:taskId/status', updateWorkspaceTaskStatus);
router.get('/workspaces/:id/resources', getWorkspaceResources);
router.post('/workspaces/:id/resources', createWorkspaceResource);
router.get('/workspaces/:id/code-session', getCodeSession);
router.put('/workspaces/:id/code-session', updateCodeSession);
router.post('/workspaces/:id/code-session/run', runCollaborativeCode);

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

// Drives, Applications & AI Application Assistant
router.get('/drives', getPlacementDrives);
router.post('/apply', applyForDrive);
router.get('/applications', getApplications);
router.patch('/applications/:applicationId/withdraw', withdrawApplication);
router.delete('/applications/:applicationId', withdrawApplication);
router.get('/interviews', getInterviews);
router.post('/application-assistant/cover-letter', generateCoverLetter);
router.post('/application-assistant/recruiter-email', generateRecruiterEmail);
router.get('/application-assistant/summarize/:driveId', summarizePlacementDrive);

// Student Notifications & Diagnostics
router.get('/notifications', getStudentNotifications);
router.patch('/notifications/:notificationId/read', markStudentNotificationRead);
router.post('/test-email', testEmailDelivery);

export default router;
