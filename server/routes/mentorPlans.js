import express from 'express';
import mentorPlanController from '../controllers/mentorPlanController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get all mentor plans
router.get('/plans', mentorPlanController.getMentorPlans);

// Subscribe to a plan
router.post('/subscribe', protect, mentorPlanController.subscribeToPlan);

// Get user's subscriptions
router.get('/subscriptions', protect, mentorPlanController.getUserSubscriptions);

// Cancel subscription
router.post('/subscriptions/:subscriptionId/cancel', protect, mentorPlanController.cancelSubscription);

// Check mentor access
router.get('/:mentorId/access', protect, mentorPlanController.checkMentorAccess);

export default router;
