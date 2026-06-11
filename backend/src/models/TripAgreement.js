const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TripAgreement = sequelize.define('TripAgreement', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  agreementNo: {
    type: DataTypes.STRING(50),
    unique: true,
    comment: '协议编号'
  },
  tripId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '行程ID'
  },
  orderId: {
    type: DataTypes.BIGINT.UNSIGNED,
    comment: '订单ID'
  },
  driverId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '司机ID'
  },
  passengerId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '乘客ID'
  },
  agreementContent: {
    type: DataTypes.TEXT,
    comment: '协议内容'
  },
  startPoint: {
    type: DataTypes.STRING(200),
    comment: '起点'
  },
  endPoint: {
    type: DataTypes.STRING(200),
    comment: '终点'
  },
  departureTime: {
    type: DataTypes.DATE,
    comment: '出发时间'
  },
  seats: {
    type: DataTypes.INTEGER,
    comment: '座位数'
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    comment: '总费用'
  },
  driverSign: {
    type: DataTypes.STRING(500),
    comment: '司机签名/确认'
  },
  passengerSign: {
    type: DataTypes.STRING(500),
    comment: '乘客签名/确认'
  },
  driverSignedAt: {
    type: DataTypes.DATE,
    comment: '司机签署时间'
  },
  passengerSignedAt: {
    type: DataTypes.DATE,
    comment: '乘客签署时间'
  },
  status: {
    type: DataTypes.ENUM('draft', 'pending_sign', 'signed', 'void'),
    defaultValue: 'draft',
    comment: '协议状态'
  },
  signedAt: {
    type: DataTypes.DATE,
    comment: '双方签署完成时间'
  },
  pdfUrl: {
    type: DataTypes.STRING(500),
    comment: '协议PDF地址'
  },
  terms: {
    type: DataTypes.JSON,
    comment: '条款摘要'
  }
}, {
  tableName: 'trip_agreements',
  timestamps: true,
  indexes: [
    { fields: ['agreementNo'], unique: true },
    { fields: ['tripId'] },
    { fields: ['driverId'] },
    { fields: ['passengerId'] }
  ]
});

module.exports = TripAgreement;
