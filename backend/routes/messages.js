import express from 'express';
import auth from '../middleware/auth.js';
import Message from '../models/Message.js';
import Friend from '../models/Friend.js';

const router = express.Router();

// Send message
router.post('/send', auth, async (req, res) => {
  try {
    const { receiverId, content, type = 'text' } = req.body;

    // Check if they are friends
    const areFriends = await Friend.findOne({
      $or: [
        { userId: req.user.id, friendId: receiverId, status: 'accepted' },
        { userId: receiverId, friendId: req.user.id, status: 'accepted' }
      ]
    });

    if (!areFriends) {
      return res.status(403).json({ message: 'Can only message friends' });
    }

    const message = new Message({
      senderId: req.user.id,
      receiverId,
      content,
      type
    });

    await message.save();
    
    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'name')
      .populate('receiverId', 'name');

    // Emit via socket (handled by socket.io)
    const io = req.app.get('io');
    if (io) {
      io.to(receiverId).emit('new-message', populatedMessage);
    }

    res.json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get messages with a friend
router.get('/:friendId', auth, async (req, res) => {
  try {
    const { friendId } = req.params;
    const { limit = 50, before } = req.query;

    const query = {
      $or: [
        { senderId: req.user.id, receiverId: friendId },
        { senderId: friendId, receiverId: req.user.id }
      ]
    };

    if (before) {
      query.timestamp = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .populate('senderId', 'name')
      .populate('receiverId', 'name');

    // Mark messages as seen
    await Message.updateMany(
      { senderId: friendId, receiverId: req.user.id, isSeen: false },
      { isSeen: true }
    );

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark messages as seen
router.post('/mark-seen/:friendId', auth, async (req, res) => {
  try {
    const { friendId } = req.params;

    await Message.updateMany(
      { senderId: friendId, receiverId: req.user.id, isSeen: false },
      { isSeen: true }
    );

    res.json({ message: 'Messages marked as seen' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get unread count
router.get('/unread/count', auth, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiverId: req.user.id,
      isSeen: false
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
