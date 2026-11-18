import express from 'express';
import {
  getProfile,
  updateProfile,
  uploadCompanyLogo,
  getDashboard,
  createDrive,
  submitDriveForApproval,
  updateDrive,
  getDrives,
  getApplicants,
  getShortlisted,
  getInterviewCandidates,
  scheduleInterview,
  updateApplicationStatus,
  getInterviews,
  getNotifications,
  markNotificationRead
} from '../controllers/companyController.js';
import { protect, authorize } from '../middleware/auth.js';
import { handleLogoUpload, handleAvatarUpload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);
router.use(authorize('company'));

// Profile & Organization
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile/logo', handleLogoUpload, uploadCompanyLogo);
router.post('/profile/photo', handleAvatarUpload, uploadCompanyLogo);

// Dashboard
router.get('/dashboard', getDashboard);

// Placement Drives & Approval Workflow
router.post('/drives', createDrive);
router.get('/drives', getDrives);
router.put('/drives/:driveId', updateDrive);
router.patch('/drives/:driveId/submit', submitDriveForApproval);
router.post('/drives/:driveId/submit', submitDriveForApproval);
router.post('/drives/:driveId/submit-approval', submitDriveForApproval);

// Candidate & Application Management
router.get('/applicants', getApplicants);
router.get('/shortlisted', getShortlisted);
router.get('/interview-candidates', getInterviewCandidates);
router.get('/candidates', getInterviewCandidates);
router.patch('/applications/:applicationId/status', updateApplicationStatus);
router.put('/applications/:applicationId/status', updateApplicationStatus);

// Interview Scheduling
router.post('/interviews', scheduleInterview);
router.get('/interviews', getInterviews);

// Notifications
router.get('/notifications', getNotifications);
router.patch('/notifications/:notificationId/read', markNotificationRead);

export default router;
