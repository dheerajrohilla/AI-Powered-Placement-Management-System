import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  placementDrive: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PlacementDrive'
  },
  round: {
    type: String,
    default: 'technical',
    required: true
  },
  title: {
    type: String,
    default: 'Technical Interview'
  },
  roomId: {
    type: String,
    index: true,
    sparse: true
  },
  description: {
    type: String,
    default: ''
  },
  instructions: {
    type: String,
    default: ''
  },
  scheduledTime: {
    type: String,
    default: ''
  },
  actualStartTime: {
    type: Date
  },
  actualEndTime: {
    type: Date
  },
  endedBy: {
    type: String
  },
  activityType: {
    type: String,
    enum: ['interview', 'coding_test', 'aptitude_test', 'group_discussion'],
    default: 'interview'
  },
  durationMinutes: {
    type: Number,
    default: 45
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  timeZone: {
    type: String,
    default: 'Asia/Kolkata'
  },
  mode: {
    type: String,
    enum: ['virtual', 'in_person', 'telephonic'],
    default: 'virtual'
  },
  status: {
    type: String,
    enum: ['scheduled', 'upcoming', 'waiting', 'in_progress', 'completed', 'passed', 'failed', 'cancelled'],
    default: 'scheduled'
  },
  location: String,
  joinLink: String,
  interviewer: String,
  interviewerEmail: String,
  feedback: String,
  result: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Interview', interviewSchema);
