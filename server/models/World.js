import mongoose from 'mongoose';

const worldSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  worldId: {
    type: String,
    required: true,
    enum: ['forest', 'ocean', 'mountain', 'gym', 'garden']
  },
  status: {
    type: String,
    enum: ['locked', 'active', 'completed'],
    default: 'locked'
  },
  currentLevel: {
    type: Number,
    default: 1,
    min: 1,
    max: 50
  },
  completedLevels: {
    type: Number,
    default: 0
  },
  totalStars: {
    type: Number,
    default: 0
  },
  unlockedAt: Date,
  completedAt: Date
}, {
  timestamps: true
});

worldSchema.index({ userId: 1, worldId: 1 }, { unique: true });

export default mongoose.model('World', worldSchema);
