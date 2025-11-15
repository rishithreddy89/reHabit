import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  postId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Post', 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  content: { 
    type: String, 
    required: true,
    maxlength: 500
  },
  
  // Nested Comments (Replies)
  parentCommentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Comment'
  },
  
  // Engagement
  likes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  likeCount: { type: Number, default: 0 },
  
  // AI Analysis
  aiSentiment: {
    type: String,
    enum: ['supportive', 'neutral', 'motivational', 'questioning'],
    default: 'neutral'
  },
  isAIGenerated: { type: Boolean, default: false },
  
  // Moderation
  isFlagged: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: true },
  
}, { timestamps: true });

// Indexes
commentSchema.index({ postId: 1, createdAt: -1 });
commentSchema.index({ userId: 1 });
commentSchema.index({ parentCommentId: 1 });

export default mongoose.model('Comment', commentSchema);
