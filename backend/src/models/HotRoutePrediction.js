const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HotRoutePrediction = sequelize.define('HotRoutePrediction', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  city: {
    type: DataTypes.STRING(50),
    comment: '城市'
  },
  startPoint: {
    type: DataTypes.STRING(200),
    comment: '起点'
  },
  endPoint: {
    type: DataTypes.STRING(200),
    comment: '终点'
  },
  startLat: {
    type: DataTypes.DECIMAL(10, 7),
    comment: '起点纬度'
  },
  startLng: {
    type: DataTypes.DECIMAL(10, 7),
    comment: '起点经度'
  },
  endLat: {
    type: DataTypes.DECIMAL(10, 7),
    comment: '终点纬度'
  },
  endLng: {
    type: DataTypes.DECIMAL(10, 7),
    comment: '终点经度'
  },
  hourOfDay: {
    type: DataTypes.INTEGER,
    comment: '时段(0-23)'
  },
  dayOfWeek: {
    type: DataTypes.INTEGER,
    comment: '星期几(0-6)'
  },
  predictedDemand: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '预测需求量'
  },
  predictedOrders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '预测订单数'
  },
  historicalOrders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '历史订单数'
  },
  suggestedBasePrice: {
    type: DataTypes.DECIMAL(10, 2),
    comment: '建议基准价'
  },
  suggestedPeakPrice: {
    type: DataTypes.DECIMAL(10, 2),
    comment: '建议高峰价'
  },
  priceMultiplier: {
    type: DataTypes.DECIMAL(4, 2),
    defaultValue: 1.00,
    comment: '价格系数'
  },
  confidence: {
    type: DataTypes.DECIMAL(5, 2),
    comment: '预测置信度(%)'
  },
  trend: {
    type: DataTypes.ENUM('rising', 'stable', 'falling'),
    comment: '趋势'
  },
  isHot: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否热门'
  },
  isPeak: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否高峰时段'
  },
  predictionDate: {
    type: DataTypes.DATEONLY,
    comment: '预测日期'
  }
}, {
  tableName: 'hot_route_predictions',
  timestamps: true,
  indexes: [
    { fields: ['city', 'predictionDate'] },
    { fields: ['startPoint', 'endPoint'] },
    { fields: ['isHot'] },
    { fields: ['isPeak'] }
  ]
});

module.exports = HotRoutePrediction;
