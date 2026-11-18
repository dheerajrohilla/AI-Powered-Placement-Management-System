import mongoose from 'mongoose';

const workspaceResourceSchema = new mongoose.Schema({
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['link', 'notes', 'docs', 'video', 'cheatsheet'],
    default: 'link'
  },
  category: {
    type: String,
    default: 'article'
  },
  description: {
    type: String,
    default: '',
    maxlength: 500
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  addedByName: {
    type: String,
    default: 'Member'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

workspaceResourceSchema.index({ workspace: 1, type: 1 });

export default mongoose.model('WorkspaceResource', workspaceResourceSchema);
