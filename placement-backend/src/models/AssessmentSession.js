import mongoose from 'mongoose';

const assessmentSessionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['aptitude', 'technical', 'hr', 'company'],
    default: 'technical'
  },
  topics: [{
    type: String
  }],
  targetCompany: {
    type: String,
    default: null
  },
  targetRole: {
    type: String,
    default: 'Software Engineer'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'adaptive'],
    default: 'medium'
  },
  questionMix: {
    type: String,
    enum: ['objective', 'subjective', 'mixed'],
    default: 'mixed'
  },
  durationMinutes: {
    type: Number,
    default: 30
  },
  revealMode: {
    type: String,
    enum: ['immediate', 'end'],
    default: 'end'
  },
  negativeMarking: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'expired'],
    default: 'in_progress'
  },
  currentQuestionIdx: {
    type: Number,
    default: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  questions: [{
    questionId: String,
    originalId: String,
    questionText: String,
    category: String,
    topic: String,
    subtopic: String,
    difficulty: String,
    questionType: {
      type: String
    },
    type: {
      type: String
    },
    options: [String],
    correctAnswer: String, // Kept secret on server
    numericalTolerance: Number,
    maxMarks: { type: Number, default: 2 },
    timeAllocationSeconds: Number,
    rubric: [{
      criterion: String,
      weight: Number,
      description: String
    }],
    expectedKeyPoints: [String],
    modelAnswer: String,
    explanation: String,
    codeTemplate: String,
    codeLanguage: String,
    testCases: [{
      input: String,
      expectedOutput: String,
      isHidden: Boolean,
      weight: Number
    }],
    sqlSchema: String,
    sqlExpectedQuery: String,

    // Student response and evaluation
    studentAnswer: { type: String, default: '' },
    isAnswered: { type: Boolean, default: false },
    answeredAt: Date,
    marksAwarded: { type: Number, default: 0 },
    percentageScore: { type: Number, default: 0 },
    feedback: { type: String, default: '' },
    rubricScores: [{
      criterion: String,
      weight: Number,
      scoreAwarded: Number,
      maxScore: Number,
      percentage: Number,
      feedback: String
    }],
    coveredPoints: [String],
    missingPoints: [String],
    incorrectStatements: [String],
    followUpQuestion: { type: String, default: null },
    testCaseResults: [{
      testCaseIndex: Number,
      input: String,
      expected: String,
      actual: String,
      passed: Boolean,
      isHidden: Boolean,
      durationMs: Number,
      error: String
    }]
  }],
  results: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('AssessmentSession', assessmentSessionSchema);
