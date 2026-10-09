import mongoose from 'mongoose';

const mockInterviewSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null
  },
  placementDrive: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PlacementDrive',
    default: null
  },
  targetRole: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    default: 'General Tech'
  },
  jdRequirements: [String],
  questions: [{
    questionId: String,
    question: String,
    category: {
      type: String,
      enum: ['technical', 'system_design', 'sql_problem', 'behavioral', 'coding'],
      default: 'technical'
    },
    topic: String,
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    expectedKeyPoints: [String],
    studentAnswer: {
      type: String,
      default: ''
    },
    score: {
      type: Number,
      default: 0
    },
    feedback: {
      type: String,
      default: ''
    },
    modelAnswer: {
      type: String,
      default: ''
    },
    strengths: [String],
    missingPoints: [String],
    isAnswered: {
      type: Boolean,
      default: false
    },
    answeredAt: Date
  }],
  overallScore: {
    type: Number,
    default: 0
  },
  placementReadinessScore: {
    type: Number,
    default: 0
  },
  readinessStatus: {
    type: String,
    enum: ['Ready for Technical Rounds', 'Moderate Readiness - Target Gaps', 'Needs Practice', 'Not Evaluated'],
    default: 'Not Evaluated'
  },
  topicBreakdown: [{
    topic: String,
    score: Number,
    count: Number
  }],
  strengthsSummary: [String],
  improvementRoadmap: [String],
  status: {
    type: String,
    enum: ['in_progress', 'completed'],
    default: 'in_progress'
  },
  completedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('MockInterview', mockInterviewSchema);
