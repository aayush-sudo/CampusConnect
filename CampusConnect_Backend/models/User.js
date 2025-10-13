import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: "/placeholder.svg"
  },
  year: {
    type: String,
    default: "1st Year"
  },
  major: {
    type: String,
    default: "Undeclared"
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;