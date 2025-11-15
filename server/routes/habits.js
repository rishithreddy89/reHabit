import express from 'express';
import * as habitController from '../controllers/habitController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', habitController.createHabit);
router.get('/', habitController.getHabits);

// add validation endpoint for completion verification
router.post('/validate', habitController.validateCompletion);

// new endpoint for multi-question validation
router.post('/validate-answer', habitController.submitValidationAnswer);

// new route to fetch habit completion logs
router.get('/:id/logs', habitController.getHabitLogs);
router.get('/:id', habitController.getHabit);
router.patch('/:id', habitController.updateHabit);
router.delete('/:id', habitController.deleteHabit);
router.post('/:id/complete', habitController.completeHabit);
router.get('/:id/analytics', habitController.getHabitAnalytics);

export default router;
