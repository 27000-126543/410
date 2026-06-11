const { Review, Order, User, Notification } = require('../models');
const { success, error, pagination, paginateResult } = require('../utils/response');

exports.createReview = async (req, res) => {
  try {
    const user = req.user;
    const {
      orderId, overallRating, punctualityRating, attitudeRating,
      drivingRating, cleanlinessRating, content, images, tags, isAnonymous
    } = req.body;

    if (!orderId || !overallRating) {
      return error(res, '订单ID和评分必填', 400);
    }

    if (overallRating < 1 || overallRating > 5) {
      return error(res, '评分范围1-5', 400);
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      return error(res, '订单不存在', 404);
    }

    if (order.orderStatus !== 'completed') {
      return error(res, '订单未完成，无法评价', 400);
    }

    let reviewType, revieweeId;
    if (order.passengerId === user.id) {
      reviewType = 'passenger_to_driver';
      revieweeId = order.driverId;
    } else if (order.driverId === user.id) {
      reviewType = 'driver_to_passenger';
      revieweeId = order.passengerId;
    } else {
      return error(res, '无权评价', 403);
    }

    const existing = await Review.findOne({ where: { orderId, reviewerId: user.id } });
    if (existing) {
      return error(res, '您已评价过此订单', 409);
    }

    const review = await Review.create({
      orderId,
      tripId: order.tripId,
      reviewerId: user.id,
      revieweeId,
      reviewType,
      overallRating,
      punctualityRating,
      attitudeRating,
      drivingRating,
      cleanlinessRating,
      content,
      images,
      tags,
      isAnonymous
    });

    const userService = require('./userController');
    let scoreChange = 0;
    if (overallRating >= 4.5) {
      scoreChange = 3;
    } else if (overallRating >= 3.5) {
      scoreChange = 1;
    } else if (overallRating <= 2) {
      scoreChange = -3;
    }

    if (scoreChange !== 0) {
      const reason = overallRating >= 3.5 ? 'review_good' : 'review_bad';
      await userService.addReputationScore(revieweeId, scoreChange, reason, review.id, 'review');
    }

    await Notification.create({
      userId: revieweeId,
      type: 'review',
      title: '收到新的评价',
      content: `您收到了${overallRating}星评价`,
      relatedId: review.id,
      relatedType: 'review'
    });

    success(res, review, '评价成功', 201);
  } catch (err) {
    console.error('评价错误:', err);
    error(res, '评价失败: ' + err.message, 500);
  }
};

exports.getReviews = async (req, res) => {
  try {
    const { userId, type, page, pageSize } = req.query;
    const { page: p, pageSize: ps, offset, limit } = pagination(page, pageSize);

    const where = {};
    if (userId) where.revieweeId = userId;
    if (type) where.reviewType = type;
    where.isVisible = true;

    const { count, rows } = await Review.findAndCountAll({
      where,
      include: [
        { model: User, as: 'reviewer', attributes: ['id', 'nickname', 'avatar'] },
        { model: Order, attributes: ['orderNo'] }
      ],
      order: [['createdAt', 'DESC']],
      offset,
      limit
    });

    success(res, paginateResult(rows, count, p, ps));
  } catch (err) {
    error(res, '获取评价失败: ' + err.message, 500);
  }
};

exports.getReviewStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const reviews = await Review.findAll({
      where: { revieweeId: userId, isVisible: true },
      attributes: ['overallRating']
    });

    const total = reviews.length;
    let avgRating = 0;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    if (total > 0) {
      const sum = reviews.reduce((acc, r) => acc + parseFloat(r.overallRating), 0);
      avgRating = (sum / total).toFixed(1);

      reviews.forEach(r => {
        const rating = Math.round(parseFloat(r.overallRating));
        if (distribution[rating] !== undefined) {
          distribution[rating]++;
        }
      });
    }

    success(res, {
      totalReviews: total,
      averageRating: parseFloat(avgRating),
      distribution
    });
  } catch (err) {
    error(res, '获取统计失败: ' + err.message, 500);
  }
};

exports.replyReview = async (req, res) => {
  try {
    const user = req.user;
    const { reviewId } = req.params;
    const { replyContent } = req.body;

    const review = await Review.findByPk(reviewId);
    if (!review) {
      return error(res, '评价不存在', 404);
    }

    if (review.revieweeId !== user.id && user.role !== 'admin') {
      return error(res, '无权回复', 403);
    }

    await review.update({
      replyContent,
      replyAt: new Date()
    });

    success(res, review, '回复成功');
  } catch (err) {
    error(res, '回复失败: ' + err.message, 500);
  }
};
