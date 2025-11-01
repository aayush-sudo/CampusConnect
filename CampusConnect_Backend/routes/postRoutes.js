import express from 'express';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Helper function to calculate time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return `${Math.floor(diffInSeconds / 2592000)} months ago`;
}

// Create a new post
router.post('/posts', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { title, description, category, tags, fileType } = req.body;
    const authorId = req.user._id;
    
    const post = new Post({
      title,
      description,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      author: authorId,
      authorName: `${req.user.firstName} ${req.user.lastName}`,
      fileType: fileType || 'PDF',
      pdfPath: req.file ? req.file.path : null
    });
    
    await post.save();
    res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all posts
router.get('/posts', async (req, res) => {
  try {
    const { category, search, limit = 10, page = 1 } = req.query;
    
    let query = {};
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Search in title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const posts = await Post.find(query)
      .populate('author', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Post.countDocuments(query);
    
    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get trending posts for homepage (MUST be before /posts/:id)
router.get('/posts/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    console.log('Fetching trending posts with limit:', limit);
    
    const posts = await Post.find({})
      .populate('author', 'firstName lastName avatar')
      .sort({ likes: -1, downloads: -1, createdAt: -1 })
      .limit(parseInt(limit));
    
    console.log('Found posts:', posts.length);
    
    // Format for homepage display
    const formattedPosts = posts.map(post => ({
      id: post._id,
      title: post.title,
      author: post.authorName,
      likes: post.likes || 0,
      category: post.category,
      timeAgo: getTimeAgo(post.createdAt),
      downloads: post.downloads || 0,
      views: post.views || 0
    }));
    
    res.json(formattedPosts);
  } catch (error) {
    console.error('Error in getTrendingPosts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's contributions for homepage (MUST be before /posts/:id)
router.get('/posts/user/:userId/contributions', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const userId = req.params.userId;
    
    console.log('Fetching contributions for user:', userId);
    
    // Validate userId format
    if (!userId || userId === 'undefined' || userId === 'null') {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const posts = await Post.find({ author: userId })
      .populate('author', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    console.log('Found contributions:', posts.length);
    
    // Format for homepage display
    const formattedPosts = posts.map(post => ({
      id: post._id,
      title: post.title,
      description: post.description,
      likes: post.likes || 0,
      downloads: post.downloads || 0,
      timeAgo: getTimeAgo(post.createdAt),
      category: post.category
    }));
    
    res.json(formattedPosts);
  } catch (error) {
    console.error('Error in getUserContributions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single post by ID
router.get('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'firstName lastName avatar');
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get posts by user
router.get('/posts/user/:userId', async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .populate('author', 'firstName lastName avatar')
      .sort({ createdAt: -1 });
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// NEW: Update a post (only by owner)
router.put('/posts/:id', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Check if user is the owner
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You are not authorized to edit this post' });
    }
    
    const { title, description, category, tags, fileType } = req.body;
    
    // Update fields
    if (title) post.title = title;
    if (description) post.description = description;
    if (category) post.category = category;
    if (tags) post.tags = tags.split(',').map(tag => tag.trim());
    if (fileType) post.fileType = fileType;
    if (req.file) post.pdfPath = req.file.path;
    
    await post.save();
    res.json({ message: 'Post updated successfully', post });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// NEW: Delete a post (only by owner)
router.delete('/posts/:id', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Check if user is the owner
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You are not authorized to delete this post' });
    }
    
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// IMPROVED: Like/Unlike a post (with authentication)
router.post('/posts/:id/like', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const userId = req.user._id;
    const hasLiked = post.likedBy.includes(userId);
    
    if (hasLiked) {
      // Unlike
      post.likedBy.pull(userId);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      // Like
      post.likedBy.push(userId);
      post.likes += 1;
    }
    
    await post.save();
    res.json({ 
      message: hasLiked ? 'Post unliked' : 'Post liked', 
      likes: post.likes,
      hasLiked: !hasLiked 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Increment download count
router.post('/posts/:id/download', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    post.downloads += 1;
    await post.save();
    
    res.json({ message: 'Download count updated', downloads: post.downloads });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Increment view count
router.post('/posts/:id/view', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    post.views += 1;
    await post.save();
    
    res.json({ message: 'View count updated', views: post.views });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//  NEW: Download file route
router.get('/posts/:id/file', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (!post.pdfPath) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // This will trigger browser download
    res.download(post.pdfPath, (err) => {
      if (err) {
        res.status(500).json({ error: 'Error downloading file' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
