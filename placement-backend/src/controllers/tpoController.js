import Student from '../models/Student.js';
import Company from '../models/Company.js';
import PlacementDrive from '../models/PlacementDrive.js';
import Interview from '../models/Interview.js';
import Application from '../models/Application.js';
import User from '../models/User.js';
import TPO from '../models/TPO.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';
import { buildPlacementReport, attachApplicantCounts } from '../utils/reports.js';
import { detectPlacementConflicts } from '../utils/conflictDetectorEngine.js';
import { sendInterviewRescheduledEmail } from '../services/emailService.js';

// Helper for audit logging
const logAudit = async (user, action, module, details, status = 'success') => {
  try {
    await AuditLog.create({
      user: user.id,
      userName: user.name || 'TPO User',
      userRole: user.role || 'tpo',
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
    const user = await User.findById(req.user.id);
    let tpo = await TPO.findOne({ userId: req.user.id });

    if (!tpo) {
      tpo = await TPO.create({
        userId: req.user.id,
        employeeId: `TPO-${Date.now().toString().slice(-4)}`
      });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePicture,
        role: user.role
      },
      tpoProfile: tpo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, department, designation, collegeName, university, officeLocation, employeeId, bio } = req.body;

    if (name || phone !== undefined) {
      await User.findByIdAndUpdate(req.user.id, {
        ...(name && { name: name.trim() }),
        ...(phone !== undefined && { phone: phone.trim() }),
        updatedAt: Date.now()
      });
    }

    const tpoUpdates = {};
    if (department !== undefined) tpoUpdates.department = department;
    if (designation !== undefined) tpoUpdates.designation = designation;
    if (collegeName !== undefined) tpoUpdates.collegeName = collegeName;
    if (university !== undefined) tpoUpdates.university = university;
    if (officeLocation !== undefined) tpoUpdates.officeLocation = officeLocation;
    if (employeeId !== undefined) tpoUpdates.employeeId = employeeId;
    if (bio !== undefined) tpoUpdates.bio = bio;

    const tpo = await TPO.findOneAndUpdate(
      { userId: req.user.id },
      tpoUpdates,
      { new: true, upsert: true }
    );

    const updatedUser = await User.findById(req.user.id).select('-password');
    await logAudit(req.user, 'Update Profile', 'TPO Profile', 'Updated TPO contact and office details');

    res.json({ message: 'Profile updated successfully', tpo, user: updatedUser });
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

    await logAudit(req.user, 'Change Password', 'Security', 'TPO changed account password');

    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDashboard = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalCompanies = await Company.countDocuments();
    const totalDrives = await PlacementDrive.countDocuments();
    const activeDrives = await PlacementDrive.countDocuments({ status: { $in: ['upcoming', 'ongoing'] }, approvalStatus: 'approved' });
    const pendingDrives = await PlacementDrive.countDocuments({ approvalStatus: 'pending_approval' });
    const totalApplications = await Application.countDocuments();
    const shortlistedStudents = await Application.countDocuments({ status: { $in: ['shortlisted', 'interview_scheduled'] } });
    const scheduledInterviews = await Interview.countDocuments({ status: 'scheduled' });
    const selectedStudents = await Student.countDocuments({ isPlaced: true });

    const placementRate = totalStudents > 0 ? ((selectedStudents / totalStudents) * 100).toFixed(1) : 0;

    // Department-wise distribution
    const deptStats = await Student.aggregate([
      {
        $group: {
          _id: '$department',
          total: { $sum: 1 },
          placed: { $sum: { $cond: ['$isPlaced', 1, 0] } }
        }
      }
    ]);

    // Top pending drives awaiting approval
    const pendingDriveList = await PlacementDrive.find({ approvalStatus: 'pending_approval' })
      .populate('company', 'companyName location')
      .limit(5);

    res.json({
      totalStudents,
      totalCompanies,
      totalDrives,
      activeDrives,
      pendingDrives,
      totalApplications,
      shortlistedStudents,
      scheduledInterviews,
      selectedStudents,
      placementRate,
      deptStats,
      pendingDriveList
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate('userId', 'name email phone profilePicture')
      .populate('placedCompany', 'companyName location');
    
    // Attach application history count to each student
    const studentIds = students.map(s => s._id);
    const appCounts = await Application.aggregate([
      { $match: { student: { $in: studentIds } } },
      { $group: { _id: '$student', count: { $sum: 1 } } }
    ]);
    const appMap = new Map(appCounts.map(a => [a._id.toString(), a.count]));

    const enriched = students.map(s => {
      const obj = s.toObject();
      obj.applicationCount = appMap.get(s._id.toString()) || 0;
      return obj;
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find().populate('userId', 'name email phone profilePicture createdAt');
    const enriched = await Promise.all(companies.map(async (c) => {
      const obj = c.toObject();
      obj.drivesCount = await PlacementDrive.countDocuments({ company: c._id });
      obj.applicantsCount = await Application.countDocuments({ company: c._id });
      obj.selectionsCount = await Application.countDocuments({ company: c._id, status: 'selected' });
      return obj;
    }));
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyCompany = async (req, res) => {
  try {
    const { companyId, isVerified } = req.body;
    const verifyStatus = isVerified !== undefined ? isVerified : true;
    const company = await Company.findByIdAndUpdate(
      companyId,
      { isVerified: verifyStatus },
      { new: true }
    ).populate('userId', 'name email');

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    await logAudit(req.user, 'Verify Company', 'Company Management', `Verification updated for ${company.companyName} to ${verifyStatus}`);

    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDrives = async (req, res) => {
  try {
    const drives = await PlacementDrive.find()
      .populate('company')
      .sort({ registrationDeadline: 1 });
    
    const enriched = await attachApplicantCounts(drives);
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createDrive = async (req, res) => {
  try {
    const { title, companyId, description, positions, salary, location, jobRole, jobType, eligibility, registrationDeadline, driveDate, requirements, benefits } = req.body;

    let company = null;
    if (companyId) {
      company = await Company.findById(companyId);
    } else {
      company = await Company.findOne();
    }

    if (!company) {
      return res.status(400).json({ error: 'Company registration is required before creating a drive.' });
    }

    const drive = await PlacementDrive.create({
      title,
      company: company._id,
      description,
      positions: Number(positions) || 1,
      salary: Number(salary) || 0,
      location: location || 'Multiple Locations',
      jobRole: jobRole || title,
      jobType: jobType || 'Full Time',
      eligibility: {
        minCGPA: eligibility?.minCGPA ? Number(eligibility.minCGPA) : 0,
        departments: eligibility?.departments || ['CSE', 'IT', 'ECE'],
        batches: eligibility?.batches || ['2025', '2026']
      },
      registrationDeadline: registrationDeadline || new Date(Date.now() + 15 * 86400000),
      driveDate: driveDate || new Date(Date.now() + 25 * 86400000),
      requirements: Array.isArray(requirements) ? requirements : (requirements ? requirements.split(',') : []),
      benefits: Array.isArray(benefits) ? benefits : (benefits ? benefits.split(',') : []),
      status: 'upcoming'
    });

    await logAudit(req.user, 'Create Placement Drive', 'Drive Management', `Created drive: ${title}`);
    await Notification.create({
      recipientRole: 'student',
      title: 'New Placement Drive Posted',
      message: `${company.companyName} has announced a new drive: ${title}`,
      type: 'info',
      link: '/student/jobs'
    });

    res.status(201).json(drive);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDrive = async (req, res) => {
  try {
    const { driveId } = req.params;
    const drive = await PlacementDrive.findByIdAndUpdate(driveId, req.body, { new: true }).populate('company');
    if (!drive) {
      return res.status(404).json({ error: 'Placement drive not found' });
    }
    await logAudit(req.user, 'Update Placement Drive', 'Drive Management', `Updated drive details for ${drive.title}`);
    res.json(drive);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const toggleDriveStatus = async (req, res) => {
  try {
    const { driveId } = req.params;
    const { status } = req.body;
    const drive = await PlacementDrive.findByIdAndUpdate(driveId, { status }, { new: true });
    await logAudit(req.user, 'Change Drive Status', 'Drive Management', `Drive status changed to ${status}`);
    res.json(drive);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPendingDrives = async (req, res) => {
  try {
    const drives = await PlacementDrive.find({ approvalStatus: 'pending_approval' })
      .populate('company')
      .sort({ createdAt: -1 });
    res.json(drives);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const approveDrive = async (req, res) => {
  try {
    const { driveId } = req.params;
    const { feedback } = req.body;
    const drive = await PlacementDrive.findByIdAndUpdate(
      driveId,
      {
        approvalStatus: 'approved',
        approvalFeedback: feedback || 'Approved by Placement Cell for campus recruitment.',
        isPublished: true,
        approvedBy: req.user._id,
        approvedAt: new Date()
      },
      { new: true }
    ).populate('company');

    if (!drive) return res.status(404).json({ error: 'Placement drive not found' });

    // Notify company recruiter
    if (drive.company?.userId) {
      await Notification.create({
        recipientUser: drive.company.userId,
        recipientRole: 'company',
        title: 'Placement Drive Approved! 🎉',
        message: `Your drive "${drive.title || drive.jobRole}" has been approved by the TPO and published for students.`,
        type: 'success',
        link: '/company/drives'
      });
    }

    // Broadcast notification to eligible students
    await Notification.create({
      recipientRole: 'student',
      title: 'New Placement Drive Approved',
      message: `${drive.company?.companyName || 'Recruiter'} has an approved drive for ${drive.jobRole || drive.title}! Check eligibility and apply.`,
      type: 'info',
      link: '/student/jobs'
    });

    await logAudit(req.user, 'Approve Placement Drive', 'TPO Approvals', `Approved drive "${drive.title}" (${drive._id})`);

    res.json({ message: 'Drive approved and published successfully.', drive });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const rejectDrive = async (req, res) => {
  try {
    const { driveId } = req.params;
    const { feedback } = req.body;
    const drive = await PlacementDrive.findByIdAndUpdate(
      driveId,
      {
        approvalStatus: 'rejected',
        approvalFeedback: feedback || 'Drive proposal rejected by TPO.',
        isPublished: false
      },
      { new: true }
    ).populate('company');

    if (!drive) return res.status(404).json({ error: 'Placement drive not found' });

    if (drive.company?.userId) {
      await Notification.create({
        recipientUser: drive.company.userId,
        recipientRole: 'company',
        title: 'Placement Drive Not Approved',
        message: `Your drive "${drive.title || drive.jobRole}" was rejected: ${feedback || 'Does not meet current campus placement criteria.'}`,
        type: 'warning',
        link: '/company/drives'
      });
    }

    await logAudit(req.user, 'Reject Placement Drive', 'TPO Approvals', `Rejected drive "${drive.title}" (${drive._id})`);

    res.json({ message: 'Drive rejected.', drive });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const requestDriveChanges = async (req, res) => {
  try {
    const { driveId } = req.params;
    const { feedback } = req.body;
    const drive = await PlacementDrive.findByIdAndUpdate(
      driveId,
      {
        approvalStatus: 'changes_requested',
        approvalFeedback: feedback || 'Please update eligibility or salary criteria before re-submitting.',
        isPublished: false
      },
      { new: true }
    ).populate('company');

    if (!drive) return res.status(404).json({ error: 'Placement drive not found' });

    if (drive.company?.userId) {
      await Notification.create({
        recipientUser: drive.company.userId,
        recipientRole: 'company',
        title: 'Changes Requested on Placement Drive',
        message: `The TPO requested updates on "${drive.title}": ${feedback || 'Please review criteria.'}`,
        type: 'warning',
        link: '/company/drives'
      });
    }

    await logAudit(req.user, 'Request Drive Changes', 'TPO Approvals', `Requested changes on drive "${drive.title}"`);

    res.json({ message: 'Requested changes from company recruiter.', drive });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate({
        path: 'student',
        populate: { path: 'userId', select: 'name email phone' }
      })
      .populate('placementDrive')
      .populate('company')
      .sort({ appliedAt: -1 });

    // Enrich with AI matching score & eligibility check
    const enriched = applications.map(app => {
      const obj = app.toObject();
      const minCgpa = app.placementDrive?.eligibility?.minCGPA || 0;
      const studentCgpa = app.student?.cgpa || 0;
      obj.isEligible = studentCgpa >= minCgpa;
      
      // Calculate AI match score based on skill overlap & CGPA
      const driveSkills = (app.placementDrive?.requirements || []).map(s => s.toLowerCase());
      const studentSkills = (app.student?.skills || []).map(s => s.toLowerCase());
      const matchCount = driveSkills.filter(s => studentSkills.some(st => st.includes(s) || s.includes(st))).length;
      const skillScore = driveSkills.length > 0 ? (matchCount / driveSkills.length) * 50 : 35;
      const cgpaScore = Math.min(40, (studentCgpa / 10) * 40);
      const resumeScore = app.student?.resume ? 10 : 0;
      obj.aiMatchScore = Math.min(98, Math.round(skillScore + cgpaScore + resumeScore));
      
      return obj;
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    const application = await Application.findByIdAndUpdate(
      applicationId,
      {
        status,
        ...(status === 'shortlisted' && { shortlistedAt: Date.now() }),
        ...(status === 'selected' && { selectedAt: Date.now() }),
        ...(status === 'rejected' && { rejectedAt: Date.now() })
      },
      { new: true }
    ).populate('student').populate('company');

    if (status === 'selected' && application.student) {
      await Student.findByIdAndUpdate(application.student._id, {
        isPlaced: true,
        placedCompany: application.company._id,
        salary: application.salary || application.ctc || 800000
      });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find()
      .populate({ path: 'student', populate: { path: 'userId', select: 'name email' } })
      .populate('company')
      .populate('placementDrive')
      .sort({ scheduledDate: 1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const reportData = await buildPlacementReport();
    
    // Skill gap analysis
    const drives = await PlacementDrive.find();
    const students = await Student.find();
    
    const demandedSkills = {};
    drives.forEach(d => {
      (d.requirements || []).forEach(s => {
        demandedSkills[s] = (demandedSkills[s] || 0) + 1;
      });
    });

    const studentSkillsMap = {};
    students.forEach(st => {
      (st.skills || []).forEach(s => {
        studentSkillsMap[s] = (studentSkillsMap[s] || 0) + 1;
      });
    });

    res.json({
      ...reportData,
      demandedSkills,
      studentSkillsMap
    });
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
        { recipientRole: 'tpo' },
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

// ==================== 8. PLACEMENT CONFLICT DETECTOR ====================
export const getPlacementConflicts = async (req, res) => {
  try {
    const interviews = await Interview.find({ status: { $ne: 'cancelled' } })
      .populate({
        path: 'student',
        populate: { path: 'userId', select: 'name email phone' }
      })
      .populate('company')
      .populate('placementDrive')
      .sort({ scheduledDate: 1 });

    const drives = await PlacementDrive.find({ status: { $in: ['upcoming', 'ongoing'] } })
      .populate('company')
      .sort({ driveDate: 1 });

    const report = detectPlacementConflicts({ interviews, drives });

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const resolveConflictSlot = async (req, res) => {
  try {
    const { interviewId, newScheduledDate, reason } = req.body;
    if (!interviewId || !newScheduledDate) {
      return res.status(400).json({ error: 'Interview ID and new date are required' });
    }

    const interview = await Interview.findById(interviewId)
      .populate({ path: 'student', populate: { path: 'userId', select: 'name email' } })
      .populate('company');

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    const oldDate = interview.scheduledDate;
    interview.scheduledDate = new Date(newScheduledDate);
    await interview.save();

    await logAudit(
      req.user,
      'Conflict Resolved: Interview Rescheduled',
      'Interviews',
      `Rescheduled ${interview.company?.companyName || 'Company'} interview for ${interview.student?.userId?.name || 'Student'} from ${new Date(oldDate).toLocaleString()} to ${new Date(newScheduledDate).toLocaleString()}. ${reason || ''}`
    );

    // Create notification for student
    if (interview.student?.userId?._id) {
      await Notification.create({
        recipientUserId: interview.student.userId._id,
        recipientRole: 'student',
        title: 'Interview Rescheduled to Avoid Conflict',
        message: `Your ${interview.round} interview with ${interview.company?.companyName} was rescheduled to ${new Date(newScheduledDate).toLocaleString()} to resolve a timing clash.`,
        type: 'info'
      });

      // Dispatch dynamic HTML interview rescheduled email to student's registered email
      if (interview.student.userId.email) {
        await sendInterviewRescheduledEmail({
          to: interview.student.userId.email,
          studentName: interview.student.userId.name || 'Candidate',
          companyName: interview.company?.companyName || 'Company',
          role: 'Placement Interview Candidate',
          round: interview.round || 'Technical Round',
          oldDate,
          newDate: newScheduledDate,
          timeZone: interview.timeZone || 'Asia/Kolkata',
          reason: reason || 'Rescheduled by Placement Officer to avoid schedule overlap',
          mode: interview.mode || 'virtual',
          joinLink: interview.joinLink || '',
          location: interview.location || '',
          interviewId: interview._id
        });
      }
    }

    res.json({
      message: 'Conflict resolved successfully. Interview rescheduled.',
      interview
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

