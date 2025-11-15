import express from 'express';
import microStoryController from '../controllers/microStoryController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public route
router.get('/', microStoryController.getMicroStories);

// Protected routes
router.post('/', protect, microStoryController.createMicroStory);
router.post('/:id/like', protect, microStoryController.likeStory);
router.post('/:id/comment', protect, microStoryController.addComment);

export default router;
