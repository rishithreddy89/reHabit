import UserGamification from '../models/UserGamification.js';
import GamificationChallenge from '../models/GamificationChallenge.js';
import ShopItem from '../models/ShopItem.js';
import Habit from '../models/Habit.js';
import Completion from '../models/Completion.js';

// Badge definitions
const BADGES = {
  WEEK_WARRIOR: {
    badgeId: 'week_warrior',
    name: 'Week Warrior',
    description: 'Complete 7-day streak',
    icon: '🔥',
    rarity: 'common'
  },
  MONTH_MASTER: {
    badgeId: 'month_master',
    name: 'Month Master',
    description: 'Complete 30-day streak',
    icon: '👑',
    rarity: 'rare'
  },
  EARLY_BIRD: {
    badgeId: 'early_bird',
    name: 'Early Bird',
    description: 'Complete 50 habits before 8 AM',
    icon: '🌅',
    rarity: 'rare'
  },
  CENTURION: {
    badgeId: 'centurion',
    name: 'Centurion',
    description: 'Complete 100 habits',
    icon: '💯',
    rarity: 'epic'
  },
  ACE: {
    badgeId: 'ace',
    name: 'Ace',
    description: 'Reach Level 10',
    icon: '🎯',
    rarity: 'epic'
  },
  CONQUEROR: {
    badgeId: 'conqueror',
    name: 'Conqueror',
    description: 'Reach Level 25',
    icon: '⚔️',
    rarity: 'legendary'
  },
  LEGEND: {
    badgeId: 'legend',
    name: 'Legend',
    description: 'Reach Level 50',
    icon: '👑',
    rarity: 'legendary'
  },
  RUSHER: {
    badgeId: 'rusher',
    name: 'Rusher',
    description: 'Complete 10 habits in one day',
    icon: '⚡',
    rarity: 'rare'
  },
  MR_CONSISTENT: {
    badgeId: 'mr_consistent',
    name: 'Mr. Consistent',
    description: 'Maintain 3 different 7-day streaks simultaneously',
    icon: '🎖️',
    rarity: 'epic'
  },
  PERFECTIONIST: {
    badgeId: 'perfectionist',
    name: 'Perfectionist',
    description: 'Complete all daily habits for 7 consecutive days',
    icon: '✨',
    rarity: 'legendary'
  },
  DAWN_CHAMPION: {
    badgeId: 'dawn_champion',
    name: 'Dawn Champion',
    description: 'Complete 100 early morning habits',
    icon: '🌄',
    rarity: 'epic'
  },
  UNSTOPPABLE: {
    badgeId: 'unstoppable',
    name: 'Unstoppable',
    description: 'Reach a 100-day streak on any habit',
    icon: '🚀',
    rarity: 'legendary'
  }
};

const ALL_BADGES = [
  { badgeId: 'week_warrior', name: 'Week Warrior', description: 'Complete 7-day streak', icon: '🔥', rarity: 'common' },
  { badgeId: 'month_master', name: 'Month Master', description: 'Complete 30-day streak', icon: '👑', rarity: 'rare' },
  { badgeId: 'early_bird', name: 'Early Bird', description: 'Complete 50 habits before 8 AM', icon: '🌅', rarity: 'rare' },
  { badgeId: 'centurion', name: 'Centurion', description: 'Complete 100 habits', icon: '💯', rarity: 'epic' },
  { badgeId: 'ace', name: 'Ace', description: 'Reach Level 10', icon: '🎯', rarity: 'epic' },
  { badgeId: 'conqueror', name: 'Conqueror', description: 'Reach Level 25', icon: '⚔️', rarity: 'legendary' },
  { badgeId: 'legend', name: 'Legend', description: 'Reach Level 50', icon: '👑', rarity: 'legendary' },
  { badgeId: 'rusher', name: 'Rusher', description: 'Complete 10 habits in one day', icon: '⚡', rarity: 'rare' },
  { badgeId: 'mr_consistent', name: 'Mr. Consistent', description: 'Maintain 3 different 7-day streaks simultaneously', icon: '🎖️', rarity: 'epic' },
  { badgeId: 'perfectionist', name: 'Perfectionist', description: 'Complete all daily habits for 7 consecutive days', icon: '✨', rarity: 'legendary' },
  { badgeId: 'dawn_champion', name: 'Dawn Champion', description: 'Complete 100 early morning habits', icon: '🌄', rarity: 'epic' },
  { badgeId: 'unstoppable', name: 'Unstoppable', description: 'Reach a 100-day streak on any habit', icon: '🚀', rarity: 'legendary' }
];

const SAMPLE_SHOP_ITEMS = [
  { id: 'avatar_hat', title: 'Cool Hat', price: 100, description: 'A stylish hat for your avatar' },
  { id: 'avatar_bg', title: 'Background: Sunset', price: 250, description: 'A warm sunset for your profile' },
  { id: 'double_xp', title: 'Double XP (1 day)', price: 500, description: 'Earn double XP for 24 hours' }
];

const SAMPLE_LEADERBOARD = [
  { userId: 'u1', name: 'Alice', level: 12, totalXP: 5400 },
  { userId: 'u2', name: 'Bob', level: 10, totalXP: 4200 },
  { userId: 'u3', name: 'You', level: 9, totalXP: 3800 }
];

const SAMPLE_PROFILE = (userId = 'anonymous') => ({
  userId,
  level: 9,
  totalXP: 3800,
  coins: 250,
  avatar: { skin: 'default', accessories: [] },
  habits: [
    { _id: 'h1', title: 'Meditate', streak: 5, longestStreak: 12 },
    { _id: 'h2', title: 'Run', streak: 2, longestStreak: 7 }
  ],
  badges: ALL_BADGES.slice(0, 2),
  stats: { completedHabits: 120, longestStreak: 12 }
});

const SAMPLE_CHALLENGES = [
  { _id: 'c1', title: '7-day streak challenge', description: 'Complete a habit 7 days in a row', joined: false, userProgress: 2, userCompleted: false },
  { _id: 'c2', title: 'Early bird', description: 'Do a habit before 8 AM', joined: true, userProgress: 10, userCompleted: false }
];

// Get or create user gamification
const getOrCreateUserGamification = async (userId) => {
  let userGamification = await UserGamification.findOne({ userId });
  
  if (!userGamification) {
    userGamification = await UserGamification.create({ userId });
  }
  
  return userGamification;
};

// Process habit completion for gamification
export const processHabitCompletion = async (req, res) => {
  try {
    const { habitId, completedAt } = req.body;
    const userId = req.user._id;

    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const userGamification = await getOrCreateUserGamification(userId);
    const completionDate = new Date(completedAt || Date.now());
    const completionHour = completionDate.getHours();

    // Calculate XP based on difficulty
    const xpRewards = { easy: 10, medium: 15, hard: 25 };
    const baseXP = xpRewards[habit.difficulty] || 15;
    
    // Bonus XP for early morning (before 8 AM)
    const isEarlyBird = completionHour < 8;
    const bonusXP = isEarlyBird ? 5 : 0;
    const totalXP = baseXP + bonusXP;

    // Calculate streak
    const today = new Date(completionDate).setHours(0, 0, 0, 0);
    const lastCompleted = habit.lastCompletedDate ? new Date(habit.lastCompletedDate).setHours(0, 0, 0, 0) : null;
    
    let streakBroken = false;
    if (!lastCompleted) {
      habit.streak = 1;
    } else {
      const daysDiff = Math.floor((today - lastCompleted) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        habit.streak += 1;
      } else if (daysDiff === 0) {
        // Same day, don't change streak
      } else {
        streakBroken = true;
        habit.streak = 1;
      }
    }

    // Update longest streak
    if (habit.streak > habit.longestStreak) {
      habit.longestStreak = habit.streak;
    }

    habit.lastCompletedDate = completionDate;
    habit.lastCompletedAt = completionDate;
    habit.total_completions += 1;

    // Add XP and coins
    const xpResult = userGamification.addXP(totalXP);
    const coins = Math.ceil(totalXP / 5); // 1 coin per 5 XP
    userGamification.addCoins(coins);

    // Update stats
    userGamification.stats.totalHabitsCompleted += 1;
    if (isEarlyBird) {
      userGamification.stats.earlyBirdCount += 1;
    }

    // Update avatar mood and evolution
    userGamification.updateAvatarMood(habit.streak);
    userGamification.updateAvatarEvolution();

    // Check for badges
    const newBadges = [];
    
    // Streak badges
    if (habit.streak === 7 && !userGamification.badges.find(b => b.badgeId === 'week_warrior')) {
      userGamification.awardBadge(BADGES.WEEK_WARRIOR);
      newBadges.push(BADGES.WEEK_WARRIOR);
    }
    if (habit.streak === 30 && !userGamification.badges.find(b => b.badgeId === 'month_master')) {
      userGamification.awardBadge(BADGES.MONTH_MASTER);
      newBadges.push(BADGES.MONTH_MASTER);
    }
    if (habit.streak === 100 && !userGamification.badges.find(b => b.badgeId === 'unstoppable')) {
      userGamification.awardBadge(BADGES.UNSTOPPABLE);
      newBadges.push(BADGES.UNSTOPPABLE);
    }

    // Early bird badges
    if (userGamification.stats.earlyBirdCount === 50 && !userGamification.badges.find(b => b.badgeId === 'early_bird')) {
      userGamification.awardBadge(BADGES.EARLY_BIRD);
      newBadges.push(BADGES.EARLY_BIRD);
    }
    if (userGamification.stats.earlyBirdCount === 100 && !userGamification.badges.find(b => b.badgeId === 'dawn_champion')) {
      userGamification.awardBadge(BADGES.DAWN_CHAMPION);
      newBadges.push(BADGES.DAWN_CHAMPION);
    }

    // Completion count badges
    if (userGamification.stats.totalHabitsCompleted === 100 && !userGamification.badges.find(b => b.badgeId === 'centurion')) {
      userGamification.awardBadge(BADGES.CENTURION);
      newBadges.push(BADGES.CENTURION);
    }

    // Level badges
    if (xpResult.leveledUp) {
      if (userGamification.level === 10 && !userGamification.badges.find(b => b.badgeId === 'ace')) {
        userGamification.awardBadge(BADGES.ACE);
        newBadges.push(BADGES.ACE);
      }
      if (userGamification.level === 25 && !userGamification.badges.find(b => b.badgeId === 'conqueror')) {
        userGamification.awardBadge(BADGES.CONQUEROR);
        newBadges.push(BADGES.CONQUEROR);
      }
      if (userGamification.level === 50 && !userGamification.badges.find(b => b.badgeId === 'legend')) {
        userGamification.awardBadge(BADGES.LEGEND);
        newBadges.push(BADGES.LEGEND);
      }
    }

    // Check for multiple simultaneous streaks (Mr. Consistent)
    const allHabits = await Habit.find({ userId, isActive: true });
    const activeStreaks = allHabits.filter(h => h.streak >= 7).length;
    if (activeStreaks >= 3 && !userGamification.badges.find(b => b.badgeId === 'mr_consistent')) {
      userGamification.awardBadge(BADGES.MR_CONSISTENT);
      newBadges.push(BADGES.MR_CONSISTENT);
    }

    await habit.save();
    await userGamification.save();

    res.json({
      success: true,
      xpGained: totalXP,
      coinsGained: coins,
      leveledUp: xpResult.leveledUp,
      newLevel: xpResult.newLevel,
      oldLevel: xpResult.oldLevel,
      currentXP: userGamification.totalXP,
      currentCoins: userGamification.coins,
      currentLevel: userGamification.level,
      streak: habit.streak,
      longestStreak: habit.longestStreak,
      streakBroken,
      newBadges,
      avatar: userGamification.avatar
    });
  } catch (error) {
    console.error('Gamification error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get user gamification data
export const getUserGamification = async (req, res) => {
  try {
    const userId = req.user._id;
    const userGamification = await getOrCreateUserGamification(userId);
    
    // Get user's habits for streak info
    const habits = await Habit.find({ userId, isActive: true })
      .select('title streak longestStreak lastCompletedDate category')
      .sort({ streak: -1 });

    res.json({
      totalXP: userGamification.totalXP,
      level: userGamification.level,
      coins: userGamification.coins,
      badges: userGamification.badges,
      avatar: userGamification.avatar,
      stats: userGamification.stats,
      inventory: userGamification.inventory,
      habits,
      xpToNextLevel: ((userGamification.level) * 100) - userGamification.totalXP,
      progressPercent: ((userGamification.totalXP % 100) / 100) * 100
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get shop items
export const getShopItems = async (req, res) => {
  try {
    const userId = req.user._id;
    const userGamification = await getOrCreateUserGamification(userId);
    
    const items = await ShopItem.find({ isAvailable: true }).sort({ rarity: 1, price: 1 });
    
    // Mark which items user already owns
    const itemsWithOwnership = items.map(item => ({
      ...item.toObject(),
      owned: userGamification.inventory.some(inv => inv.itemId === item._id.toString()),
      canAfford: userGamification.coins >= item.price,
      canBuy: userGamification.level >= item.levelRequired
    }));

    res.json({
      items: itemsWithOwnership,
      userCoins: userGamification.coins,
      userLevel: userGamification.level
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Purchase shop item
export const purchaseShopItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user._id;
    
    const item = await ShopItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const userGamification = await getOrCreateUserGamification(userId);

    // Check if already owned
    if (userGamification.inventory.some(inv => inv.itemId === itemId)) {
      return res.status(400).json({ message: 'Item already owned' });
    }

    // Check level requirement
    if (userGamification.level < item.levelRequired) {
      return res.status(400).json({ message: `Level ${item.levelRequired} required` });
    }

    // Check if can afford
    if (!userGamification.spendCoins(item.price)) {
      return res.status(400).json({ message: 'Insufficient coins' });
    }

    // Add to inventory
    userGamification.inventory.push({
      itemId: item._id.toString(),
      itemType: item.type,
      name: item.name
    });

    // If it's a skin or accessory, equip it
    if (item.type === 'skin') {
      userGamification.avatar.skin = item._id.toString();
    } else if (item.type === 'accessory') {
      if (!userGamification.avatar.accessories.includes(item._id.toString())) {
        userGamification.avatar.accessories.push(item._id.toString());
      }
    }

    await userGamification.save();

    res.json({
      success: true,
      item,
      remainingCoins: userGamification.coins,
      inventory: userGamification.inventory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get active challenges
export const getActiveChallenges = async (req, res) => {
  try {
    const userId = req.user._id;
    const challenges = await GamificationChallenge.getActiveChallenges();
    
    // Add user's progress to each challenge
    const challengesWithProgress = challenges.map(challenge => {
      const participant = challenge.participants.find(p => p.userId.toString() === userId.toString());
      return {
        ...challenge.toObject(),
        userProgress: participant ? participant.progress : 0,
        userCompleted: participant ? participant.completed : false,
        joined: !!participant
      };
    });

    res.json(challengesWithProgress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Join challenge
export const joinChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const userId = req.user._id;
    
    const challenge = await GamificationChallenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Check if already joined
    if (challenge.participants.some(p => p.userId.toString() === userId.toString())) {
      return res.status(400).json({ message: 'Already joined this challenge' });
    }

    challenge.participants.push({ userId, progress: 0 });
    await challenge.save();

    res.json({ success: true, challenge });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const { type = 'level' } = req.query; // level, xp, coins, streaks
    
    let sortField = {};
    if (type === 'level') sortField = { level: -1, totalXP: -1 };
    else if (type === 'xp') sortField = { totalXP: -1 };
    else if (type === 'coins') sortField = { coins: -1 };
    
    const leaderboard = await UserGamification.find()
      .populate('userId', 'name username avatar')
      .sort(sortField)
      .limit(100);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Public / fallback endpoints returning sample data (safe, consistent ESM exports)
export const getBadges = async (req, res) => {
  try {
    return res.json(ALL_BADGES);
  } catch (error) {
    console.error('getBadges error', error);
    return res.status(500).json({ message: error.message });
  }
};

export const getPublicShopItems = async (req, res) => {
  try {
    return res.json({ items: SAMPLE_SHOP_ITEMS });
  } catch (error) {
    console.error('getPublicShopItems error', error);
    return res.status(500).json({ message: error.message });
  }
};

export const getPublicLeaderboard = async (req, res) => {
  try {
    return res.json({ entries: SAMPLE_LEADERBOARD });
  } catch (error) {
    console.error('getPublicLeaderboard error', error);
    return res.status(500).json({ message: error.message });
  }
};

export const getPublicProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId || 'anonymous';
    return res.json(SAMPLE_PROFILE(userId));
  } catch (error) {
    console.error('getPublicProfile error', error);
    return res.status(500).json({ message: error.message });
  }
};

export const getPublicChallenges = async (req, res) => {
  try {
    return res.json(SAMPLE_CHALLENGES);
  } catch (error) {
    console.error('getPublicChallenges error', error);
    return res.status(500).json({ message: error.message });
  }
};

export const joinPublicChallenge = async (req, res) => {
  try {
    const challengeId = req.params.id || req.params.challengeId;
    return res.json({ success: true, message: `Joined challenge ${challengeId}` });
  } catch (error) {
    console.error('joinPublicChallenge error', error);
    return res.status(500).json({ message: error.message });
  }
};

// Default export (keep named exports too)
export default {
  processHabitCompletion,
  getUserGamification,
  getShopItems,
  purchaseShopItem,
  getActiveChallenges,
  joinChallenge,
  getLeaderboard,
  getBadges,
  getPublicShopItems,
  getPublicLeaderboard,
  getPublicProfile,
  getPublicChallenges,
  joinPublicChallenge
};
