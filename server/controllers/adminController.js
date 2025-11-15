const User = require('../models/User');
const Habit = require('../models/Habit');
const Community = require('../models/Community');
const Challenge = require('../models/Challenge');
const Completion = require('../models/Completion');

exports.getAnalytics = async (req, res) => {
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

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
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

exports.deleteUser = async (req, res) => {
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

exports.getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.find()
      .populate('creatorId', 'name email')
      .sort({ createdAt: -1 });
    res.json(communities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCommunity = async (req, res) => {
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

exports.deleteCommunity = async (req, res) => {
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
