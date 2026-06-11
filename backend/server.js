const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDatabase } = require('./src/models');
const authRoutes = require('./src/routes/authRoutes');
const tripRoutes = require('./src/routes/tripRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const userRoutes = require('./src/routes/userRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get('/api/health', (req, res) => {
  res.json({
    code: 200,
    message: '社区拼车与顺风车出行管理系统 API 服务正常运行',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  console.error('错误:', err);
  res.status(err.statusCode || 500).json({
    code: err.statusCode || 500,
    message: err.message || '服务器内部错误',
    data: null
  });
});

app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '请求的资源不存在',
    data: null
  });
});

const startServer = async () => {
  try {
    await initDatabase(false);

    const server = app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════════════╗
║     社区拼车与顺风车出行管理系统 - 后端服务              ║
╠══════════════════════════════════════════════════════════╣
║  服务地址: http://localhost:${PORT}                        ║
║  API文档:  http://localhost:${PORT}/api/health             ║
║  启动时间: ${new Date().toLocaleString('zh-CN')}                      ║
╚══════════════════════════════════════════════════════════╝
      `);
    });

    const cron = require('node-cron');
    const adminController = require('./src/controllers/adminController');

    cron.schedule('0 3 * * *', () => {
      console.log('执行每日预测任务...');
      adminController.predictHotRoutes();
    });

  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
