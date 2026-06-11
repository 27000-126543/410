const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/wechat-login', authController.wechatLogin);
router.post('/logout', authMiddleware, authController.logout);

router.get('/me', authMiddleware, authController.getCurrentUser);
router.put('/profile', authMiddleware, authController.updateProfile);
router.put('/bind-phone', authMiddleware, authController.bindPhone);
router.post('/real-name', authMiddleware, authController.realNameAuth);
router.put('/driver-info', authMiddleware, authController.updateDriverInfo);
router.put('/password', authMiddleware, authController.changePassword);

router.get('/:id', authMiddleware, authController.getUserById);

module.exports = router;
