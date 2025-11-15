import mongoose from 'mongoose';

const accountabilityPartnerSchema = new mongoose.Schema({
  user1Id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  user2Id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Partnership Details
  status: {
    type: String,
    enum: ['pending', 'active', 'paused', 'ended'],
    default: 'pending'
  },
  
  // AI Match Details
  matchScore: { type: Number, min: 0, max: 100 },
  matchReasons: [String],
  
  sharedHabits: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Habit' 
  }],
  sharedGoals: [String],
  
  // Partnership Stats
  checkIns: { type: Number, default: 0 },
  mutualSupport: { type: Number, default: 0 },
  streakTogether: { type: Number, default: 0 },
  
  // Communication
  lastInteraction: Date,
  chatEnabled: { type: Boolean, default: true },
  
  // Dates
  matchedAt: { type: Date, default: Date.now },
  activeSince: Date,
  endedAt: Date,
  
}, { timestamps: true });

// Compound index to prevent duplicates
accountabilityPartnerSchema.index({ user1Id: 1, user2Id: 1 }, { unique: true });
accountabilityPartnerSchema.index({ status: 1 });

export default mongoose.model('AccountabilityPartner', accountabilityPartnerSchema);
