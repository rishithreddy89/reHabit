import User from '../models/User.js';
import Habit from '../models/Habit.js';
import Community from '../models/Community.js';
import Challenge from '../models/Challenge.js';
import Completion from '../models/Completion.js';

const getAnalytics = async (req, res) => {
  try {
    const [total_users, total_habits, total_communities, total_completions, total_challenges] = await Promise.all([
      User.countDocuments(),
      Habit.countDocuments(),
      Community.countDocuments(),
      Completion.countDocuments(),
      Challenge.countDocuments()
    ]);

    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    res.json({
      total_users,
      total_habits,
      total_communities,
      total_completions,
      total_challenges,
      usersByRole
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.find()
      .populate('creatorId', 'name email')
      .sort({ createdAt: -1 });
    res.json(communities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCommunity = async (req, res) => {
  try {
    const community = await Community.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    res.json(community);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCommunity = async (req, res) => {
  try {
    const community = await Community.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    res.json({ message: 'Community deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  getAnalytics,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllCommunities,
  updateCommunity,
  deleteCommunity
};
