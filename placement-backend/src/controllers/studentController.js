import Student from '../models/Student.js';
import Application from '../models/Application.js';
import Interview from '../models/Interview.js';
import PlacementDrive from '../models/PlacementDrive.js';
import User from '../models/User.js';
import ChatMessage from '../models/ChatMessage.js';
import MockInterview from '../models/MockInterview.js';
import StudyCollaboration from '../models/StudyCollaboration.js';
import Notification from '../models/Notification.js';
import AssessmentSession from '../models/AssessmentSession.js';
import { sendApplicationConfirmationEmail, sendEmail, isRealSmtpConfigured } from '../utils/emailService.js';
import { extractTextFromPDF, extractTextFromResume } from '../utils/resumeParser.js';
import { validateResumeContent } from '../utils/resumeValidator.js';
import ResumeAnalysisRecord from '../models/ResumeAnalysisRecord.js';
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
import { analyzeResumeWithAI, analyzeShortlistWithAI, checkCredibilityWithAI } from '../services/resumeService.js';
import { generateInterviewSessionWithAI, evaluateInterviewAnswerWithAI, calculateFinalInterviewReportWithAI } from '../services/interviewService.js';
import { generateCompanyPrepWithAI } from '../services/companyPrepService.js';
import { analyzeSkillsWithAI } from '../services/skillAnalysisService.js';
import { generatePlacementJourneyWithAI } from '../services/placementJourneyService.js';
import { answerCopilotQuery } from '../services/copilotService.js';
import { generateDashboardReadinessSummary } from '../services/dashboardSummaryService.js';
import { summarizeDriveAndAlignment, draftCoverLetterWithAI, draftRecruiterEmailWithAI } from '../services/applicationAssistantService.js';
import { interpretPeerBenchmarkWithAI, generateCollaborativeExerciseWithAI } from '../services/collaborationService.js';
import { isGeminiConfigured, getGeminiModel, checkGeminiHealth } from '../config/gemini.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '../..');

export const resolveResumePath = (resumePath) => {
  if (!resumePath) return null;
  const relPath = resumePath.replace(/^[/\\]+/, '');
  const candidatePaths = [
    path.join(backendRoot, relPath),
    path.join(process.cwd(), relPath),
    path.join(backendRoot, 'uploads/resumes', path.basename(relPath)),
    path.join(process.cwd(), 'placement-backend/uploads/resumes', path.basename(relPath)),
    path.join(process.cwd(), 'uploads/resumes', path.basename(relPath))
  ];
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) return p;
  }
  return path.join(backendRoot, relPath);
};

export const resolveStudentCgpa = (student) => {
  if (!student) return null;
  if (student.cgpa != null && !isNaN(Number(student.cgpa)) && Number(student.cgpa) > 0) {
    return Number(student.cgpa);
  }
  if (student.currentCgpa != null && !isNaN(Number(student.currentCgpa)) && Number(student.currentCgpa) > 0) {
    return Number(student.currentCgpa);
  }
  if (student.academic?.cgpa != null && !isNaN(Number(student.academic.cgpa)) && Number(student.academic.cgpa) > 0) {
    return Number(student.academic.cgpa);
  }
  if (Array.isArray(student.education)) {
    for (const edu of student.education) {
      if (edu && edu.score) {
        const match = String(edu.score).match(/(\d+(\.\d+)?)/);
        if (match) {
          const val = parseFloat(match[1]);
          if (!isNaN(val) && val > 0 && val <= 10) {
            return val;
          }
        }
      }
    }
  }
  return null;
};

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

    const effectiveCgpa = resolveStudentCgpa(student);
    if ((student.cgpa == null || student.cgpa === 0) && effectiveCgpa != null) {
      student.cgpa = effectiveCgpa;
      await student.save();
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
    const isRejected = student.resumeProcessingStatus === 'rejected' ||
      student.resumeAnalysis?.isValidResume === false;
    const atsScore = isRejected ? 0 : (student.atsScore || (student.resumeAnalysis?.score ?? 0));

    res.json({
      atsScore,
      isValidResume: !isRejected,
      applications,
      interviews,
      shortlisted,
      profileStrength,
      isPlaced: student.isPlaced,
      hasResume: Boolean(student.resume),
      geminiConfigured: isGeminiConfigured(),
      geminiModel: getGeminiModel(),
      cgpa: effectiveCgpa != null ? effectiveCgpa : null,
      cgpaDisplay: effectiveCgpa != null ? Number(effectiveCgpa).toFixed(2) : 'Not Provided',
      department: student.department || 'Not Provided',
      rollNumber: student.rollNumber || 'Not Provided',
      batch: student.batch || 'Not Provided',
      activeBacklogs: student.activeBacklogs || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAiDashboardSummary = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    const user = await User.findById(req.user.id);
    const applications = await Application.find({ student: student?._id });
    const interviews = await Interview.find({ student: student?._id });
    const drives = await PlacementDrive.find({ status: { $in: ['upcoming', 'ongoing'] } });
    const mockInterviews = await MockInterview.find({ student: student?._id });
    const assessmentSessions = await AssessmentSession.find({ student: student?._id });

    const summary = await generateDashboardReadinessSummary({
      student: student || {},
      user: user || {},
      applications,
      interviews,
      drives,
      mockInterviews,
      assessmentSessions
    });

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    let student = await Student.findOne({ userId: req.user.id }).populate('userId', 'name email phone profilePicture role');
    if (!student) {
      const newStudent = await Student.create({
        userId: req.user.id,
        rollNumber: `ROLL-${Date.now().toString().slice(-6)}`,
        department: 'General',
        batch: new Date().getFullYear().toString()
      });
      student = await Student.findById(newStudent._id).populate('userId', 'name email phone profilePicture role');
    }
    const effectiveCgpa = resolveStudentCgpa(student);
    if ((student.cgpa == null || student.cgpa === 0) && effectiveCgpa != null) {
      student.cgpa = effectiveCgpa;
      await student.save();
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF (.pdf) or Word (.docx) resume' });
    }

    const filePath = req.file.path;
    const resumeUrl = `/uploads/resumes/${req.file.filename}`;

    const studentDoc = await Student.findOne({ userId: req.user.id });
    if (!studentDoc) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    // Versioning: increment version for fresh resume upload
    const currentVersion = studentDoc.resumeVersion || 0;
    const newVersion = currentVersion + 1;

    // Real Universal Text Extraction (PDF and DOCX supported)
    let extractedText = '';
    try {
      extractedText = await extractTextFromResume(filePath, req.file.originalname);
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('Extracted resume text is completely empty. Please verify the file content.');
      }
    } catch (parseError) {
      // Failed extraction must NEVER wipe out a previously valid profile or skills!
      console.warn('Resume extraction failure:', parseError.message);

      studentDoc.resumeProcessingStatus = 'failed';
      studentDoc.resumeProcessingError = parseError.message;
      await studentDoc.save();

      return res.status(400).json({
        success: false,
        isValidResume: false,
        error: `Failed to extract text from document: ${parseError.message}. Please ensure the file is not corrupted, password-protected, or unreadable.`,
        errorType: 'extraction_failed',
        retryable: true,
        previousResumeRetained: Boolean(studentDoc.resumeParsedText)
      });
    }

    // Step 2: Content-Based Multi-Signal Resume Validation
    const validation = validateResumeContent(extractedText, {
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype
    });

    if (!validation.isValidResume) {
      // Clean up uploaded invalid file from disk so it does not linger
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (unlinkErr) {
        console.warn('Failed to clean up rejected resume file:', unlinkErr.message);
      }

      // Log invalid upload attempt to history
      try {
        await ResumeAnalysisRecord.create({
          student: studentDoc._id,
          userId: req.user.id,
          originalFileName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          documentType: validation.documentType,
          isValidResume: false,
          validationConfidence: validation.confidence,
          rejectionReason: validation.message,
          version: currentVersion
        });
      } catch (logErr) {
        console.warn('Failed to log invalid resume record:', logErr.message);
      }

      const hadPreviousResume = Boolean(studentDoc.resume);

      // Only reset the student profile status to rejected if they had no prior valid resume
      if (!hadPreviousResume) {
        studentDoc.atsScore = 0;
        studentDoc.resumeProcessingStatus = 'rejected';
        studentDoc.resumeProcessingError = validation.message;
        studentDoc.resumeAnalysis = {
          score: 0,
          overallScore: 0,
          isValidResume: false,
          grade: 'N/A',
          statusText: 'Document Validation Failed (Not a Resume)',
          wordCount: 0,
          breakdown: {
            impact: { actionVerbsCount: 0, metricsCount: 0 },
            contact: { score: 0 },
            sections: { score: 0 },
            skills: { score: 0, skills: [] },
            formatting: { score: 0 }
          },
          sectionBreakdown: {
            contact: { score: 0 },
            contactInformation: { score: 0 },
            summary: { score: 0 },
            professionalSummary: { score: 0 },
            education: { score: 0 },
            technicalSkills: { score: 0 },
            workExperience: { score: 0 },
            internships: { score: 0 },
            projects: { score: 0 },
            certifications: { score: 0 },
            relevantKeywords: { score: 0 },
            formatting: { score: 0 },
            formattingReadability: { score: 0 },
            atsCompatibility: { score: 0 }
          }
        };
        await studentDoc.save();
      }

      // Return rejection notification with 422
      return res.status(422).json({
        success: false,
        isValidResume: false,
        atsScore: hadPreviousResume ? studentDoc.atsScore : 0,
        score: hadPreviousResume ? studentDoc.atsScore : 0,
        error: 'The uploaded document does not appear to be a resume. Please upload a valid resume in PDF or DOCX format.',
        documentType: validation.documentType,
        confidence: validation.confidence,
        details: validation.details,
        negativeSignals: validation.negativeSignals,
        previousResumeRetained: hadPreviousResume
      });
    }

    // Run Real ATS analysis (Gemini AI enhanced with transparent scoring & improvements)
    let atsResult;
    try {
      atsResult = await analyzeResumeWithAI({ resumeText: extractedText });
    } catch (atsErr) {
      console.warn('ATS analysis error, falling back to local ATS engine:', atsErr.message);
      atsResult = analyzeATS(extractedText);
    }

    // Run Real Skill analysis
    let skillResult;
    try {
      skillResult = extractCategorizedSkills(extractedText);
    } catch (skillErr) {
      console.warn('Skill extraction warning:', skillErr.message);
      skillResult = { categorized: {}, allSkills: [], evidence: {} };
    }

    let roleReadiness = [];
    try {
      roleReadiness = calculateRoleReadiness(skillResult.allSkills);
    } catch (roleErr) {
      console.warn('Role readiness calculation warning:', roleErr.message);
    }

    // Merge analysis payload
    const fullAnalysis = {
      ...atsResult,
      extractedSkills: skillResult.categorized,
      allExtractedSkills: skillResult.allSkills,
      evidence: skillResult.evidence,
      roleReadiness,
      analyzedAt: new Date(),
      version: newVersion
    };

    // Calculate updated profile strength
    let strengthPoints = 0;
    if (studentDoc.department) strengthPoints += 20;
    if (studentDoc.batch) strengthPoints += 20;
    if (skillResult.allSkills.length > 0) strengthPoints += 30;
    if (studentDoc.bio) strengthPoints += 15;
    strengthPoints += 15; // resume uploaded

    // Transactionally update the student's active resume and skill profile
    const updatedStudent = await Student.findOneAndUpdate(
      { userId: req.user.id },
      {
        resume: resumeUrl,
        resumeParsedText: extractedText,
        resumeVersion: newVersion,
        resumeProcessingStatus: 'completed',
        resumeProcessingError: null,
        resumeMetadata: {
          originalName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          uploadedAt: new Date(),
          version: newVersion
        },
        extractedSkills: {
          categorized: skillResult.categorized,
          allSkills: skillResult.allSkills,
          evidence: skillResult.evidence,
          extractedAt: new Date()
        },
        skills: skillResult.allSkills, // Active verified skills updated authoritatively
        lastSkillSyncAt: new Date(),
        resumeAnalysis: fullAnalysis,
        atsScore: atsResult.score,
        profileStrength: Math.min(100, strengthPoints)
      },
      { new: true }
    );

    // Save record to resume analysis history
    try {
      await ResumeAnalysisRecord.create({
        student: updatedStudent._id,
        userId: req.user.id,
        originalFileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        documentType: 'resume',
        isValidResume: true,
        validationConfidence: validation.confidence,
        atsScore: atsResult.score,
        grade: fullAnalysis.grade || 'A',
        statusText: fullAnalysis.statusText || 'Strong ATS Match',
        scoreBreakdown: fullAnalysis.sectionBreakdown || fullAnalysis.scoreBreakdown || fullAnalysis.breakdown,
        matchedSkills: skillResult.allSkills,
        missingSkills: fullAnalysis.missingSkills || [],
        missingKeywords: fullAnalysis.missingKeywords || [],
        strengths: fullAnalysis.strengths || [],
        weaknesses: fullAnalysis.weaknesses || [],
        improvements: fullAnalysis.improvements || [],
        formattingIssues: fullAnalysis.formattingIssues || [],
        isFresherProfile: Boolean(fullAnalysis.isFresherMode),
        version: newVersion
      });
    } catch (recErr) {
      console.warn('Failed to persist ResumeAnalysisRecord:', recErr.message);
    }

    res.json({
      success: true,
      isValidResume: true,
      message: 'Resume uploaded and skills synchronized successfully',
      resume: updatedStudent.resume,
      resumeUrl: updatedStudent.resume,
      version: newVersion,
      atsScore: atsResult.score,
      analysis: fullAnalysis,
      extractedSkills: skillResult.categorized,
      allExtractedSkills: skillResult.allSkills,
      profileSkills: updatedStudent.skills,
      evidence: skillResult.evidence,
      roleReadiness,
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

    // If student has an existing resume file on disk, dynamically verify and re-parse if needed
    if (student.resume) {
      const fullPath = resolveResumePath(student.resume);
      if (fs.existsSync(fullPath)) {
        try {
          const parsed = student.resumeParsedText || await extractTextFromResume(fullPath, student.resume);
          const validation = validateResumeContent(parsed);

          if (validation.isValidResume) {
            // Restore valid status if it was erroneously stuck in rejected or failed state
            if (student.resumeProcessingStatus === 'rejected' || student.resumeProcessingStatus === 'failed' || !analysis || analysis.isValidResume === false) {
              student.resumeProcessingStatus = 'completed';
              student.resumeProcessingError = null;

              let atsResult;
              try {
                atsResult = await analyzeResumeWithAI({ resumeText: parsed });
              } catch (atsErr) {
                console.warn('ATS AI analysis error, using local analyzer:', atsErr.message);
                atsResult = analyzeATS(parsed);
              }

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
              if (skillResult.allSkills?.length) {
                student.skills = skillResult.allSkills;
              }
              await student.save();
            }
          } else {
            student.atsScore = 0;
            student.resumeProcessingStatus = 'rejected';
            student.resumeProcessingError = validation.message;
            if (student.resumeAnalysis) {
              student.resumeAnalysis.score = 0;
              student.resumeAnalysis.isValidResume = false;
              student.resumeAnalysis.grade = 'N/A';
            }
            await student.save();

            return res.json({
              hasResume: true,
              isValidResume: false,
              resume: student.resume,
              resumeUrl: student.resume,
              atsScore: 0,
              score: 0,
              documentType: validation.documentType,
              validationError: {
                title: 'Document Validation Failed',
                message: 'The uploaded document does not appear to be a resume. Please upload a valid resume in PDF or DOCX format.',
                details: validation.details,
                documentType: validation.documentType
              },
              analysis: {
                score: 0,
                overallScore: 0,
                isValidResume: false,
                grade: 'N/A',
                statusText: 'Document Validation Failed (Not a Resume)',
                wordCount: 0,
                breakdown: {
                  impact: { actionVerbsCount: 0, metricsCount: 0 },
                  contact: { score: 0 },
                  sections: { score: 0 },
                  skills: { score: 0, skills: [] },
                  formatting: { score: 0 }
                },
                sectionBreakdown: {
                  contact: { score: 0 },
                  contactInformation: { score: 0 },
                  summary: { score: 0 },
                  professionalSummary: { score: 0 },
                  education: { score: 0 },
                  technicalSkills: { score: 0 },
                  workExperience: { score: 0 },
                  internships: { score: 0 },
                  projects: { score: 0 },
                  certifications: { score: 0 },
                  relevantKeywords: { score: 0 },
                  formatting: { score: 0 },
                  formattingReadability: { score: 0 },
                  atsCompatibility: { score: 0 }
                }
              },
              driveMatches: [],
              studentSkills: student.skills || []
            });
          }
        } catch (e) {
          console.warn('On-demand PDF analysis warning:', e.message);
        }
      }
    }

    // If student's current resume failed validation or was rejected, explicitly return 0%
    if (student.resumeProcessingStatus === 'rejected' || student.resumeAnalysis?.isValidResume === false) {
      return res.json({
        hasResume: Boolean(student.resume),
        isValidResume: false,
        resume: student.resume,
        resumeUrl: student.resume,
        atsScore: 0,
        score: 0,
        validationError: {
          title: 'Document Validation Failed',
          message: 'The uploaded document does not appear to be a resume. Please upload a valid resume in PDF or DOCX format.',
          details: student.resumeProcessingError || 'The uploaded file does not contain necessary resume sections (Contact details, Education, Skills, or Projects).'
        },
        analysis: {
          score: 0,
          overallScore: 0,
          isValidResume: false,
          grade: 'N/A',
          statusText: 'Document Validation Failed (Not a Resume)',
          wordCount: 0,
          breakdown: {
            impact: { actionVerbsCount: 0, metricsCount: 0 },
            contact: { score: 0 },
            sections: { score: 0 },
            skills: { score: 0, skills: [] },
            formatting: { score: 0 }
          },
          sectionBreakdown: {
            contact: { score: 0 },
            contactInformation: { score: 0 },
            summary: { score: 0 },
            professionalSummary: { score: 0 },
            education: { score: 0 },
            technicalSkills: { score: 0 },
            workExperience: { score: 0 },
            internships: { score: 0 },
            projects: { score: 0 },
            certifications: { score: 0 },
            relevantKeywords: { score: 0 },
            formatting: { score: 0 },
            formattingReadability: { score: 0 },
            atsCompatibility: { score: 0 }
          }
        },
        driveMatches: [],
        studentSkills: student.skills || []
      });
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

    const isDocNotResume = student.resumeProcessingStatus === 'rejected' ||
      analysis?.isValidResume === false ||
      student.resumeAnalysis?.isValidResume === false;
    const finalAtsScore = isDocNotResume ? 0 : (student.atsScore ?? analysis?.score ?? 0);

    res.json({
      hasResume: Boolean(student.resume),
      isValidResume: !isDocNotResume,
      resume: student.resume,
      resumeUrl: student.resume,
      atsScore: finalAtsScore,
      analysis,
      driveMatches: isDocNotResume ? [] : driveMatches,
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

    let targetDrive = null;
    let driveMatch = null;
    if (targetDriveId) {
      targetDrive = await PlacementDrive.findById(targetDriveId).populate('company');
      if (targetDrive) {
        driveMatch = {
          drive: targetDrive,
          ...matchResumeWithDrive(text, targetDrive.requirements, targetDrive.description)
        };
      }
    }

    const atsResult = await analyzeResumeWithAI({
      resumeText: text,
      targetDrive
    });
    const skillResult = extractCategorizedSkills(text);
    const roleReadiness = calculateRoleReadiness(skillResult.allSkills);

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
    const assessmentSessions = await AssessmentSession.find({ student: student._id });
    const mockInterviews = await MockInterview.find({ student: student._id });

    const skillAnalysis = await analyzeSkillsWithAI({
      student,
      drives,
      assessmentSessions,
      mockInterviews
    });

    res.json({
      hasResume: Boolean(student.resume),
      ...skillAnalysis
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

    // If explicit skills list provided, use it; otherwise use the extracted skills from active resume
    const sourceSkills = skills && skills.length > 0
      ? skills
      : (student.extractedSkills?.allSkills || student.skills || []);

    const normalizedSkills = Array.from(new Set(sourceSkills.map(s => String(s).trim()).filter(Boolean)));
    student.skills = normalizedSkills;
    student.lastSkillSyncAt = new Date();

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
      message: 'Skills synchronized to profile successfully',
      skills: student.skills,
      allExtractedSkills: student.extractedSkills?.allSkills || student.skills,
      profileSkills: student.skills,
      lastSkillSyncAt: student.lastSkillSyncAt,
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

    let student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      student = await Student.create({
        userId: req.user.id,
        rollNumber: `ROLL-${Date.now().toString().slice(-6)}`,
        department: 'General',
        batch: new Date().getFullYear().toString()
      });
    }
    const user = await User.findById(req.user.id);
    const drives = await PlacementDrive.find({ status: { $in: ['upcoming', 'ongoing'] } }).populate('company');
    const applications = await Application.find({ student: student._id }).populate('placementDrive company');
    const interviews = await Interview.find({ student: student._id }).populate('company placementDrive');

    // Multi-turn recent conversation history from ChatMessage collection (latest 10 chronologically)
    const historyDocs = await ChatMessage.find({ studentId: student._id })
      .sort({ createdAt: -1 })
      .limit(10);
    const recentHistory = historyDocs.reverse();

    // Process using Gemini Copilot Service (with context-aware fallback)
    const { reply, suggestions, isAiPowered } = await answerCopilotQuery({
      message,
      chatHistory: recentHistory,
      student,
      user,
      drives,
      applications,
      interviews
    });

    // Save user message and bot reply in ChatMessage
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

    res.json({
      reply,
      suggestions,
      isAiPowered: Boolean(isAiPowered),
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

    // Retrieve up to 50 most recent messages, ordered chronologically
    const historyDocs = await ChatMessage.find({ studentId: student._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(historyDocs.reverse());
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
    const {
      name,
      phone,
      bio,
      skills,
      programmingLanguages,
      department,
      batch,
      rollNumber,
      cgpa,
      dob,
      gender,
      address,
      city,
      state,
      country,
      university,
      campus,
      degree,
      currentSemester,
      activeBacklogs,
      certifications,
      projects,
      experience,
      socialLinks,
      careerObjective,
      preferredRoles,
      preferredLocations
    } = req.body;

    const allowedUpdates = {};

    // Academic & identification
    if (department !== undefined) allowedUpdates.department = department;
    if (batch !== undefined) allowedUpdates.batch = batch;
    if (rollNumber !== undefined) allowedUpdates.rollNumber = rollNumber;
    if (university !== undefined) allowedUpdates.university = university;
    if (campus !== undefined) allowedUpdates.campus = campus;
    if (degree !== undefined) allowedUpdates.degree = degree;
    if (currentSemester !== undefined) allowedUpdates.currentSemester = currentSemester;
    if (activeBacklogs !== undefined) allowedUpdates.activeBacklogs = Number(activeBacklogs) || 0;

    // CGPA Validation (Strict 0.0 - 10.0 scale)
    if (cgpa !== undefined && cgpa !== null && cgpa !== '') {
      const parsedCgpa = parseFloat(cgpa);
      if (isNaN(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 10) {
        return res.status(400).json({ error: 'CGPA must be a valid number between 0.00 and 10.00' });
      }
      allowedUpdates.cgpa = Math.round(parsedCgpa * 100) / 100;
    }

    // Personal details
    if (phone !== undefined) allowedUpdates.phone = phone;
    if (dob !== undefined) allowedUpdates.dob = dob;
    if (gender !== undefined) allowedUpdates.gender = gender;
    if (address !== undefined) allowedUpdates.address = address;
    if (city !== undefined) allowedUpdates.city = city;
    if (state !== undefined) allowedUpdates.state = state;
    if (country !== undefined) allowedUpdates.country = country;

    // Professional details
    if (bio !== undefined) allowedUpdates.bio = bio;
    if (skills !== undefined) {
      allowedUpdates.skills = Array.isArray(skills)
        ? skills.filter(Boolean)
        : typeof skills === 'string'
        ? skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
    }
    if (programmingLanguages !== undefined) {
      allowedUpdates.programmingLanguages = Array.isArray(programmingLanguages)
        ? programmingLanguages.filter(Boolean)
        : typeof programmingLanguages === 'string'
        ? programmingLanguages.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
    }
    if (certifications !== undefined) allowedUpdates.certifications = certifications;
    if (projects !== undefined) allowedUpdates.projects = projects;
    if (experience !== undefined) allowedUpdates.experience = experience;
    if (socialLinks !== undefined) allowedUpdates.socialLinks = socialLinks;

    // Career preferences
    if (careerObjective !== undefined) allowedUpdates.careerObjective = careerObjective;
    if (preferredRoles !== undefined) {
      allowedUpdates.preferredRoles = Array.isArray(preferredRoles)
        ? preferredRoles.filter(Boolean)
        : typeof preferredRoles === 'string'
        ? preferredRoles.split(',').map((r) => r.trim()).filter(Boolean)
        : [];
    }
    if (preferredLocations !== undefined) {
      allowedUpdates.preferredLocations = Array.isArray(preferredLocations)
        ? preferredLocations.filter(Boolean)
        : typeof preferredLocations === 'string'
        ? preferredLocations.split(',').map((l) => l.trim()).filter(Boolean)
        : [];
    }

    // Update User model (name & phone)
    const userUpdates = {};
    if (name) userUpdates.name = name.trim();
    if (phone !== undefined) userUpdates.phone = phone.trim();
    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(req.user.id, userUpdates);
    }

    // Dynamic Profile Completeness calculation
    let studentDoc = await Student.findOne({ userId: req.user.id });
    if (!studentDoc) {
      studentDoc = await Student.create({
        userId: req.user.id,
        rollNumber: rollNumber || `ROLL-${Date.now().toString().slice(-6)}`,
        department: department || 'General',
        batch: batch || new Date().getFullYear().toString()
      });
    }

    const merged = { ...studentDoc.toObject(), ...allowedUpdates };
    let score = 0;
    // Personal details (25%)
    if (name || studentDoc.userId?.name) score += 5;
    if (merged.phone) score += 5;
    if (merged.rollNumber) score += 5;
    if (merged.dob || merged.gender) score += 5;
    if (merged.city || merged.address) score += 5;

    // Academic details (30%)
    if (merged.department && merged.department !== 'General') score += 8;
    if (merged.degree) score += 7;
    if (merged.batch) score += 5;
    if (merged.cgpa != null && merged.cgpa > 0) score += 10;

    // Professional & Skills (30%)
    if (merged.skills && merged.skills.length > 0) score += 10;
    if (merged.programmingLanguages && merged.programmingLanguages.length > 0) score += 5;
    if (merged.resume) score += 10;
    if ((merged.projects && merged.projects.length > 0) || (merged.certifications && merged.certifications.length > 0)) score += 5;

    // Preferences & Socials (15%)
    if (merged.careerObjective) score += 5;
    if (merged.preferredRoles && merged.preferredRoles.length > 0) score += 5;
    if (merged.socialLinks?.linkedin || merged.socialLinks?.github) score += 5;

    allowedUpdates.profileStrength = Math.min(100, Math.max(15, score));

    const student = await Student.findOneAndUpdate(
      { userId: req.user.id },
      allowedUpdates,
      { new: true }
    ).populate('userId', 'name email phone profilePicture role');
    res.json(student);
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

export const getPlacementDrives = async (req, res) => {
  try {
    // Students only see approved or legacy drives with active status
    const drives = await PlacementDrive.find({
      status: { $in: ['upcoming', 'ongoing'] },
      $or: [
        { approvalStatus: 'approved' },
        { approvalStatus: { $exists: false } }
      ]
    })
      .populate('company')
      .sort({ registrationDeadline: 1 });
    res.json(drives);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const withdrawApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const application = await Application.findOne({ _id: applicationId, student: student._id });
    if (!application) {
      return res.status(404).json({ error: 'Application not found or unauthorized' });
    }

    if (['selected', 'offer_accepted', 'withdrawn', 'rejected'].includes(application.status)) {
      return res.status(400).json({ error: `Cannot withdraw an application that is already ${application.status}.` });
    }

    application.status = 'withdrawn';
    application.feedback = 'Application withdrawn by candidate.';
    await application.save();

    res.json({ message: 'Application successfully withdrawn.', application });
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
      driveId: drive._id,
      applicationId: application._id
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

    const result = await checkCredibilityWithAI(student);
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
    const assessmentSessions = await AssessmentSession.find({ student: student?._id });

    const journey = await generatePlacementJourneyWithAI({
      student: student || {},
      user: user || {},
      applications,
      interviews,
      drives,
      mockInterviews,
      assessmentSessions
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

    const analysis = await analyzeShortlistWithAI({
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

    const prepPlan = await generateCompanyPrepWithAI({
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

    const generated = await generateInterviewSessionWithAI(drive || {}, customRole || 'Software Engineer');

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
    const evaluation = await evaluateInterviewAnswerWithAI({
      question,
      studentAnswer,
      companyName: interview.companyName || 'Company'
    });

    interview.questions[qIndex].studentAnswer = studentAnswer;
    interview.questions[qIndex].score = evaluation.score;
    interview.questions[qIndex].feedback = evaluation.feedback;
    interview.questions[qIndex].strengths = evaluation.strengths;
    interview.questions[qIndex].missingPoints = evaluation.missingPoints;
    interview.questions[qIndex].followUpQuestion = evaluation.followUpQuestion || null;
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

    const scores = await calculateFinalInterviewReportWithAI(interview);

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

    const benchmark = await interpretPeerBenchmarkWithAI({
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

// ==================== APPLICATION ASSISTANT (COVER LETTER & RECRUITER EMAILS) ====================
export const generateCoverLetter = async (req, res) => {
  try {
    const { driveId, customTone } = req.body;
    const student = await Student.findOne({ userId: req.user.id });
    const user = await User.findById(req.user.id);
    const drive = await PlacementDrive.findById(driveId).populate('company');
    if (!drive) return res.status(404).json({ error: 'Placement drive not found' });

    const letter = await draftCoverLetterWithAI({
      student: student || {},
      user: user || {},
      drive,
      customTone: customTone || 'Professional'
    });

    res.json(letter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const generateRecruiterEmail = async (req, res) => {
  try {
    const { driveId, emailType } = req.body;
    const student = await Student.findOne({ userId: req.user.id });
    const user = await User.findById(req.user.id);
    const drive = await PlacementDrive.findById(driveId).populate('company');
    if (!drive) return res.status(404).json({ error: 'Placement drive not found' });

    const email = await draftRecruiterEmailWithAI({
      student: student || {},
      user: user || {},
      drive,
      emailType: emailType || 'initial_outreach'
    });

    res.json(email);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const summarizePlacementDrive = async (req, res) => {
  try {
    const { driveId } = req.params;
    const student = await Student.findOne({ userId: req.user.id });
    const drive = await PlacementDrive.findById(driveId).populate('company');
    if (!drive) return res.status(404).json({ error: 'Placement drive not found' });

    const summary = await summarizeDriveAndAlignment({
      drive,
      student: student || {}
    });

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== COLLABORATIVE EXERCISES ====================
export const generateCollaborationExercise = async (req, res) => {
  try {
    const { peerId, focusArea = 'DSA & System Design' } = req.body;
    const currentStudent = await Student.findOne({ userId: req.user.id });
    const peerStudent = await Student.findById(peerId);

    const exercise = await generateCollaborativeExerciseWithAI({
      focusArea,
      senderSkills: currentStudent?.skills || [],
      receiverSkills: peerStudent?.skills || []
    });

    res.json(exercise);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== GEMINI DIAGNOSTIC STATUS ====================
export const getGeminiDiagnosticStatus = async (req, res) => {
  try {
    const health = await checkGeminiHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



