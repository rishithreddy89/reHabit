// Sample data initialization script for gamification system
import axios from 'axios';
import { API } from '@/lib/config';

export const initializeSampleGamificationData = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    
    // Sample XP and level data
    const sampleXP = 1250; // This will make user level 13
    const sampleCoins = 250;
    const sampleBadges = [
      {
        badgeId: 'week_warrior',
        name: 'Week Warrior',
        description: 'Complete 7-day streak',
        icon: '🔥',
        rarity: 'common',
        earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      },
      {
        badgeId: 'early_bird',
        name: 'Early Bird',
        description: 'Complete 50 habits before 8 AM',
        icon: '🌅',
        rarity: 'rare',
        earnedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        badgeId: 'ace',
        name: 'Ace',
        description: 'Reach Level 10',
        icon: '🎯',
        rarity: 'epic',
        earnedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // Yesterday
      },
      {
        badgeId: 'rusher',
        name: 'Rusher',
        description: 'Complete 10 habits in one day',
        icon: '⚡',
        rarity: 'rare',
        earnedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago (NEW!)
      }
    ];

    return {
      totalXP: sampleXP,
      level: Math.floor(sampleXP / 100) + 1,
      coins: sampleCoins,
      badges: sampleBadges,
      avatar: {
        skin: 'default',
        mood: 'excited',
        evolution: 2, // Seedling stage
        accessories: []
      },
      stats: {
        totalHabitsCompleted: 145,
        totalDaysActive: 28,
        earlyBirdCount: 52,
        perfectWeeks: 3,
        longestOverallStreak: 14
      }
    };
  } catch (error) {
    console.error('Failed to initialize sample data:', error);
    return null;
  }
};

// Sample leaderboard data
export const SAMPLE_LEADERBOARD = [
  {
    userId: '1',
    name: 'Sarah Johnson',
    level: 95,
    totalXP: 9450,
    coins: 1890,
    badgeCount: 12,
    avatar: '🏆'
  },
  {
    userId: '2',
    name: 'Mike Chen',
    level: 87,
    totalXP: 8650,
    coins: 1730,
    badgeCount: 11,
    avatar: '⚡'
  },
  {
    userId: '3',
    name: 'Emma Rodriguez',
    level: 76,
    totalXP: 7550,
    coins: 1510,
    badgeCount: 10,
    avatar: '🌟'
  },
  {
    userId: '4',
    name: 'James Wilson',
    level: 68,
    totalXP: 6750,
    coins: 1350,
    badgeCount: 9,
    avatar: '🎯'
  },
  {
    userId: '5',
    name: 'Olivia Brown',
    level: 59,
    totalXP: 5850,
    coins: 1170,
    badgeCount: 8,
    avatar: '💎'
  },
  {
    userId: '6',
    name: 'Liam Taylor',
    level: 52,
    totalXP: 5150,
    coins: 1030,
    badgeCount: 8,
    avatar: '🔥'
  },
  {
    userId: '7',
    name: 'Sophia Anderson',
    level: 45,
    totalXP: 4450,
    coins: 890,
    badgeCount: 7,
    avatar: '⭐'
  },
  {
    userId: '8',
    name: 'Noah Martinez',
    level: 38,
    totalXP: 3750,
    coins: 750,
    badgeCount: 6,
    avatar: '🎮'
  },
  {
    userId: '9',
    name: 'Ava Garcia',
    level: 31,
    totalXP: 3050,
    coins: 610,
    badgeCount: 6,
    avatar: '🌱'
  },
  {
    userId: '10',
    name: 'Ethan Davis',
    level: 24,
    totalXP: 2350,
    coins: 470,
    badgeCount: 5,
    avatar: '🚀'
  },
  {
    userId: 'current', // This will be replaced with actual user
    name: 'You',
    level: 13,
    totalXP: 1250,
    coins: 250,
    badgeCount: 4,
    avatar: '🧑'
  },
  {
    userId: '11',
    name: 'Isabella Moore',
    level: 11,
    totalXP: 1050,
    coins: 210,
    badgeCount: 3,
    avatar: '🌸'
  },
  {
    userId: '12',
    name: 'Mason Lee',
    level: 9,
    totalXP: 850,
    coins: 170,
    badgeCount: 3,
    avatar: '🎨'
  },
  {
    userId: '13',
    name: 'Charlotte White',
    level: 7,
    totalXP: 650,
    coins: 130,
    badgeCount: 2,
    avatar: '📚'
  },
  {
    userId: '14',
    name: 'Lucas Harris',
    level: 5,
    totalXP: 450,
    coins: 90,
    badgeCount: 2,
    avatar: '🎭'
  },
  {
    userId: '15',
    name: 'Amelia Clark',
    level: 3,
    totalXP: 250,
    coins: 50,
    badgeCount: 1,
    avatar: '🌈'
  }
];

// Sample habits with streaks
export const SAMPLE_HABITS = [
  {
    _id: '1',
    title: 'Morning Meditation',
    streak: 14,
    longestStreak: 21,
    category: 'Wellness',
    difficulty: 'easy'
  },
  {
    _id: '2',
    title: 'Daily Exercise',
    streak: 9,
    longestStreak: 15,
    category: 'Fitness',
    difficulty: 'medium'
  },
  {
    _id: '3',
    title: 'Read 30 Minutes',
    streak: 7,
    longestStreak: 10,
    category: 'Education',
    difficulty: 'easy'
  }
];

// Enhanced shop items with more variety
export const ENHANCED_SHOP_ITEMS = [
  // Themes
  {
    name: 'Ocean Breeze',
    description: 'Calm blue waves theme',
    type: 'theme',
    price: 50,
    icon: '🌊',
    rarity: 'common',
    levelRequired: 1,
    colors: { primary: '#0ea5e9', secondary: '#38bdf8', accent: '#7dd3fc' }
  },
  {
    name: 'Forest Zen',
    description: 'Natural green forest theme',
    type: 'theme',
    price: 50,
    icon: '🌲',
    rarity: 'common',
    levelRequired: 1,
    colors: { primary: '#10b981', secondary: '#34d399', accent: '#6ee7b7' }
  },
  {
    name: 'Sunset Glow',
    description: 'Warm orange sunset theme',
    type: 'theme',
    price: 75,
    icon: '🌅',
    rarity: 'rare',
    levelRequired: 5,
    colors: { primary: '#f97316', secondary: '#fb923c', accent: '#fdba74' }
  },
  {
    name: 'Midnight Purple',
    description: 'Deep purple night theme',
    type: 'theme',
    price: 100,
    icon: '🌙',
    rarity: 'epic',
    levelRequired: 10,
    colors: { primary: '#a855f7', secondary: '#c084fc', accent: '#e9d5ff' }
  },
  {
    name: 'Aurora Borealis',
    description: 'Mystical northern lights theme',
    type: 'theme',
    price: 150,
    icon: '✨',
    rarity: 'legendary',
    levelRequired: 20,
    colors: { primary: '#8b5cf6', secondary: '#06b6d4', accent: '#10b981' }
  },

  // Fonts
  {
    name: 'Elegant Script',
    description: 'Beautiful handwritten font',
    type: 'font',
    price: 40,
    icon: '✍️',
    rarity: 'common',
    levelRequired: 1,
    fontFamily: 'Dancing Script'
  },
  {
    name: 'Modern Sans',
    description: 'Clean and modern font',
    type: 'font',
    price: 40,
    icon: '📝',
    rarity: 'common',
    levelRequired: 1,
    fontFamily: 'Inter'
  },
  {
    name: 'Retro Gaming',
    description: 'Nostalgic pixel font',
    type: 'font',
    price: 60,
    icon: '🎮',
    rarity: 'rare',
    levelRequired: 5,
    fontFamily: 'Press Start 2P'
  },
  {
    name: 'Royal Serif',
    description: 'Classic elegant serif',
    type: 'font',
    price: 80,
    icon: '👑',
    rarity: 'epic',
    levelRequired: 10,
    fontFamily: 'Playfair Display'
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
    price: 120,
    icon: '👨‍🚀',
    rarity: 'epic',
    levelRequired: 10
  },
  {
    name: 'Dragon Master',
    description: 'Legendary dragon rider',
    type: 'skin',
    price: 200,
    icon: '🐉',
    rarity: 'legendary',
    levelRequired: 20
  },
  {
    name: 'Cyber Samurai',
    description: 'Futuristic warrior',
    type: 'skin',
    price: 180,
    icon: '🤖',
    rarity: 'legendary',
    levelRequired: 15
  },

  // Accessories
  {
    name: 'Crown of Glory',
    description: 'Majestic golden crown',
    type: 'accessory',
    price: 150,
    icon: '👑',
    rarity: 'epic',
    levelRequired: 15
  },
  {
    name: 'Lightning Aura',
    description: 'Electric energy effect',
    type: 'accessory',
    price: 120,
    icon: '⚡',
    rarity: 'rare',
    levelRequired: 10
  },
  {
    name: 'Phoenix Wings',
    description: 'Fiery wings of rebirth',
    type: 'accessory',
    price: 200,
    icon: '🔥',
    rarity: 'legendary',
    levelRequired: 25
  },
  {
    name: 'Crystal Shield',
    description: 'Protective diamond barrier',
    type: 'accessory',
    price: 140,
    icon: '💎',
    rarity: 'epic',
    levelRequired: 12
  },

  // Effects
  {
    name: 'Sparkle Trail',
    description: 'Leave sparkles behind',
    type: 'effect',
    price: 80,
    icon: '✨',
    rarity: 'rare',
    levelRequired: 8
  },
  {
    name: 'Rainbow Boost',
    description: 'Colorful rainbow effect',
    type: 'effect',
    price: 100,
    icon: '🌈',
    rarity: 'epic',
    levelRequired: 12
  },
  {
    name: 'Meteor Shower',
    description: 'Falling stars effect',
    type: 'effect',
    price: 150,
    icon: '☄️',
    rarity: 'legendary',
    levelRequired: 20
  },
  {
    name: 'Confetti Blast',
    description: 'Celebration confetti',
    type: 'effect',
    price: 60,
    icon: '🎊',
    rarity: 'common',
    levelRequired: 5
  },

  // Sound Packs
  {
    name: 'Nature Sounds',
    description: 'Peaceful forest ambience',
    type: 'sound',
    price: 70,
    icon: '🎵',
    rarity: 'common',
    levelRequired: 3
  },
  {
    name: 'Epic Victory',
    description: 'Triumphant celebration sounds',
    type: 'sound',
    price: 90,
    icon: '🎺',
    rarity: 'rare',
    levelRequired: 8
  },
  {
    name: 'Zen Garden',
    description: 'Calming meditation sounds',
    type: 'sound',
    price: 110,
    icon: '🧘',
    rarity: 'epic',
    levelRequired: 15
  }
];
