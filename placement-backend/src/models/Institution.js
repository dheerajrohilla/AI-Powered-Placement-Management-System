import mongoose from 'mongoose';

const institutionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    default: 'Apex Institute of Technology'
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    default: 'APEX-UNIV'
  },
  domain: {
    type: String,
    default: 'apex.edu'
  },
  address: {
    city: { type: String, default: 'Tech Hub' },
    state: { type: String, default: 'Karnataka' },
    country: { type: String, default: 'India' }
  },
  contactEmail: {
    type: String,
    default: 'tpo@apex.edu'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    allowStudentRegistration: { type: Boolean, default: true },
    requireDriveApproval: { type: Boolean, default: true },
    minCgpaThreshold: { type: Number, default: 6.0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Institution', institutionSchema);
