const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TripPassenger = sequelize.define('TripPassenger', {
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
  passengerId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '乘客ID'
  },
  seatsBooked: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '预订座位数'
  },
  pickupPoint: {
    type: DataTypes.STRING(200),
    comment: '上车地点'
  },
  pickupLat: {
    type: DataTypes.DECIMAL(10, 7),
    comment: '上车纬度'
  },
  pickupLng: {
    type: DataTypes.DECIMAL(10, 7),
    comment: '上车经度'
  },
  dropoffPoint: {
    type: DataTypes.STRING(200),
    comment: '下车地点'
  },
  dropoffLat: {
    type: DataTypes.DECIMAL(10, 7),
    comment: '下车纬度'
  },
  dropoffLng: {
    type: DataTypes.DECIMAL(10, 7),
    comment: '下车经度'
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    comment: '单价'
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    comment: '总价'
  },
  status: {
    type: DataTypes.ENUM('requested', 'accepted', 'rejected', 'confirmed', 'boarding', 'in_trip', 'completed', 'cancelled', 'no_show'),
    defaultValue: 'requested',
    comment: '状态'
  },
  driverConfirmed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '司机确认'
  },
  passengerConfirmed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '乘客确认'
  },
  matchScore: {
    type: DataTypes.DECIMAL(5, 2),
    comment: '匹配度分数'
  },
  boardedAt: {
    type: DataTypes.DATE,
    comment: '上车时间'
  },
  droppedOffAt: {
    type: DataTypes.DATE,
    comment: '下车时间'
  },
  rejectReason: {
    type: DataTypes.STRING(500),
    comment: '拒绝原因'
  },
  cancelReason: {
    type: DataTypes.STRING(500),
    comment: '取消原因'
  }
}, {
  tableName: 'trip_passengers',
  timestamps: true,
  indexes: [
    { fields: ['tripId', 'passengerId'], unique: true },
    { fields: ['passengerId'] },
    { fields: ['status'] }
  ]
});

module.exports = TripPassenger;
