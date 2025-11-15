import mongoose from 'mongoose';

const completionSchema = new mongoose.Schema({
  habitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  completedAt: { type: Date, default: Date.now },
  verificationAnswer: { type: String, default: '' }, // For backward compatibility
  allAnswers: [{ type: String }], // Array to store all answers
  currentQuestionIndex: { type: Number, default: 0 },
  aiVerified: { type: Boolean, default: false },
  aiConfidence: { type: Number, min: 0, max: 100, default: 0 },
  aiReasoning: { type: String, default: '' },
  isValidated: { type: Boolean, default: false }, // True only if confidence >= 80
  notes: { type: String, default: '' },
  mood: { type: String, enum: ['excellent', 'good', 'okay', 'struggling', ''], default: '' }
}, { timestamps: true });

completionSchema.index({ habitId: 1, completedAt: -1 });
completionSchema.index({ userId: 1, completedAt: -1 });

const Completion = mongoose.model('Completion', completionSchema);
export default Completion;
