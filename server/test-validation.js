const { validateHabitCompletion } = require('./services/aiService');
require('dotenv').config();

async function testValidation() {
  console.log('Testing validation system...');
  
  const habitTitle = "Morning Exercise";
  const questions = [
    "What exercises did you do today?",
    "How long did you exercise?", 
    "Where did you exercise?"
  ];
  
  // Test with detailed answers
  const goodAnswers = [
    "I did 30 minutes of cardio including running on the treadmill for 20 minutes and cycling for 10 minutes",
    "I exercised for exactly 45 minutes from 7:00 AM to 7:45 AM this morning",
    "I went to the local gym on Oak Street and used their cardio equipment section"
  ];
  
  // Test with poor answers
  const badAnswers = [
    "yes",
    "some time",
    "at home"
  ];
  
  try {
    console.log('\n=== Testing GOOD answers ===');
    const goodResult = await validateHabitCompletion(habitTitle, '', questions, goodAnswers);
    console.log('Good answers result:', goodResult);
    
    console.log('\n=== Testing BAD answers ===');
    const badResult = await validateHabitCompletion(habitTitle, '', questions, badAnswers);
    console.log('Bad answers result:', badResult);
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testValidation();