import mongoose from 'mongoose';


const requestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requesterName: {
    type: String,
    required: true
  },
  requesterDetails: {
    year: String,
    major: String,
    avatar: String
  },
  category: {
    type: String,
    required: true,
    enum: ['Study Material', 'Study Partner', 'Project Team', 'Textbook', 'Equipment', 'Tutoring', 'Study Group', 'Other']
  },
  urgency: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high']
  },
  status: {
    type: String,
    enum: ['pending', 'complete', 'in-progress'],
    default: 'pending'
  },
  location: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    lowercase: true
  }],
  responses: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: String,
    message: String,
    filePath: String,  // NEW: Store uploaded file path
    fileName: String,  // NEW: Store original file name
    fileType: String,  // NEW: Store file type (Image, Video, File)
    respondedAt: {
      type: Date,
      default: Date.now
    }
  }],
  responseCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});


const Request = mongoose.model('Request', requestSchema);
export default Request;
