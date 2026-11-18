import mongoose from 'mongoose';

const workspaceMessageSchema = new mongoose.Schema({
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
    index: true
  },
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkspaceChannel',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  senderUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  senderName: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 4000
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkspaceMessage',
    default: null
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

workspaceMessageSchema.index({ workspace: 1, channel: 1, createdAt: -1 });

export default mongoose.model('WorkspaceMessage', workspaceMessageSchema);
