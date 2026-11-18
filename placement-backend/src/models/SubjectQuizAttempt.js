import mongoose from 'mongoose';

const questionAttemptSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOption: { type: Number, required: true }, // Kept secure on server
  selectedOption: { type: Number, default: -1 }, // -1 means unanswered, 0-3 for options
  isAnswered: { type: Boolean, default: false },
  isCorrect: { type: Boolean, default: false },
  explanation: { type: String, default: '' },
  topic: { type: String, default: '' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
}, { _id: false });

const subjectQuizAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  subject: {
    type: String,
    enum: ['oops', 'dsa', 'daa', 'coa', 'os', 'dbms', 'cn'],
    required: true,
    index: true
  },
  subjectName: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'abandoned'],
    default: 'in_progress',
    index: true
  },
  totalQuestions: {
    type: Number,
    default: 15
  },
  score: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  correctCount: {
    type: Number,
    default: 0
  },
  incorrectCount: {
    type: Number,
    default: 0
  },
  unansweredCount: {
    type: Number,
    default: 0
  },
  durationMinutes: {
    type: Number,
    default: 20
  },
  timeSpentSeconds: {
    type: Number,
    default: 0
  },
  performanceCategory: {
    type: String,
    default: ''
  },
  performanceMessage: {
    type: String,
    default: ''
  },
  questions: [questionAttemptSchema],
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for fast history and dashboard queries
subjectQuizAttemptSchema.index({ user: 1, subject: 1, createdAt: -1 });
subjectQuizAttemptSchema.index({ user: 1, status: 1, createdAt: -1 });
subjectQuizAttemptSchema.index({ user: 1, difficulty: 1 });

export default mongoose.model('SubjectQuizAttempt', subjectQuizAttemptSchema);
