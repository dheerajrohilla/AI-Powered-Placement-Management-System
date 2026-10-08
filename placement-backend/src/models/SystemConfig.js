import mongoose from 'mongoose';

const systemConfigSchema = new mongoose.Schema({
  collegeName: {
    type: String,
    default: 'National Institute of Technology'
  },
  collegeCode: {
    type: String,
    default: 'NIT-2026'
  },
  address: {
    type: String,
    default: 'Campus Road, University Enclave'
  },
  contactEmail: {
    type: String,
    default: 'placement@college.edu'
  },
  academicYear: {
    type: String,
    default: '2025-2026'
  },
  departments: [{
    type: String
  }],
  placementSettings: {
    minCgpaDefault: { type: Number, default: 6.5 },
    autoShortlistThreshold: { type: Number, default: 8.0 },
    maxApplicationsPerStudent: { type: Number, default: 15 }
  },
  applicationSettings: {
    allowMultipleOffers: { type: Boolean, default: false },
    requireResumeUpload: { type: Boolean, default: true }
  },
  notificationSettings: {
    emailAlertsEnabled: { type: Boolean, default: true },
    systemAlertsEnabled: { type: Boolean, default: true }
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('SystemConfig', systemConfigSchema);
