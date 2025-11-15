import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

console.log('=== OpenAI Test ===');
console.log('API Key present:', !!process.env.OPENAI_API_KEY);
console.log('API Key length:', process.env.OPENAI_API_KEY?.length || 0);
console.log('API Key prefix:', process.env.OPENAI_API_KEY?.substring(0, 20) + '...');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testOpenAI() {
  try {
    console.log('\n🧪 Testing OpenAI API connection...');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a test assistant. Respond briefly." },
        { role: "user", content: "Hello, this is a test. Respond with just 'Test successful!'" }
      ],
      max_tokens: 10,
      temperature: 0
    });

    const response = completion.choices[0].message.content;
    console.log('✅ OpenAI API Test SUCCESS');
    console.log('Response:', response);
    
    return true;
  } catch (error) {
    console.log('❌ OpenAI API Test FAILED');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    if (error.status) {
      console.error('HTTP Status:', error.status);
    }
    
    if (error.code) {
      console.error('Error code:', error.code);
    }
    
    return false;
  }
}

testOpenAI();