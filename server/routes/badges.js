const express = require('express');
const router = express.Router();
const badgesController = require('../controllers/badgesController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', badgesController.getBadges);

module.exports = router;
