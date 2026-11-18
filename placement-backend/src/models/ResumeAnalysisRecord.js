import mongoose from 'mongoose';

const resumeAnalysisRecordSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  originalFileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    default: 0
  },
  mimeType: {
    type: String,
    default: 'application/pdf'
  },
  documentType: {
    type: String,
    enum: ['resume', 'research_paper', 'assignment', 'certificate', 'general_article', 'unrelated_document', 'insufficient_content', 'empty_or_too_short'],
    default: 'resume'
  },
  isValidResume: {
    type: Boolean,
    required: true,
    default: true
  },
  validationConfidence: {
    type: Number,
    default: 1.0
  },
  rejectionReason: {
    type: String,
    default: null
  },
  atsScore: {
    type: Number,
    default: 0
  },
  grade: {
    type: String,
    default: 'N/A'
  },
  statusText: {
    type: String,
    default: ''
  },
  scoreBreakdown: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  matchedSkills: [{
    type: String
  }],
  missingSkills: [{
    type: String
  }],
  missingKeywords: [{
    type: String
  }],
  strengths: [{
    type: String
  }],
  weaknesses: [{
    type: String
  }],
  improvements: [{
    type: String
  }],
  formattingIssues: [{
    type: String
  }],
  isFresherProfile: {
    type: Boolean,
    default: true
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

resumeAnalysisRecordSchema.index({ student: 1, createdAt: -1 });

export default mongoose.model('ResumeAnalysisRecord', resumeAnalysisRecordSchema);

