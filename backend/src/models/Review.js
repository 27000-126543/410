const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '订单ID'
  },
  tripId: {
    type: DataTypes.BIGINT.UNSIGNED,
    comment: '行程ID'
  },
  reviewerId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '评价人ID'
  },
  revieweeId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '被评价人ID'
  },
  reviewType: {
    type: DataTypes.ENUM('driver_to_passenger', 'passenger_to_driver'),
    comment: '评价类型'
  },
  overallRating: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: false,
    comment: '总体评分(1-5)'
  },
  punctualityRating: {
    type: DataTypes.DECIMAL(2, 1),
    comment: '准时度评分'
  },
  attitudeRating: {
    type: DataTypes.DECIMAL(2, 1),
    comment: '态度评分'
  },
  drivingRating: {
    type: DataTypes.DECIMAL(2, 1),
    comment: '驾驶技术评分'
  },
  cleanlinessRating: {
    type: DataTypes.DECIMAL(2, 1),
    comment: '车内整洁度评分'
  },
  content: {
    type: DataTypes.TEXT,
    comment: '评价内容'
  },
  images: {
    type: DataTypes.JSON,
    comment: '评价图片'
  },
  tags: {
    type: DataTypes.JSON,
    comment: '标签'
  },
  isAnonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否匿名'
  },
  isVisible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '是否显示'
  },
  replyContent: {
    type: DataTypes.TEXT,
    comment: '回复内容'
  },
  replyAt: {
    type: DataTypes.DATE,
    comment: '回复时间'
  },
  isHelpful: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '有用数'
  }
}, {
  tableName: 'reviews',
  timestamps: true,
  indexes: [
    { fields: ['orderId'] },
    { fields: ['revieweeId'] },
    { fields: ['reviewerId'] },
    { fields: ['reviewType'] }
  ]
});

module.exports = Review;
