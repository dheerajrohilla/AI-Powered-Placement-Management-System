import mongoose from 'mongoose';

const workspaceInvitationSchema = new mongoose.Schema({
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  recipientEmail: {
    type: String,
    trim: true,
    lowercase: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending',
    index: true
  },
  message: {
    type: String,
    default: 'Join our placement study group!'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

workspaceInvitationSchema.index({ workspace: 1, recipient: 1, status: 1 });
workspaceInvitationSchema.index({ recipientEmail: 1, status: 1 });

export default mongoose.model('WorkspaceInvitation', workspaceInvitationSchema);
