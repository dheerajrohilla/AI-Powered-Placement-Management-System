import mongoose from 'mongoose';

const studyCollaborationSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  complementaryFocus: {
    type: String,
    required: true
  },
  senderStrongSkills: [String],
  receiverStrongSkills: [String],
  sharedTargetRole: {
    type: String,
    default: 'Software Engineer'
  },
  message: {
    type: String,
    default: 'Hey! Found your profile through Skill Match. Would love to collaborate and prep together.'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'completed'],
    default: 'pending'
  },
  suggestedStudyTopics: [String],
  contactPreference: {
    type: String,
    enum: ['email', 'linkedin', 'github', 'discord'],
    default: 'email'
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

// Avoid duplicate pending requests between same pair
studyCollaborationSchema.index({ sender: 1, receiver: 1, status: 1 });

export default mongoose.model('StudyCollaboration', studyCollaborationSchema);
