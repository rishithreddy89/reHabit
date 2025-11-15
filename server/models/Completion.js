const mongoose = require('mongoose');

const completionSchema = new mongoose.Schema({
  habitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  completedAt: { type: Date, default: Date.now },
  verificationAnswer: { type: String, default: '' },
  aiVerified: { type: Boolean, default: false },
  notes: { type: String, default: '' },
  mood: { type: String, enum: ['excellent', 'good', 'okay', 'struggling', ''], default: '' }
}, { timestamps: true });

completionSchema.index({ habitId: 1, completedAt: -1 });
completionSchema.index({ userId: 1, completedAt: -1 });

module.exports = mongoose.model('Completion', completionSchema);
