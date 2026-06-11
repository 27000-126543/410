const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'carpool_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '123456',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_TYPE || 'mysql',
    timezone: '+08:00',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 100,
      min: 5,
      acquire: 30000,
      idle: 10000
    }
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
  } catch (error) {
    console.error('数据库连接失败:', error);
  }
};

testConnection();

module.exports = sequelize;
