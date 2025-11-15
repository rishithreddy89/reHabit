import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ShopItem from './models/ShopItem.js';
import GamificationChallenge from './models/GamificationChallenge.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rehabit';

const shopItems = [
  // Themes
  {
    name: 'Ocean Breeze',
    description: 'Calming blue ocean theme',
    type: 'theme',
    price: 50,
    icon: '🌊',
    rarity: 'common',
    levelRequired: 1,
    colors: { primary: '#0077be', secondary: '#00a8e8', accent: '#5eb3d6' }
  },
  {
    name: 'Forest Zen',
    description: 'Peaceful green forest theme',
    type: 'theme',
    price: 50,
    icon: '🌲',
    rarity: 'common',
    levelRequired: 1,
    colors: { primary: '#228b22', secondary: '#32cd32', accent: '#90ee90' }
  },
  {
    name: 'Sunset Glow',
    description: 'Warm orange sunset theme',
    type: 'theme',
    price: 75,
    icon: '🌅',
    rarity: 'rare',
    levelRequired: 5,
    colors: { primary: '#ff6b35', secondary: '#f7931e', accent: '#ffc857' }
  },
  {
    name: 'Midnight Purple',
    description: 'Mysterious purple night theme',
    type: 'theme',
    price: 100,
    icon: '🌙',
    rarity: 'epic',
    levelRequired: 10,
    colors: { primary: '#6a0572', secondary: '#ab47bc', accent: '#ce93d8' }
  },
  {
    name: 'Aurora Borealis',
    description: 'Mystical northern lights theme',
    type: 'theme',
    price: 200,
    icon: '✨',
    rarity: 'legendary',
    levelRequired: 25,
    colors: { primary: '#00ff88', secondary: '#00ccff', accent: '#ff00ff' }
  },

  // Avatar Skins
  {
    name: 'Ninja Warrior',
    description: 'Stealthy ninja avatar',
    type: 'skin',
    price: 100,
    icon: '🥷',
    rarity: 'rare',
    levelRequired: 5
  },
  {
    name: 'Space Explorer',
    description: 'Cosmic astronaut avatar',
    type: 'skin',
    price: 150,
    icon: '👨‍🚀',
    rarity: 'epic',
    levelRequired: 15
  },
  {
    name: 'Dragon Master',
    description: 'Legendary dragon rider',
    type: 'skin',
    price: 300,
    icon: '🐉',
    rarity: 'legendary',
    levelRequired: 30
  },
  {
    name: 'Cyber Samurai',
    description: 'Futuristic warrior',
    type: 'skin',
    price: 250,
    icon: '⚔️',
    rarity: 'legendary',
    levelRequired: 25
  },

  // Accessories
  {
    name: 'Crown of Glory',
    description: 'Shiny golden crown',
    type: 'accessory',
    price: 80,
    icon: '👑',
    rarity: 'rare',
    levelRequired: 10
  },
  {
    name: 'Lightning Aura',
    description: 'Electric energy effect',
    type: 'accessory',
    price: 120,
    icon: '⚡',
    rarity: 'epic',
    levelRequired: 15
  },
  {
    name: 'Phoenix Wings',
    description: 'Majestic fire wings',
    type: 'accessory',
    price: 200,
    icon: '🔥',
    rarity: 'legendary',
    levelRequired: 20
  },

  // Effects
  {
    name: 'Sparkle Trail',
    description: 'Glittering particle effect',
    type: 'effect',
    price: 60,
    icon: '✨',
    rarity: 'common',
    levelRequired: 3
  },
  {
    name: 'Rainbow Boost',
    description: 'Colorful rainbow effect',
    type: 'effect',
    price: 100,
    icon: '🌈',
    rarity: 'rare',
    levelRequired: 12
  },
  {
    name: 'Meteor Shower',
    description: 'Epic falling stars',
    type: 'effect',
    price: 180,
    icon: '☄️',
    rarity: 'epic',
    levelRequired: 18
  }
];

const challenges = [
  // Weekly Challenges
  {
    title: 'Week Warrior',
    description: 'Complete 7 habits this week',
    type: 'weekly',
    requirement: {
      type: 'complete_habits',
      target: 7
    },
    rewards: {
      xp: 100,
      coins: 50,
      badge: {
        badgeId: 'weekly_champion',
        name: 'Weekly Champion',
        icon: '🏆',
        rarity: 'common'
      }
    },
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isActive: true,
    difficulty: 'easy'
  },
  {
    title: 'Early Bird Special',
    description: 'Complete 5 habits before 8 AM this week',
    type: 'weekly',
    requirement: {
      type: 'early_bird',
      target: 5
    },
    rewards: {
      xp: 150,
      coins: 75
    },
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isActive: true,
    difficulty: 'medium'
  },
  {
    title: 'Fitness Frenzy',
    description: 'Complete 10 fitness habits this week',
    type: 'weekly',
    requirement: {
      type: 'specific_category',
      target: 10,
      category: 'Health & Fitness'
    },
    rewards: {
      xp: 200,
      coins: 100
    },
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isActive: true,
    difficulty: 'hard'
  },

  // Monthly Challenges
  {
    title: 'Month Master',
    description: 'Complete 30 habits this month',
    type: 'monthly',
    requirement: {
      type: 'complete_habits',
      target: 30
    },
    rewards: {
      xp: 500,
      coins: 250,
      badge: {
        badgeId: 'monthly_master',
        name: 'Monthly Master',
        icon: '🎖️',
        rarity: 'rare'
      }
    },
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive: true,
    difficulty: 'hard'
  },
  {
    title: 'Consistency King',
    description: 'Maintain a 7-day streak',
    type: 'monthly',
    requirement: {
      type: 'streak',
      target: 7
    },
    rewards: {
      xp: 300,
      coins: 150
    },
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive: true,
    difficulty: 'medium'
  },

  // Special Challenges
  {
    title: 'The Ultimate Challenge',
    description: 'Complete 50 habits and maintain a 30-day streak',
    type: 'special',
    requirement: {
      type: 'complete_habits',
      target: 50
    },
    rewards: {
      xp: 1000,
      coins: 500,
      badge: {
        badgeId: 'ultimate_champion',
        name: 'Ultimate Champion',
        icon: '💎',
        rarity: 'legendary'
      }
    },
    startDate: new Date(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    isActive: true,
    difficulty: 'legendary'
  }
];

async function seedGamificationData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await ShopItem.deleteMany({});
    await GamificationChallenge.deleteMany({});
    console.log('Cleared existing gamification data');

    // Insert shop items
    const createdItems = await ShopItem.insertMany(shopItems);
    console.log(`Created ${createdItems.length} shop items`);

    // Insert challenges
    const createdChallenges = await GamificationChallenge.insertMany(challenges);
    console.log(`Created ${createdChallenges.length} challenges`);

    console.log('Gamification data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedGamificationData();
