const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);
router.use(restrictTo('admin'));

router.get('/analytics', adminController.getAnalytics);
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.get('/communities', adminController.getAllCommunities);
router.patch('/communities/:id', adminController.updateCommunity);
router.delete('/communities/:id', adminController.deleteCommunity);

module.exports = router;
