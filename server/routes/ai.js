const express = require('express');
const router = express.Router();
const { getChatResponse } = require('../services/aiService');
const { protect } = require('../middleware/auth');

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

module.exports = router;