import mongoose from 'mongoose';

const mentorPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['basic', 'duo', 'family']
  },
  displayName: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  duration: {
    type: Number, // in days
    default: 30
  },
  features: [{
    type: String
  }],
  maxMentees: {
    type: Number,
    required: true
  },
  sessionsPerMonth: {
    type: Number,
    required: true
  },
  responseTime: {
    type: String,
    default: '24 hours'
  },
  groupSessions: {
    type: Boolean,
    default: false
  },
  prioritySupport: {
    type: Boolean,
    default: false
  },
  customPlans: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const MentorPlan = mongoose.model('MentorPlan', mentorPlanSchema);

export default MentorPlan;
