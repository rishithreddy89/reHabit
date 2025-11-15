import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { 
    type: String, 
    required: true,
    enum: [
      'Health & Fitness',
      'Mental & Emotional Wellbeing',
      'Productivity & Work',
      'Personal Growth',
      'Lifestyle & Daily Routine',
      'Finance',
      'Relationships & Social',
      'Creativity & Hobbies',
      'Digital Discipline',
      'Environmental & Sustainability',
      'Spiritual & Values',
      'Behavioral Control'
    ]
  },
  frequency: { type: String, enum: ['daily', 'weekly'], default: 'daily' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  streak: { type: Number, default: 0 },
  total_completions: { type: Number, default: 0 },
  lastCompletedAt: { type: Date },
  isActive: { type: Boolean, default: true },
  aiGenerated: { type: Boolean, default: false },
  verificationQuestion: { type: String, default: '' }
}, { timestamps: true });

habitSchema.index({ userId: 1, createdAt: -1 });

const Habit = mongoose.model('Habit', habitSchema);
export default Habit;
