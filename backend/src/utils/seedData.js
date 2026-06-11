const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const models = require('../models');

const seedData = async () => {
  try {
    console.log('开始初始化数据库...');
    await sequelize.sync({ force: true });

    console.log('创建管理员账号...');
    const admin = await models.User.create({
      phone: '13800000000',
      password: 'admin123',
      nickname: '超级管理员',
      role: 'admin',
      realName: '管理员',
      isVerified: true,
      reputationScore: 100,
      reputationLevel: 'diamond',
      city: '北京'
    });

    console.log('创建测试司机账号...');
    const driver = await models.User.create({
      phone: '13800000001',
      password: '123456',
      nickname: '老司机',
      role: 'driver',
      realName: '张三',
      idCard: '110101199001011234',
      isVerified: true,
      reputationScore: 92,
      reputationLevel: 'gold',
      completionRate: 98.5,
      totalTrips: 156,
      city: '北京',
      driverLicense: '110101199001011234',
      carPlate: '京A·12345',
      carModel: '大众帕萨特',
      carColor: '黑色',
      carSeats: 4,
      balance: 1250.00
    });

    console.log('创建测试司机2...');
    const driver2 = await models.User.create({
      phone: '13800000002',
      password: '123456',
      nickname: '顺风车王',
      role: 'driver',
      realName: '李四',
      idCard: '110101198805054321',
      isVerified: true,
      reputationScore: 96,
      reputationLevel: 'platinum',
      completionRate: 99.2,
      totalTrips: 328,
      city: '北京',
      driverLicense: '110101198805054321',
      carPlate: '京B·67890',
      carModel: '丰田凯美瑞',
      carColor: '白色',
      carSeats: 4,
      balance: 3680.00
    });

    console.log('创建测试乘客账号...');
    const passenger = await models.User.create({
      phone: '13800000003',
      password: '123456',
      nickname: '小明同学',
      role: 'passenger',
      realName: '王五',
      isVerified: true,
      reputationScore: 88,
      reputationLevel: 'gold',
      city: '北京',
      balance: 500.00
    });

    console.log('创建测试乘客2...');
    const passenger2 = await models.User.create({
      phone: '13800000004',
      password: '123456',
      nickname: '白领小李',
      role: 'passenger',
      isVerified: true,
      reputationScore: 82,
      reputationLevel: 'silver',
      city: '北京',
      balance: 200.00
    });

    console.log('创建测试行程...');
    const trip1 = await models.Trip.create({
      tripNo: 'TR2024011500001',
      driverId: driver.id,
      startPoint: '北京西站',
      startLat: 39.8949,
      startLng: 116.3225,
      endPoint: '天安门广场',
      endLat: 39.9055,
      endLng: 116.4053,
      city: '北京',
      departureTime: new Date(Date.now() + 3600000),
      totalSeats: 3,
      availableSeats: 2,
      pricePerSeat: 25.00,
      estimatedDistance: 8.5,
      estimatedDuration: 30,
      description: '顺路拼车，车内禁烟，准时出发',
      allowSmoking: false,
      allowPets: false,
      allowLuggage: true,
      status: 'matching'
    });

    const trip2 = await models.Trip.create({
      tripNo: 'TR2024011500002',
      driverId: driver2.id,
      startPoint: '望京SOHO',
      startLat: 39.9961,
      startLng: 116.4784,
      endPoint: '国贸CBD',
      endLat: 39.9087,
      endLng: 116.4605,
      city: '北京',
      departureTime: new Date(Date.now() + 7200000),
      totalSeats: 3,
      availableSeats: 3,
      pricePerSeat: 35.00,
      estimatedDistance: 12.3,
      estimatedDuration: 45,
      description: '每天通勤，准时可靠',
      allowSmoking: false,
      allowPets: false,
      allowLuggage: true,
      status: 'matching'
    });

    const trip3 = await models.Trip.create({
      tripNo: 'TR2024011500003',
      driverId: driver.id,
      startPoint: '中关村',
      startLat: 39.9831,
      startLng: 116.3166,
      endPoint: '西二旗',
      endLat: 40.0501,
      endLng: 116.3017,
      city: '北京',
      departureTime: new Date(Date.now() + 1800000),
      totalSeats: 2,
      availableSeats: 1,
      pricePerSeat: 20.00,
      estimatedDistance: 9.8,
      estimatedDuration: 35,
      description: '互联网大厂通勤路线',
      status: 'confirmed'
    });

    console.log('创建收藏路线...');
    await models.FavoriteRoute.bulkCreate([
      {
        userId: passenger.id,
        routeName: '上下班路线',
        startPoint: '回龙观',
        startLat: 40.0729,
        startLng: 116.3378,
        endPoint: '望京SOHO',
        endLat: 39.9961,
        endLng: 116.4784,
        city: '北京',
        preferredTime: '08:00',
        matchNotification: true,
        isDefault: true
      },
      {
        userId: passenger.id,
        routeName: '周末回家',
        startPoint: '北京西站',
        startLat: 39.8949,
        startLng: 116.3225,
        endPoint: '保定东站',
        endLat: 38.8765,
        endLng: 115.5824,
        city: '北京',
        preferredTime: '18:00',
        matchNotification: true
      }
    ]);

    console.log('创建模拟订单...');
    const order = await models.Order.create({
      orderNo: 'CP20240115000001',
      tripId: trip3.id,
      passengerId: passenger2.id,
      driverId: driver.id,
      orderType: 'carpool',
      totalAmount: 20.00,
      seatCount: 1,
      unitPrice: 20.00,
      platformFee: 1.00,
      driverIncome: 19.00,
      payAmount: 20.00,
      paymentMethod: 'wechat',
      paymentStatus: 'paid',
      orderStatus: 'completed',
      paidAt: new Date(),
      completedAt: new Date(),
      transactionId: 'MOCK_202401150001'
    });

    console.log('创建模拟评价...');
    await models.Review.create({
      orderId: order.id,
      tripId: trip3.id,
      reviewerId: passenger2.id,
      revieweeId: driver.id,
      reviewType: 'passenger_to_driver',
      overallRating: 5,
      punctualityRating: 5,
      attitudeRating: 5,
      drivingRating: 5,
      cleanlinessRating: 5,
      content: '司机非常准时，车内干净整洁，驾驶平稳，强烈推荐！',
      tags: ['准时', '车内整洁', '驾驶平稳'],
      isVisible: true
    });

    console.log('创建模拟投诉...');
    await models.Complaint.create({
      complaintNo: 'CMP2024011500001',
      orderId: order.id,
      tripId: trip3.id,
      complainantId: passenger2.id,
      respondentId: driver.id,
      type: 'other',
      title: '测试投诉',
      content: '这是一条模拟测试投诉数据',
      status: 'resolved',
      priority: 'normal',
      handlerId: admin.id,
      handleResult: '已核实情况，双方友好解决',
      responseTime: 15,
      resolutionTime: 120,
      respondedAt: new Date(),
      resolvedAt: new Date(),
      complainantSatisfied: true,
      satisfactionRating: 5
    });

    console.log('创建日统计数据...');
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      await models.DailyStats.create({
        date: date.toISOString().split('T')[0],
        city: 'all',
        totalOrders: Math.floor(Math.random() * 500) + 200,
        completedOrders: Math.floor(Math.random() * 450) + 180,
        cancelledOrders: Math.floor(Math.random() * 50) + 10,
        matchSuccessCount: Math.floor(Math.random() * 400) + 150,
        matchTotalCount: Math.floor(Math.random() * 480) + 200,
        matchSuccessRate: Math.floor(Math.random() * 15) + 80,
        totalRevenue: (Math.random() * 50000 + 20000).toFixed(2),
        platformFee: (Math.random() * 2500 + 1000).toFixed(2),
        averageOrderPrice: (Math.random() * 30 + 25).toFixed(2),
        newUsers: Math.floor(Math.random() * 50) + 10,
        activeUsers: Math.floor(Math.random() * 500) + 300,
        activeDrivers: Math.floor(Math.random() * 80) + 40,
        complaintsCount: Math.floor(Math.random() * 10),
        complaintsResolved: Math.floor(Math.random() * 8),
        avgResponseTime: (Math.random() * 30 + 10).toFixed(1),
        avgResolutionTime: (Math.random() * 180 + 60).toFixed(1),
        userSatisfaction: (Math.random() * 1 + 4).toFixed(2),
        reputationDistribution: { bronze: 100, silver: 200, gold: 150, platinum: 80, diamond: 30 }
      });
    }

    console.log('创建热门路线预测数据...');
    const routes = [
      { start: '中关村', end: '西二旗', slat: 39.9831, slng: 116.3166, elat: 40.0501, elng: 116.3017 },
      { start: '望京SOHO', end: '国贸CBD', slat: 39.9961, slng: 116.4784, elat: 39.9087, elng: 116.4605 },
      { start: '回龙观', end: '望京SOHO', slat: 40.0729, slng: 116.3378, elat: 39.9961, elng: 116.4784 },
      { start: '北京西站', end: '天安门', slat: 39.8949, slng: 116.3225, elat: 39.9055, elng: 116.4053 },
      { start: '国贸CBD', end: '三里屯', slat: 39.9087, slng: 116.4605, elat: 39.9370, elng: 116.4544 }
    ];

    for (const route of routes) {
      for (let hour = 7; hour <= 21; hour++) {
        const isPeak = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
        const orders = isPeak ? Math.floor(Math.random() * 20) + 30 : Math.floor(Math.random() * 10) + 5;
        await models.HotRoutePrediction.create({
          city: '北京',
          startPoint: route.start,
          endPoint: route.end,
          startLat: route.slat,
          startLng: route.slng,
          endLat: route.elat,
          endLng: route.elng,
          hourOfDay: hour,
          dayOfWeek: today.getDay(),
          predictedDemand: orders * 3,
          predictedOrders: orders,
          historicalOrders: orders,
          suggestedBasePrice: 20,
          suggestedPeakPrice: isPeak ? 26 : 20,
          priceMultiplier: isPeak ? 1.3 : 1.0,
          confidence: 85 + Math.random() * 10,
          trend: ['rising', 'stable', 'falling'][Math.floor(Math.random() * 3)],
          isHot: orders > 15,
          isPeak,
          predictionDate: today.toISOString().split('T')[0]
        });
      }
    }

    console.log('创建信誉变动记录...');
    await models.ReputationRecord.bulkCreate([
      {
        userId: driver.id,
        changeType: 'trip_completed',
        scoreChange: 2,
        previousScore: 90,
        newScore: 92,
        previousLevel: 'gold',
        newLevel: 'gold',
        relatedId: order.id,
        relatedType: 'order',
        reason: 'trip_completed'
      },
      {
        userId: driver.id,
        changeType: 'review_good',
        scoreChange: 3,
        previousScore: 87,
        newScore: 90,
        previousLevel: 'gold',
        newLevel: 'gold',
        reason: 'review_good'
      }
    ]);

    console.log('\n========================================');
    console.log('   数据库初始化完成！');
    console.log('========================================\n');
    console.log('测试账号：');
    console.log('  管理员: 13800000000 / admin123');
    console.log('  司机:   13800000001 / 123456');
    console.log('  司机2:  13800000002 / 123456');
    console.log('  乘客:   13800000003 / 123456');
    console.log('  乘客2:  13800000004 / 123456');
    console.log('\n========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('初始化失败:', error);
    process.exit(1);
  }
};

seedData();
