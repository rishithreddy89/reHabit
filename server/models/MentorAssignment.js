const mongoose = require('mongoose');

const mentorAssignmentSchema = new mongoose.Schema({
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  notes: { type: String, default: '' }
}, { timestamps: true });

mentorAssignmentSchema.index({ mentorId: 1, userId: 1 });

module.exports = mongoose.model('MentorAssignment', mentorAssignmentSchema);
