const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', communityController.createCommunity);
router.get('/', communityController.getCommunities);
router.get('/:id', communityController.getCommunity);
router.post('/:id/join', communityController.joinCommunity);
router.post('/:id/leave', communityController.leaveCommunity);

module.exports = router;
