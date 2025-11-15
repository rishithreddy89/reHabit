import mongoose from 'mongoose';

const friendActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['habit_complete', 'streak', 'quest', 'level_up', 'badge', 'coins', 'needs_support'],
    required: true 
  },
  message: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
});

friendActivitySchema.index({ userId: 1, timestamp: -1 });

export default mongoose.model('FriendActivity', friendActivitySchema);
