import express from 'express';
import badgesController from '../controllers/badgesController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', badgesController.getBadges);

export default router;
