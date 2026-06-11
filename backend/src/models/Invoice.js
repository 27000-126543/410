const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  invoiceNo: {
    type: DataTypes.STRING(50),
    unique: true,
    comment: '发票编号'
  },
  orderId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '订单ID'
  },
  userId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '申请人ID'
  },
  invoiceType: {
    type: DataTypes.ENUM('personal', 'company'),
    defaultValue: 'personal',
    comment: '发票类型'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '发票抬头'
  },
  taxNumber: {
    type: DataTypes.STRING(50),
    comment: '税号'
  },
  companyAddress: {
    type: DataTypes.STRING(200),
    comment: '公司地址'
  },
  companyPhone: {
    type: DataTypes.STRING(50),
    comment: '公司电话'
  },
  bankName: {
    type: DataTypes.STRING(100),
    comment: '开户银行'
  },
  bankAccount: {
    type: DataTypes.STRING(50),
    comment: '银行账号'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '开票金额'
  },
  email: {
    type: DataTypes.STRING(100),
    comment: '接收邮箱'
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'issued', 'failed', 'cancelled'),
    defaultValue: 'pending',
    comment: '发票状态'
  },
  pdfUrl: {
    type: DataTypes.STRING(500),
    comment: 'PDF地址'
  },
  issuedAt: {
    type: DataTypes.DATE,
    comment: '开票时间'
  },
  remark: {
    type: DataTypes.STRING(500),
    comment: '备注'
  }
}, {
  tableName: 'invoices',
  timestamps: true,
  indexes: [
    { fields: ['invoiceNo'], unique: true },
    { fields: ['orderId'] },
    { fields: ['userId'] },
    { fields: ['status'] }
  ]
});

module.exports = Invoice;
