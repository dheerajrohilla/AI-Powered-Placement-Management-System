import mongoose from 'mongoose';

const workspaceTaskSchema = new mongoose.Schema({
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
  description: {
    type: String,
    default: '',
    maxlength: 1000
  },
  category: {
    type: String,
    default: 'Placement Goal'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    default: null
  },
  assignedName: {
    type: String,
    default: 'All Members'
  },
  status: {
    type: String,
    enum: ['todo', 'pending', 'in_progress', 'completed'],
    default: 'todo'
  },
  dueDate: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  createdByName: {
    type: String,
    default: 'Member'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

workspaceTaskSchema.index({ workspace: 1, status: 1 });

export default mongoose.model('WorkspaceTask', workspaceTaskSchema);
