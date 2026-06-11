const { Op } = require('sequelize');
const dayjs = require('dayjs');
const {
  User, Order, Trip, Review, Complaint,
  DailyStats, HotRoutePrediction, ReputationRecord, AdminLog
} = require('../models');
const { success, error, pagination, paginateResult, generateOrderNo } = require('../utils/response');

exports.getDashboardStats = async (req, res) => {
  try {
    const { city, startDate, endDate } = req.query;

    const today = dayjs().startOf('day');
    const start = startDate ? dayjs(startDate).startOf('day') : today.subtract(30, 'day');
    const end = endDate ? dayjs(endDate).endOf('day') : dayjs().endOf('day');

    const dateWhere = { createdAt: { [Op.between]: [start.toDate(), end.toDate()] } };

    const totalOrders = await Order.count({ where: dateWhere });
    const completedOrders = await Order.count({ where: { ...dateWhere, orderStatus: 'completed' } });
    const cancelledOrders = await Order.count({ where: { ...dateWhere, orderStatus: 'cancelled' } });

    const totalRevenue = await Order.sum('payAmount', {
      where: { ...dateWhere, paymentStatus: 'paid' }
    }) || 0;

    const platformFee = await Order.sum('platformFee', {
      where: { ...dateWhere, paymentStatus: 'paid' }
    }) || 0;

    const newUsers = await User.count({ where: dateWhere });
    const totalUsers = await User.count();
    const activeDrivers = await User.count({
      where: { role: { [Op.in]: ['driver', 'admin'] }, status: 'active' }
    });

    const complaints = await Complaint.count({ where: dateWhere });
    const resolvedComplaints = await Complaint.count({
      where: { ...dateWhere, status: { [Op.in]: ['resolved', 'closed'] } }
    });

    const pendingComplaints = await Complaint.findAll({
      where: { status: 'pending' },
      order: [['priority', 'DESC'], ['createdAt', 'ASC']],
      limit: 10
    });

    const avgResponseTime = await Complaint.findOne({
      where: { responseTime: { [Op.not]: null }, createdAt: { [Op.between]: [start.toDate(), end.toDate()] } },
      attributes: [[require('sequelize').fn('AVG', require('sequelize').col('responseTime')), 'avg']]
    });

    const avgResolutionTime = await Complaint.findOne({
      where: { resolutionTime: { [Op.not]: null }, createdAt: { [Op.between]: [start.toDate(), end.toDate()] } },
      attributes: [[require('sequelize').fn('AVG', require('sequelize').col('resolutionTime')), 'avg']]
    });

    const avgRating = await Review.findOne({
      where: { createdAt: { [Op.between]: [start.toDate(), end.toDate()] } },
      attributes: [[require('sequelize').fn('AVG', require('sequelize').col('overallRating')), 'avg']]
    });

    const reputationDistribution = await User.findAll({
      attributes: [
        'reputationLevel',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['reputationLevel']
    });

    const matchData = await Trip.findAll({
      where: { createdAt: { [Op.between]: [start.toDate(), end.toDate()] } },
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total'],
        [require('sequelize').fn('SUM', require('sequelize').literal('CASE WHEN status IN ("confirmed", "in_progress", "completed") THEN 1 ELSE 0 END')), 'matched']
      ]
    });

    const todayStats = await DailyStats.findOne({ where: { date: today.format('YYYY-MM-DD') } });

    success(res, {
      overview: {
        totalOrders,
        completedOrders,
        cancelledOrders,
        completionRate: totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(2) : 0,
        totalRevenue: parseFloat(totalRevenue),
        platformFee: parseFloat(platformFee),
        averageOrderValue: completedOrders > 0 ? (totalRevenue / completedOrders).toFixed(2) : 0,
        newUsers,
        totalUsers,
        activeDrivers,
        totalComplaints: complaints,
        resolvedComplaints,
        complaintResolutionRate: complaints > 0 ? ((resolvedComplaints / complaints) * 100).toFixed(2) : 0,
        matchSuccessRate: matchData[0] && matchData[0].dataValues.total > 0
          ? ((matchData[0].dataValues.matched / matchData[0].dataValues.total) * 100).toFixed(2)
          : 0,
        avgResponseTime: avgResponseTime ? parseFloat(avgResponseTime.dataValues.avg).toFixed(1) : 0,
        avgResolutionTime: avgResolutionTime ? parseFloat(avgResolutionTime.dataValues.avg).toFixed(1) : 0,
        userSatisfaction: avgRating ? parseFloat(avgRating.dataValues.avg).toFixed(2) : 0
      },
      reputationDistribution,
      pendingComplaints,
      todayStats: todayStats || null
    });
  } catch (err) {
    console.error('获取看板数据错误:', err);
    error(res, '获取看板数据失败: ' + err.message, 500);
  }
};

exports.getOrderTrend = async (req, res) => {
  try {
    const { city, startDate, endDate, granularity = 'day' } = req.query;

    const start = startDate ? dayjs(startDate).startOf('day') : dayjs().subtract(30, 'day');
    const end = endDate ? dayjs(endDate).endOf('day') : dayjs().endOf('day');

    const stats = await DailyStats.findAll({
      where: {
        date: { [Op.between]: [start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD')] },
        city: city || 'all'
      },
      order: [['date', 'ASC']]
    });

    success(res, stats.map(s => ({
      date: s.date,
      totalOrders: s.totalOrders,
      completedOrders: s.completedOrders,
      totalRevenue: parseFloat(s.totalRevenue),
      matchSuccessRate: parseFloat(s.matchSuccessRate),
      newUsers: s.newUsers,
      activeUsers: s.activeUsers
    })));
  } catch (err) {
    error(res, '获取趋势数据失败: ' + err.message, 500);
  }
};

exports.getHotRoutes = async (req, res) => {
  try {
    const { city, limit = 20, date } = req.query;

    const where = {};
    if (city) where.city = city;
    if (date) where.predictionDate = date;
    else where.predictionDate = dayjs().format('YYYY-MM-DD');

    const routes = await HotRoutePrediction.findAll({
      where,
      order: [['predictedOrders', 'DESC']],
      limit: parseInt(limit)
    });

    success(res, routes);
  } catch (err) {
    error(res, '获取热门路线失败: ' + err.message, 500);
  }
};

exports.getPricingSuggestions = async (req, res) => {
  try {
    const { city } = req.query;

    const today = dayjs().format('YYYY-MM-DD');
    const currentHour = dayjs().hour();

    const predictions = await HotRoutePrediction.findAll({
      where: {
        city: city || { [Op.ne]: null },
        predictionDate: today,
        hourOfDay: { [Op.between]: [currentHour, currentHour + 3] }
      },
      order: [['predictedDemand', 'DESC']],
      limit: 10
    });

    const suggestions = predictions.map(p => ({
      route: `${p.startPoint} → ${p.endPoint}`,
      hour: `${p.hourOfDay}:00`,
      currentBasePrice: p.suggestedBasePrice,
      suggestedPrice: p.isPeak ? p.suggestedPeakPrice : p.suggestedBasePrice,
      priceMultiplier: p.priceMultiplier,
      predictedDemand: p.predictedDemand,
      isPeak: p.isPeak,
      trend: p.trend,
      confidence: p.confidence
    }));

    success(res, {
      currentHour,
      suggestions,
      summary: {
        peakHours: await HotRoutePrediction.count({ where: { predictionDate: today, isPeak: true } }),
        hotRoutes: await HotRoutePrediction.count({ where: { predictionDate: today, isHot: true } })
      }
    });
  } catch (err) {
    error(res, '获取定价建议失败: ' + err.message, 500);
  }
};

exports.getUserList = async (req, res) => {
  try {
    const { page, pageSize, offset, limit } = pagination(req.query.page, req.query.pageSize);
    const { keyword, role, reputationLevel, city, status } = req.query;

    const where = {};
    if (role) where.role = role;
    if (reputationLevel) where.reputationLevel = reputationLevel;
    if (city) where.city = city;
    if (status) where.status = status;
    if (keyword) {
      where[Op.or] = [
        { nickname: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } },
        { realName: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset,
      limit
    });

    success(res, paginateResult(rows, count, page, pageSize));
  } catch (err) {
    error(res, '获取用户列表失败: ' + err.message, 500);
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, isBanned, reputationScore, reason } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return error(res, '用户不存在', 404);
    }

    const oldStatus = user.status;

    if (status !== undefined) user.status = status;
    if (isBanned !== undefined) user.isBanned = isBanned;
    if (reputationScore !== undefined) user.reputationScore = reputationScore;

    await user.save();

    if (reputationScore !== undefined) {
      await ReputationRecord.create({
        userId: id,
        changeType: 'admin_adjust',
        scoreChange: reputationScore - user.previous('reputationScore'),
        previousScore: user.previous('reputationScore'),
        newScore: reputationScore,
        reason: reason || '管理员调整',
        operatorId: req.user.id
      });
    }

    await AdminLog.create({
      adminId: req.user.id,
      adminName: req.user.nickname,
      action: 'update_user_status',
      module: 'user',
      targetId: id,
      targetType: 'user',
      description: `更新用户状态: ${oldStatus} → ${status || user.status}, 原因: ${reason || '无'}`,
      ipAddress: req.ip
    });

    success(res, user, '更新成功');
  } catch (err) {
    error(res, '更新失败: ' + err.message, 500);
  }
};

exports.getOrderList = async (req, res) => {
  try {
    const { page, pageSize, offset, limit } = pagination(req.query.page, req.query.pageSize);
    const { orderNo, status, paymentStatus, startDate, endDate, passengerId, driverId } = req.query;

    const where = {};
    if (orderNo) where.orderNo = { [Op.like]: `%${orderNo}%` };
    if (status) where.orderStatus = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (passengerId) where.passengerId = passengerId;
    if (driverId) where.driverId = driverId;
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: User, as: 'passenger', attributes: ['id', 'nickname', 'phone'] },
        { model: User, as: 'driver', attributes: ['id', 'nickname', 'phone'] },
        { model: Trip, attributes: ['startPoint', 'endPoint', 'departureTime'] }
      ],
      order: [['createdAt', 'DESC']],
      offset,
      limit
    });

    success(res, paginateResult(rows, count, page, pageSize));
  } catch (err) {
    error(res, '获取订单列表失败: ' + err.message, 500);
  }
};

exports.getComplaintList = async (req, res) => {
  try {
    const { page, pageSize, offset, limit } = pagination(req.query.page, req.query.pageSize);
    const { status, priority, type, startDate, endDate } = req.query;

    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (type) where.type = type;
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }

    const { count, rows } = await Complaint.findAndCountAll({
      where,
      include: [
        { model: User, as: 'complainant', attributes: ['id', 'nickname', 'phone'] },
        { model: User, as: 'respondent', attributes: ['id', 'nickname', 'phone'] },
        { model: User, as: 'handler', attributes: ['id', 'nickname'] }
      ],
      order: [
        ['priority', 'DESC'],
        ['status', 'ASC'],
        ['createdAt', 'ASC']
      ],
      offset,
      limit
    });

    success(res, paginateResult(rows, count, page, pageSize));
  } catch (err) {
    error(res, '获取投诉列表失败: ' + err.message, 500);
  }
};

exports.handleComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, handleResult, handleRemark, complainantSatisfied, satisfactionRating } = req.body;

    const complaint = await Complaint.findByPk(id);
    if (!complaint) {
      return error(res, '投诉不存在', 404);
    }

    const now = new Date();
    const updateData = {
      handlerId: req.user.id,
      handleResult,
      handleRemark
    };

    if (!complaint.respondedAt) {
      updateData.respondedAt = now;
      updateData.responseTime = Math.round((now - complaint.createdAt) / (1000 * 60));
    }

    if (status) {
      updateData.status = status;
      if (status === 'resolved' || status === 'closed') {
        updateData.resolvedAt = now;
        updateData.resolutionTime = Math.round((now - complaint.createdAt) / (1000 * 60));
        if (complainantSatisfied !== undefined) updateData.complainantSatisfied = complainantSatisfied;
        if (satisfactionRating !== undefined) updateData.satisfactionRating = satisfactionRating;
      }
    }

    await complaint.update(updateData);

    await AdminLog.create({
      adminId: req.user.id,
      adminName: req.user.nickname,
      action: 'handle_complaint',
      module: 'complaint',
      targetId: id,
      targetType: 'complaint',
      description: `处理投诉: ${complaint.complaintNo}, 状态: ${status || complaint.status}`,
      ipAddress: req.ip
    });

    success(res, complaint, '处理成功');
  } catch (err) {
    error(res, '处理失败: ' + err.message, 500);
  }
};

exports.exportMonthlyReport = async (req, res) => {
  try {
    const { city, month } = req.query;
    const reportMonth = month || dayjs().format('YYYY-MM');

    const start = dayjs(reportMonth).startOf('month');
    const end = dayjs(reportMonth).endOf('month');

    const stats = await DailyStats.findAll({
      where: {
        date: { [Op.between]: [start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD')] },
        city: city || { [Op.ne]: null }
      },
      order: [['date', 'ASC']]
    });

    const cityGroups = {};
    stats.forEach(s => {
      const c = s.city || 'unknown';
      if (!cityGroups[c]) cityGroups[c] = [];
      cityGroups[c].push(s);
    });

    const report = {
      reportMonth,
      generatedAt: new Date(),
      totalDays: stats.length,
      cities: Object.keys(cityGroups).map(city => {
        const cityData = cityGroups[city];
        return {
          city,
          totalOrders: cityData.reduce((sum, s) => sum + s.totalOrders, 0),
          completedOrders: cityData.reduce((sum, s) => sum + s.completedOrders, 0),
          cancelledOrders: cityData.reduce((sum, s) => sum + s.cancelledOrders, 0),
          totalRevenue: cityData.reduce((sum, s) => sum + parseFloat(s.totalRevenue || 0), 0).toFixed(2),
          platformFee: cityData.reduce((sum, s) => sum + parseFloat(s.platformFee || 0), 0).toFixed(2),
          avgOrderPrice: cityData.length > 0
            ? (cityData.reduce((sum, s) => sum + parseFloat(s.averageOrderPrice || 0), 0) / cityData.length).toFixed(2)
            : 0,
          matchSuccessRate: cityData.length > 0
            ? (cityData.reduce((sum, s) => sum + parseFloat(s.matchSuccessRate || 0), 0) / cityData.length).toFixed(2)
            : 0,
          feeEfficiencyRatio: cityData.reduce((sum, s) => sum + parseFloat(s.totalRevenue || 0), 0) > 0
            ? (cityData.reduce((sum, s) => sum + parseFloat(s.platformFee || 0), 0) / cityData.reduce((sum, s) => sum + parseFloat(s.totalRevenue || 0), 0) * 100).toFixed(2)
            : 0,
          newUsers: cityData.reduce((sum, s) => sum + s.newUsers, 0),
          activeUsers: Math.round(cityData.length > 0 ? cityData.reduce((sum, s) => sum + s.activeUsers, 0) / cityData.length : 0),
          complaintsCount: cityData.reduce((sum, s) => sum + s.complaintsCount, 0),
          complaintsResolved: cityData.reduce((sum, s) => sum + s.complaintsResolved, 0),
          avgResponseTime: cityData.length > 0
            ? (cityData.reduce((sum, s) => sum + parseFloat(s.avgResponseTime || 0), 0) / cityData.length).toFixed(1)
            : 0,
          avgResolutionTime: cityData.length > 0
            ? (cityData.reduce((sum, s) => sum + parseFloat(s.avgResolutionTime || 0), 0) / cityData.length).toFixed(1)
            : 0,
          userSatisfaction: cityData.length > 0
            ? (cityData.reduce((sum, s) => sum + parseFloat(s.userSatisfaction || 0), 0) / cityData.length).toFixed(2)
            : 0,
          reputationDistribution: cityData[0]?.reputationDistribution || null
        };
      })
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="monthly-report-${reportMonth}.json"`);
    success(res, report, '报表导出成功');
  } catch (err) {
    console.error('导出报表错误:', err);
    error(res, '导出失败: ' + err.message, 500);
  }
};

exports.getAdminLogs = async (req, res) => {
  try {
    const { page, pageSize, offset, limit } = pagination(req.query.page, req.query.pageSize);
    const { adminId, module, action, startDate, endDate } = req.query;

    const where = {};
    if (adminId) where.adminId = adminId;
    if (module) where.module = module;
    if (action) where.action = action;
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }

    const { count, rows } = await AdminLog.findAndCountAll({
      where,
      include: [{ model: User, as: 'admin', attributes: ['id', 'nickname'] }],
      order: [['createdAt', 'DESC']],
      offset,
      limit
    });

    success(res, paginateResult(rows, count, page, pageSize));
  } catch (err) {
    error(res, '获取日志失败: ' + err.message, 500);
  }
};

exports.predictHotRoutes = async () => {
  try {
    const today = dayjs();
    const thirtyDaysAgo = today.subtract(30, 'day');

    const trips = await Trip.findAll({
      where: { createdAt: { [Op.between]: [thirtyDaysAgo.toDate(), today.toDate()] } },
      attributes: [
        'city', 'startPoint', 'endPoint', 'startLat', 'startLng', 'endLat', 'endLng'
      ]
    });

    const routeGroups = {};
    trips.forEach(trip => {
      const key = `${trip.city}|${trip.startPoint}|${trip.endPoint}`;
      if (!routeGroups[key]) {
        routeGroups[key] = {
          city: trip.city,
          startPoint: trip.startPoint,
          endPoint: trip.endPoint,
          startLat: trip.startLat,
          startLng: trip.startLng,
          endLat: trip.endLat,
          endLng: trip.endLng,
          count: 0,
          hours: {}
        };
      }
      routeGroups[key].count++;
      const hour = new Date(trip.createdAt).getHours();
      routeGroups[key].hours[hour] = (routeGroups[key].hours[hour] || 0) + 1;
    });

    const results = [];
    Object.values(routeGroups).forEach(route => {
      Object.entries(route.hours).forEach(([hour, count]) => {
        const avgDemand = count / 30;
        const isHot = count >= 10;
        const isPeak = hour >= 7 && hour <= 9 || hour >= 17 && hour <= 19;
        const basePrice = 15;
        const multiplier = isPeak ? 1.3 : (isHot ? 1.1 : 1.0);

        results.push({
          city: route.city,
          startPoint: route.startPoint,
          endPoint: route.endPoint,
          startLat: route.startLat,
          startLng: route.startLng,
          endLat: route.endLat,
          endLng: route.endLng,
          hourOfDay: parseInt(hour),
          dayOfWeek: today.day(),
          predictedDemand: Math.round(avgDemand * 10),
          predictedOrders: count,
          historicalOrders: count,
          suggestedBasePrice: basePrice,
          suggestedPeakPrice: (basePrice * 1.3).toFixed(2),
          priceMultiplier: multiplier.toFixed(2),
          confidence: 85,
          trend: count > route.count * 0.04 ? 'rising' : (count < route.count * 0.03 ? 'falling' : 'stable'),
          isHot,
          isPeak,
          predictionDate: today.format('YYYY-MM-DD')
        });
      });
    });

    await HotRoutePrediction.bulkCreate(results);
    console.log(`预测完成，生成${results.length}条数据`);
  } catch (err) {
    console.error('预测错误:', err);
  }
};
