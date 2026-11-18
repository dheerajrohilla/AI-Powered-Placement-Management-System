import mongoose from 'mongoose';
import crypto from 'crypto';

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    default: '',
    maxlength: 500
  },
  goal: {
    type: String,
    default: 'Placement Preparation & Mock Interviews'
  },
  category: {
    type: String,
    enum: [
      'DSA & Algorithms',
      'Full Stack Development',
      'System Design',
      'Aptitude & Reasoning',
      'Core CS & DBMS',
      'Mock Interviews',
      'General'
    ],
    default: 'DSA & Algorithms'
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  inviteCode: {
    type: String,
    unique: true,
    default: () => crypto.randomBytes(4).toString('hex').toUpperCase()
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  members: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member', 'viewer'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

workspaceSchema.index({ 'members.student': 1 });
workspaceSchema.index({ isPrivate: 1, category: 1 });

export default mongoose.model('Workspace', workspaceSchema);
