const { User } = require('../models');
const { generateToken } = require('../middleware/auth');
const { success, error, validatePhone, maskPhone } = require('../utils/response');

exports.register = async (req, res) => {
  try {
    const { phone, password, nickname, code, role } = req.body;

    if (!phone || !password) {
      return error(res, '手机号和密码不能为空', 400);
    }

    if (!validatePhone(phone)) {
      return error(res, '手机号格式不正确', 400);
    }

    if (password.length < 6) {
      return error(res, '密码至少6位', 400);
    }

    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) {
      return error(res, '该手机号已注册', 409);
    }

    const user = await User.create({
      phone,
      password,
      nickname: nickname || `用户${phone.slice(-4)}`,
      role: role || 'passenger'
    });

    const token = generateToken(user);

    await user.update({ lastLoginAt: new Date() });

    success(res, {
      token,
      user: {
        id: user.id,
        phone: maskPhone(user.phone),
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
        reputationScore: user.reputationScore,
        reputationLevel: user.reputationLevel
      }
    }, '注册成功');
  } catch (err) {
    console.error('注册错误:', err);
    error(res, '注册失败: ' + err.message, 500);
  }
};

exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return error(res, '手机号和密码不能为空', 400);
    }

    const user = await User.findOne({ where: { phone } });
    if (!user) {
      return error(res, '用户不存在', 404);
    }

    if (!user.comparePassword(password)) {
      return error(res, '密码错误', 401);
    }

    if (user.isBanned || user.status === 'banned') {
      return error(res, '账号已被封禁', 403);
    }

    const token = generateToken(user);

    await user.update({ lastLoginAt: new Date() });

    success(res, {
      token,
      user: {
        id: user.id,
        phone: maskPhone(user.phone),
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
        reputationScore: user.reputationScore,
        reputationLevel: user.reputationLevel,
        isVerified: user.isVerified,
        balance: user.balance
      }
    }, '登录成功');
  } catch (err) {
    console.error('登录错误:', err);
    error(res, '登录失败: ' + err.message, 500);
  }
};

exports.wechatLogin = async (req, res) => {
  try {
    const { code, nickname, avatar, gender } = req.body;

    if (!code) {
      return error(res, '微信code不能为空', 400);
    }

    let mockOpenid = 'wx_' + Math.random().toString(36).substr(2, 20);

    let user = await User.findOne({ where: { openid: mockOpenid } });

    if (!user) {
      user = await User.create({
        openid: mockOpenid,
        nickname: nickname || '微信用户',
        avatar: avatar || '',
        gender: gender || 'unknown',
        role: 'passenger'
      });
    }

    const token = generateToken(user);
    await user.update({ lastLoginAt: new Date() });

    success(res, {
      token,
      user: {
        id: user.id,
        phone: user.phone ? maskPhone(user.phone) : null,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
        reputationScore: user.reputationScore,
        reputationLevel: user.reputationLevel,
        isVerified: user.isVerified
      }
    }, '微信登录成功');
  } catch (err) {
    console.error('微信登录错误:', err);
    error(res, '微信登录失败: ' + err.message, 500);
  }
};

exports.logout = async (req, res) => {
  try {
    success(res, null, '退出成功');
  } catch (err) {
    error(res, '退出失败: ' + err.message, 500);
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    success(res, {
      id: user.id,
      phone: user.phone ? maskPhone(user.phone) : null,
      nickname: user.nickname,
      avatar: user.avatar,
      realName: user.realName,
      role: user.role,
      gender: user.gender,
      city: user.city,
      reputationScore: user.reputationScore,
      reputationLevel: user.reputationLevel,
      completionRate: user.completionRate,
      totalTrips: user.totalTrips,
      balance: user.balance,
      deposit: user.deposit,
      isVerified: user.isVerified,
      driverLicense: user.driverLicense,
      carPlate: user.carPlate,
      carModel: user.carModel,
      carColor: user.carColor,
      carSeats: user.carSeats,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt
    });
  } catch (err) {
    error(res, '获取用户信息失败: ' + err.message, 500);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const { nickname, avatar, gender, city } = req.body;

    await user.update({
      nickname: nickname || user.nickname,
      avatar: avatar !== undefined ? avatar : user.avatar,
      gender: gender || user.gender,
      city: city || user.city
    });

    success(res, {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      gender: user.gender,
      city: user.city
    }, '更新成功');
  } catch (err) {
    error(res, '更新失败: ' + err.message, 500);
  }
};

exports.bindPhone = async (req, res) => {
  try {
    const user = req.user;
    const { phone, code } = req.body;

    if (!validatePhone(phone)) {
      return error(res, '手机号格式不正确', 400);
    }

    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser && existingUser.id !== user.id) {
      return error(res, '该手机号已绑定其他账号', 409);
    }

    await user.update({ phone });
    success(res, null, '手机号绑定成功');
  } catch (err) {
    error(res, '绑定失败: ' + err.message, 500);
  }
};

exports.realNameAuth = async (req, res) => {
  try {
    const user = req.user;
    const { realName, idCard, driverLicense } = req.body;

    if (!realName || !idCard) {
      return error(res, '真实姓名和身份证号不能为空', 400);
    }

    await user.update({
      realName,
      idCard,
      driverLicense: driverLicense || user.driverLicense,
      isVerified: true
    });

    success(res, { isVerified: true }, '实名认证成功');
  } catch (err) {
    error(res, '认证失败: ' + err.message, 500);
  }
};

exports.updateDriverInfo = async (req, res) => {
  try {
    const user = req.user;
    const { carPlate, carModel, carColor, carSeats, driverLicense } = req.body;

    if (user.role !== 'driver' && user.role !== 'admin') {
      await user.update({ role: 'driver' });
    }

    await user.update({
      carPlate: carPlate || user.carPlate,
      carModel: carModel || user.carModel,
      carColor: carColor || user.carColor,
      carSeats: carSeats || user.carSeats,
      driverLicense: driverLicense || user.driverLicense
    });

    success(res, {
      carPlate: user.carPlate,
      carModel: user.carModel,
      carColor: user.carColor,
      carSeats: user.carSeats,
      driverLicense: user.driverLicense,
      role: user.role
    }, '司机信息更新成功');
  } catch (err) {
    error(res, '更新失败: ' + err.message, 500);
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return error(res, '用户不存在', 404);
    }

    success(res, {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      role: user.role,
      reputationScore: user.reputationScore,
      reputationLevel: user.reputationLevel,
      completionRate: user.completionRate,
      totalTrips: user.totalTrips,
      carModel: user.carModel,
      carPlate: user.carPlate,
      carColor: user.carColor,
      isVerified: user.isVerified,
      gender: user.gender,
      city: user.city
    });
  } catch (err) {
    error(res, '获取用户信息失败: ' + err.message, 500);
  }
};

exports.changePassword = async (req, res) => {
  try {
    const user = req.user;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return error(res, '密码不能为空', 400);
    }

    if (newPassword.length < 6) {
      return error(res, '新密码至少6位', 400);
    }

    if (!user.comparePassword(oldPassword)) {
      return error(res, '原密码错误', 401);
    }

    user.password = newPassword;
    await user.save();

    success(res, null, '密码修改成功');
  } catch (err) {
    error(res, '修改密码失败: ' + err.message, 500);
  }
};
