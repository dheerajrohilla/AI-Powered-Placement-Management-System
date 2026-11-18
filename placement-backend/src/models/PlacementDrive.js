import mongoose from 'mongoose';

const placementDriveSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution'
  },
  positions: {
    type: Number,
    required: true
  },
  salary: {
    type: Number,
    required: true
  },
  location: String,
  jobRole: String,
  jobType: {
    type: String,
    default: 'Full Time'
  },
  eligibility: {
    minCGPA: {
      type: Number,
      default: 0
    },
    departments: [String],
    batches: [String]
  },
  registrationDeadline: Date,
  driveDate: Date,
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  // TPO Approval Lifecycle
  approvalStatus: {
    type: String,
    enum: ['draft', 'pending_approval', 'approved', 'rejected', 'changes_requested'],
    default: 'approved' // Default approved for existing drives & backward compatibility, company drives set to pending_approval on submit
  },
  approvalFeedback: {
    type: String,
    default: ''
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  isPublished: {
    type: Boolean,
    default: true
  },
  requirements: [String],
  benefits: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('PlacementDrive', placementDriveSchema);
