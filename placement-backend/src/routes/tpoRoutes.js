import express from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  getDashboard,
  getStudents,
  getCompanies,
  verifyCompany,
  getDrives,
  createDrive,
  updateDrive,
  toggleDriveStatus,
  getApplications,
  updateApplicationStatus,
  getInterviews,
  getAnalytics,
  generateReports,
  getNotifications,
  markNotificationRead
} from '../controllers/tpoController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('tpo', 'admin'));

// Profile & Security
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

// Dashboard
router.get('/dashboard', getDashboard);

// Operations Management
router.get('/students', getStudents);
router.get('/companies', getCompanies);
router.post('/verify-company', verifyCompany);

// Placement Drive Management
router.get('/drives', getDrives);
router.post('/drives', createDrive);
router.put('/drives/:driveId', updateDrive);
router.patch('/drives/:driveId/status', toggleDriveStatus);

// Application Monitoring
router.get('/applications', getApplications);
router.patch('/applications/:applicationId/status', updateApplicationStatus);

// Interviews & Analytics
router.get('/interviews', getInterviews);
router.get('/analytics', getAnalytics);
router.get('/reports', generateReports);

// Notifications
router.get('/notifications', getNotifications);
router.patch('/notifications/:notificationId/read', markNotificationRead);

export default router;
