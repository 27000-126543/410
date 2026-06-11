import { Component } from 'react'
import { View, Text, Input, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { login, register, wechatLogin } from '../../services/auth'
import './login.scss'

export default class Login extends Component {
  config = {
    navigationBarTitleText: '登录'
  }

  state = {
    mode: 'login',
    phone: '',
    password: '',
    nickname: '',
    code: '',
    loading: false
  }

  switchMode = () => {
    this.setState({
      mode: this.state.mode === 'login' ? 'register' : 'login',
      phone: '',
      password: '',
      nickname: ''
    })
  }

  onInput = (key, e) => {
    this.setState({ [key]: e.detail.value })
  }

  handleLogin = async () => {
    const { phone, password } = this.state
    if (!phone || !password) {
      Taro.showToast({ title: '请输入手机号和密码', icon: 'none' })
      return
    }
    this.setState({ loading: true })
    try {
      const res = await login({ phone, password })
      Taro.setStorageSync('token', res.token)
      Taro.setStorageSync('userInfo', res.user)
      Taro.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => Taro.switchTab({ url: '/pages/index/index' }), 1000)
    } catch (e) {
      console.error(e)
    }
    this.setState({ loading: false })
  }

  handleRegister = async () => {
    const { phone, password, nickname } = this.state
    if (!phone || !password) {
      Taro.showToast({ title: '请输入手机号和密码', icon: 'none' })
      return
    }
    if (password.length < 6) {
      Taro.showToast({ title: '密码至少6位', icon: 'none' })
      return
    }
    this.setState({ loading: true })
    try {
      const res = await register({ phone, password, nickname })
      Taro.setStorageSync('token', res.token)
      Taro.setStorageSync('userInfo', res.user)
      Taro.showToast({ title: '注册成功', icon: 'success' })
      setTimeout(() => Taro.switchTab({ url: '/pages/index/index' }), 1000)
    } catch (e) {
      console.error(e)
    }
    this.setState({ loading: false })
  }

  handleWechatLogin = async () => {
    try {
      const loginRes = await Taro.login()
      const userInfo = await Taro.getUserProfile({ desc: '用于完善用户资料' })

      this.setState({ loading: true })
      const res = await wechatLogin({
        code: loginRes.code,
        nickname: userInfo.userInfo.nickName,
        avatar: userInfo.userInfo.avatarUrl,
        gender: userInfo.userInfo.gender === 1 ? 'male' : userInfo.userInfo.gender === 2 ? 'female' : 'unknown'
      })

      Taro.setStorageSync('token', res.token)
      Taro.setStorageSync('userInfo', res.user)
      Taro.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => Taro.switchTab({ url: '/pages/index/index' }), 1000)
    } catch (e) {
      console.error(e)
    }
    this.setState({ loading: false })
  }

  render() {
    const { mode, phone, password, nickname, loading } = this.state
    return (
      <View className='login-page'>
        <View className='logo-section'>
          <View className='logo'>🚗</View>
          <Text className='title'>社区拼车</Text>
          <Text className='subtitle'>让出行更便捷、更经济</Text>
        </View>

        <View className='form-section'>
          <View className='tabs'>
            <View
              className={`tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => this.setState({ mode: 'login' })}
            >登录</View>
            <View
              className={`tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => this.setState({ mode: 'register' })}
            >注册</View>
          </View>

          {mode === 'register' && (
            <View className='form-item'>
              <Text className='label'>昵称</Text>
              <Input
                className='input'
                placeholder='请输入昵称'
                value={nickname}
                onInput={(e) => this.onInput('nickname', e)}
              />
            </View>
          )}

          <View className='form-item'>
            <Text className='label'>手机号</Text>
            <Input
              className='input'
              type='number'
              placeholder='请输入手机号'
              value={phone}
              onInput={(e) => this.onInput('phone', e)}
              maxLength={11}
            />
          </View>

          <View className='form-item'>
            <Text className='label'>密码</Text>
            <Input
              className='input'
              type='password'
              placeholder='请输入密码'
              value={password}
              onInput={(e) => this.onInput('password', e)}
            />
          </View>

          <Button
            className='submit-btn'
            loading={loading}
            onClick={mode === 'login' ? this.handleLogin : this.handleRegister}
          >
            {mode === 'login' ? '登录' : '注册'}
          </Button>

          <View className='divider'>
            <View className='line'></View>
            <Text className='text'>其他方式</Text>
            <View className='line'></View>
          </View>

          <View className='wechat-btn' onClick={this.handleWechatLogin}>
            <Text className='wechat-icon'>💬</Text>
            <Text>微信一键登录</Text>
          </View>
        </View>

        <View className='agreement'>
          登录即表示同意《用户协议》和《隐私政策》
        </View>
      </View>
    )
  }
}
