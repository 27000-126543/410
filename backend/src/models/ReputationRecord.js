const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReputationRecord = sequelize.define('ReputationRecord', {
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
  changeType: {
    type: DataTypes.ENUM('trip_completed', 'review_good', 'review_bad', 'cancelled', 'no_show', 'complaint', 'admin_adjust', 'new_user_bonus'),
    comment: '变动类型'
  },
  scoreChange: {
    type: DataTypes.DECIMAL(5, 2),
    comment: '分数变动'
  },
  previousScore: {
    type: DataTypes.DECIMAL(5, 2),
    comment: '变动前分数'
  },
  newScore: {
    type: DataTypes.DECIMAL(5, 2),
    comment: '变动后分数'
  },
  previousLevel: {
    type: DataTypes.ENUM('bronze', 'silver', 'gold', 'platinum', 'diamond'),
    comment: '变动前等级'
  },
  newLevel: {
    type: DataTypes.ENUM('bronze', 'silver', 'gold', 'platinum', 'diamond'),
    comment: '变动后等级'
  },
  relatedId: {
    type: DataTypes.BIGINT.UNSIGNED,
    comment: '关联ID（订单/评价/投诉）'
  },
  relatedType: {
    type: DataTypes.ENUM('order', 'review', 'complaint', 'trip'),
    comment: '关联类型'
  },
  reason: {
    type: DataTypes.STRING(500),
    comment: '变动原因'
  },
  operatorId: {
    type: DataTypes.BIGINT.UNSIGNED,
    comment: '操作人ID(管理员)'
  }
}, {
  tableName: 'reputation_records',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['changeType'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = ReputationRecord;
