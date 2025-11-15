const path = require('path');

const tryRequire = (candidate) => {
  try {
    const full = path.resolve(candidate);
    // eslint-disable-next-line global-require, import/no-dynamic-require
    return require(full);
  } catch (e) {
    return null;
  }
};

exports.getBadges = async (req, res) => {
  try {
    // try common model locations relative to project
    const candidates = [
      path.join(__dirname, '../models/Badge.js'),
      path.join(__dirname, '../../models/Badge.js'),
      path.join(__dirname, '../backend/models/Badge.js'),
    ];
    const Badge = candidates.map(tryRequire).find(Boolean);

    if (Badge) {
      // if a Badge model exists, return DB docs mapped to the frontend shape
      const docs = await Badge.find().lean();
      const badges = docs.map(d => ({
        id: String(d._id),
        name: d.name,
        description: d.description,
        xp_required: d.xp_required || 0,
        icon: d.icon || ''
      }));
      return res.json(badges);
    }

    // fallback static badges
    const defaultBadges = [
      { id: 'badge_1', name: 'First Steps', description: 'Create your first habit', xp_required: 0, icon: '🏁' },
      { id: 'badge_2', name: 'Consistency Novice', description: 'Complete 7 days in a row', xp_required: 50, icon: '🔥' },
      { id: 'badge_3', name: 'Streak Master', description: 'Reach a 30 day streak', xp_required: 300, icon: '🏆' },
      { id: 'badge_4', name: 'Habit Architect', description: 'Create 10 habits', xp_required: 150, icon: '🧰' },
      { id: 'badge_5', name: 'Explorer', description: 'Join a community', xp_required: 20, icon: '🌐' }
    ];

    return res.json(defaultBadges);
  } catch (err) {
    console.error('getBadges error:', err);
    return res.status(500).json({ message: 'Failed to load badges' });
  }
};
