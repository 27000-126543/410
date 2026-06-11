const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Complaint = sequelize.define('Complaint', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  complaintNo: {
    type: DataTypes.STRING(50),
    unique: true,
    comment: '投诉编号'
  },
  orderId: {
    type: DataTypes.BIGINT.UNSIGNED,
    comment: '订单ID'
  },
  tripId: {
    type: DataTypes.BIGINT.UNSIGNED,
    comment: '行程ID'
  },
  complainantId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '投诉人ID'
  },
  respondentId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '被投诉人ID'
  },
  type: {
    type: DataTypes.ENUM('attitude', 'punctuality', 'safety', 'cleanliness', 'overcharge', 'cancellation', 'other'),
    comment: '投诉类型'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '投诉标题'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '投诉内容'
  },
  images: {
    type: DataTypes.JSON,
    comment: '图片证据'
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'resolved', 'rejected', 'closed'),
    defaultValue: 'pending',
    comment: '处理状态'
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    defaultValue: 'normal',
    comment: '优先级'
  },
  handlerId: {
    type: DataTypes.BIGINT.UNSIGNED,
    comment: '处理人ID'
  },
  handleResult: {
    type: DataTypes.TEXT,
    comment: '处理结果'
  },
  handleRemark: {
    type: DataTypes.STRING(500),
    comment: '处理备注'
  },
  responseTime: {
    type: DataTypes.INTEGER,
    comment: '响应时长(分钟)'
  },
  resolutionTime: {
    type: DataTypes.INTEGER,
    comment: '解决时长(分钟)'
  },
  respondedAt: {
    type: DataTypes.DATE,
    comment: '响应时间'
  },
  resolvedAt: {
    type: DataTypes.DATE,
    comment: '解决时间'
  },
  complainantSatisfied: {
    type: DataTypes.BOOLEAN,
    comment: '投诉人是否满意'
  },
  satisfactionRating: {
    type: DataTypes.INTEGER,
    comment: '满意度评分(1-5)'
  }
}, {
  tableName: 'complaints',
  timestamps: true,
  indexes: [
    { fields: ['complaintNo'], unique: true },
    { fields: ['complainantId'] },
    { fields: ['respondentId'] },
    { fields: ['status'] },
    { fields: ['priority'] }
  ]
});

module.exports = Complaint;
