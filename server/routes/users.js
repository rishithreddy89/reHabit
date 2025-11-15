const express = require('express');
const router = express.Router();
const dashboard = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/stats', dashboard.getUserStats);
router.get('/leaderboard', dashboard.getLeaderboard);
router.get('/insights', dashboard.getAIInsights);

module.exports = router;
