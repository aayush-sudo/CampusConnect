import express from 'express';
import Request from '../models/Request.js';
import User from '../models/User.js';

const router = express.Router();

// Create a new request
router.post('/requests', async (req, res) => {
  try {
    const { title, description, requesterId, category, urgency, location, tags } = req.body;
    
    // Get requester details
    const requester = await User.findById(requesterId);
    if (!requester) {
      return res.status(404).json({ error: 'Requester not found' });
    }
    
    const request = new Request({
      title,
      description,
      requester: requesterId,
      requesterName: `${requester.firstName} ${requester.lastName}`,
      requesterDetails: {
        major: requester.major,
        avatar: requester.avatar
      },
      category,
      urgency,
      location,
      tags: tags || []
    });
    
    await request.save();
    res.status(201).json({ message: 'Request created successfully', request });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all requests
router.get('/requests', async (req, res) => {
  try {
    const { category, urgency, status, search, limit = 10, page = 1 } = req.query;
    
    let query = {};
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Filter by urgency
    if (urgency && urgency !== 'all') {
      query.urgency = urgency;
    }
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Search in title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const requests = await Request.find(query)
      .populate('requester', 'firstName lastName avatar major')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Request.countDocuments(query);
    
    res.json({
      requests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get requests by user
router.get('/requests/user/:userId', async (req, res) => {
  try {
    const requests = await Request.find({ requester: req.params.userId })
      .populate('requester', 'firstName lastName avatar major')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Respond to a request
router.post('/requests/:id/respond', async (req, res) => {
  try {
    const { userId, message } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    // Add response
    request.responses.push({
      user: userId,
      userName: `${user.firstName} ${user.lastName}`,
      message
    });
    
    request.responseCount = request.responses.length;
    await request.save();
    
    res.json({ message: 'Response added successfully', request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update request status
router.patch('/requests/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    request.status = status;
    await request.save();
    
    res.json({ message: 'Request status updated', request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get request responses
router.get('/requests/:id/responses', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('responses.user', 'firstName lastName avatar major');
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    res.json(request.responses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;