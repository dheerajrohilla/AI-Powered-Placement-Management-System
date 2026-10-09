import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  rollNumber: {
    type: String,
    unique: true,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  batch: {
    type: String,
    required: true
  },
  cgpa: {
    type: Number,
    default: 0
  },
  resume: {
    type: String,
    default: null
  },
  skills: [String],
  bio: String,
  education: [{
    degree: String,
    institution: String,
    passoutYear: String,
    score: String
  }],
  projects: [{
    title: String,
    description: String,
    techStack: [String],
    link: String
  }],
  certifications: [{
    title: String,
    issuer: String,
    issueDate: String
  }],
  experience: [{
    role: String,
    company: String,
    duration: String,
    description: String
  }],
  socialLinks: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    leetcode: { type: String, default: '' },
    portfolio: { type: String, default: '' }
  },
  resumeParsedText: {
    type: String,
    default: ''
  },
  resumeAnalysis: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  atsScore: {
    type: Number,
    default: 0
  },
  profileStrength: {
    type: Number,
    default: 0
  },
  isPlaced: {
    type: Boolean,
    default: false
  },
  placedCompany: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null
  },
  salary: {
    type: Number,
    default: null
  },
  targetRole: {
    type: String,
    default: 'Software Development Engineer'
  },
  codingProfiles: {
    githubRepos: { type: Number, default: 0 },
    leetcodeSolved: { type: Number, default: 0 },
    codeforcesRating: { type: Number, default: 0 },
    hackerrankBadges: { type: Number, default: 0 }
  },
  peerMetrics: {
    dsaScore: { type: Number, default: 0 },
    projectScore: { type: Number, default: 0 },
    resumeScore: { type: Number, default: 0 },
    aptitudeScore: { type: Number, default: 0 }
  },
  credibilityCheck: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Student', studentSchema);
