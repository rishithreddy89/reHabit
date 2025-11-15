import mongoose from 'mongoose';

const mentorRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // mentor stored as a User document
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  message: {
    type: String,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

mentorRequestSchema.index({ userId: 1, mentorId: 1 });

mentorRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const MentorRequest = mongoose.model('MentorRequest', mentorRequestSchema);
export default MentorRequest;
