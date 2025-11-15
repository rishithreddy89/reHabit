import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Studio from '../models/Studio.js';
import User from '../models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rehabit';

const seedStudios = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get or create a system user
    let systemUser = await User.findOne({ email: 'system@rehabit.com' });
    if (!systemUser) {
      systemUser = await User.create({
        name: 'ReHabit System',
        email: 'system@rehabit.com',
        password: 'system-password-not-used',
        role: 'admin'
      });
      console.log('Created system user');
    }

    // Clear existing studios
    await Studio.deleteMany({});
    console.log('Cleared existing studios');

    // Create sample studios
    const studios = [
      {
        name: '5AM Club',
        description: 'Early risers who build an unstoppable morning routine together.',
        category: 'productivity',
        energy: 8,
        creatorId: systemUser._id,
        members: [],
        scoreboard: [],
        checkins: [],
        isPublic: true
      },
      {
        name: 'Writers Sprint Room',
        description: 'Timed sprints, accountability and short feedback for writers.',
        category: 'learning',
        energy: 5,
        creatorId: systemUser._id,
        members: [],
        scoreboard: [],
        checkins: [],
        isPublic: true
      },
      {
        name: 'Fitness & Focus Circle',
        description: 'Hybrid group for quick workouts and focused sessions.',
        category: 'fitness',
        energy: 10,
        creatorId: systemUser._id,
        members: [],
        scoreboard: [],
        checkins: [],
        isPublic: true
      },
      {
        name: 'Meditation Mindfulness',
        description: 'Daily mindfulness practice and breathing exercises.',
        category: 'mindfulness',
        energy: 6,
        creatorId: systemUser._id,
        members: [],
        scoreboard: [],
        checkins: [],
        isPublic: true
      },
      {
        name: 'Code & Coffee',
        description: 'Developers learning and coding together.',
        category: 'learning',
        energy: 7,
        creatorId: systemUser._id,
        members: [],
        scoreboard: [],
        checkins: [],
        isPublic: true
      }
    ];

    const createdStudios = await Studio.insertMany(studios);
    console.log(`Created ${createdStudios.length} studios`);

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding studios:', error);
    process.exit(1);
  }
};

seedStudios();
