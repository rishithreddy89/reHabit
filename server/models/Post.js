import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
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
  habitId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Habit'
  },
  
  // Post Content
  content: { 
    type: String, 
    required: true,
    maxlength: 2000
  },
  images: [String],
  postType: {
    type: String,
    enum: ['progress', 'achievement', 'struggle', 'milestone', 'general'],
    default: 'general'
  },
  
  // Engagement Metrics
  likes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  likeCount: { type: Number, default: 0 },
  
  reactions: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { 
      type: String, 
      enum: ['like', 'love', 'fire', 'clap', 'strong', 'sparkle'],
      default: 'like'
    },
    createdAt: { type: Date, default: Date.now }
  }],
  
  commentCount: { type: Number, default: 0 },
  shareCount: { type: Number, default: 0 },
  
  // AI Analysis
  aiSentiment: {
    type: String,
    enum: ['positive', 'neutral', 'struggling', 'celebrating'],
    default: 'neutral'
  },
  aiTags: [String],
  aiSuggestedSupport: String,
  
  // Visibility
  isPublic: { type: Boolean, default: true },
  isPinned: { type: Boolean, default: false },
  isHighlighted: { type: Boolean, default: false },
  
  // Moderation
  isFlagged: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: true },
  
}, { timestamps: true });

// Indexes
postSchema.index({ communityId: 1, createdAt: -1 });
postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ aiTags: 1 });
postSchema.index({ likeCount: -1 });

export default mongoose.model('Post', postSchema);
