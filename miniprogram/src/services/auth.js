import { get, post, put } from '../utils/request'

export var login = function (data) { return post('/auth/login', data) }
export var register = function (data) { return post('/auth/register', data) }
export var wechatLogin = function (data) { return post('/auth/wechat-login', data) }
export var logout = function () { return post('/auth/logout') }
export var getCurrentUser = function () { return get('/auth/me') }
export var updateProfile = function (data) { return put('/auth/profile', data) }
export var bindPhone = function (data) { return put('/auth/bind-phone', data) }
export var realNameAuth = function (data) { return post('/auth/real-name', data) }
export var updateDriverInfo = function (data) { return put('/auth/driver-info', data) }
export var changePassword = function (data) { return put('/auth/password', data) }
export var getUserById = function (id) { return get('/auth/' + id) }

export default {
  login: login,
  register: register,
  wechatLogin: wechatLogin,
  logout: logout,
  getCurrentUser: getCurrentUser,
  updateProfile: updateProfile,
  bindPhone: bindPhone,
  realNameAuth: realNameAuth,
  updateDriverInfo: updateDriverInfo,
  changePassword: changePassword,
  getUserById: getUserById
}
