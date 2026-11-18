import mongoose from 'mongoose';

const subjectQuestionSchema = new mongoose.Schema({
  subject: {
    type: String,
    enum: ['oops', 'dsa', 'daa', 'coa', 'os', 'dbms', 'cn'],
    required: true,
    index: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
    index: true
  },
  topic: {
    type: String,
    required: true,
    index: true
  },
  questionText: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctOption: {
    type: Number, // 0, 1, 2, 3
    required: true,
    min: 0,
    max: 3
  },
  explanation: {
    type: String,
    required: true
  },
  source: {
    type: String,
    enum: ['curated', 'ai_generated'],
    default: 'curated'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Composite index for fast targeted question sampling
subjectQuestionSchema.index({ subject: 1, difficulty: 1, isActive: 1 });

export default mongoose.model('SubjectQuestion', subjectQuestionSchema);
