import ChatMessage from '../models/ChatMessage.js';
import MentorRequest from '../models/MentorRequest.js';

export const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user._id;

    // Verify relationship exists (either user->mentor or mentor->user)
    const relationship = await MentorRequest.findOne({
      $or: [
        { userId: senderId, mentorId: receiverId, status: 'accepted' },
        { userId: receiverId, mentorId: senderId, status: 'accepted' }
      ]
    });

    if (!relationship) {
      return res.status(403).json({ message: 'No active relationship with this user' });
    }

    const chatMessage = await ChatMessage.create({
      senderId,
      receiverId,
      message,
      isDelivered: true
    });

    const populatedMessage = await ChatMessage.findById(chatMessage._id)
      .populate('senderId', 'name avatar')
      .populate('receiverId', 'name avatar');

    // Broadcast the saved message to the chat room via Socket.IO (if available)
    try {
      const io = req.app?.get('io');
      if (io) {
        const room = [String(senderId), String(receiverId)].sort().join('_');
        io.to(room).emit('receive_message', populatedMessage);
      }
    } catch (emitErr) {
      console.warn('Failed to emit chat message via Socket.IO:', emitErr.message || emitErr);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Verify relationship
    const relationship = await MentorRequest.findOne({
      $or: [
        { userId: currentUserId, mentorId: userId, status: 'accepted' },
        { userId, mentorId: currentUserId, status: 'accepted' }
      ]
    });

    if (!relationship) {
      return res.status(403).json({ message: 'No active relationship with this user' });
    }

    const messages = await ChatMessage.find({
      $or: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId }
      ]
    })
      .populate('senderId', 'name avatar')
      .populate('receiverId', 'name avatar')
      .sort({ createdAt: 1 })
      .limit(100);

    // Mark messages as seen
    await ChatMessage.updateMany(
      { senderId: userId, receiverId: currentUserId, isSeen: false },
      { isSeen: true }
    );

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: error.message });
  }
};

export const markAsSeen = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await ChatMessage.findByIdAndUpdate(
      messageId,
      { isSeen: true },
      { new: true }
    );

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  sendMessage,
  getMessages,
  markAsSeen
};
