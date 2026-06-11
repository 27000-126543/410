import { Component } from 'react'
import Taro from '@tarojs/taro'
import { getCurrentUser } from './services/auth'
import './app.scss'

function safeClearAuth() {
  try {
    Taro.removeStorageSync('token')
  } catch (e1) {
    console.warn('clear token err', e1)
  }
  try {
    Taro.removeStorageSync('userInfo')
  } catch (e2) {
    console.warn('clear userInfo err', e2)
  }
}

function safeGetToken() {
  try {
    return Taro.getStorageSync('token') || ''
  } catch (e) {
    return ''
  }
}

class App extends Component {

  componentDidMount() {
    var token = safeGetToken()
    console.log('[App] launch, token=' + (token ? 'exists' : 'empty'))

    if (!token) {
      console.log('[App] no auth, continue as guest')
      return
    }

    try {
      if (typeof Taro.checkSession === 'function') {
        Taro.checkSession({
          success: function () {
            console.log('[App] wx session ok, verify backend')
            getCurrentUser().then(function (user) {
              if (user) {
                try { Taro.setStorageSync('userInfo', user) } catch (e) {}
                console.log('[App] backend auth ok')
              }
            }).catch(function (err) {
              var msg = (err && err.message) || (err && err.errMsg) || 'unknown'
              console.warn('[App] backend auth fail, clear local', msg)
              safeClearAuth()
            })
          },
          fail: function () {
            console.warn('[App] wx session expired, clear local')
            safeClearAuth()
          },
          complete: function () {}
        })
      } else {
        console.log('[App] checkSession unavailable, verify backend directly')
        getCurrentUser().then(function (user) {
          if (user) {
            try { Taro.setStorageSync('userInfo', user) } catch (e) {}
          }
        }).catch(function (err) {
          var msg = (err && err.message) || (err && err.errMsg) || 'unknown'
          console.warn('[App] verify fail, clear local, continue', msg)
          safeClearAuth()
        })
      }
    } catch (outerErr) {
      console.error('[App] outer launch err, degrade', outerErr)
      safeClearAuth()
    }
  }

  componentDidShow() {}

  componentDidHide() {}

  render() {
    return this.props.children
  }
}

export default App
