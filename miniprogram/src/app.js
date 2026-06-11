import { Component, PropsWithChildren } from 'react'
import Taro from '@tarojs/taro'
import { getCurrentUser } from './services/auth'
import './app.scss'

const clearAuthStorage = () => {
  try {
    Taro.removeStorageSync('token')
    Taro.removeStorageSync('userInfo')
  } catch (e) {
    console.warn('清除登录态失败:', e)
  }
}

class App extends Component<PropsWithChildren> {

  componentDidMount () {
    console.log('[App] 小程序启动')

    try {
      const token = Taro.getStorageSync('token')
      if (!token) {
        console.log('[App] 无登录态，以游客身份继续')
        return
      }

      if (typeof Taro.checkSession === 'function') {
        Taro.checkSession({
          success: async () => {
            console.log('[App] 微信会话有效，校验后端token')
            try {
              const user = await getCurrentUser()
              Taro.setStorageSync('userInfo', user)
              console.log('[App] 后端token校验通过')
            } catch (e) {
              console.warn('[App] 后端token失效，清除本地登录态:', e?.message)
              clearAuthStorage()
            }
          },
          fail: () => {
            console.warn('[App] 微信会话过期，清除本地登录态')
            clearAuthStorage()
          }
        })
      } else {
        console.log('[App] 非微信环境，直接校验后端token')
        getCurrentUser()
          .then(user => {
            Taro.setStorageSync('userInfo', user)
          })
          .catch(e => {
            console.warn('[App] token校验失败，清除登录态继续进入:', e?.message)
            clearAuthStorage()
          })
      }
    } catch (e) {
      console.error('[App] 启动异常，清除登录态:', e)
      clearAuthStorage()
    }
  }

  componentDidShow () {}

  componentDidHide () {}

  componentDidCatchError (error) {
    console.error('[App] 全局错误捕获:', error)
  }

  render () {
    return this.props.children
  }
}

export default App
