import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Studio from './models/Studio.js';
import User from './models/User.js';

dotenv.config();

const seedStudios = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get some users to assign as members
    const users = await User.find().limit(5);
    
    if (users.length === 0) {
      console.log('No users found. Please create users first.');
      process.exit(1);
    }

    // Clear existing studios
    await Studio.deleteMany({});
    console.log('Cleared existing studios');

    // Create sample studios
    const studios = [
      {
        name: '5AM Club',
        description: 'Early risers who build an unstoppable morning routine together.',
        creatorId: users[0]._id,
        members: [users[0]._id, users[1]._id, users[2]._id],
        memberCount: 3,
        category: 'productivity',
        isPublic: true,
        energy: 2,
        scoreboard: [
          { userId: users[2]._id, points: 120 },
          { userId: users[0]._id, points: 90 },
          { userId: users[1]._id, points: 80 }
        ],
        checkins: []
      },
      {
        name: 'Writers Sprint Room',
        description: 'Timed sprints, accountability and short feedback for writers.',
        creatorId: users[1]._id,
        members: [users[1]._id, users[3]._id],
        memberCount: 2,
        category: 'learning',
        isPublic: true,
        energy: 1,
        scoreboard: [
          { userId: users[1]._id, points: 70 },
          { userId: users[3]._id, points: 40 }
        ],
        checkins: []
      },
      {
        name: 'Fitness & Focus Circle',
        description: 'Hybrid group for quick workouts and focused sessions.',
        creatorId: users[2]._id,
        members: [users[2]._id, users[4]._id],
        memberCount: 2,
        category: 'fitness',
        isPublic: true,
        energy: 0,
        scoreboard: [
          { userId: users[2]._id, points: 110 },
          { userId: users[4]._id, points: 60 }
        ],
        checkins: []
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
