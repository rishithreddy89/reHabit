import mongoose from 'mongoose';

const checkInSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  at: {
    type: Date,
    default: Date.now
  }
});

const scoreboardEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  points: {
    type: Number,
    default: 0
  }
});

const studioSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  memberCount: {
    type: Number,
    default: 0
  },
  checkins: [checkInSchema],
  energy: {
    type: Number,
    default: 0
  },
  scoreboard: [scoreboardEntrySchema],
  isPublic: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['fitness', 'productivity', 'mindfulness', 'learning', 'social', 'general'],
    default: 'general'
  }
}, {
  timestamps: true
});

// Update energy based on check-ins in the last hour
studioSchema.methods.updateEnergy = function() {
  const oneHourAgo = new Date(Date.now() - 1000 * 60 * 60);
  this.energy = this.checkins.filter(c => c.at >= oneHourAgo).length;
};

const Studio = mongoose.model('Studio', studioSchema);

export default Studio;
