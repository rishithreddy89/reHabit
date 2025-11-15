import mongoose from 'mongoose';

const userGamificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // XP and Levels
  totalXP: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  
  // Coins
  coins: { type: Number, default: 0 },
  
  // Badges/Achievements
  badges: [{
    badgeId: String,
    name: String,
    description: String,
    icon: String,
    earnedAt: { type: Date, default: Date.now },
    rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], default: 'common' }
  }],
  
  // Avatar
  avatar: {
    skin: { type: String, default: 'default' },
    mood: { type: String, enum: ['happy', 'excited', 'motivated', 'tired', 'sad'], default: 'happy' },
    accessories: [String],
    evolution: { type: Number, default: 1 } // 1-5 evolution stages
  },
  
  // Purchased Items
  inventory: [{
    itemId: String,
    itemType: { type: String, enum: ['theme', 'skin', 'accessory', 'effect'] },
    name: String,
    purchasedAt: { type: Date, default: Date.now }
  }],
  
  // Statistics
  stats: {
    totalHabitsCompleted: { type: Number, default: 0 },
    totalDaysActive: { type: Number, default: 0 },
    earlyBirdCount: { type: Number, default: 0 }, // Habits before 8 AM
    perfectWeeks: { type: Number, default: 0 },
    longestOverallStreak: { type: Number, default: 0 }
  },
  
  // Active Challenges
  activeChallenges: [{
    challengeId: mongoose.Schema.Types.ObjectId,
    progress: { type: Number, default: 0 },
    startedAt: Date,
    completed: { type: Boolean, default: false }
  }]
}, {
  timestamps: true
});

// Calculate level from XP
userGamificationSchema.methods.calculateLevel = function() {
  return Math.floor(this.totalXP / 100) + 1;
};

// Add XP and check for level up
userGamificationSchema.methods.addXP = function(amount) {
  const oldLevel = this.level;
  this.totalXP += amount;
  this.level = this.calculateLevel();
  return {
    xpGained: amount,
    leveledUp: this.level > oldLevel,
    newLevel: this.level,
    oldLevel: oldLevel
  };
};

// Add coins
userGamificationSchema.methods.addCoins = function(amount) {
  this.coins += amount;
};

// Spend coins
userGamificationSchema.methods.spendCoins = function(amount) {
  if (this.coins >= amount) {
    this.coins -= amount;
    return true;
  }
  return false;
};

// Award badge
userGamificationSchema.methods.awardBadge = function(badge) {
  const exists = this.badges.find(b => b.badgeId === badge.badgeId);
  if (!exists) {
    this.badges.push(badge);
    return true;
  }
  return false;
};

// Update avatar mood based on activity
userGamificationSchema.methods.updateAvatarMood = function(streakCount) {
  if (streakCount >= 30) {
    this.avatar.mood = 'excited';
  } else if (streakCount >= 14) {
    this.avatar.mood = 'motivated';
  } else if (streakCount >= 7) {
    this.avatar.mood = 'happy';
  } else if (streakCount >= 3) {
    this.avatar.mood = 'happy';
  } else {
    this.avatar.mood = 'tired';
  }
};

// Update avatar evolution
userGamificationSchema.methods.updateAvatarEvolution = function() {
  if (this.level >= 50) {
    this.avatar.evolution = 5;
  } else if (this.level >= 30) {
    this.avatar.evolution = 4;
  } else if (this.level >= 20) {
    this.avatar.evolution = 3;
  } else if (this.level >= 10) {
    this.avatar.evolution = 2;
  } else {
    this.avatar.evolution = 1;
  }
};

export default mongoose.model('UserGamification', userGamificationSchema);
