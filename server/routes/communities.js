
import express from 'express';
import communityController from '../controllers/communityController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public: allow browsing communities without authentication
router.get('/', communityController.getCommunities);
router.get('/:id', communityController.getCommunity);

// Protected: creating, joining, leaving requires authentication
router.post('/', protect, communityController.createCommunity);
router.post('/:id/join', protect, communityController.joinCommunity);
router.post('/:id/leave', protect, communityController.leaveCommunity);

export default router;
