import mongoose from 'mongoose';

const tpoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  employeeId: {
    type: String,
    unique: true,
    required: true
  },
  department: {
    type: String,
    default: 'Training & Placement Office'
  },
  collegeName: {
    type: String,
    default: 'National Institute of Technology'
  },
  designation: {
    type: String,
    default: 'Head Training & Placement Officer'
  },
  phone: {
    type: String,
    default: ''
  },
  officeLocation: {
    type: String,
    default: 'Placement Cell, Main Block'
  },
  university: {
    type: String,
    default: 'National Institute of Technology'
  },
  bio: {
    type: String,
    default: ''
  },
  permissions: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('TPO', tpoSchema);
