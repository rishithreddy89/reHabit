import mongoose from 'mongoose';

const mentorSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MentorPlan',
    required: true
  },
  planType: {
    type: String,
    enum: ['basic', 'duo', 'family'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'pending'],
    default: 'pending'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  sessionsUsed: {
    type: Number,
    default: 0
  },
  sessionsTotal: {
    type: Number,
    required: true
  },
  additionalMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: String,
  autoRenew: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

mentorSubscriptionSchema.index({ userId: 1, mentorId: 1, status: 1 });
mentorSubscriptionSchema.index({ endDate: 1, status: 1 });

const MentorSubscription = mongoose.model('MentorSubscription', mentorSubscriptionSchema);

export default MentorSubscription;
