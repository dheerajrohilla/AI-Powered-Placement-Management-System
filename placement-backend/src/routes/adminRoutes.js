import express from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  getDashboard,
  getUsers,
  createUser,
  toggleUserStatus,
  resetUserPassword,
  deleteUser,
  getRolesPermissions,
  getSystemConfig,
  updateSystemConfig,
  getAuditLogs,
  getPlatformAnalytics,
  getStudents,
  getCompanies,
  verifyCompany,
  getDrives,
  getInterviews,
  generateReports,
  getNotifications,
  markNotificationRead,
  getEmailDiagnostics,
  verifyEmailConnection,
  sendTestEmail,
  getEmailLogs
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

// Profile & Security
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

// System Overview Dashboard
router.get('/dashboard', getDashboard);

// User Management (Full CRUD)
router.get('/users', getUsers);
router.post('/users', createUser);
router.patch('/users/:userId/status', toggleUserStatus);
router.post('/users/:userId/reset-password', resetUserPassword);
router.delete('/users/:userId', deleteUser);

// Roles & Permissions & Configuration
router.get('/roles-permissions', getRolesPermissions);
router.get('/configuration', getSystemConfig);
router.put('/configuration', updateSystemConfig);

// Platform Monitoring & Audit Logs
router.get('/monitoring', getAuditLogs);
router.get('/analytics', getPlatformAnalytics);

// Legacy/Compatibility endpoints
router.get('/students', getStudents);
router.get('/companies', getCompanies);
router.post('/verify-company', verifyCompany);
router.get('/drives', getDrives);
router.get('/interviews', getInterviews);
router.get('/reports', generateReports);

// Admin Notifications
router.get('/notifications', getNotifications);
router.patch('/notifications/:notificationId/read', markNotificationRead);

// Centralized Email System & Diagnostics
router.get('/email/diagnostics', getEmailDiagnostics);
router.get('/email/verify-connection', verifyEmailConnection);
router.post('/email/test-send', sendTestEmail);
router.get('/email/logs', getEmailLogs);

export default router;
