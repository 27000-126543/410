const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  orderNo: {
    type: DataTypes.STRING(50),
    unique: true,
    comment: '订单号'
  },
  tripId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '行程ID'
  },
  tripPassengerId: {
    type: DataTypes.BIGINT.UNSIGNED,
    comment: '行程乘客关联ID'
  },
  passengerId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '乘客ID'
  },
  driverId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '司机ID'
  },
  orderType: {
    type: DataTypes.ENUM('carpool', 'hitchhike'),
    defaultValue: 'carpool',
    comment: '订单类型'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: '订单总金额'
  },
  seatCount: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '座位数'
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    comment: '单价'
  },
  platformFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: '平台服务费'
  },
  driverIncome: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: '司机收入'
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: '优惠金额'
  },
  payAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: '实付金额'
  },
  paymentMethod: {
    type: DataTypes.ENUM('balance', 'wechat', 'alipay'),
    defaultValue: 'wechat',
    comment: '支付方式'
  },
  paymentStatus: {
    type: DataTypes.ENUM('unpaid', 'pending', 'paid', 'failed', 'refunded', 'partial_refunded'),
    defaultValue: 'unpaid',
    comment: '支付状态'
  },
  orderStatus: {
    type: DataTypes.ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed'),
    defaultValue: 'pending',
    comment: '订单状态'
  },
  paidAt: {
    type: DataTypes.DATE,
    comment: '支付时间'
  },
  completedAt: {
    type: DataTypes.DATE,
    comment: '完成时间'
  },
  cancelledAt: {
    type: DataTypes.DATE,
    comment: '取消时间'
  },
  cancelReason: {
    type: DataTypes.STRING(500),
    comment: '取消原因'
  },
  cancelBy: {
    type: DataTypes.ENUM('passenger', 'driver', 'system', 'admin'),
    comment: '取消方'
  },
  transactionId: {
    type: DataTypes.STRING(100),
    comment: '第三方交易号'
  },
  refundAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: '退款金额'
  },
  refundReason: {
    type: DataTypes.STRING(500),
    comment: '退款原因'
  },
  invoiceRequested: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否申请发票'
  },
  remark: {
    type: DataTypes.STRING(500),
    comment: '备注'
  }
}, {
  tableName: 'orders',
  timestamps: true,
  paranoid: true,
  indexes: [
    { fields: ['orderNo'], unique: true },
    { fields: ['tripId'] },
    { fields: ['passengerId'] },
    { fields: ['driverId'] },
    { fields: ['orderStatus'] },
    { fields: ['paymentStatus'] }
  ]
});

module.exports = Order;
