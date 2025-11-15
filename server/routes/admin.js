import express from 'express';
import adminController from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin'));

router.get('/analytics', adminController.getAnalytics);
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.get('/communities', adminController.getAllCommunities);
router.patch('/communities/:id', adminController.updateCommunity);
router.delete('/communities/:id', adminController.deleteCommunity);

export default router;
