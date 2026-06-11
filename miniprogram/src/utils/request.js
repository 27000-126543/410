import Taro from '@tarojs/taro'

const BASE_URL = 'http://localhost:3000/api'

const request = async (url, options = {}) => {
  const token = Taro.getStorageSync('token')
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await Taro.request({
      url: BASE_URL + url,
      method: options.method || 'GET',
      data: options.data || {},
      header: headers,
      timeout: 15000
    })

    const res = response.data

    if (res.code === 401) {
      Taro.removeStorageSync('token')
      Taro.removeStorageSync('userInfo')
      Taro.showToast({ title: '请先登录', icon: 'none' })
      setTimeout(() => {
        Taro.navigateTo({ url: '/pages/user/login' })
      }, 1500)
      return Promise.reject(res)
    }

    if (res.code !== 200) {
      Taro.showToast({ title: res.message || '请求失败', icon: 'none' })
      return Promise.reject(res)
    }

    return res.data
  } catch (error) {
    if (error.errMsg) {
      Taro.showToast({ title: '网络连接失败', icon: 'none' })
    }
    return Promise.reject(error)
  }
}

export const get = (url, data) => request(url, { method: 'GET', data })
export const post = (url, data) => request(url, { method: 'POST', data })
export const put = (url, data) => request(url, { method: 'PUT', data })
export const del = (url, data) => request(url, { method: 'DELETE', data })

export default request
