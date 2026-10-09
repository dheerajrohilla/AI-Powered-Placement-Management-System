import Company from '../models/Company.js';
import PlacementDrive from '../models/PlacementDrive.js';
import Application from '../models/Application.js';
import Interview from '../models/Interview.js';
import Student from '../models/Student.js';

const findOrCreateCompany = async (user) => {
  let company = await Company.findOne({ userId: user.id });
  if (!company) {
    company = await Company.create({
      userId: user.id,
      companyName: user.name || `Company-${Date.now().toString().slice(-4)}`,
      isVerified: true
    });
  }
  return company;
};

export const getDashboard = async (req, res) => {
  try {
    const company = await findOrCreateCompany(req.user);

    const drives = await PlacementDrive.countDocuments({ company: company._id });
    const applications = await Application.countDocuments({ company: company._id });
    const interviewed = await Interview.countDocuments({ company: company._id });
    const selected = await Application.countDocuments({
      company: company._id,
      status: 'selected'
    });

    res.json({
      totalDrives: drives,
      applications,
      interviewed,
      selected,
      filledPositions: company.filledPositions || 0,
      totalPositions: company.totalPositions || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createDrive = async (req, res) => {
  try {
    const company = await findOrCreateCompany(req.user);
    const drive = await PlacementDrive.create({
      ...req.body,
      company: company._id
    });
    res.status(201).json(drive);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDrives = async (req, res) => {
  try {
    const company = await findOrCreateCompany(req.user);
    const drives = await PlacementDrive.find({ company: company._id });
    res.json(drives);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getApplicants = async (req, res) => {
  try {
    const company = await findOrCreateCompany(req.user);
    const applicants = await Application.find({ company: company._id })
      .populate({ path: 'student', populate: { path: 'userId', select: 'name email' } })
      .populate('placementDrive')
      .sort({ appliedAt: -1 });
    res.json(applicants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getShortlisted = async (req, res) => {
  try {
    const company = await findOrCreateCompany(req.user);
    const shortlisted = await Application.find({
      company: company._id,
      status: { $in: ['shortlisted', 'selected'] }
    })
      .populate({ path: 'student', populate: { path: 'userId', select: 'name email' } })
      .populate('placementDrive');
    res.json(shortlisted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const scheduleInterview = async (req, res) => {
  try {
    const company = await findOrCreateCompany(req.user);

    const interview = await Interview.create({
      ...req.body,
      company: company._id
    });
    res.status(201).json(interview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    const company = await findOrCreateCompany(req.user);

    const validStatuses = ['applied', 'shortlisted', 'rejected', 'selected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid application status.' });
    }

    const application = await Application.findOneAndUpdate(
      { _id: applicationId, company: company._id },
      {
        status,
        shortlistedAt: status === 'shortlisted' ? new Date() : undefined,
        rejectedAt: status === 'rejected' ? new Date() : undefined,
        selectedAt: status === 'selected' ? new Date() : undefined
      },
      { new: true }
    ).populate({ path: 'student', populate: { path: 'userId', select: 'name email' } }).populate('placementDrive');

    if (!application) {
      return res.status(404).json({ error: 'Application not found or unauthorized.' });
    }

    if (status === 'selected') {
      await Student.findByIdAndUpdate(application.student?._id || application.student, {
        isPlaced: true,
        placedCompany: company._id,
        salary: application.salary || application.ctc || undefined
      });
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
      .populate({ path: 'student', populate: { path: 'userId', select: 'name email' } })
      .populate('placementDrive')
      .sort({ scheduledDate: 1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
