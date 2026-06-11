const { FavoriteRoute, Complaint, Notification, LocationTrack } = require('../models');
const { success, error, pagination, paginateResult, generateComplaintNo } = require('../utils/response');

exports.addFavoriteRoute = async (req, res) => {
  try {
    const user = req.user;
    const {
      routeName, startPoint, startLat, startLng,
      endPoint, endLat, endLng, city, preferredTime, matchNotification
    } = req.body;

    if (!startPoint || !endPoint) {
      return error(res, '起点和终点必填', 400);
    }

    const route = await FavoriteRoute.create({
      userId: user.id,
      routeName,
      startPoint, startLat, startLng,
      endPoint, endLat, endLng,
      city: city || user.city,
      preferredTime,
      matchNotification: matchNotification !== undefined ? matchNotification : true
    });

    success(res, route, '收藏成功', 201);
  } catch (err) {
    error(res, '收藏失败: ' + err.message, 500);
  }
};

exports.getFavoriteRoutes = async (req, res) => {
  try {
    const user = req.user;
    const routes = await FavoriteRoute.findAll({
      where: { userId: user.id },
      order: [['sort', 'ASC'], ['lastUsedAt', 'DESC']]
    });
    success(res, routes);
  } catch (err) {
    error(res, '获取失败: ' + err.message, 500);
  }
};

exports.updateFavoriteRoute = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const route = await FavoriteRoute.findByPk(id);
    if (!route) {
      return error(res, '路线不存在', 404);
    }

    if (route.userId !== user.id) {
      return error(res, '无权操作', 403);
    }

    await route.update(req.body);
    success(res, route, '更新成功');
  } catch (err) {
    error(res, '更新失败: ' + err.message, 500);
  }
};

exports.deleteFavoriteRoute = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const route = await FavoriteRoute.findByPk(id);
    if (!route) {
      return error(res, '路线不存在', 404);
    }

    if (route.userId !== user.id) {
      return error(res, '无权操作', 403);
    }

    await route.destroy();
    success(res, null, '删除成功');
  } catch (err) {
    error(res, '删除失败: ' + err.message, 500);
  }
};

exports.createComplaint = async (req, res) => {
  try {
    const user = req.user;
    const { orderId, tripId, respondentId, type, title, content, images, priority } = req.body;

    if (!respondentId || !type || !title || !content) {
      return error(res, '必填参数缺失', 400);
    }

    const complaint = await Complaint.create({
      complaintNo: generateComplaintNo(),
      orderId,
      tripId,
      complainantId: user.id,
      respondentId,
      type,
      title,
      content,
      images,
      priority: priority || 'normal'
    });

    success(res, complaint, '投诉已提交', 201);
  } catch (err) {
    error(res, '提交失败: ' + err.message, 500);
  }
};

exports.getMyComplaints = async (req, res) => {
  try {
    const user = req.user;
    const { page, pageSize, offset, limit } = pagination(req.query.page, req.query.pageSize);
    const { status } = req.query;

    const where = { complainantId: user.id };
    if (status) where.status = status;

    const { count, rows } = await Complaint.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset,
      limit
    });

    success(res, paginateResult(rows, count, page, pageSize));
  } catch (err) {
    error(res, '获取失败: ' + err.message, 500);
  }
};

exports.getComplaintDetail = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const complaint = await Complaint.findByPk(id, {
      include: [
        { model: require('../models').User, as: 'complainant', attributes: ['id', 'nickname', 'avatar'] },
        { model: require('../models').User, as: 'respondent', attributes: ['id', 'nickname', 'avatar'] },
        { model: require('../models').Order, attributes: ['orderNo'] }
      ]
    });

    if (!complaint) {
      return error(res, '投诉不存在', 404);
    }

    if (complaint.complainantId !== user.id && complaint.respondentId !== user.id && user.role !== 'admin') {
      return error(res, '无权查看', 403);
    }

    success(res, complaint);
  } catch (err) {
    error(res, '获取失败: ' + err.message, 500);
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const user = req.user;
    const { page, pageSize, offset, limit } = pagination(req.query.page, req.query.pageSize);
    const { type, isRead } = req.query;

    const where = { userId: user.id };
    if (type) where.type = type;
    if (isRead !== undefined) where.isRead = isRead;

    const { count, rows } = await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset,
      limit
    });

    success(res, paginateResult(rows, count, page, pageSize));
  } catch (err) {
    error(res, '获取失败: ' + err.message, 500);
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const notification = await Notification.findByPk(id);
    if (!notification) {
      return error(res, '通知不存在', 404);
    }

    if (notification.userId !== user.id) {
      return error(res, '无权操作', 403);
    }

    await notification.update({ isRead: true, readAt: new Date() });
    success(res, null, '已标记为已读');
  } catch (err) {
    error(res, '操作失败: ' + err.message, 500);
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    const user = req.user;
    await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { userId: user.id, isRead: false } }
    );
    success(res, null, '全部标记为已读');
  } catch (err) {
    error(res, '操作失败: ' + err.message, 500);
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const user = req.user;
    const count = await Notification.count({
      where: { userId: user.id, isRead: false }
    });
    success(res, { unreadCount: count });
  } catch (err) {
    error(res, '获取失败: ' + err.message, 500);
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const user = req.user;
    const { tripId, lat, lng, speed, direction, accuracy, altitude } = req.body;

    if (!tripId || !lat || !lng) {
      return error(res, '行程ID和坐标必填', 400);
    }

    await LocationTrack.create({
      tripId,
      userId: user.id,
      lat,
      lng,
      speed,
      direction,
      accuracy,
      altitude,
      timestamp: new Date()
    });

    success(res, null, '位置已更新');
  } catch (err) {
    error(res, '更新失败: ' + err.message, 500);
  }
};

exports.getTripLocations = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { userId, limit = 100 } = req.query;

    const where = { tripId };
    if (userId) where.userId = userId;

    const tracks = await LocationTrack.findAll({
      where,
      order: [['timestamp', 'ASC']],
      limit: parseInt(limit)
    });

    success(res, tracks);
  } catch (err) {
    error(res, '获取失败: ' + err.message, 500);
  }
};
