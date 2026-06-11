const express = require('express');
const router = express.Router();
const miscController = require('../controllers/miscController');
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');

router.post('/favorite-routes', authMiddleware, miscController.addFavoriteRoute);
router.get('/favorite-routes', authMiddleware, miscController.getFavoriteRoutes);
router.put('/favorite-routes/:id', authMiddleware, miscController.updateFavoriteRoute);
router.delete('/favorite-routes/:id', authMiddleware, miscController.deleteFavoriteRoute);

router.post('/complaints', authMiddleware, miscController.createComplaint);
router.get('/complaints/my', authMiddleware, miscController.getMyComplaints);
router.get('/complaints/:id', authMiddleware, miscController.getComplaintDetail);

router.get('/notifications', authMiddleware, miscController.getNotifications);
router.put('/notifications/:id/read', authMiddleware, miscController.markNotificationRead);
router.put('/notifications/read-all', authMiddleware, miscController.markAllNotificationsRead);
router.get('/notifications/unread-count', authMiddleware, miscController.getUnreadCount);

router.post('/locations', authMiddleware, miscController.updateLocation);
router.get('/locations/trip/:tripId', authMiddleware, miscController.getTripLocations);

router.get('/reputation/history', authMiddleware, userController.getReputationHistory);
router.get('/reviews/my', authMiddleware, userController.getMyReviews);

module.exports = router;
