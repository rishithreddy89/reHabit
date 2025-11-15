import express from 'express';
import studioController from '../controllers/studioController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', studioController.getStudios);
router.get('/:id', studioController.getStudio);

// Protected routes
router.post('/', protect, studioController.createStudio);
router.post('/:id/join', protect, studioController.joinStudio);
router.post('/:id/checkin', protect, studioController.checkInStudio);
router.post('/:id/leave', protect, studioController.leaveStudio);

export default router;
