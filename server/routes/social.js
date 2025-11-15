import express from 'express';
import socialController from '../controllers/socialController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Community Recommendations
router.get('/recommendations/communities', protect, socialController.getCommunityRecommendations);
router.post('/recommendations/:recommendationId/dismiss', protect, socialController.dismissRecommendation);
router.post('/recommendations/:recommendationId/view', protect, socialController.markRecommendationViewed);

// Accountability Partners
router.get('/accountability/matches', protect, socialController.getAccountabilityMatches);
router.post('/accountability/:partnerId/accept', protect, socialController.acceptAccountabilityPartner);

// Micro Support Circles
router.get('/circles/:communityId', protect, socialController.getMicroSupportCircles);

// Trending Challenges
router.get('/challenges/trending', protect, socialController.getTrendingChallenges);

// Mentor Recommendations
router.get('/recommendations/mentors', protect, socialController.getMentorRecommendations);

export default router;
