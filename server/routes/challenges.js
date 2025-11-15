import express from 'express';
import challengeController from '../controllers/challengeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', challengeController.createChallenge);
router.get('/', challengeController.getChallenges);
router.get('/:id', challengeController.getChallenge);
router.post('/:id/join', challengeController.joinChallenge);
router.patch('/:id/progress', challengeController.updateProgress);

export default router;
