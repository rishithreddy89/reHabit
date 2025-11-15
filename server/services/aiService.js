// Simple AI service without external dependencies

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

// Simple chatbot with varied responses
export const getChatResponse = async (message, sessionId) => {
  const responses = [
    "That's a great question! Building habits takes consistency and patience. What specific habit are you trying to develop?",
    "I'm here to help you build better habits! Can you tell me more about what you're working on?", 
    "Every journey starts with a single step. What's one habit you'd like to work on this week?",
    "Building lasting habits is all about starting small and being consistent. What area of your life would you like to improve?",
    "I understand you're looking for guidance. Let's focus on one small step you can take today towards your goal.",
    "Habit formation is a process that takes time. What challenges are you facing with your current habits?",
    "Great to see you're committed to personal growth! Which habit is most important to you right now?",
    "Remember, small consistent actions lead to big changes over time. What habit would make the biggest impact on your life?",
    "The key to success is making habits so easy you can't say no! What's the smallest version of your desired habit?",
    "I love helping people transform their lives through better habits! What's your biggest challenge right now?",
    "Consistency beats perfection every time. How can we make your habit more consistent?",
    "Your future self will thank you for the habits you build today. What habit will have the most impact on your life?"
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};

// Generate exactly 3 validation questions
export const generateValidationQuestions = async (title, description = '') => {
  return [
    `How did you complete "${title}" today?`,
    `What specific actions did you take for "${title}"?`, 
    `How long did you spend on "${title}" and what was the outcome?`
  ];
};

// Basic validation
export const validateHabitCompletion = async (habitTitle, habitDescription, questions, userAnswers) => {
  const allAnswersLength = userAnswers.join(' ').trim().length;
  
  return {
    validated: allAnswersLength >= 20,
    confidence: allAnswersLength >= 20 ? 80 : 40,
    reasoning: "Basic validation based on answer length and effort",
    encouragement: "Keep working on your habits! Every step counts! 🌟"
  };
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

// Generate AI-driven step-by-step guidance for habit completion
export const generateHabitSteps = async (habitTitle, habitDescription, category, difficulty) => {
  const baseSteps = getBaseStepsByCategory(category, habitTitle);
  const difficultyModifications = getDifficultyModifications(difficulty);
  
  // Apply difficulty modifications to base steps
  const steps = baseSteps.map((step, index) => ({
    ...step,
    duration: difficultyModifications.durations[index] || step.duration,
    tips: [...step.tips, ...difficultyModifications.additionalTips]
  }));

  return {
    steps,
    totalEstimatedTime: steps.reduce((total, step) => {
      const minutes = parseInt(step.duration.match(/(\d+)/)?.[1] || '5');
      return total + minutes;
    }, 0),
    difficulty,
    category
  };
};

// Get category-specific base steps
const getBaseStepsByCategory = (category, habitTitle) => {
  const stepTemplates = {
    'Health & Fitness': [
      {
        title: 'Prepare Your Environment',
        description: 'Set up your workout space, gather equipment, and prepare mentally for your fitness activity.',
        duration: '5 minutes',
        tips: [
          'Lay out workout clothes the night before',
          'Ensure you have enough space to move freely',
          'Keep water nearby for hydration'
        ]
      },
      {
        title: 'Warm-Up & Activation',
        description: 'Start with light movements to prepare your body and reduce injury risk.',
        duration: '5-10 minutes',
        tips: [
          'Begin with gentle stretching or light cardio',
          'Focus on major muscle groups',
          'Listen to energizing music to boost motivation'
        ]
      },
      {
        title: 'Execute Main Activity',
        description: `Complete your ${habitTitle} following your planned routine or workout.`,
        duration: '15-30 minutes',
        tips: [
          'Focus on proper form over speed or intensity',
          'Take breaks when needed',
          'Track your progress in a fitness journal'
        ]
      },
      {
        title: 'Cool Down & Recovery',
        description: 'Wind down with stretching and reflect on your accomplishment.',
        duration: '5-10 minutes',
        tips: [
          'Do gentle stretching to prevent soreness',
          'Hydrate well after exercise',
          'Take a moment to appreciate your effort'
        ]
      }
    ],
    'Mental & Emotional Wellbeing': [
      {
        title: 'Create a Calm Environment',
        description: 'Find a quiet space and eliminate distractions for your mental wellness practice.',
        duration: '3-5 minutes',
        tips: [
          'Turn off notifications on devices',
          'Find comfortable seating',
          'Dim lights or use natural lighting'
        ]
      },
      {
        title: 'Center Yourself',
        description: 'Take deep breaths and bring your attention to the present moment.',
        duration: '5 minutes',
        tips: [
          'Practice 4-7-8 breathing technique',
          'Release tension in your shoulders and jaw',
          'Set a positive intention for your practice'
        ]
      },
      {
        title: 'Engage in Practice',
        description: `Focus on your ${habitTitle} with full attention and mindfulness.`,
        duration: '10-20 minutes',
        tips: [
          'Be patient and kind with yourself',
          'Notice thoughts without judgment',
          'Return focus gently when mind wanders'
        ]
      },
      {
        title: 'Reflect & Integrate',
        description: 'Take time to reflect on your experience and how you feel.',
        duration: '3-5 minutes',
        tips: [
          'Journal about insights or feelings',
          'Set an intention for carrying peace forward',
          'Express gratitude for taking time for yourself'
        ]
      }
    ],
    'Productivity & Work': [
      {
        title: 'Plan & Prioritize',
        description: 'Organize your tasks and set clear priorities for maximum productivity.',
        duration: '5-10 minutes',
        tips: [
          'Use the Eisenhower Matrix for prioritization',
          'Break large tasks into smaller steps',
          'Set realistic time estimates for each task'
        ]
      },
      {
        title: 'Eliminate Distractions',
        description: 'Create a focused work environment free from interruptions.',
        duration: '5 minutes',
        tips: [
          'Put phone in another room or on silent',
          'Close unnecessary browser tabs',
          'Tell others about your focused work time'
        ]
      },
      {
        title: 'Execute Focused Work',
        description: `Work on your ${habitTitle} with full concentration and energy.`,
        duration: '25-45 minutes',
        tips: [
          'Use the Pomodoro Technique for time management',
          'Take short breaks every 25 minutes',
          'Track progress to stay motivated'
        ]
      },
      {
        title: 'Review & Plan Next Steps',
        description: 'Assess what you accomplished and plan your next actions.',
        duration: '5 minutes',
        tips: [
          'Celebrate completed tasks',
          'Note lessons learned for future improvement',
          'Schedule follow-up tasks if needed'
        ]
      }
    ],
    'Personal Growth': [
      {
        title: 'Set Learning Intention',
        description: 'Define what you want to learn or achieve from this growth activity.',
        duration: '3-5 minutes',
        tips: [
          'Write down specific learning goals',
          'Connect new learning to existing knowledge',
          'Set a growth mindset for the session'
        ]
      },
      {
        title: 'Gather Resources',
        description: 'Collect all materials, tools, or resources needed for your learning.',
        duration: '5 minutes',
        tips: [
          'Organize books, videos, or online courses',
          'Prepare note-taking materials',
          'Ensure stable internet connection if needed'
        ]
      },
      {
        title: 'Active Learning',
        description: `Engage deeply with your ${habitTitle} through active participation.`,
        duration: '20-45 minutes',
        tips: [
          'Take notes and ask questions',
          'Practice new skills immediately',
          'Connect concepts to real-world applications'
        ]
      },
      {
        title: 'Reflect & Apply',
        description: 'Process what you learned and plan how to apply new knowledge.',
        duration: '10 minutes',
        tips: [
          'Summarize key insights in your own words',
          'Identify practical applications',
          'Schedule practice or implementation time'
        ]
      }
    ]
  };

  // Default steps for uncategorized habits
  const defaultSteps = [
    {
      title: 'Prepare & Set Intention',
      description: `Get ready for your ${habitTitle} by preparing your environment and mindset.`,
      duration: '5 minutes',
      tips: [
        'Clear your space of distractions',
        'Set a clear intention for this session',
        'Gather any needed materials'
      ]
    },
    {
      title: 'Begin with Focus',
      description: `Start your ${habitTitle} with full attention and commitment.`,
      duration: '15-20 minutes',
      tips: [
        'Start small and build momentum',
        'Focus on quality over quantity',
        'Stay present and engaged'
      ]
    },
    {
      title: 'Complete & Reflect',
      description: `Finish your ${habitTitle} and reflect on your experience.`,
      duration: '5 minutes',
      tips: [
        'Acknowledge your effort and progress',
        'Note what went well and areas for improvement',
        'Plan for tomorrow\'s session'
      ]
    }
  ];

  return stepTemplates[category] || defaultSteps;
};

// Get difficulty-specific modifications
const getDifficultyModifications = (difficulty) => {
  const modifications = {
    'easy': {
      durations: ['3 minutes', '5 minutes', '10-15 minutes', '3 minutes'],
      additionalTips: ['Take it slow and steady', 'Focus on building the routine first']
    },
    'medium': {
      durations: ['5 minutes', '10 minutes', '20-30 minutes', '5 minutes'],
      additionalTips: ['Challenge yourself but stay realistic', 'Track your progress daily']
    },
    'hard': {
      durations: ['10 minutes', '15 minutes', '30-45 minutes', '10 minutes'],
      additionalTips: ['Push your limits mindfully', 'Prepare for mental challenges', 'Celebrate small wins']
    }
  };

  return modifications[difficulty] || modifications['medium'];
};