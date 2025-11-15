import express from 'express';
import gamificationController from '../controllers/gamificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware as you need; if you want some public endpoints remove protect for those routes
router.use(protect);

// User gamification data
router.get('/profile', gamificationController.getUserGamification);
router.post('/complete-habit', gamificationController.processHabitCompletion);

// Shop
router.get('/shop', gamificationController.getShopItems);
router.get('/shop/items', gamificationController.getPublicShopItems); // explicit items endpoint expected by frontend
router.post('/shop/purchase/:itemId', gamificationController.purchaseShopItem);

// Badges (public/listing)
router.get('/badges', gamificationController.getBadges);

// Challenges
router.get('/challenges', gamificationController.getActiveChallenges);
router.post('/challenges/:challengeId/join', gamificationController.joinChallenge);

// Leaderboard
router.get('/leaderboard', gamificationController.getLeaderboard);

export default router;
