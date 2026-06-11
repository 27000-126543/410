import Taro from '@tarojs/taro'

var BASE_URL = 'http://localhost:3000/api'

function clearAuthSilent() {
  try { Taro.removeStorageSync('token') } catch (e) {}
  try { Taro.removeStorageSync('userInfo') } catch (e) {}
}

var request = function (url, options) {
  if (!options) options = {}
  var token = ''
  try {
    token = Taro.getStorageSync('token') || ''
  } catch (e) {
    token = ''
  }

  var headers = { 'Content-Type': 'application/json' }
  var userHeaders = options.headers || {}
  for (var k in userHeaders) {
    if (Object.prototype.hasOwnProperty.call(userHeaders, k)) {
      headers[k] = userHeaders[k]
    }
  }
  if (token) {
    headers['Authorization'] = 'Bearer ' + token
  }

  return new Promise(function (resolve, reject) {
    try {
      Taro.request({
        url: BASE_URL + url,
        method: options.method || 'GET',
        data: options.data || {},
        header: headers,
        timeout: 15000,
        success: function (response) {
          var res = response.data || {}
          if (res.code === 401) {
            clearAuthSilent()
            reject(res)
            return
          }
          if (res.code !== 200) {
            reject(res)
            return
          }
          resolve(res.data)
        },
        fail: function (err) {
          reject(err)
        }
      })
    } catch (e) {
      reject(e)
    }
  })
}

export var get = function (url, data) { return request(url, { method: 'GET', data: data }) }
export var post = function (url, data) { return request(url, { method: 'POST', data: data }) }
export var put = function (url, data) { return request(url, { method: 'PUT', data: data }) }
export var del = function (url, data) { return request(url, { method: 'DELETE', data: data }) }

export default request
