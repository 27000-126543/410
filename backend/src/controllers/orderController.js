const { Order, Trip, TripPassenger, User, Invoice, TripAgreement, Notification } = require('../models');
const {
  success, error, pagination, paginateResult,
  generateOrderNo, generateAgreementNo, formatMoney
} = require('../utils/response');

exports.createOrder = async (req, res) => {
  try {
    const user = req.user;
    const { tripPassengerId } = req.body;

    const tp = await TripPassenger.findByPk(tripPassengerId, {
      include: [{ model: Trip, as: 'Trip' }]
    });

    if (!tp) {
      return error(res, '行程乘客记录不存在', 404);
    }

    if (tp.passengerId !== user.id) {
      return error(res, '无权创建订单', 403);
    }

    if (tp.status !== 'confirmed') {
      return error(res, '行程未确认', 400);
    }

    const existingOrder = await Order.findOne({ where: { tripPassengerId } });
    if (existingOrder) {
      return error(res, '订单已存在', 409);
    }

    const platformFeeRate = 0.05;
    const totalAmount = parseFloat(tp.totalPrice);
    const platformFee = (totalAmount * platformFeeRate).toFixed(2);
    const driverIncome = (totalAmount - platformFee).toFixed(2);

    const order = await Order.create({
      orderNo: generateOrderNo(),
      tripId: tp.tripId,
      tripPassengerId,
      passengerId: user.id,
      driverId: tp.Trip.driverId,
      orderType: 'carpool',
      totalAmount,
      seatCount: tp.seatsBooked,
      unitPrice: tp.unitPrice,
      platformFee,
      driverIncome,
      payAmount: totalAmount,
      paymentStatus: 'unpaid',
      orderStatus: 'pending'
    });

    await exports.createTripAgreement(order, tp, tp.Trip);

    success(res, order, '订单创建成功', 201);
  } catch (err) {
    console.error('创建订单错误:', err);
    error(res, '创建订单失败: ' + err.message, 500);
  }
};

exports.createTripAgreement = async (order, tp, trip) => {
  try {
    const driver = await User.findByPk(trip.driverId);
    const passenger = await User.findByPk(tp.passengerId);

    const agreementContent = `
拼车服务电子协议

协议编号：${generateAgreementNo()}
签署时间：${new Date().toLocaleString('zh-CN')}

甲方（司机）：${driver.nickname}
乙方（乘客）：${passenger.nickname}

一、行程信息
起点：${trip.startPoint}
终点：${trip.endPoint}
出发时间：${new Date(trip.departureTime).toLocaleString('zh-CN')}
座位数：${tp.seatsBooked}
总费用：${formatMoney(tp.totalPrice)}元

二、费用说明
1. 费用按座位计算，每位乘客${formatMoney(tp.unitPrice)}元
2. 平台服务费已包含在费用中
3. 到达目的地后自动扣款

三、双方权利义务
1. 司机应准时到达指定地点，安全驾驶
2. 乘客应准时到达上车点，文明乘车
3. 行程中如遇特殊情况，双方应友好协商

四、其他
本协议为电子协议，双方确认后具有法律效力。
    `.trim();

    await TripAgreement.create({
      agreementNo: generateAgreementNo(),
      tripId: trip.id,
      orderId: order.id,
      driverId: trip.driverId,
      passengerId: tp.passengerId,
      agreementContent,
      startPoint: trip.startPoint,
      endPoint: trip.endPoint,
      departureTime: trip.departureTime,
      seats: tp.seatsBooked,
      totalPrice: tp.totalPrice,
      status: 'pending_sign',
      driverSignedAt: new Date(),
      driverSign: 'confirmed',
      terms: {
        platformFeeRate: 0.05,
        cancellationPolicy: '出发前2小时可免费取消'
      }
    });
  } catch (err) {
    console.error('创建协议错误:', err);
  }
};

exports.payOrder = async (req, res) => {
  try {
    const user = req.user;
    const { orderId, paymentMethod = 'wechat' } = req.body;

    const order = await Order.findByPk(orderId);
    if (!order) {
      return error(res, '订单不存在', 404);
    }

    if (order.passengerId !== user.id) {
      return error(res, '无权支付', 403);
    }

    if (order.paymentStatus === 'paid') {
      return error(res, '订单已支付', 400);
    }

    if (order.orderStatus === 'cancelled') {
      return error(res, '订单已取消', 400);
    }

    if (paymentMethod === 'balance') {
      if (user.balance < order.payAmount) {
        return error(res, '余额不足', 400);
      }
      await user.decrement('balance', { by: order.payAmount });
    }

    await order.update({
      paymentMethod,
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
      paidAt: new Date(),
      transactionId: 'MOCK_' + Date.now()
    });

    const agreement = await TripAgreement.findOne({ where: { orderId: order.id } });
    if (agreement) {
      await agreement.update({
        status: 'signed',
        passengerSignedAt: new Date(),
        passengerSign: 'confirmed',
        signedAt: new Date()
      });
    }

    const driver = await User.findByPk(order.driverId);
    await driver.increment('balance', { by: order.driverIncome });

    await Notification.create({
      userId: order.driverId,
      type: 'payment',
      title: '收到订单付款',
      content: `订单${order.orderNo}已支付，收入${formatMoney(order.driverIncome)}元`,
      relatedId: order.id,
      relatedType: 'order'
    });

    success(res, { order, balance: user.balance - order.payAmount }, '支付成功');
  } catch (err) {
    console.error('支付错误:', err);
    error(res, '支付失败: ' + err.message, 500);
  }
};

exports.getOrderList = async (req, res) => {
  try {
    const user = req.user;
    const { page, pageSize, offset, limit } = pagination(req.query.page, req.query.pageSize);
    const { status, role = 'passenger' } = req.query;

    const where = {};
    if (role === 'driver') {
      where.driverId = user.id;
    } else {
      where.passengerId = user.id;
    }
    if (status) where.orderStatus = status;

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: Trip, attributes: ['startPoint', 'endPoint', 'departureTime', 'tripNo'] },
        { model: User, as: 'driver', attributes: ['id', 'nickname', 'avatar', 'carModel'] },
        { model: User, as: 'passenger', attributes: ['id', 'nickname', 'avatar'] }
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

exports.getOrderDetail = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: Trip,
          include: [{ model: User, as: 'driver', attributes: ['id', 'nickname', 'avatar', 'phone', 'carModel', 'carPlate'] }]
        },
        { model: TripPassenger, attributes: ['pickupPoint', 'dropoffPoint', 'seatsBooked'] },
        { model: User, as: 'driver', attributes: ['id', 'nickname', 'avatar', 'phone', 'carModel', 'carPlate'] },
        { model: User, as: 'passenger', attributes: ['id', 'nickname', 'avatar', 'phone'] },
        { model: TripAgreement, as: 'TripAgreement' }
      ]
    });

    if (!order) {
      return error(res, '订单不存在', 404);
    }

    if (order.driverId !== user.id && order.passengerId !== user.id && user.role !== 'admin') {
      return error(res, '无权查看', 403);
    }

    success(res, order);
  } catch (err) {
    error(res, '获取订单详情失败: ' + err.message, 500);
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findByPk(id, { include: [Trip] });
    if (!order) {
      return error(res, '订单不存在', 404);
    }

    if (order.passengerId !== user.id && order.driverId !== user.id && user.role !== 'admin') {
      return error(res, '无权取消', 403);
    }

    if (order.orderStatus === 'completed' || order.orderStatus === 'cancelled') {
      return error(res, '订单不可取消', 400);
    }

    const cancelBy = order.passengerId === user.id ? 'passenger' : (order.driverId === user.id ? 'driver' : 'admin');

    const updateData = {
      orderStatus: 'cancelled',
      cancelledAt: new Date(),
      cancelReason: reason,
      cancelBy
    };

    if (order.paymentStatus === 'paid') {
      updateData.paymentStatus = 'refunded';
      updateData.refundAmount = order.payAmount;

      if (cancelBy === 'passenger') {
        const driver = await User.findByPk(order.driverId);
        await driver.decrement('balance', { by: order.driverIncome });
      }
    }

    await order.update(updateData);

    const tp = await TripPassenger.findOne({ where: { id: order.tripPassengerId } });
    if (tp && tp.status !== 'completed') {
      await tp.update({ status: 'cancelled', cancelReason: reason });
      if (order.Trip) {
        await order.Trip.increment('availableSeats', { by: tp.seatsBooked });
        if (order.Trip.status === 'confirmed') {
          await order.Trip.update({ status: 'matching' });
        }
      }
    }

    const notifyUserId = cancelBy === 'passenger' ? order.driverId : order.passengerId;
    await Notification.create({
      userId: notifyUserId,
      type: 'order_status',
      title: '订单已取消',
      content: `订单${order.orderNo}已被${cancelBy === 'passenger' ? '乘客' : '司机'}取消`,
      relatedId: order.id,
      relatedType: 'order'
    });

    if (cancelBy === 'passenger') {
      const userService = require('./userController');
      await userService.addReputationScore(user.id, -3, 'cancelled', order.id, 'order');
    }

    success(res, null, '取消成功');
  } catch (err) {
    error(res, '取消失败: ' + err.message, 500);
  }
};

exports.requestInvoice = async (req, res) => {
  try {
    const user = req.user;
    const { orderId, invoiceType, title, taxNumber, email, companyAddress, companyPhone, bankName, bankAccount } = req.body;

    const order = await Order.findByPk(orderId);
    if (!order) {
      return error(res, '订单不存在', 404);
    }

    if (order.passengerId !== user.id && user.role !== 'admin') {
      return error(res, '无权申请', 403);
    }

    if (order.paymentStatus !== 'paid') {
      return error(res, '订单未支付，无法开票', 400);
    }

    const { generateInvoiceNo } = require('../utils/response');
    const invoice = await Invoice.create({
      invoiceNo: generateInvoiceNo(),
      orderId,
      userId: user.id,
      invoiceType: invoiceType || 'personal',
      title,
      taxNumber,
      email,
      companyAddress,
      companyPhone,
      bankName,
      bankAccount,
      amount: order.payAmount,
      status: 'processing'
    });

    await order.update({ invoiceRequested: true });

    setTimeout(async () => {
      await invoice.update({ status: 'issued', issuedAt: new Date() });
    }, 2000);

    success(res, invoice, '发票申请已提交', 201);
  } catch (err) {
    error(res, '申请失败: ' + err.message, 500);
  }
};

exports.getMyInvoices = async (req, res) => {
  try {
    const user = req.user;
    const { page, pageSize, offset, limit } = pagination(req.query.page, req.query.pageSize);

    const { count, rows } = await Invoice.findAndCountAll({
      where: { userId: user.id },
      include: [{ model: Order, attributes: ['orderNo', 'payAmount'] }],
      order: [['createdAt', 'DESC']],
      offset,
      limit
    });

    success(res, paginateResult(rows, count, page, pageSize));
  } catch (err) {
    error(res, '获取发票列表失败: ' + err.message, 500);
  }
};

exports.getAgreement = async (req, res) => {
  try {
    const user = req.user;
    const { orderId } = req.params;

    const agreement = await TripAgreement.findOne({
      where: { orderId },
      include: [
        { model: User, as: 'driver', attributes: ['id', 'nickname', 'avatar'] },
        { model: User, as: 'passenger', attributes: ['id', 'nickname', 'avatar'] }
      ]
    });

    if (!agreement) {
      return error(res, '协议不存在', 404);
    }

    if (agreement.driverId !== user.id && agreement.passengerId !== user.id && user.role !== 'admin') {
      return error(res, '无权查看', 403);
    }

    success(res, agreement);
  } catch (err) {
    error(res, '获取协议失败: ' + err.message, 500);
  }
};
