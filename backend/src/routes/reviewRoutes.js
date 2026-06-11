const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, reviewController.createReview);
router.get('/', authMiddleware, reviewController.getReviews);
router.get('/stats/:userId', authMiddleware, reviewController.getReviewStats);
router.put('/:reviewId/reply', authMiddleware, reviewController.replyReview);

module.exports = router;
