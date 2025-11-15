const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habitController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', habitController.createHabit);
router.get('/', habitController.getHabits);

// add validation endpoint for completion verification
router.post('/validate', habitController.validateCompletion);

// new route to fetch habit completion logs
router.get('/:id/logs', habitController.getHabitLogs);
router.get('/:id', habitController.getHabit);
router.patch('/:id', habitController.updateHabit);
router.delete('/:id', habitController.deleteHabit);
router.post('/:id/complete', habitController.completeHabit);
router.get('/:id/analytics', habitController.getHabitAnalytics);

module.exports = router;
