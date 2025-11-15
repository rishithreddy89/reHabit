import Habit from '../models/Habit.js';
import Completion from '../models/Completion.js';
import { classifyHabit, generateValidationQuestions, generateVerificationQuestion, validateHabitCompletion, generateEncouragement } from '../services/aiService.js';

export const createHabit = async (req, res) => {
  try {
    const { title, description, frequency } = req.body;
    
    // AI classify the habit
    const category = await classifyHabit(title, description);
    const verificationQuestion = await generateVerificationQuestion(title, description);

    const habit = await Habit.create({
      userId: req.user._id,
      title,
      description,
      category,
      frequency,
      verificationQuestion
    });

    res.status(201).json(habit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user._id, isActive: true })
      .sort({ createdAt: -1 });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    res.json(habit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    res.json(habit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isActive: false },
      { new: true }
    );
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const completeHabit = async (req, res) => {
  try {
    const { verificationAnswer, notes, mood } = req.body;
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Check if habit has already been completed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingCompletion = await Completion.findOne({
      habitId: habit._id,
      userId: req.user._id,
      isValidated: true, // Only count validated completions
      completedAt: {
        $gte: today,
        $lt: tomorrow
      }
    });

    if (existingCompletion) {
      return res.status(400).json({ 
        message: 'Habit already completed today! Come back tomorrow to continue your streak.',
        alreadyCompleted: true 
      });
    }

    // Create a completion record but don't update habit stats yet
    const completion = await Completion.create({
      habitId: habit._id,
      userId: req.user._id,
      verificationAnswer,
      notes,
      mood,
      isValidated: false,
      currentQuestionIndex: 0, // Track which question we're on
      allAnswers: [] // Store all answers
    });

    // Generate multiple validation questions
    const validationQuestions = await generateValidationQuestions(habit.title, habit.description);

    // respond with normalized fields frontend expects
    return res.json({
      habit,
      completion,
      validation_questions: validationQuestions, // Multiple questions
      current_question_index: 0,
      log_id: completion._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// new: return recent completion logs for a habit (normalized for frontend)
export const getHabitLogs = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id }).select('verificationQuestion');
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const completions = await Completion.find({ habitId: req.params.id, userId: req.user._id })
      .sort({ completedAt: -1 })
      .limit(200)
      .lean();

    const logs = completions.map(c => ({
      id: c._id,
      completed_at: c.completedAt || c.createdAt,
      validated: !!c.isValidated, // Use isValidated instead of aiVerified
      ai_verified: !!c.aiVerified,
      ai_confidence: c.aiConfidence || 0,
      ai_reasoning: c.aiReasoning || '',
      completion_status: c.isValidated ? 'completed' : 'attempted',
      validation_question: habit.verificationQuestion || '',
      validation_answer: c.verificationAnswer || '',
      notes: c.notes || '',
      mood: c.mood || ''
    }));

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHabitAnalytics = async (req, res) => {
  try {
    const completions = await Completion.find({
      habitId: req.params.id,
      userId: req.user._id
    }).sort({ completedAt: -1 }).limit(30);

    const habit = await Habit.findById(req.params.id);

    res.json({
      habit,
      completions,
      stats: {
        totalCompletions: completions.length,
        currentStreak: habit.streak
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit answer to current validation question
export const submitValidationAnswer = async (req, res) => {
  try {
    const { log_id, answer, question_index, all_questions } = req.body;
    
    if (!log_id || !answer || question_index === undefined) {
      return res.status(400).json({ message: 'log_id, answer, and question_index are required' });
    }

    const completion = await Completion.findById(log_id);
    if (!completion) {
      return res.status(404).json({ message: 'Completion not found' });
    }

    // Add the answer to the array
    if (!completion.allAnswers) completion.allAnswers = [];
    completion.allAnswers[question_index] = answer;
    completion.currentQuestionIndex = question_index + 1;
    
    await completion.save();

    // Check if we have all 3 answers (strict requirement)
    const totalQuestions = 3; // Always require exactly 3 questions
    const hasAllAnswers = completion.allAnswers.length >= 3 && completion.allAnswers.every(answer => answer && answer.trim().length > 0);

    if (hasAllAnswers) {
      // All questions answered - perform final validation
      const habit = await Habit.findById(completion.habitId);
      
      console.log('Starting validation for habit:', habit.title);
      console.log('User answers:', completion.allAnswers);
      
      const validationResult = await validateHabitCompletion(
        habit.title,
        habit.description || '',
        all_questions,
        completion.allAnswers
      );

      console.log('Validation result:', validationResult);

      // Update completion with validation results
      completion.aiVerified = validationResult.validated;
      completion.aiConfidence = validationResult.confidence;
      completion.aiReasoning = validationResult.reasoning;

      const isSuccessfulCompletion = validationResult.confidence >= 80 && validationResult.validated;
      completion.isValidated = isSuccessfulCompletion;
      
      console.log('Is successful completion:', isSuccessfulCompletion);
      
      await completion.save();

      // Update habit stats if successful
      if (isSuccessfulCompletion) {
        habit.total_completions += 1;
        habit.streak += 1;
        habit.lastCompletedAt = new Date();
        await habit.save();
      }

      // Calculate XP
      let xp_earned = 0;
      if (isSuccessfulCompletion) {
        xp_earned = 10 + Math.floor(validationResult.confidence / 20);
      } else if (validationResult.confidence >= 60) {
        xp_earned = 3;
      } else {
        xp_earned = 1;
      }

      const encouragement = await generateEncouragement(
        habit.title,
        habit.streak,
        isSuccessfulCompletion
      );

      return res.json({
        completed: true,
        xp_earned,
        new_streak: habit.streak,
        validated: isSuccessfulCompletion,
        confidence: validationResult.confidence,
        reasoning: validationResult.reasoning,
        encouragement: encouragement,
        completion_status: isSuccessfulCompletion ? 'completed' : 'attempted'
      });
    } else {
      // More questions to go
      return res.json({
        completed: false,
        next_question_index: completion.currentQuestionIndex,
        total_questions: totalQuestions
      });
    }

  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ message: error.message });
  }
};

// new: validate a completion (frontend posts { habit_id, answer, log_id? })
export const validateCompletion = async (req, res) => {
  try {
    const { habit_id, answer, log_id } = req.body;
    if (!habit_id || !answer) {
      return res.status(400).json({ message: 'habit_id and answer are required' });
    }

    const habit = await Habit.findOne({ _id: habit_id, userId: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    // find the completion to validate
    let completion;
    if (log_id) {
      completion = await Completion.findOne({ _id: log_id, habitId: habit._id, userId: req.user._id });
    } else {
      completion = await Completion.findOne({ habitId: habit._id, userId: req.user._id }).sort({ createdAt: -1 });
    }

    if (!completion) {
      return res.status(404).json({ message: 'Completion log not found' });
    }

    // Use AI to validate the completion
    const validationResult = await validateHabitCompletion(
      habit.title,
      habit.description || '',
      habit.verificationQuestion || 'How did you complete this habit today?',
      answer
    );

    // Save the validation results
    completion.verificationAnswer = answer;
    completion.aiVerified = validationResult.validated;
    completion.aiConfidence = validationResult.confidence;
    completion.aiReasoning = validationResult.reasoning;

    // Only mark as successfully completed if confidence is 80 or above
    const isSuccessfulCompletion = validationResult.confidence >= 80 && validationResult.validated;
    completion.isValidated = isSuccessfulCompletion;
    
    await completion.save();

    // Only update habit stats if the completion is successful (80+ confidence)
    if (isSuccessfulCompletion) {
      habit.total_completions += 1;
      habit.streak += 1;
      habit.lastCompletedAt = new Date();
      await habit.save();
    } else {
      // If validation fails, we might want to reset or not count towards streak
      // For now, we'll just not update the stats
    }

    // Calculate XP reward based on AI validation
    let xp_earned = 0;
    if (isSuccessfulCompletion) {
      // Base XP + bonus for confidence
      xp_earned = 10 + Math.floor(validationResult.confidence / 20);
    } else if (validationResult.confidence >= 60) {
      // Partial XP for good effort but not complete success
      xp_earned = 3;
    } else {
      // Minimal XP for attempting
      xp_earned = 1;
    }

    // Generate personalized encouragement
    const encouragement = await generateEncouragement(
      habit.title,
      habit.streak,
      isSuccessfulCompletion
    );

    // Get updated habit info
    const freshHabit = await Habit.findById(habit._id);

    return res.json({
      xp_earned,
      new_streak: freshHabit ? freshHabit.streak : 0,
      validated: isSuccessfulCompletion,
      confidence: validationResult.confidence,
      reasoning: validationResult.reasoning,
      encouragement: encouragement,
      completion_status: isSuccessfulCompletion ? 'completed' : 'attempted',
      log_id: completion._id
    });
  } catch (error) {
    console.error('validateCompletion error:', error);
    res.status(500).json({ message: error.message });
  }
};
