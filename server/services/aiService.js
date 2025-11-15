import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Simple rule-based classifier
export const classifyHabit = async (title, description = '') => {
  const text = `${title} ${description}`.toLowerCase();

  if (/(workout|exercise|gym|run|walk|yoga|fitness|diet|nutrition|sleep|meditation)/i.test(text)) {
    return 'Health & Fitness';
  }
  if (/(mental|therapy|journal|gratitude|mindfulness|stress|anxiety|emotion)/i.test(text)) {
    return 'Mental & Emotional Wellbeing';
  }
  if (/(work|productivity|task|deadline|project|meeting|email|focus)/i.test(text)) {
    return 'Productivity & Work';
  }
  if (/(learn|read|study|skill|course|book|growth|development)/i.test(text)) {
    return 'Personal Growth';
  }
  if (/(money|save|budget|invest|finance|expense|income)/i.test(text)) {
    return 'Finance';
  }
  if (/(friend|family|relationship|social|call|connect|date)/i.test(text)) {
    return 'Relationships & Social';
  }
  if (/(create|paint|draw|music|write|hobby|art|craft)/i.test(text)) {
    return 'Creativity & Hobbies';
  }
  if (/(phone|screen|social media|digital|tech|device|app)/i.test(text)) {
    return 'Digital Discipline';
  }
  if (/(recycle|environment|sustainable|eco|green|planet|climate)/i.test(text)) {
    return 'Environmental & Sustainability';
  }
  if (/(pray|spiritual|faith|religion|values|purpose|meaning)/i.test(text)) {
    return 'Spiritual & Values';
  }

  return 'Lifestyle & Daily Routine';
};

// Generate multiple validation questions
export const generateValidationQuestions = async (title, description = '') => {
  if (!openai) {
    const singleQuestion = await generateVerificationQuestion(title, description);
    return [singleQuestion];
  }

  try {
    const prompt = `Generate 2-3 specific validation questions for this habit: "${title}". Return as JSON array: ["Q1", "Q2", "Q3"]`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.7
    });

    const response = completion.choices[0].message.content.trim();
    try {
      const questions = JSON.parse(response);
      return Array.isArray(questions) ? questions : [questions];
    } catch (parseError) {
      const singleQuestion = await generateVerificationQuestion(title, description);
      return [singleQuestion];
    }
  } catch (error) {
    console.error('Questions generation error:', error);
    const singleQuestion = await generateVerificationQuestion(title, description);
    return [singleQuestion];
  }
};

export const generateVerificationQuestion = async (title, description = '') => {
  const text = `${title} ${description}`.toLowerCase();
  
  if (/meditat/i.test(text)) return "Which meditation technique did you use today?";
  if (/exercise|workout|gym/i.test(text)) return "What exercises did you do and for how long?";
  if (/walk|run/i.test(text)) return "Where did you walk/run and for how long?";
  if (/read/i.test(text)) return "What did you read today and how many pages?";
  if (/journal/i.test(text)) return "What was the main theme you journaled about today?";
  if (/water|hydrat/i.test(text)) return "How many glasses of water did you drink?";
  
  return "How did you complete this habit today?";
};

// AI Chatbot functionality
export const getChatResponse = async (message, sessionId) => {
  if (!openai) {
    return "I'm here to help you build better habits! What would you like to work on?";
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an AI habit coach. Help users build better habits." },
        { role: "user", content: message }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return "I'm here to help you build better habits! What would you like to work on?";
  }
};

// Multi-question validation
export const validateHabitCompletion = async (habitTitle, habitDescription, questions, userAnswers) => {
  const allAnswersLength = userAnswers.join(' ').trim().length;
  
  if (!openai) {
    return {
      validated: allAnswersLength >= 20,
      confidence: allAnswersLength >= 20 ? 70 : 30,
      reasoning: "Basic validation based on answer length",
      encouragement: "Keep working on your habits! 🌟"
    };
  }

  try {
    const questionsAndAnswers = questions.map((q, i) => 
      `Q${i+1}: ${q}\nA${i+1}: ${userAnswers[i] || 'No answer'}`
    ).join('\n\n');

    const prompt = `Analyze habit completion based on multiple answers:

Habit: "${habitTitle}"
${questionsAndAnswers}

Be STRICT. Use 80+ confidence only for clear, complete success.

Respond with JSON:
{
  "validated": true/false,
  "confidence": 0-100,
  "reasoning": "explanation",
  "encouragement": "message"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 400,
      temperature: 0.3
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Validation error:', error);
    
    return {
      validated: allAnswersLength >= 20,
      confidence: allAnswersLength >= 20 ? 70 : 30,
      reasoning: "Basic validation based on answer length",
      encouragement: "Keep working on your habits! 🌟"
    };
  }
};

export const generateEncouragement = async (habitTitle, streakCount, validated) => {
  const validatedMessages = [
    `🎉 Amazing! ${streakCount} days strong with ${habitTitle}!`,
    `🌟 Fantastic work! Your ${streakCount}-day streak shows dedication!`,
    `💪 Outstanding! ${streakCount} consecutive days!`
  ];
  
  const attemptMessages = [
    `🌱 Every step counts! Keep working on ${habitTitle}!`,
    `💝 Don't give up! Each attempt brings you closer!`,
    `🔥 Your persistence is admirable! Keep going!`
  ];
  
  const messages = validated ? validatedMessages : attemptMessages;
  return messages[Math.floor(Math.random() * messages.length)];
};