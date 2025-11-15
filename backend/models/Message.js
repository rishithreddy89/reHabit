import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'habit-update', 'system', 'sticker'], default: 'text' },
  isSeen: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

messageSchema.index({ senderId: 1, receiverId: 1, timestamp: -1 });

export default mongoose.model('Message', messageSchema);
