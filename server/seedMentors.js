import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const mentorsData = [
  {
    name: 'Sneha Reddy',
    email: 'sneha.reddy@rehabit.com',
    password: 'mentor123',
    role: 'mentor',
    bio: 'An enthusiastic and motivated aspiring fitness trainer with a deep passion for strength training, functional fitness, and wellness coaching. Currently completing a Certificate in Personal Training, I am eager to expand my practical skills and learn from experienced professionals in the field. My goal is to help individuals transform their lives through sustainable fitness habits and personalized training programs.',
    avatar: 'https://i.pravatar.cc/150?img=47',
    mentorProfile: {
      specialization: ['Strength Training', 'Functional Fitness', 'Wellness Coaching', 'Weight Loss'],
      rating: 4.8,
      totalReviews: 127,
      isOnline: true,
      currentClients: 8,
      maxClients: 15,
      location: {
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA'
      }
    },
    isVerified: true
  },
  {
    name: 'Srikar',
    email: 'srikar@rehabit.com',
    password: 'mentor123',
    role: 'mentor',
    bio: 'A certified mindfulness coach and meditation expert with over 10 years of experience helping individuals achieve mental clarity and emotional balance. Specializing in stress management, anxiety reduction, and building sustainable daily meditation practices. I combine traditional mindfulness techniques with modern neuroscience to create personalized programs that fit into busy lifestyles.',
    avatar: 'https://i.pravatar.cc/150?img=12',
    mentorProfile: {
      specialization: ['Meditation', 'Mindfulness', 'Stress Management', 'Mental Wellness'],
      rating: 4.9,
      totalReviews: 203,
      isOnline: true,
      currentClients: 12,
      maxClients: 20,
      location: {
        city: 'San Francisco',
        state: 'CA',
        country: 'USA'
      }
    },
    isVerified: true
  },
  {
    name: 'MumtazBegum',
    email: 'mumtaz.begum@rehabit.com',
    password: 'mentor123',
    role: 'mentor',
    bio: 'A licensed nutritionist and health coach dedicated to helping people develop healthy eating habits and sustainable lifestyle changes. With a Ph.D. in Nutritional Science and 15 years of clinical experience, I specialize in creating personalized nutrition plans that address individual health goals, dietary restrictions, and lifestyle preferences. My approach focuses on education, empowerment, and long-term success.',
    avatar: 'https://i.pravatar.cc/150?img=26',
    mentorProfile: {
      specialization: ['Nutrition', 'Healthy Eating', 'Weight Management', 'Lifestyle Coaching'],
      rating: 4.95,
      totalReviews: 312,
      isOnline: false,
      currentClients: 15,
      maxClients: 18,
      location: {
        city: 'New York',
        state: 'NY',
        country: 'USA'
      }
    },
    isVerified: true
  },
  {
    name: 'Shaik Javeed',
    email: 'shaik.javeed@rehabit.com',
    password: 'mentor123',
    role: 'mentor',
    bio: 'A productivity expert and executive coach passionate about helping professionals overcome procrastination and achieve peak performance. With a background in organizational psychology and years of experience in corporate training, I help individuals build effective time management systems, eliminate distractions, and create accountability structures that lead to consistent progress and goal achievement.',
    avatar: 'https://i.pravatar.cc/150?img=33',
    mentorProfile: {
      specialization: ['Productivity', 'Time Management', 'Goal Setting', 'Accountability'],
      rating: 4.7,
      totalReviews: 156,
      isOnline: true,
      currentClients: 10,
      maxClients: 12,
      location: {
        city: 'Chicago',
        state: 'IL',
        country: 'USA'
      }
    },
    isVerified: true
  }
];

async function seedMentors() {
  try {
    // Build MONGO_URI from env
    const {
      MONGO_URI: RAW_MONGO_URI,
      MONGO_USER,
      MONGO_PASS,
      MONGO_HOST,
      MONGO_DB
    } = process.env;

    let MONGO_URI = RAW_MONGO_URI || '';

    if (!MONGO_URI && MONGO_USER && MONGO_PASS && MONGO_HOST) {
      const db = MONGO_DB || 'rehabit';
      if (MONGO_HOST.includes('mongodb+srv') || MONGO_HOST.includes('cluster')) {
        MONGO_URI = `mongodb+srv://${encodeURIComponent(MONGO_USER)}:${encodeURIComponent(MONGO_PASS)}@${MONGO_HOST}/${db}?retryWrites=true&w=majority`;
      } else {
        MONGO_URI = `mongodb://${encodeURIComponent(MONGO_USER)}:${encodeURIComponent(MONGO_PASS)}@${MONGO_HOST}/${db}`;
      }
    }

    if (!MONGO_URI) {
      console.error('No MONGO_URI found. Please set it in .env file.');
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    // Delete all existing mentors to start fresh
    const deletedCount = await User.deleteMany({ role: 'mentor' });
    console.log(`Deleted ${deletedCount.deletedCount} existing mentors`);

    // Hash passwords and create new mentors
    for (const mentorData of mentorsData) {
      console.log(`Creating mentor: ${mentorData.name}`);
      const hashedPassword = await bcrypt.hash(mentorData.password, 10);
      await User.create({
        ...mentorData,
        password: hashedPassword
      });
    }

    console.log('✅ Mentors seeded successfully!');
    console.log('\nMentor Login Credentials:');
    mentorsData.forEach(mentor => {
      console.log(`Email: ${mentor.email} | Password: mentor123`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding mentors:', error);
    process.exit(1);
  }
}

seedMentors();
