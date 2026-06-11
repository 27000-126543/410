const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Trip = sequelize.define('Trip', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  tripNo: {
    type: DataTypes.STRING(50),
    unique: true,
    comment: '行程编号'
  },
  driverId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '司机ID'
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
  departureTime: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '出发时间'
  },
  totalSeats: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '总座位数'
  },
  availableSeats: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '可用座位数'
  },
  pricePerSeat: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '每位乘客价格'
  },
  estimatedDistance: {
    type: DataTypes.DECIMAL(10, 2),
    comment: '预估距离(km)'
  },
  estimatedDuration: {
    type: DataTypes.INTEGER,
    comment: '预估时长(分钟)'
  },
  description: {
    type: DataTypes.TEXT,
    comment: '行程描述'
  },
  waypoints: {
    type: DataTypes.JSON,
    comment: '途经点'
  },
  allowSmoking: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否允许吸烟'
  },
  allowPets: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否允许宠物'
  },
  allowLuggage: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '是否允许大件行李'
  },
  status: {
    type: DataTypes.ENUM('pending', 'matching', 'confirmed', 'in_progress', 'completed', 'cancelled', 'expired'),
    defaultValue: 'pending',
    comment: '行程状态'
  },
  matchSuccessRate: {
    type: DataTypes.DECIMAL(5, 2),
    comment: '匹配成功率预测'
  },
  actualStartTime: {
    type: DataTypes.DATE,
    comment: '实际出发时间'
  },
  actualEndTime: {
    type: DataTypes.DATE,
    comment: '实际到达时间'
  },
  actualDistance: {
    type: DataTypes.DECIMAL(10, 2),
    comment: '实际距离(km)'
  }
}, {
  tableName: 'trips',
  timestamps: true,
  paranoid: true,
  indexes: [
    { fields: ['driverId'] },
    { fields: ['status'] },
    { fields: ['departureTime'] },
    { fields: ['city'] },
    { fields: ['startPoint'] },
    { fields: ['endPoint'] }
  ]
});

module.exports = Trip;
