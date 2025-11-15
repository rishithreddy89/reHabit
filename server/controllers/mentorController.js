const User = require('../models/User');
const Habit = require('../models/Habit');
const Completion = require('../models/Completion');
const MentorAssignment = require('../models/MentorAssignment');
const Message = require('../models/Message');

exports.getMyClients = async (req, res) => {
  try {
    const assignments = await MentorAssignment.find({ 
      mentorId: req.user._id, 
      status: 'active' 
    }).populate('userId', 'name email avatar stats');

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getClientDetails = async (req, res) => {
  try {
    const assignment = await MentorAssignment.findOne({
      mentorId: req.user._id,
      userId: req.params.userId,
      status: 'active'
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const user = await User.findById(req.params.userId);
    const habits = await Habit.find({ userId: req.params.userId, isActive: true });
    const recentCompletions = await Completion.find({ userId: req.params.userId })
      .sort({ completedAt: -1 })
      .limit(20);

    res.json({ user, habits, recentCompletions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    const message = await Message.create({
      senderId: req.user._id,
      receiverId,
      content
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.user._id, receiverId: req.params.userId },
        { senderId: req.params.userId, receiverId: req.user._id }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMentorAnalytics = async (req, res) => {
  try {
    const assignments = await MentorAssignment.find({ 
      mentorId: req.user._id, 
      status: 'active' 
    });

    const clientIds = assignments.map(a => a.userId);
    
    const totalHabits = await Habit.countDocuments({ userId: { $in: clientIds } });
    const totalCompletions = await Completion.countDocuments({ userId: { $in: clientIds } });

    res.json({
      totalClients: clientIds.length,
      totalHabits,
      totalCompletions,
      maxCapacity: req.user.mentorProfile?.maxClients || 10
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
