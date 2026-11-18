import crypto from 'crypto';
import User from '../models/User.js';
import Company from '../models/Company.js';
import PlacementDrive from '../models/PlacementDrive.js';
import Application from '../models/Application.js';
import Interview from '../models/Interview.js';
import Student from '../models/Student.js';
import Notification from '../models/Notification.js';
import { sendInterviewScheduledEmail, sendApplicationStatusUpdateEmail } from '../services/emailService.js';

const findOrCreateCompany = async (user) => {
  let company = await Company.findOne({ userId: user.id || user._id });
  if (!company) {
    company = await Company.create({
      userId: user.id || user._id,
      companyName: user.name || `Company-${Date.now().toString().slice(-4)}`,
      hrName: user.name || 'Hiring Manager',
      hrEmail: user.email,
      isVerified: true
    });
  }
  return company;
};

export const getProfile = async (req, res) => {
  try {
    const company = await findOrCreateCompany(req.user);
    const user = await User.findById(req.user.id).select('name email phone profilePicture role');
    res.json({
      ...company.toObject(),
      userId: user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const company = await findOrCreateCompany(req.user);
    const {
      companyName,
      website,
      location,
      headquarters,
      officeLocations,
      companySize,
      industry,
      description,
      hrName,
      hrPhone,
      hrEmail,
      linkedin
    } = req.body;

    const allowedUpdates = {};
    if (companyName) allowedUpdates.companyName = companyName.trim();
    if (website !== undefined) allowedUpdates.website = website ? website.trim() : '';
    if (location !== undefined) allowedUpdates.location = location ? location.trim() : '';
    if (headquarters !== undefined) allowedUpdates.headquarters = headquarters ? headquarters.trim() : '';
    if (officeLocations !== undefined) allowedUpdates.officeLocations = officeLocations ? officeLocations.trim() : '';
    if (companySize !== undefined) allowedUpdates.companySize = companySize;
    if (industry !== undefined) allowedUpdates.industry = industry ? industry.trim() : '';
    if (description !== undefined) allowedUpdates.description = description ? description.trim() : '';
    if (hrName !== undefined) allowedUpdates.hrName = hrName ? hrName.trim() : '';
    if (hrPhone !== undefined) allowedUpdates.hrPhone = hrPhone ? hrPhone.trim() : '';
    if (hrEmail !== undefined) allowedUpdates.hrEmail = hrEmail ? hrEmail.trim().toLowerCase() : '';
    if (linkedin !== undefined) allowedUpdates.linkedin = linkedin ? linkedin.trim() : '';

    const updated = await Company.findByIdAndUpdate(
      company._id,
      allowedUpdates,
      { new: true }
    );

    // Keep User model in sync for name and phone
    const userUpdates = {};
    if (companyName) userUpdates.name = companyName.trim();
    if (hrPhone) userUpdates.phone = hrPhone.trim();
    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(req.user.id, userUpdates);
    }

    const user = await User.findById(req.user.id).select('name email phone profilePicture role');
    res.json({
      ...updated.toObject(),
      userId: user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadCompanyLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a valid logo file (JPG, PNG, WEBP, GIF).' });
    }
    const logoUrl = `/uploads/logos/${req.file.filename}`;
    const company = await findOrCreateCompany(req.user);
    company.logo = logoUrl;
    await company.save();

    await User.findByIdAndUpdate(req.user.id, { profilePicture: logoUrl });
    const user = await User.findById(req.user.id).select('name email phone profilePicture role');

    res.json({
      message: 'Company logo updated successfully',
      logo: logoUrl,
      profilePicture: logoUrl,
      company: {
        ...company.toObject(),
        userId: user
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDashboard = async (req, res) => {
  try {
    const company = await findOrCreateCompany(req.user);

    const totalDrives = await PlacementDrive.countDocuments({ company: company._id });
    const draftDrives = await PlacementDrive.countDocuments({ company: company._id, approvalStatus: 'draft' });
    const pendingDrives = await PlacementDrive.countDocuments({ company: company._id, approvalStatus: 'pending_approval' });
    const approvedDrives = await PlacementDrive.countDocuments({ company: company._id, approvalStatus: 'approved' });

    const totalApplications = await Application.countDocuments({ company: company._id });
    const underReview = await Application.countDocuments({ company: company._id, status: 'under_review' });
    const shortlisted = await Application.countDocuments({ company: company._id, status: 'shortlisted' });
    const interviewScheduled = await Application.countDocuments({ company: company._id, status: 'interview_scheduled' });
    const selected = await Application.countDocuments({ company: company._id, status: 'selected' });
    const rejected = await Application.countDocuments({ company: company._id, status: 'rejected' });

    const totalInterviews = await Interview.countDocuments({ company: company._id });

    // Recruitment funnel data
    const funnel = {
      applied: totalApplications,
      underReview: underReview + shortlisted + interviewScheduled + selected,
      shortlisted: shortlisted + interviewScheduled + selected,
      interviewed: interviewScheduled + selected,
      selected: selected
    };

    // Recent 5 applicants
    const recentApplicants = await Application.find({ company: company._id })
      .populate({ path: 'student', populate: { path: 'userId', select: 'name email profilePicture' } })
      .populate('placementDrive', 'title jobRole salary')
      .sort({ appliedAt: -1 })
      .limit(5);

    // Upcoming 5 interviews
    const upcomingInterviews = await Interview.find({ company: company._id, status: 'scheduled' })
      .populate({ path: 'student', populate: { path: 'userId', select: 'name email' } })
      .populate('placementDrive', 'title jobRole')
      .sort({ scheduledDate: 1 })
      .limit(5);

    res.json({
      totalDrives,
      draftDrives,
      pendingDrives,
      approvedDrives,
      applications: totalApplications,
      underReview,
      shortlisted,
      interviewScheduled,
      selected,
      rejected,
      interviewed: totalInterviews,
      funnel,
      recentApplicants,
      upcomingInterviews,
      companyInfo: {
        id: company._id,
        name: company.companyName,
        isVerified: company.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createDrive = async (req, res) => {
  try {
    const company = await findOrCreateCompany(req.user);
    const { isDraft, ...driveData } = req.body;

    // Security: Company cannot self-approve drives
    const initialApproval = isDraft ? 'draft' : 'pending_approval';

    const drive = await PlacementDrive.create({
      ...driveData,
      company: company._id,
      approvalStatus: initialApproval,
      isPublished: false // Requires TPO approval before public student visibility
    });

    if (initialApproval === 'pending_approval') {
      await Notification.create({
        recipientRole: 'tpo',
        title: 'New Placement Drive Pending Approval',
        message: `${company.companyName} submitted drive "${drive.title || drive.jobRole}" for institutional review.`,
        type: 'info',
        link: '/tpo/drives'
      });
    }

    res.status(201).json(drive);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const submitDriveForApproval = async (req, res) => {
  try {
    const { driveId } = req.params;
    const company = await findOrCreateCompany(req.user);

    const drive = await PlacementDrive.findOne({ _id: driveId, company: company._id });
    if (!drive) {
      return res.status(404).json({ error: 'Placement drive not found or unauthorized.' });
    }

    drive.approvalStatus = 'pending_approval';
    drive.isPublished = false;
    await drive.save();

    await Notification.create({
      recipientRole: 'tpo',
      title: 'Placement Drive Submitted for Approval',
      message: `${company.companyName} resubmitted drive "${drive.title}" for review.`,
      type: 'info',
      link: '/tpo/drives'
    });

    res.json({ message: 'Drive submitted to TPO for approval.', drive });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDrive = async (req, res) => {
  try {
    const { driveId } = req.params;
    const company = await findOrCreateCompany(req.user);

    // Prevent company from approving drive
    const { approvalStatus, isPublished, ...allowedUpdates } = req.body;

    const drive = await PlacementDrive.findOneAndUpdate(
      { _id: driveId, company: company._id },
      allowedUpdates,
      { new: true }
    );

    if (!drive) {
      return res.status(404).json({ error: 'Drive not found or unauthorized.' });
    }

    res.json(drive);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDrives = async (req, res) => {
  try {
    const company = await findOrCreateCompany(req.user);
    const drives = await PlacementDrive.find({ company: company._id }).sort({ createdAt: -1 });

    // Enrich with applicant counts
    const driveIds = drives.map(d => d._id);
    const counts = await Application.aggregate([
      { $match: { placementDrive: { $in: driveIds } } },
      { $group: { _id: '$placementDrive', count: { $sum: 1 } } }
    ]);
    const countMap = new Map(counts.map(c => [c._id.toString(), c.count]));

    const enriched = drives.map(d => {
      const obj = d.toObject();
      obj.applicantCount = countMap.get(d._id.toString()) || 0;
      return obj;
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getApplicants = async (req, res) => {
  try {
    const company = await findOrCreateCompany(req.user);
    const { driveId, status, search } = req.query;

    const filter = { company: company._id };
    if (driveId) filter.placementDrive = driveId;
    if (status && status !== 'all') filter.status = status;

    const applicants = await Application.find(filter)
      .populate({ path: 'student', populate: { path: 'userId', select: 'name email phone profilePicture' } })
      .populate('placementDrive')
      .sort({ appliedAt: -1 });

    let result = applicants;
    if (search && search.trim()) {
      const q = search.toLowerCase();
      result = applicants.filter(a =>
        a.student?.userId?.name?.toLowerCase().includes(q) ||
        a.student?.userId?.email?.toLowerCase().includes(q) ||
        a.student?.rollNumber?.toLowerCase().includes(q)
      );
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getShortlisted = async (req, res) => {
  try {
    const company = await findOrCreateCompany(req.user);
    const shortlisted = await Application.find({
      company: company._id,
      status: { $in: ['shortlisted', 'interview_scheduled', 'selected'] }
    })
      .populate({ path: 'student', populate: { path: 'userId', select: 'name email phone' } })
      .populate('placementDrive')
      .sort({ shortlistedAt: -1 });
    res.json(shortlisted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getInterviewCandidates = async (req, res) => {
  try {
    const company = await findOrCreateCompany(req.user);

    // Candidates who applied to this company's drives
    const applications = await Application.find({ company: company._id })
      .populate({ path: 'student', populate: { path: 'userId', select: 'name email phone avatar profilePicture' } })
      .populate('placementDrive', 'title jobRole batch');

    const candidatesMap = new Map();
    for (const app of applications) {
      if (app.student && app.student.userId && !candidatesMap.has(app.student._id.toString())) {
        candidatesMap.set(app.student._id.toString(), {
          studentId: app.student._id,
          name: app.student.userId.name || 'Candidate',
          email: app.student.userId.email || '',
          phone: app.student.userId.phone || '',
          rollNumber: app.student.rollNumber || '',
          department: app.student.department || '',
          placementDriveId: app.placementDrive?._id || null,
          driveTitle: app.placementDrive?.title || app.placementDrive?.jobRole || 'Campus Recruitment',
          applicationId: app._id,
          status: app.status
        });
      }
    }

    // In local development or fresh setups with zero drive applicants yet,
    // surface registered students so recruiters can immediately test scheduling
    if (candidatesMap.size === 0) {
      const registeredStudents = await Student.find()
        .populate('userId', 'name email phone profilePicture')
        .limit(25);

      for (const st of registeredStudents) {
        if (st.userId && !candidatesMap.has(st._id.toString())) {
          candidatesMap.set(st._id.toString(), {
            studentId: st._id,
            name: st.userId.name || 'Candidate',
            email: st.userId.email || '',
            phone: st.userId.phone || '',
            rollNumber: st.rollNumber || '',
            department: st.department || '',
            placementDriveId: null,
            driveTitle: 'Campus Placement Pool',
            applicationId: null,
            status: 'registered'
          });
        }
      }
    }

    res.json(Array.from(candidatesMap.values()));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const scheduleInterview = async (req, res) => {
  try {
    const company = await findOrCreateCompany(req.user);
    let {
      studentId,
      placementDriveId,
      applicationId,
      title,
      round,
      scheduledDate,
      scheduledTime,
      durationMinutes,
      description,
      instructions,
      mode,
      location,
      joinLink,
      timeZone,
      interviewer,
      interviewerEmail,
      notes
    } = req.body;

    if (applicationId) {
      const appDoc = await Application.findById(applicationId);
      if (appDoc) {
        studentId = studentId || appDoc.student;
        placementDriveId = placementDriveId || appDoc.placementDrive;
      }
    }

    if (!studentId) {
      return res.status(400).json({ error: 'Candidate selection (studentId) is required to schedule an interview.' });
    }

    // Prevent unauthorized recruiters: Candidate must exist
    const student = await Student.findById(studentId).populate('userId');
    if (!student) {
      return res.status(404).json({ error: 'Selected candidate was not found in the system.' });
    }

    // If placementDriveId is not provided, associate with company's first drive or leave optional
    if (!placementDriveId) {
      const firstDrive = await PlacementDrive.findOne({ company: company._id });
      if (firstDrive) {
        placementDriveId = firstDrive._id;
      }
    }

    // Generate unique room ID for virtual interview
    const roomId = 'room_' + (crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '') : (Date.now().toString(36) + Math.random().toString(36).substring(2, 9)));
    const finalMode = mode || 'virtual';
    const computedJoinLink = joinLink || `/interview/room/${roomId}`;

    const interview = await Interview.create({
      student: studentId,
      company: company._id,
      placementDrive: placementDriveId || null,
      title: title || `${round ? (round.charAt(0).toUpperCase() + round.slice(1)) : 'Technical'} Interview`,
      round: round || 'technical',
      roomId,
      description: description || '',
      instructions: instructions || '',
      scheduledTime: scheduledTime || '',
      durationMinutes: durationMinutes ? Number(durationMinutes) : 45,
      mode: finalMode,
      location: location || '',
      joinLink: computedJoinLink,
      timeZone: timeZone || 'Asia/Kolkata',
      scheduledDate: scheduledDate ? new Date(scheduledDate) : new Date(),
      status: 'scheduled',
      interviewer: interviewer || company.hrName || 'Technical Panel',
      interviewerEmail: interviewerEmail || company.hrEmail || '',
      feedback: notes || ''
    });

    // Update application status to interview_scheduled if application exists
    await Application.findOneAndUpdate(
      {
        $or: [
          ...(applicationId ? [{ _id: applicationId }] : []),
          { student: studentId, ...(placementDriveId ? { placementDrive: placementDriveId } : {}), company: company._id }
        ]
      },
      { status: 'interview_scheduled', interviewScheduledAt: new Date() }
    );

    // Notify the candidate
    if (student?.userId) {
      const formattedDate = new Date(scheduledDate || Date.now()).toLocaleDateString();
      const timeStr = scheduledTime ? ` at ${scheduledTime}` : '';

      await Notification.create({
        recipientUser: student.userId._id,
        recipientRole: 'student',
        title: `Virtual Interview Scheduled: ${interview.title}`,
        message: `${company.companyName} has scheduled a ${interview.round} interview with you on ${formattedDate}${timeStr}.`,
        type: 'interview',
        link: `/student/interviews`
      });

      // Dispatch dynamic HTML interview scheduled email to student's registered email
      if (student.userId.email) {
        const drive = placementDriveId ? await PlacementDrive.findById(placementDriveId) : null;
        await sendInterviewScheduledEmail({
          to: student.userId.email,
          studentName: student.userId.name || 'Candidate',
          companyName: company.companyName || 'Company',
          role: drive?.jobRole || drive?.title || interview.title || 'Software Engineer',
          round: interview.round || 'technical',
          scheduledDate: interview.scheduledDate,
          timeZone: timeZone || 'Asia/Kolkata',
          mode: finalMode,
          location: location || '',
          joinLink: computedJoinLink,
          interviewer: interviewer || company.hrName || 'Technical Interview Panel',
          interviewId: interview._id
        }).catch(err => console.warn('Non-blocking email dispatch notice:', err.message));
      }
    }

    res.status(201).json(interview);
  } catch (error) {
    console.error('scheduleInterview error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, feedback } = req.body;

    const company = await findOrCreateCompany(req.user);

    const validStatuses = [
      'applied',
      'under_review',
      'shortlisted',
      'interview_scheduled',
      'selected',
      'rejected'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid application status value.' });
    }

    const application = await Application.findOneAndUpdate(
      { _id: applicationId, company: company._id },
      {
        status,
        ...(feedback && { feedback }),
        ...(status === 'under_review' && { underReviewAt: new Date() }),
        ...(status === 'shortlisted' && { shortlistedAt: new Date() }),
        ...(status === 'interview_scheduled' && { interviewScheduledAt: new Date() }),
        ...(status === 'selected' && { selectedAt: new Date() }),
        ...(status === 'rejected' && { rejectedAt: new Date() })
      },
      { new: true }
    )
      .populate({ path: 'student', populate: { path: 'userId', select: 'name email' } })
      .populate('placementDrive');

    if (!application) {
      return res.status(404).json({ error: 'Application not found or unauthorized.' });
    }

    // If candidate selected, mark student as placed
    if (status === 'selected' && application.student) {
      await Student.findByIdAndUpdate(application.student._id || application.student, {
        isPlaced: true,
        placedCompany: company._id,
        salary: application.placementDrive?.salary || application.salary || undefined
      });
    }

    // Send persistent notification to student
    if (application.student?.userId) {
      const statusLabels = {
        under_review: 'is now Under Review',
        shortlisted: 'has been Shortlisted!',
        interview_scheduled: 'has an Interview Scheduled',
        selected: 'has resulted in a Selection Offer! Congratulations!',
        rejected: 'was not selected'
      };

      await Notification.create({
        recipientUser: application.student.userId._id,
        recipientRole: 'student',
        title: `Application Update: ${application.placementDrive?.title || 'Placement Drive'}`,
        message: `Your application to ${company.companyName} ${statusLabels[status] || status}.`,
        type: status === 'selected' ? 'success' : status === 'shortlisted' ? 'info' : 'update',
        link: '/student/applications'
      });

      // Dispatch dynamic HTML application status email to student's registered email
      if (application.student.userId.email) {
        await sendApplicationStatusUpdateEmail({
          to: application.student.userId.email,
          studentName: application.student.userId.name || 'Candidate',
          companyName: company.companyName || 'Company',
          role: application.placementDrive?.jobRole || application.placementDrive?.title || 'Role',
          status,
          feedback: feedback || '',
          salary: application.placementDrive?.salary || application.salary || null,
          applicationId: application._id
        });
      }
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getInterviews = async (req, res) => {
  try {
    const company = await findOrCreateCompany(req.user);
    const interviews = await Interview.find({ company: company._id })
      .populate({ path: 'student', populate: { path: 'userId', select: 'name email phone' } })
      .populate('placementDrive')
      .sort({ scheduledDate: 1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { recipientRole: 'all' },
        { recipientRole: 'company' },
        { recipientUser: req.user._id || req.user.id },
        { recipientUserId: req.user._id || req.user.id }
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
      await Notification.updateMany(
        {
          $or: [
            { recipientRole: 'all' },
            { recipientRole: 'company' },
            { recipientUser: req.user._id || req.user.id },
            { recipientUserId: req.user._id || req.user.id }
          ],
          isRead: false
        },
        { isRead: true }
      );
      return res.json({ message: 'All notifications marked as read' });
    }
    const updated = await Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

