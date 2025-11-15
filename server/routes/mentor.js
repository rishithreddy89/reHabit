const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentorController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);
router.use(restrictTo('mentor'));

router.get('/clients', mentorController.getMyClients);
router.get('/clients/:userId', mentorController.getClientDetails);
router.post('/messages', mentorController.sendMessage);
router.get('/messages/:userId', mentorController.getMessages);
router.get('/analytics', mentorController.getMentorAnalytics);

module.exports = router;
