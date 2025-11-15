import express from 'express';
import mentorController from '../controllers/mentorController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('mentor'));

router.get('/clients', mentorController.getMyClients);
router.get('/clients/:userId', mentorController.getClientDetails);
router.post('/messages', mentorController.sendMessage);
router.get('/messages/:userId', mentorController.getMessages);
router.get('/analytics', mentorController.getMentorAnalytics);

export default router;
