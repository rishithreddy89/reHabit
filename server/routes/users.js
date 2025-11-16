import express from 'express';
import dashboard from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import UserGamification from '../models/UserGamification.js';

const router = express.Router();

router.use(protect);

router.get('/stats', dashboard.getUserStats);
router.get('/leaderboard', dashboard.getLeaderboard);
router.get('/insights', dashboard.getAIInsights);

// Get current user's profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const gamification = await UserGamification.findOne({ userId: req.user.id });
    
    const profileData = {
      ...user.toObject(),
      xp: gamification?.xp || 0,
      level: gamification?.level || 1,
      coins: gamification?.coins || 0,
      streak: gamification?.streak || 0,
      badges: gamification?.badges || []
    };
    
    res.json(profileData);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { name, email, bio, avatarEmoji } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (bio !== undefined) updateData.bio = bio;
    if (avatarEmoji) updateData.avatarEmoji = avatarEmoji;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Get another user's public profile
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('name email bio avatarEmoji createdAt');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const gamification = await UserGamification.findOne({ userId: req.params.userId });
    
    const profileData = {
      ...user.toObject(),
      xp: gamification?.xp || 0,
      level: gamification?.level || 1,
      coins: gamification?.coins || 0,
      streak: gamification?.streak || 0,
      badges: gamification?.badges || [],
      // Hide email for other users
      email: req.user.id === req.params.userId ? user.email : undefined
    };
    
    res.json(profileData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

export default router;
