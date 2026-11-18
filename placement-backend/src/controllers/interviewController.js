import mongoose from 'mongoose';
import Interview from '../models/Interview.js';
import Student from '../models/Student.js';
import Company from '../models/Company.js';

const getIceServers = () => {
  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ];

  if (process.env.TURN_SERVER_URL) {
    iceServers.push({
      urls: process.env.TURN_SERVER_URL,
      username: process.env.TURN_USERNAME || '',
      credential: process.env.TURN_CREDENTIAL || ''
    });
  }

  return iceServers;
};

// GET /api/interviews/:id/room-access
export const getRoomAccess = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Interview ID or Room ID is required' });
    }

    const isMongoId = mongoose.Types.ObjectId.isValid(id);
    const query = isMongoId ? { $or: [{ _id: id }, { roomId: id }] } : { roomId: id };

    const interview = await Interview.findOne(query)
      .populate({ path: 'student', populate: { path: 'userId', select: 'name email phone avatar' } })
      .populate({ path: 'company', populate: { path: 'userId', select: 'name email' } })
      .populate('placementDrive', 'title jobRole');

    if (!interview) {
      return res.status(404).json({ error: 'Virtual interview session not found' });
    }

    // Determine current user authorization
    const currentUserId = req.user._id ? req.user._id.toString() : req.user.id;
    const currentUserRole = req.user.role;

    const studentUserId = interview.student?.userId?._id?.toString() || interview.student?.userId?.toString();
    const companyUserId = interview.company?.userId?._id?.toString() || interview.company?.userId?.toString();

    let studentProfileId = null;
    let companyProfileId = null;

    if (currentUserRole === 'student') {
      const studentProfile = await Student.findOne({ userId: currentUserId });
      studentProfileId = studentProfile?._id?.toString();
    } else if (currentUserRole === 'company') {
      const companyProfile = await Company.findOne({ userId: currentUserId });
      companyProfileId = companyProfile?._id?.toString();
    }

    const isCandidate = (currentUserRole === 'student') &&
      (currentUserId === studentUserId || (studentProfileId && interview.student?._id?.toString() === studentProfileId));

    const isRecruiter = (currentUserRole === 'company') &&
      (currentUserId === companyUserId || (companyProfileId && interview.company?._id?.toString() === companyProfileId));

    const isPrivileged = ['admin', 'tpo'].includes(currentUserRole);

    if (!isCandidate && !isRecruiter && !isPrivileged) {
      return res.status(403).json({
        error: 'Access denied: You are not authorized to access this virtual interview room.'
      });
    }

    // Role representation inside the room
    const userRoleInInterview = isCandidate ? 'candidate' : (isRecruiter ? 'interviewer' : 'proctor');

    res.json({
      interviewId: interview._id,
      roomId: interview.roomId || interview._id.toString(),
      title: interview.title || `${interview.round || 'Technical'} Interview`,
      round: interview.round || 'technical',
      mode: interview.mode || 'virtual',
      status: interview.status || 'scheduled',
      scheduledDate: interview.scheduledDate,
      scheduledTime: interview.scheduledTime || '',
      durationMinutes: interview.durationMinutes || 45,
      description: interview.description || '',
      instructions: interview.instructions || '',
      driveTitle: interview.placementDrive?.title || interview.placementDrive?.jobRole || '',
      companyName: interview.company?.companyName || 'Recruiter',
      candidateName: interview.student?.userId?.name || 'Candidate',
      candidateEmail: interview.student?.userId?.email || '',
      interviewerName: interview.interviewer || interview.company?.hrName || 'Interviewer',
      userRoleInInterview,
      currentUserName: req.user.name,
      currentUserId,
      iceServers: getIceServers()
    });
  } catch (error) {
    console.error('getRoomAccess error:', error);
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/interviews/:id/status
export const updateInterviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback, notes, result } = req.body;

    const isMongoId = mongoose.Types.ObjectId.isValid(id);
    const query = isMongoId ? { $or: [{ _id: id }, { roomId: id }] } : { roomId: id };

    const interview = await Interview.findOne(query);
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    if (status) {
      interview.status = status;
      if (status === 'in_progress' && !interview.actualStartTime) {
        interview.actualStartTime = new Date();
      }
      if (status === 'completed' && !interview.actualEndTime) {
        interview.actualEndTime = new Date();
        interview.endedBy = req.user.name || req.user.role;
      }
    }

    if (feedback !== undefined) interview.feedback = feedback;
    if (result !== undefined) interview.result = result;
    if (notes !== undefined) interview.feedback = notes;

    await interview.save();
    res.json({ success: true, interview });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/interviews/:id
export const getInterviewDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const isMongoId = mongoose.Types.ObjectId.isValid(id);
    const query = isMongoId ? { $or: [{ _id: id }, { roomId: id }] } : { roomId: id };

    const interview = await Interview.findOne(query)
      .populate({ path: 'student', populate: { path: 'userId', select: 'name email phone' } })
      .populate('company', 'companyName website logo hrName')
      .populate('placementDrive', 'title jobRole');

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    res.json(interview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

