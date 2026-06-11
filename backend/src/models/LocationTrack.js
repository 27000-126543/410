const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LocationTrack = sequelize.define('LocationTrack', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  tripId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '行程ID'
  },
  userId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '用户ID'
  },
  lat: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: false,
    comment: '纬度'
  },
  lng: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: false,
    comment: '经度'
  },
  speed: {
    type: DataTypes.DECIMAL(6, 2),
    comment: '速度(km/h)'
  },
  direction: {
    type: DataTypes.DECIMAL(5, 2),
    comment: '方向(0-360度)'
  },
  accuracy: {
    type: DataTypes.DECIMAL(6, 2),
    comment: '精度(米)'
  },
  altitude: {
    type: DataTypes.DECIMAL(8, 2),
    comment: '海拔(米)'
  },
  timestamp: {
    type: DataTypes.DATE,
    comment: '定位时间'
  }
}, {
  tableName: 'location_tracks',
  timestamps: false,
  indexes: [
    { fields: ['tripId'] },
    { fields: ['userId'] },
    { fields: ['timestamp'] }
  ]
});

module.exports = LocationTrack;
