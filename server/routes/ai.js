import express from 'express';
import dashboard from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';
import { getChatResponse, generateHabitSteps } from '../services/aiService.js';

const router = express.Router();

// POST /api/ai/chat - AI Chatbot endpoint
router.post('/chat', protect, async (req, res) => {
  try {
    console.log('\n🌐 AI Chat Route Hit!');
    console.log('User:', req.user?.id);
    console.log('Request body:', req.body);
    
    const { message, session_id } = req.body;
    
    if (!message || !message.trim()) {
      console.log('❌ Empty message received');
      return res.status(400).json({ message: 'Message is required' });
    }

    console.log('📝 Processing message:', message.trim());
    const response = await getChatResponse(message.trim(), session_id || req.user.id);
    console.log('✅ Response generated, length:', response.length);
    console.log('✅ Full response:', response);
    
    res.json({ response });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ 
      message: 'Failed to get AI response',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/ai/test - Test endpoint for AI service
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 AI Test endpoint hit');
    const testResponse = await getChatResponse('Hello, this is a test message', 'test-session');
    res.json({ 
      status: 'success',
      message: 'AI service is working',
      testResponse: testResponse
    });
  } catch (error) {
    console.error('AI test error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'AI service test failed',
      error: error.message
    });
  }
});

// POST /api/ai/generate-steps - Generate AI-driven steps for habit completion
router.post('/generate-steps', protect, async (req, res) => {
  try {
    console.log('\n🧠 AI Generate Steps Route Hit!');
    console.log('User:', req.user?.id);
    console.log('Request body:', req.body);
    
    const { habit_id, title, description, category, difficulty } = req.body;
    
    if (!title || !category) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ message: 'Title and category are required' });
    }

    console.log(`📝 Generating steps for: ${title} (${category})`);
    const stepsData = await generateHabitSteps(title, description || '', category, difficulty || 'medium');
    
    console.log('✅ Steps generated successfully');
    console.log('✅ Steps data:', JSON.stringify(stepsData, null, 2));
    
    res.json(stepsData);
  } catch (error) {
    console.error('AI generate steps error:', error);
    res.status(500).json({ 
      message: 'Failed to generate AI steps',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/ai/insights - simple placeholder insights endpoint
router.get('/insights', protect, async (req, res) => {
  try {
    // Placeholder logic; in future, aggregate user habits/challenges for personalized insights.
    res.json({ insights: 'Stay consistent! Small daily actions compound into big results.' });
  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({ message: 'Failed to generate insights' });
  }
});

export default router;
