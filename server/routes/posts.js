import express from 'express';
import postController from '../controllers/postController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Post routes
router.post('/', protect, postController.createPost);
router.get('/feed', protect, postController.getPersonalizedFeed);
router.get('/community/:communityId', protect, postController.getCommunityFeed);
router.get('/user/:userId', protect, postController.getUserPosts);
router.delete('/:postId', protect, postController.deletePost);

// Reactions
router.post('/:postId/react', protect, postController.reactToPost);
router.delete('/:postId/react', protect, postController.removeReaction);

// Comments
router.post('/:postId/comments', protect, postController.addComment);
router.get('/:postId/comments', protect, postController.getPostComments);
router.post('/comments/:commentId/like', protect, postController.likeComment);

// AI Features
router.get('/:postId/ai-comment', protect, postController.generateAIComment);

export default router;
