import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'mentor', 'admin'], default: 'user' },
  name: { type: String, required: true },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  isActive: { type: Boolean, default: true },
  mentorProfile: {
    specialization: [String],
    experience: String,
    maxClients: { type: Number, default: 10 },
    currentClients: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    isOnline: { type: Boolean, default: false },
    location: {
      lat: Number,
      lng: Number,
      city: String,
      country: String
    }
  },
  stats: {
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    totalHabits: { type: Number, default: 0 },
    totalCompletions: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    activeMentees: { type: Number, default: 0 },
    totalMentees: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 }
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
