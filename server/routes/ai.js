import express from 'express';
import dashboard from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';
import { getChatResponse } from '../services/aiService.js';

const router = express.Router();

// POST /api/ai/chat - AI Chatbot endpoint
router.post('/chat', protect, async (req, res) => {
  try {
    const { message, session_id } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const response = await getChatResponse(message.trim(), session_id || req.user.id);
    
    res.json({ response });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ 
      message: 'Failed to get AI response',
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
