const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      phone: user.phone
    },
    process.env.JWT_SECRET || 'carpool_jwt_secret_key_2024',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ code: 401, message: '请先登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'carpool_jwt_secret_key_2024');
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({ code: 401, message: '用户不存在' });
    }

    if (user.isBanned || user.status === 'banned') {
      return res.status(403).json({ code: 403, message: '账号已被封禁' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ code: 401, message: '登录已过期，请重新登录' });
    }
    return res.status(401).json({ code: 401, message: '无效的token' });
  }
};

const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ code: 401, message: '请先登录' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ code: 403, message: '权限不足' });
    }
    next();
  };
};

const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ code: 401, message: '请先登录' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ code: 403, message: '需要管理员权限' });
  }
  next();
};

module.exports = {
  generateToken,
  authMiddleware,
  roleMiddleware,
  adminMiddleware
};
