import express from 'express';
import auth from '../middleware/auth.js';
import Friend from '../models/Friend.js';
import User from '../models/User.js';
import FriendActivity from '../models/FriendActivity.js';

const router = express.Router();

// Send friend request
router.post('/request', auth, async (req, res) => {
  try {
    const { friendId } = req.body;
    
    if (friendId === req.user.id) {
      return res.status(400).json({ message: 'Cannot add yourself as friend' });
    }

    const existingRequest = await Friend.findOne({
      $or: [
        { userId: req.user.id, friendId },
        { userId: friendId, friendId: req.user.id }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already exists' });
    }

    const friendRequest = new Friend({
      userId: req.user.id,
      friendId,
      status: 'pending'
    });

    await friendRequest.save();
    res.json({ message: 'Friend request sent', request: friendRequest });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Accept friend request
router.post('/accept', auth, async (req, res) => {
  try {
    const { friendId } = req.body;
    
    const friendRequest = await Friend.findOne({
      userId: friendId,
      friendId: req.user.id,
      status: 'pending'
    });

    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    friendRequest.status = 'accepted';
    friendRequest.updatedAt = Date.now();
    await friendRequest.save();

    res.json({ message: 'Friend request accepted', request: friendRequest });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reject friend request
router.post('/reject', auth, async (req, res) => {
  try {
    const { friendId } = req.body;
    
    await Friend.findOneAndDelete({
      userId: friendId,
      friendId: req.user.id,
      status: 'pending'
    });

    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get friends list
router.get('/list', auth, async (req, res) => {
  try {
    const friends = await Friend.find({
      $or: [
        { userId: req.user.id, status: 'accepted' },
        { friendId: req.user.id, status: 'accepted' }
      ]
    }).populate('userId friendId', 'name email xp level streak');

    const friendsList = friends.map(f => {
      const friend = f.userId.toString() === req.user.id ? f.friendId : f.userId;
      return friend;
    });

    res.json(friendsList);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search users
router.get('/search', auth, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.json([]);
    }

    const users = await User.find({
      _id: { $ne: req.user.id },
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('name email xp level streak').limit(20);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get friend activity feed
router.get('/activity', auth, async (req, res) => {
  try {
    const friends = await Friend.find({
      $or: [
        { userId: req.user.id, status: 'accepted' },
        { friendId: req.user.id, status: 'accepted' }
      ]
    });

    const friendIds = friends.map(f => 
      f.userId.toString() === req.user.id ? f.friendId : f.userId
    );

    const activities = await FriendActivity.find({
      userId: { $in: friendIds }
    })
    .populate('userId', 'name')
    .sort({ timestamp: -1 })
    .limit(50);

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove friend
router.post('/remove', auth, async (req, res) => {
  try {
    const { friendId } = req.body;
    
    await Friend.findOneAndDelete({
      $or: [
        { userId: req.user.id, friendId },
        { userId: friendId, friendId: req.user.id }
      ]
    });

    res.json({ message: 'Friend removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get pending requests
router.get('/requests/pending', auth, async (req, res) => {
  try {
    const requests = await Friend.find({
      friendId: req.user.id,
      status: 'pending'
    }).populate('userId', 'name email xp level streak');

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
