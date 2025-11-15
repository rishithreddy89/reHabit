const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', challengeController.createChallenge);
router.get('/', challengeController.getChallenges);
router.get('/:id', challengeController.getChallenge);
router.post('/:id/join', challengeController.joinChallenge);
router.patch('/:id/progress', challengeController.updateProgress);

module.exports = router;
