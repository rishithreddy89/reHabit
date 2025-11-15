import mongoose from 'mongoose';

const levelSchema = new mongoose.Schema({
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
  levelNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 50
  },
  status: {
    type: String,
    enum: ['locked', 'unlocked', 'current', 'completed'],
    default: 'locked'
  },
  stars: {
    type: Number,
    min: 0,
    max: 3,
    default: 0
  },
  questId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quest'
  },
  startedAt: Date,
  completedAt: Date,
  attempts: {
    type: Number,
    default: 0
  },
  bestStars: {
    type: Number,
    min: 0,
    max: 3,
    default: 0
  }
}, {
  timestamps: true
});

levelSchema.index({ userId: 1, worldId: 1, levelNumber: 1 }, { unique: true });

export default mongoose.model('Level', levelSchema);
