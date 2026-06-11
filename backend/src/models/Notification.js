const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '接收用户ID'
  },
  type: {
    type: DataTypes.ENUM('system', 'trip_match', 'order_status', 'payment', 'review', 'complaint', 'reputation', 'route_match'),
    comment: '通知类型'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '通知标题'
  },
  content: {
    type: DataTypes.TEXT,
    comment: '通知内容'
  },
  relatedId: {
    type: DataTypes.BIGINT.UNSIGNED,
    comment: '关联ID'
  },
  relatedType: {
    type: DataTypes.ENUM('trip', 'order', 'review', 'complaint', 'user'),
    comment: '关联类型'
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否已读'
  },
  readAt: {
    type: DataTypes.DATE,
    comment: '阅读时间'
  },
  pushStatus: {
    type: DataTypes.ENUM('pending', 'sent', 'failed'),
    defaultValue: 'pending',
    comment: '推送状态'
  },
  extraData: {
    type: DataTypes.JSON,
    comment: '扩展数据'
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['type'] },
    { fields: ['isRead'] }
  ]
});

module.exports = Notification;
