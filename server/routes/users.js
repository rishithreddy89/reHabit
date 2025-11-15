const express = require('express');
const router = express.Router();
const dashboard = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/stats', dashboard.getUserStats);

module.exports = router;
