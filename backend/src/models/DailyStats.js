const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DailyStats = sequelize.define('DailyStats', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: '日期'
  },
  city: {
    type: DataTypes.STRING(50),
    defaultValue: 'all',
    comment: '城市'
  },
  totalOrders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '总订单数'
  },
  completedOrders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '完成订单数'
  },
  cancelledOrders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '取消订单数'
  },
  matchSuccessCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '匹配成功数'
  },
  matchTotalCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '匹配尝试总数'
  },
  matchSuccessRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
    comment: '匹配成功率(%)'
  },
  totalRevenue: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    comment: '总营收'
  },
  platformFee: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    comment: '平台服务费收入'
  },
  averageOrderPrice: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: '平均订单价格'
  },
  newUsers: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '新增用户数'
  },
  activeUsers: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '活跃用户数'
  },
  activeDrivers: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '活跃司机数'
  },
  totalTrips: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '总行程数'
  },
  complaintsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '投诉数量'
  },
  complaintsResolved: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '已解决投诉数'
  },
  avgResponseTime: {
    type: DataTypes.DECIMAL(8, 2),
    defaultValue: 0.00,
    comment: '平均响应时长(分钟)'
  },
  avgResolutionTime: {
    type: DataTypes.DECIMAL(8, 2),
    defaultValue: 0.00,
    comment: '平均解决时长(分钟)'
  },
  userSatisfaction: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00,
    comment: '用户满意度(0-5)'
  },
  reputationDistribution: {
    type: DataTypes.JSON,
    comment: '信誉分布数据'
  }
}, {
  tableName: 'daily_stats',
  timestamps: true,
  indexes: [
    { fields: ['date', 'city'], unique: true },
    { fields: ['date'] },
    { fields: ['city'] }
  ]
});

module.exports = DailyStats;
