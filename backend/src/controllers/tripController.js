const { Trip, TripPassenger, User, Order, FavoriteRoute, Notification } = require('../models');
const {
  success, error, pagination, paginateResult,
  generateTripNo, haversineDistance, calculateDistanceScore,
  calculateTimeScore, calculateReputationScore
} = require('../utils/response');

exports.publishTrip = async (req, res) => {
  try {
    const user = req.user;
    const {
      startPoint, startLat, startLng,
      endPoint, endLat, endLng,
      city, departureTime, totalSeats, pricePerSeat,
      estimatedDistance, estimatedDuration, description,
      waypoints, allowSmoking, allowPets, allowLuggage
    } = req.body;

    if (!startPoint || !endPoint || !departureTime || !totalSeats || !pricePerSeat) {
      return error(res, '必填参数缺失', 400);
    }

    if (user.role !== 'driver' && user.role !== 'admin') {
      if (!user.carPlate || !user.driverLicense) {
        return error(res, '请先完善司机信息', 400);
      }
      await user.update({ role: 'driver' });
    }

    if (new Date(departureTime) <= new Date()) {
      return error(res, '出发时间必须晚于当前时间', 400);
    }

    if (totalSeats < 1 || totalSeats > (user.carSeats || 4)) {
      return error(res, `座位数不能超过车辆座位数${user.carSeats || 4}`, 400);
    }

    const trip = await Trip.create({
      tripNo: generateTripNo(),
      driverId: user.id,
      startPoint, startLat, startLng,
      endPoint, endLat, endLng,
      city: city || user.city,
      departureTime,
      totalSeats,
      availableSeats: totalSeats,
      pricePerSeat,
      estimatedDistance,
      estimatedDuration,
      description,
      waypoints,
      allowSmoking,
      allowPets,
      allowLuggage,
      status: 'matching'
    });

    exports.notifyRouteMatches(trip);

    success(res, trip, '行程发布成功', 201);
  } catch (err) {
    console.error('发布行程错误:', err);
    error(res, '发布失败: ' + err.message, 500);
  }
};

exports.notifyRouteMatches = async (trip) => {
  try {
    const favoriteRoutes = await FavoriteRoute.findAll({
      where: {
        matchNotification: true,
        city: trip.city
      }
    });

    for (const fav of favoriteRoutes) {
      const startDist = haversineDistance(
        parseFloat(trip.startLat), parseFloat(trip.startLng),
        parseFloat(fav.startLat), parseFloat(fav.startLng)
      );
      const endDist = haversineDistance(
        parseFloat(trip.endLat), parseFloat(trip.endLng),
        parseFloat(fav.endLat), parseFloat(fav.endLng)
      );

      if (startDist < 5 && endDist < 5) {
        await Notification.create({
          userId: fav.userId,
          type: 'route_match',
          title: '匹配到常用路线',
          content: `您收藏的路线有新行程：${trip.startPoint} → ${trip.endPoint}`,
          relatedId: trip.id,
          relatedType: 'trip',
          extraData: { tripId: trip.id }
        });
      }
    }
  } catch (err) {
    console.error('推送匹配通知错误:', err);
  }
};

exports.getTripList = async (req, res) => {
  try {
    const { page, pageSize, offset, limit } = pagination(req.query.page, req.query.pageSize);
    const {
      city, startPoint, endPoint, departureDate,
      status, role, driverId, passengerId
    } = req.query;

    const where = {};
    if (city) where.city = city;
    if (status) where.status = status;
    if (driverId) where.driverId = driverId;

    if (startPoint) where.startPoint = { [require('sequelize').Op.like]: `%${startPoint}%` };
    if (endPoint) where.endPoint = { [require('sequelize').Op.like]: `%${endPoint}%` };

    if (departureDate) {
      const start = new Date(departureDate);
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      where.departureTime = {
        [require('sequelize').Op.gte]: start,
        [require('sequelize').Op.lt]: end
      };
    } else if (!status || status === 'matching') {
      where.departureTime = { [require('sequelize').Op.gte]: new Date() };
    }

    const include = [
      { model: User, as: 'driver', attributes: ['id', 'nickname', 'avatar', 'reputationScore', 'reputationLevel', 'carModel', 'carPlate', 'carColor'] }
    ];

    if (passengerId) {
      include.push({
        model: TripPassenger,
        as: 'passengers',
        where: { passengerId },
        required: true
      });
    }

    const { count, rows } = await Trip.findAndCountAll({
      where,
      include,
      order: [['departureTime', 'ASC']],
      offset,
      limit
    });

    success(res, paginateResult(rows, count, page, pageSize));
  } catch (err) {
    error(res, '获取行程列表失败: ' + err.message, 500);
  }
};

exports.getTripDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const trip = await Trip.findByPk(id, {
      include: [
        { model: User, as: 'driver', attributes: ['id', 'nickname', 'avatar', 'reputationScore', 'reputationLevel', 'completionRate', 'totalTrips', 'carModel', 'carPlate', 'carColor', 'phone'] },
        {
          model: TripPassenger,
          as: 'passengers',
          include: [{ model: User, as: 'passenger', attributes: ['id', 'nickname', 'avatar', 'reputationScore', 'reputationLevel'] }]
        }
      ]
    });

    if (!trip) {
      return error(res, '行程不存在', 404);
    }

    success(res, trip);
  } catch (err) {
    error(res, '获取行程详情失败: ' + err.message, 500);
  }
};

exports.updateTrip = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const trip = await Trip.findByPk(id);

    if (!trip) {
      return error(res, '行程不存在', 404);
    }

    if (trip.driverId !== user.id && user.role !== 'admin') {
      return error(res, '无权修改此行程', 403);
    }

    if (trip.status !== 'matching' && trip.status !== 'pending') {
      return error(res, '行程已确认，无法修改', 400);
    }

    const updateData = {};
    const allowedFields = ['departureTime', 'totalSeats', 'pricePerSeat', 'description', 'allowSmoking', 'allowPets', 'allowLuggage'];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (updateData.totalSeats) {
      const bookedSeats = trip.totalSeats - trip.availableSeats;
      if (updateData.totalSeats < bookedSeats) {
        return error(res, `已预订${bookedSeats}座，不能低于已预订数量`, 400);
      }
      updateData.availableSeats = updateData.totalSeats - bookedSeats;
    }

    await trip.update(updateData);
    success(res, trip, '更新成功');
  } catch (err) {
    error(res, '更新失败: ' + err.message, 500);
  }
};

exports.cancelTrip = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { reason } = req.body;

    const trip = await Trip.findByPk(id);
    if (!trip) {
      return error(res, '行程不存在', 404);
    }

    if (trip.driverId !== user.id && user.role !== 'admin') {
      return error(res, '无权取消此行程', 403);
    }

    if (trip.status === 'completed' || trip.status === 'cancelled') {
      return error(res, '行程已结束或已取消', 400);
    }

    trip.status = 'cancelled';
    await trip.save();

    const passengers = await TripPassenger.findAll({ where: { tripId: trip.id, status: { [require('sequelize').Op.in]: ['accepted', 'confirmed'] } } });
    for (const tp of passengers) {
      await tp.update({ status: 'cancelled', cancelReason: reason || '司机取消行程' });
      const order = await Order.findOne({ where: { tripPassengerId: tp.id } });
      if (order && order.paymentStatus === 'paid') {
        await order.update({ orderStatus: 'cancelled', paymentStatus: 'refunded', refundAmount: order.payAmount, cancelledAt: new Date(), cancelBy: 'driver' });
      }

      await Notification.create({
        userId: tp.passengerId,
        type: 'order_status',
        title: '行程已取消',
        content: `您预订的行程已被司机取消：${trip.startPoint} → ${trip.endPoint}`,
        relatedId: trip.id,
        relatedType: 'trip'
      });
    }

    const userService = require('./userController');
    await userService.addReputationScore(user.id, -5, 'cancelled', trip.id, 'trip');

    success(res, null, '行程已取消');
  } catch (err) {
    error(res, '取消失败: ' + err.message, 500);
  }
};

exports.getMyDrivenTrips = async (req, res) => {
  try {
    const user = req.user;
    req.query.driverId = user.id;
    return exports.getTripList(req, res);
  } catch (err) {
    error(res, '获取我的行程失败: ' + err.message, 500);
  }
};

exports.searchTrips = async (req, res) => {
  try {
    const {
      startLat, startLng, endLat, endLng,
      departureTime, city, radius = 10
    } = req.query;

    if (!startLat || !startLng || !endLat || !endLng) {
      return error(res, '请输入起点和终点坐标', 400);
    }

    const { page, pageSize, offset, limit } = pagination(req.query.page, req.query.pageSize);

    let trips = await Trip.findAll({
      where: {
        status: { [require('sequelize').Op.in]: ['matching', 'pending'] },
        availableSeats: { [require('sequelize').Op.gt]: 0 },
        city: city || { [require('sequelize').Op.ne]: null },
        departureTime: departureTime
          ? { [require('sequelize').Op.gte]: new Date(departureTime) }
          : { [require('sequelize').Op.gte]: new Date() }
      },
      include: [
        { model: User, as: 'driver', attributes: ['id', 'nickname', 'avatar', 'reputationScore', 'reputationLevel', 'carModel', 'carPlate'] }
      ],
      order: [['departureTime', 'ASC']]
    });

    const results = trips.map(trip => {
      const startDist = haversineDistance(parseFloat(startLat), parseFloat(startLng), parseFloat(trip.startLat), parseFloat(trip.startLng));
      const endDist = haversineDistance(parseFloat(endLat), parseFloat(endLng), parseFloat(trip.endLat), parseFloat(trip.endLng));
      const matchScore = Math.round((
        calculateDistanceScore(startDist, parseFloat(radius)) * 0.35 +
        calculateDistanceScore(endDist, parseFloat(radius)) * 0.35 +
        calculateReputationScore(trip.driver.reputationScore) * 0.3
      ));

      return {
        ...trip.toJSON(),
        matchScore,
        startDistance: startDist.toFixed(2),
        endDistance: endDist.toFixed(2)
      };
    }).filter(t => t.startDistance <= radius && t.endDistance <= radius)
      .sort((a, b) => b.matchScore - a.matchScore);

    const paginated = results.slice(offset, offset + limit);
    success(res, paginateResult(paginated, results.length, page, pageSize));
  } catch (err) {
    error(res, '搜索失败: ' + err.message, 500);
  }
};

exports.requestJoinTrip = async (req, res) => {
  try {
    const user = req.user;
    const { tripId } = req.params;
    const { seatsBooked = 1, pickupPoint, pickupLat, pickupLng, dropoffPoint, dropoffLat, dropoffLng } = req.body;

    const trip = await Trip.findByPk(id);
    if (!trip) {
      return error(res, '行程不存在', 404);
    }

    if (trip.driverId === user.id) {
      return error(res, '不能加入自己的行程', 400);
    }

    if (trip.status !== 'matching' && trip.status !== 'pending') {
      return error(res, '行程不可加入', 400);
    }

    if (trip.availableSeats < seatsBooked) {
      return error(res, '座位不足', 400);
    }

    const existing = await TripPassenger.findOne({
      where: { tripId, passengerId: user.id, status: { [require('sequelize').Op.notIn]: ['cancelled', 'rejected', 'completed'] } }
    });
    if (existing) {
      return error(res, '您已申请此行程', 409);
    }

    const matchScore = Math.round(
      calculateReputationScore(user.reputationScore)
    );

    const tp = await TripPassenger.create({
      tripId,
      passengerId: user.id,
      seatsBooked,
      pickupPoint, pickupLat, pickupLng,
      dropoffPoint, dropoffLat, dropoffLng,
      unitPrice: trip.pricePerSeat,
      totalPrice: (trip.pricePerSeat * seatsBooked).toFixed(2),
      status: 'requested',
      matchScore
    });

    await Notification.create({
      userId: trip.driverId,
      type: 'trip_match',
      title: '新的拼车请求',
      content: `${user.nickname} 请求加入您的行程`,
      relatedId: tripId,
      relatedType: 'trip',
      extraData: { tripPassengerId: tp.id }
    });

    success(res, tp, '申请已发送');
  } catch (err) {
    error(res, '申请失败: ' + err.message, 500);
  }
};

exports.handlePassengerRequest = async (req, res) => {
  try {
    const user = req.user;
    const { tripPassengerId } = req.params;
    const { action, rejectReason } = req.body;

    const tp = await TripPassenger.findByPk(tripPassengerId, { include: [{ model: Trip, as: 'Trip' }] });
    if (!tp) {
      return error(res, '请求不存在', 404);
    }

    if (tp.Trip.driverId !== user.id && user.role !== 'admin') {
      return error(res, '无权处理此请求', 403);
    }

    if (tp.status !== 'requested') {
      return error(res, '请求已处理', 400);
    }

    if (action === 'accept') {
      if (tp.Trip.availableSeats < tp.seatsBooked) {
        return error(res, '座位不足', 400);
      }

      await tp.update({ status: 'accepted', driverConfirmed: true });
      await tp.Trip.decrement('availableSeats', { by: tp.seatsBooked });

      const remainSeats = tp.Trip.availableSeats - tp.seatsBooked;
      if (remainSeats <= 0) {
        await tp.Trip.update({ status: 'confirmed' });
      }

      await Notification.create({
        userId: tp.passengerId,
        type: 'trip_match',
        title: '行程请求已通过',
        content: `您的拼车请求已被司机接受`,
        relatedId: tp.tripId,
        relatedType: 'trip'
      });

      success(res, tp, '已通过');
    } else if (action === 'reject') {
      await tp.update({ status: 'rejected', rejectReason });
      await Notification.create({
        userId: tp.passengerId,
        type: 'trip_match',
        title: '行程请求被拒绝',
        content: `您的拼车请求被拒绝：${rejectReason || '司机拒绝了您的请求'}`,
        relatedId: tp.tripId,
        relatedType: 'trip'
      });
      success(res, tp, '已拒绝');
    } else {
      error(res, '无效操作', 400);
    }
  } catch (err) {
    error(res, '处理失败: ' + err.message, 500);
  }
};

exports.passengerConfirmTrip = async (req, res) => {
  try {
    const user = req.user;
    const { tripPassengerId } = req.params;

    const tp = await TripPassenger.findByPk(tripPassengerId);
    if (!tp) {
      return error(res, '记录不存在', 404);
    }

    if (tp.passengerId !== user.id) {
      return error(res, '无权确认', 403);
    }

    if (tp.status !== 'accepted') {
      return error(res, '状态不允许确认', 400);
    }

    await tp.update({ status: 'confirmed', passengerConfirmed: true });

    success(res, tp, '确认成功');
  } catch (err) {
    error(res, '确认失败: ' + err.message, 500);
  }
};

exports.startTrip = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const trip = await Trip.findByPk(id, { include: [{ model: TripPassenger, as: 'passengers' }] });
    if (!trip) {
      return error(res, '行程不存在', 404);
    }

    if (trip.driverId !== user.id && user.role !== 'admin') {
      return error(res, '无权操作', 403);
    }

    if (trip.status !== 'confirmed') {
      return error(res, '行程状态不允许出发', 400);
    }

    await trip.update({ status: 'in_progress', actualStartTime: new Date() });

    for (const tp of trip.passengers) {
      if (tp.status === 'confirmed') {
        await tp.update({ status: 'in_trip' });
      }
    }

    success(res, trip, '行程已开始');
  } catch (err) {
    error(res, '操作失败: ' + err.message, 500);
  }
};

exports.boardPassenger = async (req, res) => {
  try {
    const user = req.user;
    const { tripPassengerId } = req.params;

    const tp = await TripPassenger.findByPk(tripPassengerId, { include: [{ model: Trip, as: 'Trip' }] });
    if (!tp) {
      return error(res, '记录不存在', 404);
    }

    if (tp.Trip.driverId !== user.id && user.role !== 'admin') {
      return error(res, '无权操作', 403);
    }

    await tp.update({ status: 'boarding', boardedAt: new Date() });
    success(res, tp, '已确认上车');
  } catch (err) {
    error(res, '操作失败: ' + err.message, 500);
  }
};

exports.completeTrip = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { actualDistance, actualEndTime } = req.body;

    const trip = await Trip.findByPk(id, { include: [{ model: TripPassenger, as: 'passengers' }] });
    if (!trip) {
      return error(res, '行程不存在', 404);
    }

    if (trip.driverId !== user.id && user.role !== 'admin') {
      return error(res, '无权操作', 403);
    }

    if (trip.status !== 'in_progress') {
      return error(res, '行程状态不允许完成', 400);
    }

    await trip.update({
      status: 'completed',
      actualEndTime: actualEndTime || new Date(),
      actualDistance: actualDistance || trip.estimatedDistance
    });

    for (const tp of trip.passengers) {
      if (tp.status === 'in_trip' || tp.status === 'boarding') {
        await tp.update({ status: 'completed', droppedOffAt: new Date() });
      }
    }

    const userService = require('./userController');
    await userService.updateCompletionRate(user.id, true);
    await userService.addReputationScore(user.id, 2, 'trip_completed', trip.id, 'trip');

    success(res, trip, '行程已完成');
  } catch (err) {
    error(res, '操作失败: ' + err.message, 500);
  }
};
