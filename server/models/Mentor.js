import mongoose from 'mongoose';

const mentorSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true 
  },
  specialization: [{
    type: String,
    enum: ['fitness', 'productivity', 'mindfulness', 'health', 'learning', 'finance', 'general']
  }],
  bio: { type: String, maxlength: 500 },
  credentials: [{
    title: String,
    organization: String,
    year: Number
  }],
  mentees: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' }
  }],
  maxMentees: { type: Number, default: 10 },
  stats: {
    totalMentees: { type: Number, default: 0 },
    activeMentees: { type: Number, default: 0 },
    completedSessions: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 }
  },
  availability: {
    isAcceptingMentees: { type: Boolean, default: true },
    preferredDays: [String],
    preferredTimes: [String]
  },
  isApproved: { type: Boolean, default: false },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

mentorSchema.methods.canAcceptMentee = function() {
  return this.isApproved && 
         this.availability.isAcceptingMentees && 
         this.stats.activeMentees < this.maxMentees;
};

mentorSchema.methods.addMentee = async function(userId) {
  if (!this.canAcceptMentee()) {
    throw new Error('Cannot accept new mentees at this time');
  }
  
  this.mentees.push({ userId, status: 'active' });
  this.stats.activeMentees += 1;
  this.stats.totalMentees += 1;
  await this.save();
};

const Mentor = mongoose.model('Mentor', mentorSchema);
export default Mentor;
