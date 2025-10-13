import express from 'express';
import Chat from '../models/Chat.js';
import User from '../models/User.js';

const router = express.Router();

// Create a new chat
router.post('/chats', async (req, res) => {
  try {
    const { title, description, createdById, participantIds, type = 'group' } = req.body;
    
    // Get creator details
    const creator = await User.findById(createdById);
    if (!creator) {
      return res.status(404).json({ error: 'Creator not found' });
    }
    
    // Prepare participants array
    const participants = [];
    
    // Add creator as first participant
    participants.push({
      user: createdById,
      userName: `${creator.firstName} ${creator.lastName}`
    });
    
    // Add other participants
    if (participantIds && participantIds.length > 0) {
      for (const participantId of participantIds) {
        if (participantId !== createdById) { // Avoid duplicating creator
          const participant = await User.findById(participantId);
          if (participant) {
            participants.push({
              user: participantId,
              userName: `${participant.firstName} ${participant.lastName}`
            });
          }
        }
      }
    }
    
    const chat = new Chat({
      title,
      description,
      participants,
      type,
      createdBy: createdById
    });
    
    await chat.save();
    res.status(201).json({ message: 'Chat created successfully', chat });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get chats for a user
router.get('/chats/user/:userId', async (req, res) => {
  try {
    const chats = await Chat.find({
      'participants.user': req.params.userId
    })
    .populate('participants.user', 'firstName lastName avatar')
    .populate('createdBy', 'firstName lastName')
    .sort({ updatedAt: -1 });
    
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific chat with messages
router.get('/chats/:id', async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants.user', 'firstName lastName avatar')
      .populate('messages.sender', 'firstName lastName avatar')
      .populate('createdBy', 'firstName lastName');
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send a message to chat
router.post('/chats/:id/messages', async (req, res) => {
  try {
    const { senderId, content } = req.body;
    
    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({ error: 'Sender not found' });
    }
    
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    // Check if sender is a participant
    const isParticipant = chat.participants.some(p => p.user.toString() === senderId);
    if (!isParticipant) {
      return res.status(403).json({ error: 'User is not a participant in this chat' });
    }
    
    // Add message
    const message = {
      sender: senderId,
      senderName: `${sender.firstName} ${sender.lastName}`,
      content,
      avatar: sender.avatar
    };
    
    chat.messages.push(message);
    
    // Update last message
    chat.lastMessage = {
      content,
      timestamp: new Date(),
      sender: `${sender.firstName} ${sender.lastName}`
    };
    
    await chat.save();
    
    res.json({ message: 'Message sent successfully', chat });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add participant to chat
router.post('/chats/:id/participants', async (req, res) => {
  try {
    const { userId, addedById } = req.body;
    
    const user = await User.findById(userId);
    const addedBy = await User.findById(addedById);
    
    if (!user || !addedBy) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    // Check if addedBy is a participant
    const isParticipant = chat.participants.some(p => p.user.toString() === addedById);
    if (!isParticipant) {
      return res.status(403).json({ error: 'Only participants can add new members' });
    }
    
    // Check if user is already a participant
    const alreadyParticipant = chat.participants.some(p => p.user.toString() === userId);
    if (alreadyParticipant) {
      return res.status(400).json({ error: 'User is already a participant' });
    }
    
    // Add participant
    chat.participants.push({
      user: userId,
      userName: `${user.firstName} ${user.lastName}`
    });
    
    await chat.save();
    
    res.json({ message: 'Participant added successfully', chat });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get chat messages with pagination
router.get('/chats/:id/messages', async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    
    const chat = await Chat.findById(req.params.id)
      .populate('messages.sender', 'firstName lastName avatar')
      .slice('messages', [(page - 1) * limit, limit]);
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    res.json(chat.messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;