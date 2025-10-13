import express from 'express';
import Post from '../models/Post.js';
import User from '../models/User.js';

const router = express.Router();

// Create a new post
router.post('/posts', async (req, res) => {
  try {
    const { title, description, category, tags, authorId, fileType, pdfPath } = req.body;
    
    // Get author details
    const author = await User.findById(authorId);
    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }
    
    const post = new Post({
      title,
      description,
      category,
      tags: tags || [],
      author: authorId,
      authorName: `${author.firstName} ${author.lastName}`,
      fileType: fileType || 'PDF',
      pdfPath
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

// Like/Unlike a post
router.post('/posts/:id/like', async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
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
    res.json({ message: hasLiked ? 'Post unliked' : 'Post liked', likes: post.likes });
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

export default router;