const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FavoriteRoute = sequelize.define('FavoriteRoute', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '用户ID'
  },
  routeName: {
    type: DataTypes.STRING(100),
    comment: '路线名称'
  },
  startPoint: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '起点地址'
  },
  startLat: {
    type: DataTypes.DECIMAL(10, 7),
    comment: '起点纬度'
  },
  startLng: {
    type: DataTypes.DECIMAL(10, 7),
    comment: '起点经度'
  },
  endPoint: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '终点地址'
  },
  endLat: {
    type: DataTypes.DECIMAL(10, 7),
    comment: '终点纬度'
  },
  endLng: {
    type: DataTypes.DECIMAL(10, 7),
    comment: '终点经度'
  },
  city: {
    type: DataTypes.STRING(50),
    comment: '城市'
  },
  preferredTime: {
    type: DataTypes.STRING(50),
    comment: '偏好出发时间'
  },
  matchNotification: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '匹配通知'
  },
  searchCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '搜索次数'
  },
  lastUsedAt: {
    type: DataTypes.DATE,
    comment: '最后使用时间'
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否默认路线'
  },
  sort: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '排序'
  }
}, {
  tableName: 'favorite_routes',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['city'] },
    { fields: ['matchNotification'] }
  ]
});

module.exports = FavoriteRoute;
