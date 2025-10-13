import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Programming', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Engineering', 'Literature', 'Other']
  },
  tags: [{
    type: String,
    lowercase: true
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['PDF', 'DOC', 'PPT', 'TXT', 'IMAGE', 'VIDEO', 'OTHER'],
    default: 'PDF'
  },
  pdfPath: {
    type: String // Store file path or URL for uploaded files
  },
  likes: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

const Post = mongoose.model('Post', postSchema);
export default Post;