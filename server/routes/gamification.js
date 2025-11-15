import express from 'express';
import gamificationController from '../controllers/gamificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// User gamification data
router.get('/profile', gamificationController.getUserGamification);
router.post('/complete-habit', gamificationController.processHabitCompletion);

// Shop
router.get('/shop', gamificationController.getShopItems);
router.post('/shop/purchase/:itemId', gamificationController.purchaseShopItem);

// Challenges
router.get('/challenges', gamificationController.getActiveChallenges);
router.post('/challenges/:challengeId/join', gamificationController.joinChallenge);

// Leaderboard
router.get('/leaderboard', gamificationController.getLeaderboard);

export default router;
