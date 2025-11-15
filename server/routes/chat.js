import express from 'express';
import chatController from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/send', chatController.sendMessage);
router.get('/messages/:userId', chatController.getMessages);
router.patch('/messages/:messageId/seen', chatController.markAsSeen);

export default router;
