import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const request = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 15000
})

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code === 200 || res.code === 0) {
      return res
    }
    if (res.code === 401) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      ElMessage.error(res.message || '登录已过期，请重新登录')
      router.push('/login')
      return Promise.reject(new Error(res.message || '未授权'))
    }
    if (res.code === 403) {
      ElMessage.error(res.message || '权限不足')
      return Promise.reject(new Error(res.message || '权限不足'))
    }
    ElMessage.error(res.message || '请求失败')
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        ElMessage.error('登录已过期，请重新登录')
        router.push('/login')
      } else if (error.response.status === 403) {
        ElMessage.error('权限不足')
      } else {
        ElMessage.error(error.response.data?.message || '网络请求错误')
      }
    } else {
      ElMessage.error('网络连接失败，请检查网络')
    }
    return Promise.reject(error)
  }
)

export default request
