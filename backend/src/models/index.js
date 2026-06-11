const sequelize = require('../config/database');

const User = require('./User');
const Trip = require('./Trip');
const TripPassenger = require('./TripPassenger');
const Order = require('./Order');
const Review = require('./Review');
const ReputationRecord = require('./ReputationRecord');
const Invoice = require('./Invoice');
const FavoriteRoute = require('./FavoriteRoute');
const Complaint = require('./Complaint');
const Notification = require('./Notification');
const LocationTrack = require('./LocationTrack');
const TripAgreement = require('./TripAgreement');
const DailyStats = require('./DailyStats');
const HotRoutePrediction = require('./HotRoutePrediction');
const AdminLog = require('./AdminLog');

Trip.belongsTo(User, { as: 'driver', foreignKey: 'driverId' });
User.hasMany(Trip, { foreignKey: 'driverId', as: 'drivenTrips' });

TripPassenger.belongsTo(Trip, { foreignKey: 'tripId' });
Trip.hasMany(TripPassenger, { foreignKey: 'tripId', as: 'passengers' });

TripPassenger.belongsTo(User, { as: 'passenger', foreignKey: 'passengerId' });
User.hasMany(TripPassenger, { foreignKey: 'passengerId', as: 'bookedTrips' });

Order.belongsTo(Trip, { foreignKey: 'tripId' });
Trip.hasMany(Order, { foreignKey: 'tripId', as: 'orders' });

Order.belongsTo(TripPassenger, { foreignKey: 'tripPassengerId' });
TripPassenger.hasOne(Order, { foreignKey: 'tripPassengerId' });

Order.belongsTo(User, { as: 'passenger', foreignKey: 'passengerId' });
Order.belongsTo(User, { as: 'driver', foreignKey: 'driverId' });
User.hasMany(Order, { foreignKey: 'passengerId', as: 'passengerOrders' });
User.hasMany(Order, { foreignKey: 'driverId', as: 'driverOrders' });

Review.belongsTo(Order, { foreignKey: 'orderId' });
Order.hasMany(Review, { foreignKey: 'orderId', as: 'reviews' });

Review.belongsTo(Trip, { foreignKey: 'tripId' });
Review.belongsTo(User, { as: 'reviewer', foreignKey: 'reviewerId' });
Review.belongsTo(User, { as: 'reviewee', foreignKey: 'revieweeId' });
User.hasMany(Review, { foreignKey: 'reviewerId', as: 'givenReviews' });
User.hasMany(Review, { foreignKey: 'revieweeId', as: 'receivedReviews' });

ReputationRecord.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(ReputationRecord, { foreignKey: 'userId', as: 'reputationHistory' });

Invoice.belongsTo(Order, { foreignKey: 'orderId' });
Order.hasMany(Invoice, { foreignKey: 'orderId', as: 'invoices' });

Invoice.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Invoice, { foreignKey: 'userId', as: 'invoices' });

FavoriteRoute.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(FavoriteRoute, { foreignKey: 'userId', as: 'favoriteRoutes' });

Complaint.belongsTo(Order, { foreignKey: 'orderId' });
Complaint.belongsTo(Trip, { foreignKey: 'tripId' });
Complaint.belongsTo(User, { as: 'complainant', foreignKey: 'complainantId' });
Complaint.belongsTo(User, { as: 'respondent', foreignKey: 'respondentId' });
Complaint.belongsTo(User, { as: 'handler', foreignKey: 'handlerId' });

Notification.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });

LocationTrack.belongsTo(Trip, { foreignKey: 'tripId' });
Trip.hasMany(LocationTrack, { foreignKey: 'tripId', as: 'tracks' });
LocationTrack.belongsTo(User, { foreignKey: 'userId' });

TripAgreement.belongsTo(Trip, { foreignKey: 'tripId' });
Trip.hasMany(TripAgreement, { foreignKey: 'tripId', as: 'agreements' });
TripAgreement.belongsTo(Order, { foreignKey: 'orderId' });
TripAgreement.belongsTo(User, { as: 'driver', foreignKey: 'driverId' });
TripAgreement.belongsTo(User, { as: 'passenger', foreignKey: 'passengerId' });

AdminLog.belongsTo(User, { as: 'admin', foreignKey: 'adminId' });

const initDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force, alter: false });
    console.log('数据库模型同步成功');
  } catch (error) {
    console.error('数据库模型同步失败:', error);
  }
};

module.exports = {
  sequelize,
  initDatabase,
  User,
  Trip,
  TripPassenger,
  Order,
  Review,
  ReputationRecord,
  Invoice,
  FavoriteRoute,
  Complaint,
  Notification,
  LocationTrack,
  TripAgreement,
  DailyStats,
  HotRoutePrediction,
  AdminLog
};
