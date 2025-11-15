import express from 'express';
import dashboard from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', dashboard.getLeaderboard);

export default router;
