import mongoose from 'mongoose';

const workspaceChannelSchema = new mongoose.Schema({
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  topic: {
    type: String,
    default: '',
    maxlength: 200
  },
  type: {
    type: String,
    enum: ['text', 'study', 'code'],
    default: 'text'
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

workspaceChannelSchema.index({ workspace: 1, name: 1 }, { unique: true });

export default mongoose.model('WorkspaceChannel', workspaceChannelSchema);
