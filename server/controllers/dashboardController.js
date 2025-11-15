const Habit = require('../models/Habit');
const Completion = require('../models/Completion');
let User = null;
try {
  User = require('../models/User');
} catch (e) {
  // User model may not exist in this project; that's fine — fallback will be used
}

exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const total_habits = await Habit.countDocuments({ userId, isActive: true });
    const total_completions = await Completion.countDocuments({ userId });

    // pick user's largest habit streak as "current" streak fallback
    const topStreakHabit = await Habit.findOne({ userId }).sort({ streak: -1 }).select('streak').lean();
    const streak = topStreakHabit ? (topStreakHabit.streak || 0) : 0;

    // xp: prefer stored value on req.user if available, otherwise estimate
    const xp = (req.user && typeof req.user.xp === 'number') ? req.user.xp : (total_completions * 5);
    const level = Math.max(1, Math.floor(xp / 100) + 1);

    return res.json({
      total_habits,
      streak,
      xp,
      level,
      total_completions
    });
  } catch (error) {
    console.error('getUserStats error:', error);
    return res.status(500).json({ message: error.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    // Aggregate completions per user to produce a simple leaderboard
    const agg = await Completion.aggregate([
      { $group: { _id: '$userId', completions: { $sum: 1 } } },
      { $sort: { completions: -1 } },
      { $limit: 20 }
    ]);

    const userIds = agg.map(a => a._id);
    let usersMap = {};
    if (User) {
      const users = await User.find({ _id: { $in: userIds } }).select('_id name xp').lean();
      usersMap = users.reduce((acc, u) => {
        acc[u._id.toString()] = u;
        return acc;
      }, {});
    }

    const leaderboard = agg.map((row, index) => {
      const id = row._id;
      const userObj = usersMap[id.toString()] || {};
      const name = userObj.name || `User ${String(id).slice(-4)}`;
      const xp = (typeof userObj.xp === 'number') ? userObj.xp : (row.completions * 5); // heuristic xp
      return {
        id,
        rank: index + 1,
        name,
        xp,
        completions: row.completions
      };
    });

    return res.json(leaderboard);
  } catch (error) {
    console.error('getLeaderboard error:', error);
    return res.status(500).json({ message: error.message });
  }
};

exports.getAIInsights = async (req, res) => {
  try {
    const userId = req.user._id;

    // totals
    const total_habits = await Habit.countDocuments({ userId, isActive: true });
    const total_completions = await Completion.countDocuments({ userId });

    // top category
    const catAgg = await Habit.aggregate([
      { $match: { userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    const top_category = (catAgg[0] && catAgg[0]._id) || 'General';

    // recent activity sample
    const recent = await Completion.find({ userId }).sort({ completedAt: -1 }).limit(5).lean();

    // build a short insight string
    let insights = `You currently track ${total_habits} active habit(s). Top category: ${top_category}. Total completions: ${total_completions}.\n\n`;
    if (recent.length) {
      insights += 'Recent activity:\n';
      recent.slice(0, 3).forEach((r, i) => {
        const when = r.completedAt ? new Date(r.completedAt).toLocaleDateString() : (r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'unknown');
        insights += `• ${when} — ${r.notes ? (r.notes.length > 80 ? r.notes.slice(0, 77) + '...' : r.notes) : 'no note'}\n`;
      });
    } else {
      insights += 'No recent completions — try logging one to build momentum!';
    }

    return res.json({ insights });
  } catch (error) {
    console.error('getAIInsights error:', error);
    return res.status(500).json({ message: error.message });
  }
};
