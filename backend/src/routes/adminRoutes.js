const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.use(authMiddleware, adminMiddleware);

router.get('/dashboard', adminController.getDashboardStats);
router.get('/orders/trend', adminController.getOrderTrend);
router.get('/hot-routes', adminController.getHotRoutes);
router.get('/pricing-suggestions', adminController.getPricingSuggestions);

router.get('/users', adminController.getUserList);
router.put('/users/:id/status', adminController.updateUserStatus);

router.get('/orders', adminController.getOrderList);

router.get('/complaints', adminController.getComplaintList);
router.put('/complaints/:id/handle', adminController.handleComplaint);

router.get('/report/monthly', adminController.exportMonthlyReport);

router.get('/logs', adminController.getAdminLogs);

module.exports = router;
