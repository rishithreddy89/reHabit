import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  memberCount: { type: Number, default: 0 },
  postCount: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  avatar: { type: String, default: '' },
  banner: { type: String, default: '' },
  rules: [String],
  focusAreas: [String],
  
  // Enhanced fields for AI matching
  tags: [String],
  activityLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  supportType: { type: String, enum: ['motivational', 'educational', 'accountability', 'social'], default: 'social' }
}, { timestamps: true });

communitySchema.index({ name: 1 });
communitySchema.index({ category: 1 });
communitySchema.index({ tags: 1 });

export default mongoose.model('Community', communitySchema);
