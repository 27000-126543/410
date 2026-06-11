import { get, post, put, del } from '../utils/request'

export const login = (data) => post('/auth/login', data)
export const register = (data) => post('/auth/register', data)
export const wechatLogin = (data) => post('/auth/wechat-login', data)
export const logout = () => post('/auth/logout')
export const getCurrentUser = () => get('/auth/me')
export const updateProfile = (data) => put('/auth/profile', data)
export const bindPhone = (data) => put('/auth/bind-phone', data)
export const realNameAuth = (data) => post('/auth/real-name', data)
export const updateDriverInfo = (data) => put('/auth/driver-info', data)
export const changePassword = (data) => put('/auth/password', data)
export const getUserById = (id) => get(`/auth/${id}`)

export default {
  login,
  register,
  wechatLogin,
  logout,
  getCurrentUser,
  updateProfile,
  bindPhone,
  realNameAuth,
  updateDriverInfo,
  changePassword,
  getUserById
}
