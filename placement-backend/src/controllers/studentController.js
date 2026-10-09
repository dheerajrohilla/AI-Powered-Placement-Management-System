import Student from '../models/Student.js';
import Application from '../models/Application.js';
import Interview from '../models/Interview.js';
import PlacementDrive from '../models/PlacementDrive.js';
import User from '../models/User.js';
import ChatMessage from '../models/ChatMessage.js';
import MockInterview from '../models/MockInterview.js';
import StudyCollaboration from '../models/StudyCollaboration.js';
import Notification from '../models/Notification.js';
import { sendApplicationConfirmationEmail, sendEmail, isRealSmtpConfigured } from '../utils/emailService.js';
import { extractTextFromPDF } from '../utils/resumeParser.js';
import { analyzeATS, matchResumeWithDrive } from '../utils/atsAnalyzer.js';
import {
  extractCategorizedSkills,
  calculateRoleReadiness,
  matchSkillsWithDrives,
  generateSkillRoadmap
} from '../utils/skillAnalyzer.js';
import { processChatQuery } from '../utils/placementChatbot.js';
import { checkResumeCredibility } from '../utils/credibilityChecker.js';
import {
  generateCompanyMockInterview,
  evaluateAnswer,
  calculatePlacementScore
} from '../utils/mockInterviewEngine.js';
import { analyzeShortlistingHistory } from '../utils/rejectionAnalyzer.js';
import { generateCompanyPrepPlan } from '../utils/companyPrepEngine.js';
import { calculatePeerBenchmark } from '../utils/peerBenchmarkEngine.js';
import { findStudyPartnerMatches } from '../utils/studyCollaborationEngine.js';
import { calculatePlacementJourney } from '../utils/placementJourneyEngine.js';
import path from 'path';
import fs from 'fs';

export const getDashboard = async (req, res) => {
  try {
    let student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      student = await Student.create({
        userId: req.user.id,
        rollNumber: `ROLL-${Date.now().toString().slice(-6)}`,
        department: 'General',
        batch: new Date().getFullYear().toString()
      });
    }

    const applications = await Application.countDocuments({ student: student._id });
    const interviews = await Interview.countDocuments({ student: student._id });
    const shortlisted = await Application.countDocuments({
      student: student._id,
      status: 'shortlisted'
    });

    // Dynamically calculate profile strength
    let strengthPoints = 0;
    if (student.department) strengthPoints += 20;
    if (student.batch) strengthPoints += 20;
    if (student.skills && student.skills.length > 0) strengthPoints += 30;
    if (student.bio) strengthPoints += 15;
    if (student.resume) strengthPoints += 15;
    const profileStrength = Math.min(100, Math.max(student.profileStrength || 0, strengthPoints));

    // Real ATS score (from resumeAnalysis if present, or student.atsScore)
    const atsScore = student.atsScore || (student.resumeAnalysis?.score ?? 0);

    res.json({
      atsScore,
      applications,
      interviews,
      shortlisted,
      profileStrength,
      isPlaced: student.isPlaced,
      hasResume: Boolean(student.resume)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    let student = await Student.findOne({ userId: req.user.id }).populate('userId');
    if (!student) {
      const newStudent = await Student.create({
        userId: req.user.id,
        rollNumber: `ROLL-${Date.now().toString().slice(-6)}`,
        department: 'General',
        batch: new Date().getFullYear().toString()
      });
      student = await Student.findById(newStudent._id).populate('userId');
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF resume' });
    }

    const filePath = req.file.path;
    const resumeUrl = `/uploads/resumes/${req.file.filename}`;

    // Real PDF text extraction
    let extractedText = '';
    try {
      extractedText = await extractTextFromPDF(filePath);
    } catch (parseError) {
      console.warn('PDF extraction warning (proceeding with fallback):', parseError.message);
    }

    // Run Real ATS analysis
    const atsResult = analyzeATS(extractedText);

    // Run Real Skill analysis
    const skillResult = extractCategorizedSkills(extractedText);
    const roleReadiness = calculateRoleReadiness(skillResult.allSkills);

    // Merge analysis payload
    const fullAnalysis = {
      ...atsResult,
      extractedSkills: skillResult.categorized,
      allExtractedSkills: skillResult.allSkills,
      roleReadiness,
      analyzedAt: new Date()
    };

    // Calculate updated profile strength
    const studentDoc = await Student.findOne({ userId: req.user.id });
    const existingSkills = studentDoc?.skills || [];
    // Auto-union detected skills with profile skills
    const combinedSkills = Array.from(new Set([...existingSkills, ...skillResult.allSkills]));

    let strengthPoints = 0;
    if (studentDoc?.department) strengthPoints += 20;
    if (studentDoc?.batch) strengthPoints += 20;
    if (combinedSkills.length > 0) strengthPoints += 30;
    if (studentDoc?.bio) strengthPoints += 15;
    strengthPoints += 15; // resume uploaded

    const updatedStudent = await Student.findOneAndUpdate(
      { userId: req.user.id },
      {
        resume: resumeUrl,
        resumeParsedText: extractedText,
        resumeAnalysis: fullAnalysis,
        atsScore: atsResult.score,
        skills: combinedSkills,
        profileStrength: Math.min(100, strengthPoints)
      },
      { new: true }
    );

    res.json({
      message: 'Resume uploaded and analyzed successfully',
      resume: updatedStudent.resume,
      atsScore: atsResult.score,
      analysis: fullAnalysis,
      extractedSkills: skillResult,
      skillsAdded: skillResult.allSkills.length
    });
  } catch (error) {
    console.error('uploadResume error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getATSAnalysis = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const drives = await PlacementDrive.find({ status: { $in: ['upcoming', 'ongoing'] } }).populate('company');

    let analysis = student.resumeAnalysis;

    // If analysis doesn't exist yet but resume file or parsed text exists, parse now
    if (!analysis && student.resume) {
      const fullPath = path.join(process.cwd(), student.resume);
      if (fs.existsSync(fullPath)) {
        try {
          const parsed = await extractTextFromPDF(fullPath);
          const atsResult = analyzeATS(parsed);
          const skillResult = extractCategorizedSkills(parsed);
          const roleReadiness = calculateRoleReadiness(skillResult.allSkills);

          analysis = {
            ...atsResult,
            extractedSkills: skillResult.categorized,
            allExtractedSkills: skillResult.allSkills,
            roleReadiness,
            analyzedAt: new Date()
          };

          student.resumeParsedText = parsed;
          student.resumeAnalysis = analysis;
          student.atsScore = atsResult.score;
          await student.save();
        } catch (e) {
          console.warn('On-demand PDF analysis warning:', e.message);
        }
      }
    }

    // If student still has no analysis, build a live preview based on student profile
    if (!analysis) {
      const profileText = `
Name: ${req.user.name}
Department: ${student.department} Batch: ${student.batch} CGPA: ${student.cgpa}
Skills: ${(student.skills || []).join(', ')}
Bio: ${student.bio || ''}
${(student.projects || []).map(p => `Project: ${p.title} - ${p.description} Tech: ${(p.techStack || []).join(', ')}`).join('\n')}
      `;
      const fallbackATS = analyzeATS(profileText);
      const skillResult = extractCategorizedSkills(profileText);
      const roleReadiness = calculateRoleReadiness(student.skills || []);

      analysis = {
        ...fallbackATS,
        score: Math.min(fallbackATS.score, 65), // capped for profile-only preview
        statusText: 'Preview from Profile (Upload PDF Resume for Full Analysis)',
        extractedSkills: skillResult.categorized,
        allExtractedSkills: student.skills || [],
        roleReadiness,
        isProfilePreview: true
      };
    }

    // Match candidate skills against active drives
    const candidateSkills = student.skills || analysis?.allExtractedSkills || [];
    const driveMatches = matchSkillsWithDrives(candidateSkills, drives);

    res.json({
      hasResume: Boolean(student.resume),
      resumeUrl: student.resume,
      atsScore: student.atsScore || analysis.score,
      analysis,
      driveMatches,
      studentSkills: student.skills || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const checkResumeText = async (req, res) => {
  try {
    const { text = '', targetDriveId = null } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Please provide resume text to analyze' });
    }

    const atsResult = analyzeATS(text);
    const skillResult = extractCategorizedSkills(text);
    const roleReadiness = calculateRoleReadiness(skillResult.allSkills);

    let driveMatch = null;
    if (targetDriveId) {
      const drive = await PlacementDrive.findById(targetDriveId).populate('company');
      if (drive) {
        driveMatch = {
          drive,
          ...matchResumeWithDrive(text, drive.requirements, drive.description)
        };
      }
    }

    res.json({
      atsResult,
      skillResult,
      roleReadiness,
      driveMatch
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSkillAnalysis = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const drives = await PlacementDrive.find({ status: { $in: ['upcoming', 'ongoing'] } }).populate('company');

    // Extract skills from resume text or profile
    const textToScan = student.resumeParsedText || student.skills.join(' ');
    const extracted = extractCategorizedSkills(textToScan);
    const activeSkills = Array.from(new Set([...(student.skills || []), ...extracted.allSkills]));

    const roleReadiness = calculateRoleReadiness(activeSkills);
    const driveMatches = matchSkillsWithDrives(activeSkills, drives);
    const roadmap = generateSkillRoadmap(activeSkills, roleReadiness);

    res.json({
      hasResume: Boolean(student.resume),
      categorizedSkills: extracted.categorized,
      allExtractedSkills: extracted.allSkills,
      profileSkills: student.skills || [],
      activeSkills,
      roleReadiness,
      driveMatches,
      roadmap
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const syncSkills = async (req, res) => {
  try {
    const { skills = [] } = req.body;
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    // Merge skills uniquely
    const newSkillSet = Array.from(new Set([...(student.skills || []), ...skills]));
    student.skills = newSkillSet;

    // Recalculate strength
    let strengthPoints = 0;
    if (student.department) strengthPoints += 20;
    if (student.batch) strengthPoints += 20;
    if (student.skills.length > 0) strengthPoints += 30;
    if (student.bio) strengthPoints += 15;
    if (student.resume) strengthPoints += 15;
    student.profileStrength = Math.min(100, strengthPoints);

    await student.save();

    res.json({
      message: 'Skills synchronized successfully',
      skills: student.skills,
      profileStrength: student.profileStrength
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const chatWithBot = async (req, res) => {
  try {
    const { message = '' } = req.body;
    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const student = await Student.findOne({ userId: req.user.id });
    const user = await User.findById(req.user.id);
    const drives = await PlacementDrive.find({ status: { $in: ['upcoming', 'ongoing'] } }).populate('company');
    const applications = await Application.find({ student: student?._id }).populate('placementDrive company');
    const interviews = await Interview.find({ student: student?._id }).populate('company placementDrive');

    // Process using context-aware engine
    const { reply, suggestions } = await processChatQuery({
      message,
      student,
      user,
      drives,
      applications,
      interviews
    });

    // Save user message and bot reply in ChatMessage
    if (student) {
      await ChatMessage.create({
        studentId: student._id,
        userId: req.user.id,
        sender: 'user',
        text: message
      });

      await ChatMessage.create({
        studentId: student._id,
        userId: req.user.id,
        sender: 'assistant',
        text: reply,
        suggestions
      });
    }

    res.json({
      reply,
      suggestions,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('chatWithBot error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.json([]);
    }

    const messages = await ChatMessage.find({ studentId: student._id })
      .sort({ createdAt: 1 })
      .limit(40);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const clearChatHistory = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (student) {
      await ChatMessage.deleteMany({ studentId: student._id });
    }
    res.json({ message: 'Chat history cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { bio, skills, department, batch, rollNumber, cgpa } = req.body;
    const allowedUpdates = {};
    if (bio !== undefined) allowedUpdates.bio = bio;
    if (skills !== undefined) allowedUpdates.skills = skills;
    if (department !== undefined) allowedUpdates.department = department;
    if (batch !== undefined) allowedUpdates.batch = batch;
    if (rollNumber !== undefined) allowedUpdates.rollNumber = rollNumber;
    if (cgpa !== undefined) allowedUpdates.cgpa = Number(cgpa) || 0;

    const student = await Student.findOneAndUpdate(
      { userId: req.user.id },
      allowedUpdates,
      { new: true }
    );
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPlacementDrives = async (req, res) => {
  try {
    const drives = await PlacementDrive.find({ status: { $in: ['upcoming', 'ongoing'] } })
      .populate('company')
      .sort({ registrationDeadline: 1 });
    res.json(drives);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const applyForDrive = async (req, res) => {
  try {
    const { driveId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const drive = await PlacementDrive.findById(driveId).populate('company');
    if (!drive) {
      return res.status(404).json({ error: 'Placement drive not found' });
    }

    const alreadyApplied = await Application.findOne({ student: student._id, placementDrive: drive._id });
    if (alreadyApplied) {
      return res.status(400).json({ error: 'You have already applied for this drive' });
    }

    const application = await Application.create({
      student: student._id,
      placementDrive: drive._id,
      company: drive.company?._id || drive.company,
      salary: drive.salary
    });

    const companyName = drive.company?.companyName || 'Company';
    const jobRole = drive.jobRole || drive.title || 'Role';

    // Dispatch automated confirmation email to student's registered email
    const emailResult = await sendApplicationConfirmationEmail({
      to: user.email,
      studentName: user.name || 'Candidate',
      companyName,
      role: jobRole,
      salary: drive.salary,
      location: drive.location,
      driveDate: drive.driveDate,
      registrationDeadline: drive.registrationDeadline,
      requirements: drive.requirements,
      driveId: drive._id
    });

    if (emailResult?.success) {
      application.emailNotificationSent = true;
      application.emailNotificationSentAt = new Date();
      application.emailNotificationTo = user.email;
      await application.save();
    }

    // Create an in-app notification for the student
    await Notification.create({
      recipientUserId: user._id,
      recipientRole: 'student',
      title: `Applied to ${companyName}`,
      message: `You applied for ${companyName} (${jobRole}). Get ready for the test! A confirmation email and preparation guide have been sent to your registered email (${user.email}). All the best!`,
      type: 'success',
      link: '/student/applications'
    });

    res.status(201).json({
      ...application.toObject(),
      emailNotification: {
        sent: Boolean(emailResult?.success),
        recipient: user.email,
        message: `Application successful! Confirmation email with test preparation details sent to ${user.email}. Get ready for the test and all the best!`
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getApplications = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }
    const applications = await Application.find({ student: student._id })
      .populate('placementDrive')
      .populate('company')
      .sort({ appliedAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getInterviews = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }
    const interviews = await Interview.find({ student: student._id })
      .populate('company')
      .populate('placementDrive')
      .sort({ scheduledDate: 1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== 1. AI RESUME CONSISTENCY / CREDIBILITY CHECKER ====================
export const getCredibilityAnalysis = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id }).populate('userId');
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const result = checkResumeCredibility(student);
    student.credibilityCheck = result;
    await student.save();

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== 2. PLACEMENT JOURNEY & SKILL ROADMAP ====================
export const getPlacementJourney = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    const user = await User.findById(req.user.id);
    const applications = await Application.find({ student: student?._id }).populate('placementDrive company');
    const interviews = await Interview.find({ student: student?._id }).populate('placementDrive company');
    const drives = await PlacementDrive.find({ status: { $in: ['upcoming', 'ongoing'] } }).populate('company');
    const mockInterviews = await MockInterview.find({ student: student?._id });

    const journey = calculatePlacementJourney({
      student: student || {},
      user: user || {},
      applications,
      interviews,
      drives,
      mockInterviews
    });

    res.json(journey);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== 3. "WHY AM I NOT GETTING SHORTLISTED?" ANALYZER ====================
export const getRejectionAnalysis = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    const applications = await Application.find({ student: student?._id }).populate('placementDrive company');
    const allDrives = await PlacementDrive.find().populate('company');
    const interviews = await Interview.find({ student: student?._id }).populate('placementDrive company');

    const analysis = analyzeShortlistingHistory({
      student: student || {},
      applications,
      allDrives,
      interviews
    });

    res.json(analysis);
  } catch (error) {
    console.error('getRejectionAnalysis error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ==================== 4. COMPANY-SPECIFIC PREPARATION MODE ====================
export const getCompanyPrepMode = async (req, res) => {
  try {
    const { driveId } = req.params;
    const student = await Student.findOne({ userId: req.user.id });

    let drive = null;
    if (driveId && driveId !== 'default') {
      drive = await PlacementDrive.findById(driveId).populate('company');
    }
    if (!drive) {
      drive = await PlacementDrive.findOne({ status: { $in: ['upcoming', 'ongoing'] } }).populate('company');
    }

    if (!drive) {
      return res.status(404).json({ error: 'No active placement drives found for preparation mode' });
    }

    const prepPlan = generateCompanyPrepPlan({
      student: student || {},
      drive
    });

    res.json(prepPlan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== 5. AI MOCK INTERVIEW → PLACEMENT SCORE ====================
export const generateMockInterview = async (req, res) => {
  try {
    const { driveId, customRole } = req.body;
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    let drive = null;
    if (driveId) {
      drive = await PlacementDrive.findById(driveId).populate('company');
    }

    const generated = generateCompanyMockInterview(drive || {}, customRole || 'Software Engineer');

    const mockInterview = await MockInterview.create({
      student: student._id,
      company: drive?.company?._id || null,
      placementDrive: drive?._id || null,
      targetRole: generated.targetRole,
      companyName: generated.companyName,
      jdRequirements: generated.jdRequirements,
      questions: generated.questions,
      status: 'in_progress'
    });

    res.status(201).json(mockInterview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const submitMockAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionId, studentAnswer } = req.body;

    const interview = await MockInterview.findById(id);
    if (!interview) return res.status(404).json({ error: 'Mock interview session not found' });

    const qIndex = interview.questions.findIndex(q => q.questionId === questionId || String(q._id) === questionId);
    if (qIndex === -1) return res.status(404).json({ error: 'Question not found' });

    const question = interview.questions[qIndex];
    const evaluation = evaluateAnswer(question, studentAnswer);

    interview.questions[qIndex].studentAnswer = studentAnswer;
    interview.questions[qIndex].score = evaluation.score;
    interview.questions[qIndex].feedback = evaluation.feedback;
    interview.questions[qIndex].strengths = evaluation.strengths;
    interview.questions[qIndex].missingPoints = evaluation.missingPoints;
    interview.questions[qIndex].isAnswered = true;
    interview.questions[qIndex].answeredAt = new Date();

    await interview.save();

    res.json({
      questionId,
      evaluation,
      updatedQuestion: interview.questions[qIndex]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const completeMockInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const interview = await MockInterview.findById(id);
    if (!interview) return res.status(404).json({ error: 'Mock interview session not found' });

    const scores = calculatePlacementScore(interview);

    interview.overallScore = scores.overallScore;
    interview.placementReadinessScore = scores.placementReadinessScore;
    interview.readinessStatus = scores.readinessStatus;
    interview.topicBreakdown = scores.topicBreakdown;
    interview.strengthsSummary = scores.strengthsSummary;
    interview.improvementRoadmap = scores.improvementRoadmap;
    interview.status = 'completed';
    interview.completedAt = new Date();

    await interview.save();

    // Update student's peerMetrics interviewScore
    await Student.findByIdAndUpdate(interview.student, {
      'peerMetrics.interviewScore': scores.placementReadinessScore
    });

    res.json(interview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMockInterviews = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const list = await MockInterview.find({ student: student._id })
      .populate('placementDrive company')
      .sort({ createdAt: -1 });

    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMockInterviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const interview = await MockInterview.findById(id).populate('placementDrive company');
    if (!interview) return res.status(404).json({ error: 'Mock interview session not found' });
    res.json(interview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== 6. ANONYMOUS PEER BENCHMARKING ====================
export const getPeerBenchmark = async (req, res) => {
  try {
    const currentStudent = await Student.findOne({ userId: req.user.id });
    if (!currentStudent) return res.status(404).json({ error: 'Student not found' });

    const allStudents = await Student.find();

    const benchmark = calculatePeerBenchmark({
      currentStudent,
      allStudents
    });

    res.json(benchmark);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== 7. SKILL-BASED STUDENT COLLABORATION ====================
export const getCollaborationMatches = async (req, res) => {
  try {
    const currentStudent = await Student.findOne({ userId: req.user.id });
    if (!currentStudent) return res.status(404).json({ error: 'Student not found' });

    const allStudents = await Student.find().populate('userId', 'name email');
    const existingRequests = await StudyCollaboration.find({
      $or: [{ sender: currentStudent._id }, { receiver: currentStudent._id }]
    });

    const matches = findStudyPartnerMatches({
      currentStudent,
      allStudents,
      existingRequests
    });

    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const sendCollaborationRequest = async (req, res) => {
  try {
    const { peerId, complementaryFocus, message } = req.body;
    const currentStudent = await Student.findOne({ userId: req.user.id });
    if (!currentStudent) return res.status(404).json({ error: 'Student not found' });

    const request = await StudyCollaboration.create({
      sender: currentStudent._id,
      receiver: peerId,
      complementaryFocus: complementaryFocus || 'Technical Skill Sharing',
      message: message || 'Hey! Let us collaborate to prepare for campus placements.',
      status: 'pending'
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCollaborationRequests = async (req, res) => {
  try {
    const currentStudent = await Student.findOne({ userId: req.user.id });
    if (!currentStudent) return res.status(404).json({ error: 'Student not found' });

    const requests = await StudyCollaboration.find({
      $or: [{ sender: currentStudent._id }, { receiver: currentStudent._id }]
    })
      .populate({ path: 'sender', populate: { path: 'userId', select: 'name email' } })
      .populate({ path: 'receiver', populate: { path: 'userId', select: 'name email' } })
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCollaborationRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const request = await StudyCollaboration.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStudentNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { recipientUserId: req.user.id },
        { recipientRole: { $in: ['all', 'student'] } }
      ]
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const markStudentNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    if (notificationId === 'all') {
      await Notification.updateMany(
        {
          $or: [
            { recipientUserId: req.user.id },
            { recipientRole: { $in: ['all', 'student'] } }
          ],
          isRead: false
        },
        { isRead: true }
      );
      return res.json({ message: 'All notifications marked as read' });
    }

    const updated = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const testEmailDelivery = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const targetEmail = req.body?.email || user?.email;
    if (!targetEmail) {
      return res.status(400).json({ error: 'No recipient email specified' });
    }

    const isReal = isRealSmtpConfigured();

    const result = await sendEmail({
      to: targetEmail,
      subject: '🧪 Test Email: AI Placement Management Portal',
      text: `Hello ${user?.name || 'Candidate'},\n\nThis is a verification email from the AI Placement Management System.\n\nDelivery status: Success!\nTarget Inbox: ${targetEmail}`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;padding:28px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;max-width:540px;margin:0 auto;">
          <h2 style="color:#4338ca;margin-top:0;">🎓 AI Placement Management System</h2>
          <p style="font-size:15px;color:#1e293b;">Hello <strong>${user?.name || 'Candidate'}</strong>,</p>
          <p style="font-size:14px;color:#334155;line-height:1.6;">
            This is a verification email sent to <strong>${targetEmail}</strong>. If you are reading this message in your personal inbox, your email configuration is completely operational!
          </p>
          <div style="background:#ecfdf5;border-left:4px solid #10b981;padding:12px 16px;border-radius:4px;margin:20px 0;">
            <p style="margin:0;color:#047857;font-weight:600;font-size:14px;">
              ✓ Real inbox email delivery is working perfectly!
            </p>
          </div>
          <p style="font-size:12px;color:#64748b;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:12px;">
            Training & Placement Cell • Automated Dispatch Test
          </p>
        </div>
      `
    });

    res.json({
      ...result,
      isRealSmtp: isReal,
      message: isReal
        ? (result.success ? `Real email delivered to ${targetEmail}! Check your inbox (and spam/promotions folder).` : `Delivery failed: ${result.error}`)
        : `Email was simulated for ${targetEmail}. To receive actual emails in your real inbox, enter your SMTP_USER and SMTP_PASS in placement-backend/.env.`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


