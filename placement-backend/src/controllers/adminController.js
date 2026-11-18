import Student from '../models/Student.js';
import Company from '../models/Company.js';
import PlacementDrive from '../models/PlacementDrive.js';
import Interview from '../models/Interview.js';
import Application from '../models/Application.js';
import User from '../models/User.js';
import TPO from '../models/TPO.js';
import SystemConfig from '../models/SystemConfig.js';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';
import EmailLog from '../models/EmailLog.js';
import { buildPlacementReport, attachApplicantCounts } from '../utils/reports.js';
import { getEmailDiagnosticsSummary, verifyTransporterConnection, sendAdminDiagnosticTestEmail } from '../services/emailService.js';

// Helper for audit logging
const logAudit = async (user, action, module, details, status = 'success') => {
  try {
    await AuditLog.create({
      user: user.id,
      userName: user.name || 'Admin User',
      userRole: user.role || 'admin',
      action,
      module,
      details,
      status
    });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        adminId: user.adminId || `ADM-${user._id.toString().slice(-4).toUpperCase()}`,
        designation: user.designation || 'System Administrator',
        department: user.department || 'Placement Administration',
        organization: user.organization || 'University Placement Cell',
        bio: user.bio || '',
        officeLocation: user.officeLocation || 'Admin Block, Room 101',
        profilePicture: user.profilePicture || '',
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, adminId, designation, department, organization, bio, officeLocation } = req.body;

    // Whitelist only safe admin profile fields - strictly reject role or permissions tampering
    const safeUpdates = { updatedAt: Date.now() };
    if (name) safeUpdates.name = name.trim();
    if (phone !== undefined) safeUpdates.phone = phone.trim();
    if (adminId !== undefined) safeUpdates.adminId = adminId.trim();
    if (designation !== undefined) safeUpdates.designation = designation.trim();
    if (department !== undefined) safeUpdates.department = department.trim();
    if (organization !== undefined) safeUpdates.organization = organization.trim();
    if (bio !== undefined) safeUpdates.bio = bio.trim();
    if (officeLocation !== undefined) safeUpdates.officeLocation = officeLocation.trim();

    const user = await User.findByIdAndUpdate(
      req.user.id,
      safeUpdates,
      { new: true }
    ).select('-password');

    await logAudit(req.user, 'Update Profile', 'Admin Profile', 'Updated Admin profile details');
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a valid image file (JPG, PNG, WEBP, GIF).' });
    }
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: avatarUrl },
      { new: true }
    ).select('-password');
    res.json({ message: 'Profile photo updated successfully', profilePicture: avatarUrl, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    await logAudit(req.user, 'Change Password', 'Security', 'Admin changed account password');

    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await Student.countDocuments();
    const totalCompanies = await Company.countDocuments();
    const totalTPO = await User.countDocuments({ role: 'tpo' });
    const totalAdmin = await User.countDocuments({ role: 'admin' });
    const totalDrives = await PlacementDrive.countDocuments();
    const activeDrives = await PlacementDrive.countDocuments({ status: { $in: ['upcoming', 'ongoing'] } });
    const totalApplications = await Application.countDocuments();
    const placedStudents = await Student.countDocuments({ isPlaced: true });

    const recentLogs = await AuditLog.find().sort({ createdAt: -1 }).limit(10);
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      totalUsers,
      totalStudents,
      totalCompanies,
      totalTPO,
      totalAdmin,
      totalDrives,
      activeDrives,
      totalApplications,
      placedStudents,
      recentLogs,
      recentUsers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, additionalData } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password: password || 'Password123',
      role: role || 'student'
    });

    if (role === 'student') {
      await Student.create({
        userId: user._id,
        rollNumber: additionalData?.rollNumber || `ROLL-${Date.now()}`,
        department: additionalData?.department || 'CSE',
        batch: additionalData?.batch || '2026',
        cgpa: additionalData?.cgpa ? Number(additionalData.cgpa) : 0
      });
    } else if (role === 'company') {
      await Company.create({
        userId: user._id,
        companyName: additionalData?.companyName || name,
        hrName: additionalData?.hrName || name,
        hrEmail: additionalData?.hrEmail || email
      });
    } else if (role === 'tpo') {
      await TPO.create({
        userId: user._id,
        employeeId: additionalData?.employeeId || `EMP-${Date.now()}`,
        department: additionalData?.department || 'Training & Placement Office'
      });
    }

    await logAudit(req.user, 'Create User', 'User Management', `Created ${role} user: ${email}`);

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (targetUser.role === 'admin' && !isActive) {
      const activeAdminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (activeAdminCount <= 1) {
        return res.status(400).json({ error: 'Cannot deactivate the last active administrator account.' });
      }
    }

    targetUser.isActive = isActive;
    await targetUser.save();

    await logAudit(req.user, 'Toggle User Status', 'User Management', `User ${targetUser.email} isActive set to ${isActive}`);

    res.json(targetUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.password = newPassword || 'Password123!';
    await user.save();

    await logAudit(req.user, 'Reset Password', 'User Management', `Admin reset password for user ${user.email}`);

    res.json({ message: `Password reset successfully for ${user.email}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (targetUser.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last remaining administrator account.' });
      }
    }

    await User.findByIdAndDelete(userId);

    if (targetUser.role === 'student') await Student.deleteOne({ userId: targetUser._id });
    if (targetUser.role === 'company') await Company.deleteOne({ userId: targetUser._id });
    if (targetUser.role === 'tpo') await TPO.deleteOne({ userId: targetUser._id });

    await logAudit(req.user, 'Delete User', 'User Management', `Deleted ${targetUser.role} user ${targetUser.email}`);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRolesPermissions = async (req, res) => {
  try {
    const rolesPermissions = [
      {
        role: 'Student',
        key: 'student',
        permissions: ['View Dashboard', 'Apply to Drives', 'Upload Resume', 'View AI Resume Score', 'Manage Profile']
      },
      {
        role: 'Company',
        key: 'company',
        permissions: ['View Dashboard', 'Create Drives', 'View Applicants', 'Shortlist/Select Candidates', 'Schedule Interviews']
      },
      {
        role: 'TPO',
        key: 'tpo',
        permissions: ['View Placement Control Center', 'Manage Students', 'Manage Companies', 'Create/Manage Drives', 'Monitor Applications', 'View Analytics', 'Export Reports', 'Receive Alerts']
      },
      {
        role: 'Admin',
        key: 'admin',
        permissions: ['System Overview', 'Full User CRUD', 'Roles & Permissions Control', 'System Configuration', 'Platform Audit Logs', 'Platform Analytics', 'System Alerts']
      }
    ];

    res.json(rolesPermissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSystemConfig = async (req, res) => {
  try {
    let config = await SystemConfig.findOne();
    if (!config) {
      config = await SystemConfig.create({
        departments: ['CSE', 'ECE', 'IT', 'ME', 'EEE', 'Civil']
      });
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSystemConfig = async (req, res) => {
  try {
    let config = await SystemConfig.findOne();
    if (!config) {
      config = new SystemConfig(req.body);
    } else {
      Object.assign(config, req.body);
      config.updatedBy = req.user.id;
      config.updatedAt = Date.now();
    }
    await config.save();

    await logAudit(req.user, 'Update Configuration', 'System Settings', 'Updated system preferences and college details');

    res.json({ message: 'System configuration updated successfully', config });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPlatformAnalytics = async (req, res) => {
  try {
    const userRoleCounts = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    const activeDrives = await PlacementDrive.countDocuments({ status: { $in: ['upcoming', 'ongoing'] } });
    const totalApps = await Application.countDocuments();
    const totalLogs = await AuditLog.countDocuments();

    res.json({
      userRoleCounts,
      activeDrives,
      totalApps,
      totalLogs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate('userId', 'name email')
      .populate('placedCompany', 'companyName');
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find().populate('userId', 'name email');
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.body.companyId,
      { isVerified: true },
      { new: true }
    );
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    await logAudit(req.user, 'Verify Company', 'Admin Action', `Verified company ${company.companyName}`);
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDrives = async (req, res) => {
  try {
    const drives = await PlacementDrive.find().populate('company');
    res.json(await attachApplicantCounts(drives));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find()
      .populate({ path: 'student', populate: { path: 'userId', select: 'name email' } })
      .populate('company')
      .populate('placementDrive');
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const generateReports = async (req, res) => {
  try {
    res.json(await buildPlacementReport());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { recipientRole: 'all' },
        { recipientRole: 'admin' },
        { recipientUserId: req.user.id }
      ]
    }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    if (notificationId === 'all') {
      await Notification.updateMany({ isRead: false }, { isRead: true });
      return res.json({ message: 'All notifications marked as read' });
    }
    const updated = await Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==============================================================================
// CENTRALIZED EMAIL NOTIFICATION DIAGNOSTICS & TESTING (ADMIN-ONLY)
// ==============================================================================

export const getEmailDiagnostics = async (req, res) => {
  try {
    const summary = await getEmailDiagnosticsSummary();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyEmailConnection = async (req, res) => {
  try {
    const result = await verifyTransporterConnection();
    await logAudit(
      req.user,
      'Verify Email Transporter',
      'Email System',
      `Result: ${result.success ? 'Success' : 'Failed'} - ${result.message}`
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const sendTestEmail = async (req, res) => {
  try {
    // Only send to the authenticated admin's registered email or an explicitly provided test recipient
    const targetEmail = (req.body.targetEmail || req.user.email || '').trim().toLowerCase();
    
    if (!targetEmail) {
      return res.status(400).json({ error: 'No recipient email specified for test dispatch.' });
    }

    const startTime = Date.now();
    const result = await sendAdminDiagnosticTestEmail({
      to: targetEmail,
      adminName: req.user.name || 'System Administrator'
    });

    const durationMs = Date.now() - startTime;

    await logAudit(
      req.user,
      'Send Test Email',
      'Email System',
      `Dispatched test email to ${targetEmail} | Result: ${result.success ? 'Success' : 'Failed'} (${durationMs}ms)`
    );

    res.json({
      ...result,
      durationMs,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getEmailLogs = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const logs = await EmailLog.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

