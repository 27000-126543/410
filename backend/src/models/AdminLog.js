const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AdminLog = sequelize.define('AdminLog', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  adminId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '管理员ID'
  },
  adminName: {
    type: DataTypes.STRING(50),
    comment: '管理员名称'
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '操作类型'
  },
  module: {
    type: DataTypes.STRING(50),
    comment: '操作模块'
  },
  targetId: {
    type: DataTypes.BIGINT.UNSIGNED,
    comment: '操作对象ID'
  },
  targetType: {
    type: DataTypes.STRING(50),
    comment: '操作对象类型'
  },
  description: {
    type: DataTypes.TEXT,
    comment: '操作描述'
  },
  oldValue: {
    type: DataTypes.JSON,
    comment: '修改前数据'
  },
  newValue: {
    type: DataTypes.JSON,
    comment: '修改后数据'
  },
  ipAddress: {
    type: DataTypes.STRING(50),
    comment: 'IP地址'
  },
  userAgent: {
    type: DataTypes.STRING(500),
    comment: '用户代理'
  },
  status: {
    type: DataTypes.ENUM('success', 'failed', 'pending'),
    defaultValue: 'success',
    comment: '操作状态'
  }
}, {
  tableName: 'admin_logs',
  timestamps: true,
  indexes: [
    { fields: ['adminId'] },
    { fields: ['action'] },
    { fields: ['module'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = AdminLog;
