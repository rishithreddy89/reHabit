import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },
  duration: { type: Number, required: true }, // in days
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  participants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now },
    progress: { type: Number, default: 0 },
    completed: { type: Boolean, default: false }
  }],
  participantCount: { type: Number, default: 0 },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  isActive: { type: Boolean, default: true },
  rewards: {
    points: { type: Number, default: 0 },
    badge: { type: String, default: '' }
  }
}, { timestamps: true });

const Challenge = mongoose.model('Challenge', challengeSchema);
export default Challenge;
