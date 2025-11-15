import mongoose from 'mongoose';

const gamificationChallengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['weekly', 'monthly', 'special'], 
    default: 'weekly' 
  },
  
  // Challenge conditions
  requirement: {
    type: { type: String, required: true }, // 'complete_habits', 'streak', 'early_bird', 'specific_category'
    target: { type: Number, required: true },
    category: String // For category-specific challenges
  },
  
  // Rewards
  rewards: {
    xp: { type: Number, default: 0 },
    coins: { type: Number, default: 0 },
    badge: {
      badgeId: String,
      name: String,
      icon: String,
      rarity: String
    }
  },
  
  // Duration
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  
  // Status
  isActive: { type: Boolean, default: true },
  
  // Participants
  participants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    progress: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    completedAt: Date
  }],
  
  // Difficulty
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard', 'legendary'], 
    default: 'medium' 
  }
}, {
  timestamps: true
});

// Check if challenge is expired
gamificationChallengeSchema.methods.isExpired = function() {
  return new Date() > this.endDate;
};

// Get active challenges
gamificationChallengeSchema.statics.getActiveChallenges = function() {
  return this.find({
    isActive: true,
    endDate: { $gt: new Date() }
  }).sort({ startDate: -1 });
};

export default mongoose.model('GamificationChallenge', gamificationChallengeSchema);
