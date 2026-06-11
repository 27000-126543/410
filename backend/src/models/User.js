const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  openid: {
    type: DataTypes.STRING(100),
    unique: true,
    comment: '微信openid'
  },
  phone: {
    type: DataTypes.STRING(20),
    unique: true,
    comment: '手机号'
  },
  password: {
    type: DataTypes.STRING(255),
    set(value) {
      this.setDataValue('password', bcrypt.hashSync(value, 10));
    },
    comment: '密码'
  },
  nickname: {
    type: DataTypes.STRING(50),
    comment: '昵称'
  },
  avatar: {
    type: DataTypes.STRING(500),
    comment: '头像'
  },
  realName: {
    type: DataTypes.STRING(50),
    comment: '真实姓名'
  },
  idCard: {
    type: DataTypes.STRING(50),
    comment: '身份证号'
  },
  role: {
    type: DataTypes.ENUM('passenger', 'driver', 'admin'),
    defaultValue: 'passenger',
    comment: '角色'
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'unknown'),
    defaultValue: 'unknown',
    comment: '性别'
  },
  city: {
    type: DataTypes.STRING(50),
    comment: '所在城市'
  },
  reputationScore: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 80.00,
    comment: '信誉分'
  },
  reputationLevel: {
    type: DataTypes.ENUM('bronze', 'silver', 'gold', 'platinum', 'diamond'),
    defaultValue: 'bronze',
    comment: '信誉等级'
  },
  completionRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 100.00,
    comment: '完成率'
  },
  totalTrips: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '总行程数'
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: '账户余额'
  },
  deposit: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: '押金'
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否实名认证'
  },
  isBanned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否被封禁'
  },
  driverLicense: {
    type: DataTypes.STRING(100),
    comment: '驾驶证号'
  },
  carPlate: {
    type: DataTypes.STRING(20),
    comment: '车牌号'
  },
  carModel: {
    type: DataTypes.STRING(100),
    comment: '车型'
  },
  carColor: {
    type: DataTypes.STRING(50),
    comment: '车辆颜色'
  },
  carSeats: {
    type: DataTypes.INTEGER,
    defaultValue: 4,
    comment: '车辆座位数'
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    comment: '最后登录时间'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'banned'),
    defaultValue: 'active',
    comment: '状态'
  }
}, {
  tableName: 'users',
  timestamps: true,
  paranoid: true,
  indexes: [
    { fields: ['phone'] },
    { fields: ['openid'] },
    { fields: ['city'] },
    { fields: ['reputationLevel'] }
  ]
});

User.prototype.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

User.prototype.calculateReputationLevel = function() {
  const score = this.reputationScore;
  if (score >= 95) return 'diamond';
  if (score >= 88) return 'platinum';
  if (score >= 80) return 'gold';
  if (score >= 70) return 'silver';
  return 'bronze';
};

module.exports = User;
