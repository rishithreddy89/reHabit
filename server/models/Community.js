const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  memberCount: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  avatar: { type: String, default: '' },
  rules: [String]
}, { timestamps: true });

communitySchema.index({ name: 1 });

module.exports = mongoose.model('Community', communitySchema);
