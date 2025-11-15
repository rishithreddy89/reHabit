const SYSTEM_PROMPT = `You are an intelligent habit classifier for the "Rehabit" application. Whenever a user adds a habit or task, you must interpret the text and return the best matching category. The available categories are: Health & Fitness, Mental & Emotional Wellbeing, Productivity & Work, Personal Growth, Lifestyle & Daily Routine, Finance, Relationships & Social, Creativity & Hobbies, Digital Discipline, Environmental & Sustainability, Spiritual & Values, and Behavioral Control. Always choose only one category based on the primary meaning of the habit. If the habit contains multiple areas, classify it by the dominant action. If the meaning is unclear, choose the most commonly understood interpretation. Do not create new categories. Your response must strictly return only the category name without any explanation or extra text.`;

const CHATBOT_SYSTEM_PROMPT = `You are an AI habit coach for the "ReHabit" application. You help users build better habits by providing personalized advice, motivation, and practical strategies. Your personality is encouraging, supportive, and knowledgeable about habit formation, psychology, and personal development.

Key guidelines:
- Be encouraging and positive while being realistic
- Provide actionable advice and practical strategies
- Ask follow-up questions to understand the user better
- Reference habit formation science and psychology when helpful
- Keep responses conversational and engaging
- Focus on sustainable habit building rather than quick fixes
- Help users overcome common obstacles and challenges
- Celebrate their progress and achievements

Remember: You're helping users build lasting positive habits that improve their lives.`;

const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const categories = [
  'Health & Fitness',
  'Mental & Emotional Wellbeing',
  'Productivity & Work',
  'Personal Growth',
  'Lifestyle & Daily Routine',
  'Finance',
  'Relationships & Social',
  'Creativity & Hobbies',
  'Digital Discipline',
  'Environmental & Sustainability',
  'Spiritual & Values',
  'Behavioral Control'
];

// Simple rule-based classifier (replace with OpenAI API call in production)
exports.classifyHabit = async (title, description = '') => {
  const text = `${title} ${description}`.toLowerCase();

  // Health & Fitness
  if (/(workout|exercise|gym|run|walk|yoga|fitness|diet|nutrition|sleep|meditation)/i.test(text)) {
    return 'Health & Fitness';
  }

  // Mental & Emotional Wellbeing
  if (/(mental|therapy|journal|gratitude|mindfulness|stress|anxiety|emotion)/i.test(text)) {
    return 'Mental & Emotional Wellbeing';
  }

  // Productivity & Work
  if (/(work|productivity|task|deadline|project|meeting|email|focus)/i.test(text)) {
    return 'Productivity & Work';
  }

  // Personal Growth
  if (/(learn|read|study|skill|course|book|growth|development)/i.test(text)) {
    return 'Personal Growth';
  }

  // Finance
  if (/(money|save|budget|invest|finance|expense|income)/i.test(text)) {
    return 'Finance';
  }

  // Relationships & Social
  if (/(friend|family|relationship|social|call|connect|date)/i.test(text)) {
    return 'Relationships & Social';
  }

  // Creativity & Hobbies
  if (/(create|paint|draw|music|write|hobby|art|craft)/i.test(text)) {
    return 'Creativity & Hobbies';
  }

  // Digital Discipline
  if (/(phone|screen|social media|digital|tech|device|app)/i.test(text)) {
    return 'Digital Discipline';
  }

  // Environmental & Sustainability
  if (/(recycle|environment|sustainable|eco|green|planet|climate)/i.test(text)) {
    return 'Environmental & Sustainability';
  }

  // Spiritual & Values
  if (/(pray|spiritual|faith|religion|values|purpose|meaning)/i.test(text)) {
    return 'Spiritual & Values';
  }

  // Default
  return 'Lifestyle & Daily Routine';
};

exports.generateVerificationQuestion = async (title, description = '') => {
  const text = `${title} ${description}`.toLowerCase();

  if (/meditat/i.test(text)) {
    return "Which meditation technique did you use today?";
  }
  if (/exercise|workout|gym/i.test(text)) {
    return "What exercises did you do and for how long?";
  }
  if (/walk|run/i.test(text)) {
    return "Where did you walk/run and for how long?";
  }
  if (/read/i.test(text)) {
    return "What did you read today and how many pages?";
  }
  if (/journal/i.test(text)) {
    return "What was the main theme you journaled about today?";
  }
  if (/water|hydrat/i.test(text)) {
    return "How many glasses of water did you drink?";
  }

  return "How did you complete this habit today?";
};

// AI Chatbot functionality
exports.getChatResponse = async (message, sessionId) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: CHATBOT_SYSTEM_PROMPT
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Fallback response if OpenAI fails
    const fallbackResponses = [
      "I'm here to help you build better habits! Can you tell me more about what you're working on?",
      "That's a great question! Building habits takes consistency and patience. What specific habit are you trying to develop?",
      "I understand you're looking for guidance. Let's focus on one small step you can take today towards your goal.",
      "Every journey starts with a single step. What's one habit you'd like to work on this week?"
    ];
    
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }
};
