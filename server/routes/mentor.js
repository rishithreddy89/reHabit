const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentorController');
const { protect, restrictTo } = require('../middleware/auth');

// Public routes (specific routes first)
router.get('/nearby', mentorController.getNearbyMentors);
router.get('/leaderboard', mentorController.getMentorLeaderboard);
router.get('/', mentorController.getAllMentors);

// Protected routes (requires authentication)
router.use(protect);

// Specific routes before parameterized ones
router.get('/requests/sent', mentorController.getSentRequests);

// Mentor-only routes (must come before parameterized /:mentorId)
router.get('/clients', restrictTo('mentor'), mentorController.getMyClients);
router.get('/clients/:userId', restrictTo('mentor'), mentorController.getClientDetails);
router.post('/messages', restrictTo('mentor'), mentorController.sendMessage);
router.get('/messages/:userId', restrictTo('mentor'), mentorController.getMessages);
router.get('/analytics', restrictTo('mentor'), mentorController.getMentorAnalytics);
router.get('/requests/received', restrictTo('mentor'), mentorController.getReceivedRequests);
router.post('/requests/:requestId/accept', restrictTo('mentor'), mentorController.acceptRequest);
router.post('/requests/:requestId/reject', restrictTo('mentor'), mentorController.rejectRequest);

// Parameterized routes
router.get('/:mentorId', mentorController.getMentorProfile);
router.get('/:mentorId/reviews', mentorController.getMentorReviews);
router.post('/:mentorId/request', mentorController.sendMentorRequest);
router.post('/:mentorId/review', mentorController.submitReview);

module.exports = router;
