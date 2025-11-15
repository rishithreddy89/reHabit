const Habit = require('../models/Habit');
const Completion = require('../models/Completion');
const { classifyHabit, generateVerificationQuestion } = require('../services/aiService');

exports.createHabit = async (req, res) => {
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

exports.getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user._id, isActive: true })
      .sort({ createdAt: -1 });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getHabit = async (req, res) => {
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

exports.updateHabit = async (req, res) => {
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

exports.deleteHabit = async (req, res) => {
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

exports.completeHabit = async (req, res) => {
  try {
    const { verificationAnswer, notes, mood } = req.body;
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const completion = await Completion.create({
      habitId: habit._id,
      userId: req.user._id,
      verificationAnswer,
      notes,
      mood
    });

    // Update habit stats
    habit.total_completions += 1;
    habit.streak += 1;
    habit.lastCompletedAt = new Date();
    await habit.save();

    // respond with normalized fields frontend expects
    return res.json({
      habit,
      completion,
      validation_question: habit.verificationQuestion || (await generateVerificationQuestion(habit.title, habit.description)),
      log_id: completion._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// new: return recent completion logs for a habit (normalized for frontend)
exports.getHabitLogs = async (req, res) => {
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
      validated: !!c.aiVerified,
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

exports.getHabitAnalytics = async (req, res) => {
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

// new: validate a completion (frontend posts { habit_id, answer, log_id? })
exports.validateCompletion = async (req, res) => {
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

    // save provided answer
    completion.verificationAnswer = answer;

    // very small heuristic: mark aiVerified if answer length is reasonable
    const aiVerified = typeof answer === 'string' && answer.trim().length >= 5;
    completion.aiVerified = aiVerified;
    await completion.save();

    // compute xp reward (simple rule; adjust later with AI)
    const xp_earned = aiVerified ? 10 : 2;

    // optionally update habit streak/new stats here if desired (completeHabit already updated habit)
    // return current habit streak as new_streak
    const freshHabit = await Habit.findById(habit._id);

    return res.json({
      xp_earned,
      new_streak: freshHabit ? freshHabit.streak : 0,
      validated: aiVerified,
      log_id: completion._id
    });
  } catch (error) {
    console.error('validateCompletion error:', error);
    res.status(500).json({ message: error.message });
  }
};
