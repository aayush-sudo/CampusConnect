import express from 'express';
import Request from '../models/Request.js';
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

// Create a new request
router.post('/requests', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, urgency, location, tags } = req.body;
    const requesterId = req.user._id;
    
    // Flexible requester name handling
    const requesterName = req.body.requesterName || 
                         `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() ||
                         req.user.username || 
                         req.user.name ||
                         'Anonymous';
    
    const request = new Request({
      title,
      description,
      requester: requesterId,
      requesterName,
      requesterDetails: {
        year: req.user.year || '',
        major: req.user.major || '',
        avatar: req.user.avatar || ''
      },
      category,
      urgency,
      location: location || "Not specified",
      tags: tags || []
    });
    
    await request.save();
    res.status(201).json({ message: 'Request created successfully', request });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(400).json({ 
      error: error.message,
      details: error.errors
    });
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
      .populate('responses.user', 'firstName lastName avatar major') // ADDED: Populate response users
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

// UPDATED: Get requests by user - NOW INCLUDES RESPONSE DATA WITH FILES
router.get('/requests/user/:userId', async (req, res) => {
  try {
    const requests = await Request.find({ requester: req.params.userId })
      .populate('requester', 'firstName lastName avatar major')
      .populate('responses.user', 'firstName lastName avatar major') // ADDED: Populate response users
      .sort({ createdAt: -1 });
    
    // Debug log to verify file data is present
    console.log('Fetched user requests with responses:');
    requests.forEach(req => {
      console.log(`Request: ${req.title}, Responses: ${req.responses.length}`);
      req.responses.forEach((resp, idx) => {
        console.log(`  Response ${idx}: ${resp.userName}, File: ${resp.fileName || 'No file'}`);
      });
    });
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching user requests:', error);
    res.status(500).json({ error: error.message });
  }
});

// UPDATED: Respond to a request with file upload support
router.post('/requests/:id/respond', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    // Determine file type based on file mimetype
    let fileType = 'File';
    if (req.file) {
      if (req.file.mimetype.startsWith('image/')) {
        fileType = 'Image';
      } else if (req.file.mimetype.startsWith('video/')) {
        fileType = 'Video';
      }
    }
    
    // Add response with file info
    const responseData = {
      user: userId,
      userName: `${user.firstName} ${user.lastName}`,
      message,
      filePath: req.file ? req.file.path : null,
      fileName: req.file ? req.file.originalname : null,
      fileType: req.file ? fileType : null
    };
    
    // Debug log
    console.log('Adding response with file:', {
      userName: responseData.userName,
      hasFile: !!req.file,
      fileName: responseData.fileName,
      fileType: responseData.fileType,
      filePath: responseData.filePath
    });
    
    request.responses.push(responseData);
    request.responseCount = request.responses.length;
    await request.save();
    
    // Increment user's requestsResponded count
    user.requestsResponded = (user.requestsResponded || 0) + 1;
    await user.save();
    
    res.json({ 
      message: 'Response added successfully', 
      request,
      requestsResponded: user.requestsResponded 
    });
  } catch (error) {
    console.error('Error responding to request:', error);
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

// UPDATED: Get request responses with debug logging
router.get('/requests/:id/responses', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('responses.user', 'firstName lastName avatar major');
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    // Debug log
    console.log(`Fetching responses for request: ${request.title}`);
    console.log(`Total responses: ${request.responses.length}`);
    request.responses.forEach((resp, idx) => {
      console.log(`Response ${idx}:`, {
        userName: resp.userName,
        hasFile: !!resp.filePath,
        fileName: resp.fileName,
        fileType: resp.fileType,
        filePath: resp.filePath
      });
    });
    
    res.json(request.responses);
  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({ error: error.message });
  }
});

// Download response file
router.get('/requests/:requestId/responses/:responseId/file', async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    const response = request.responses.id(req.params.responseId);
    
    if (!response) {
      return res.status(404).json({ error: 'Response not found' });
    }
    
    if (!response.filePath) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    console.log('Downloading file:', {
      filePath: response.filePath,
      fileName: response.fileName
    });
    
    // This will trigger browser download
    res.download(response.filePath, response.fileName || 'download', (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ error: 'Error downloading file' });
      }
    });
  } catch (error) {
    console.error('Error downloading response file:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's recent requests for homepage
router.get('/requests/user/:userId/recent', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const userId = req.params.userId;
    
    console.log('Fetching recent requests for user:', userId);
    
    // Validate userId format
    if (!userId || userId === 'undefined' || userId === 'null') {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const requests = await Request.find({ requester: userId })
      .populate('requester', 'firstName lastName avatar major')
      .populate('responses.user', 'firstName lastName avatar major') // ADDED: Populate response users
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    console.log('Found requests:', requests.length);
    
    // Format for homepage display
    const formattedRequests = requests.map(request => ({
      id: request._id,
      title: request.title,
      description: request.description,
      status: request.status,
      responses: request.responseCount || 0,
      timeAgo: getTimeAgo(request.createdAt),
      category: request.category,
      urgency: request.urgency
    }));
    
    res.json(formattedRequests);
  } catch (error) {
    console.error('Error in getUserRecentRequests:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
///cgcgcj