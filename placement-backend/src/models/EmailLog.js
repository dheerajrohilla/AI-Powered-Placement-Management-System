import mongoose from 'mongoose';

const emailLogSchema = new mongoose.Schema({
  recipient: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  from: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    enum: [
      'password_reset_otp',
      'application_confirmation',
      'interview_scheduled',
      'interview_rescheduled',
      'application_status_update',
      'placement_alert',
      'admin_test',
      'custom'
    ],
    default: 'custom',
    index: true
  },
  status: {
    type: String,
    enum: ['queued', 'sent', 'failed', 'simulated'],
    default: 'queued',
    index: true
  },
  messageId: {
    type: String,
    default: null
  },
  idempotencyKey: {
    type: String,
    sparse: true,
    unique: true,
    index: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  lastError: {
    type: String,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  sentAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Auto-expire raw email logs older than 90 days to keep database lightweight
emailLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export default mongoose.model('EmailLog', emailLogSchema);
