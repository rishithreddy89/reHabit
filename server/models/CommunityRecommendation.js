import mongoose from 'mongoose';

const communityRecommendationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  communityId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Community', 
    required: true 
  },
  
  // AI Recommendation Details
  matchScore: { 
    type: Number, 
    min: 0, 
    max: 100,
    required: true
  },
  reasons: [String],
  
  matchFactors: {
    habitSimilarity: { type: Number, default: 0 },
    personalityMatch: { type: Number, default: 0 },
    goalAlignment: { type: Number, default: 0 },
    activityLevel: { type: Number, default: 0 },
    experienceLevel: { type: Number, default: 0 }
  },
  
  // User Actions
  viewed: { type: Boolean, default: false },
  joined: { type: Boolean, default: false },
  dismissed: { type: Boolean, default: false },
  
  // Metadata
  recommendedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(+new Date() + 7*24*60*60*1000) }
  
}, { timestamps: true });

// Indexes
communityRecommendationSchema.index({ userId: 1, matchScore: -1 });
communityRecommendationSchema.index({ communityId: 1 });
communityRecommendationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('CommunityRecommendation', communityRecommendationSchema);
