import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { authenticateToken, generateToken } from '../middleware/auth.js';

const router = express.Router();

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, username, university, major, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email or username already exists' 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      username,
      university,
      major,
      password: hashedPassword
    });
    
    await user.save();
    
    // Generate JWT token
    const token = generateToken(user._id);
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({ 
      message: 'User created successfully',
      user: userResponse,
      token
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = generateToken(user._id);
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({ 
      message: 'Login successful',
      user: userResponse,
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user profile
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user profile (authenticated)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  // Since we're using JWT, logout is handled on the client side
  // by removing the token from localStorage
  res.json({ message: 'Logged out successfully' });
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, university, major, avatar } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (university) user.university = university;
    if (major) user.major = major;
    if (avatar) user.avatar = avatar;
    
    await user.save();
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({ message: 'Profile updated successfully', user: userResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search users by email (for adding to chats)
router.post('/users/search', authenticateToken, async (req, res) => {
  try {
    const { emails } = req.body;
    
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: 'Please provide an array of emails' });
    }
    
    // Find users by email
    const users = await User.find({
      email: { $in: emails }
    }).select('_id firstName lastName email avatar');
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;