const mongoose = require('mongoose');
require('dotenv').config();

const Mentor = require('../models/Mentor');
const User = require('../models/User');

async function checkMentors() {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rehabit';
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Check all mentors
    const mentors = await Mentor.find().populate('userId', 'name email role');
    console.log(`\nTotal mentors in database: ${mentors.length}`);
    
    if (mentors.length > 0) {
      console.log('\nMentor details:');
      mentors.forEach((m, i) => {
        console.log(`${i + 1}. User: ${m.userId?.name} (${m.userId?.email})`);
        console.log(`   Role: ${m.userId?.role}`);
        console.log(`   Approved: ${m.isApproved}`);
        console.log(`   Specialization: ${m.specialization?.join(', ')}`);
        console.log(`   ID: ${m._id}`);
        console.log('');
      });
    } else {
      console.log('\nNo mentors found in database!');
      
      // Check for users with mentor role
      const mentorUsers = await User.find({ role: 'mentor' });
      console.log(`\nUsers with mentor role: ${mentorUsers.length}`);
      
      if (mentorUsers.length > 0) {
        console.log('\nCreating missing mentor profiles...');
        for (const user of mentorUsers) {
          const existing = await Mentor.findOne({ userId: user._id });
          if (!existing) {
            const mentor = new Mentor({
              userId: user._id,
              bio: '',
              specialization: ['general'],
              isApproved: true,
              availability: {
                isAcceptingMentees: true,
                isOnline: false
              }
            });
            await mentor.save();
            console.log(`Created mentor profile for ${user.name} (${user.email})`);
          }
        }
        console.log('\nDone! Re-run this script to verify.');
      }
    }

    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkMentors();
