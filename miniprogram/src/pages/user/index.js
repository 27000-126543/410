import { Component } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { getCurrentUser, logout } from '../../services/auth'
import { getUnreadCount } from '../../services/user'
import { getReputationLevel, formatMoney } from '../../utils'
import './index.scss'

export default class UserCenter extends Component {
  config = {
    navigationBarTitleText: '我的',
    enablePullDownRefresh: true
  }

  state = {
    userInfo: null,
    unreadCount: 0
  }

  componentDidMount() {
    this.loadData()
  }

  componentDidShow() {
    this.loadData()
  }

  onPullDownRefresh() {
    this.loadData()
    Taro.stopPullDownRefresh()
  }

  loadData = async () => {
    const token = Taro.getStorageSync('token')
    if (!token) return

    try {
      const [user, unreadRes] = await Promise.all([
        getCurrentUser(),
        getUnreadCount().catch(() => ({ unreadCount: 0 }))
      ])
      Taro.setStorageSync('userInfo', user)
      this.setState({
        userInfo: user,
        unreadCount: unreadRes?.unreadCount || 0
      })
    } catch (e) {
      console.error(e)
    }
  }

  goLogin = () => {
    Taro.navigateTo({ url: '/pages/user/login' })
  }

  goProfile = () => {
    Taro.navigateTo({ url: '/pages/user/profile' })
  }

  goPage = (url) => {
    const token = Taro.getStorageSync('token')
    if (!token) {
      this.goLogin()
      return
    }
    Taro.navigateTo({ url })
  }

  handleLogout = async () => {
    try {
      const res = await Taro.showModal({
        title: '提示',
        content: '确定要退出登录吗？'
      })
      if (!res.confirm) return

      await logout().catch(() => {})
      Taro.removeStorageSync('token')
      Taro.removeStorageSync('userInfo')
      this.setState({ userInfo: null })
      Taro.showToast({ title: '已退出登录', icon: 'success' })
    } catch (e) {
      console.error(e)
    }
  }

  render() {
    const { userInfo, unreadCount } = this.state

    return (
      <View className='user-page'>
        <ScrollView className='content' scrollY>
          <View className='header'>
            {userInfo ? (
              <View className='user-info' onClick={this.goProfile}>
                <Image
                  className='avatar'
                  src={userInfo.avatar || 'https://img.icons8.com/color/96/user-male-circle--v1.png'}
                />
                <View className='info'>
                  <View className='name-row'>
                    <Text className='name'>{userInfo.nickname}</Text>
                    <View className={`reputation-badge reputation-${userInfo.reputationLevel}`}>
                      {getReputationLevel(userInfo.reputationLevel)}
                    </View>
                  </View>
                  <View className='sub-row'>
                    <Text className='score'>信誉分 {userInfo.reputationScore}</Text>
                    <Text className='rate'>完成率 {userInfo.completionRate}%</Text>
                  </View>
                  {userInfo.phone && <Text className='phone'>📱 {userInfo.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</Text>}
                </View>
                <Text className='arrow'>›</Text>
              </View>
            ) : (
              <View className='login-tip' onClick={this.goLogin}>
                <Text className='login-icon'>👤</Text>
                <Text className='login-text'>点击登录</Text>
              </View>
            )}

            {userInfo && (
              <View className='stats'>
                <View className='stat-item'>
                  <Text className='stat-value'>{userInfo.totalTrips || 0}</Text>
                  <Text className='stat-label'>行程数</Text>
                </View>
                <View className='stat-divider'></View>
                <View className='stat-item'>
                  <Text className='stat-value'>¥{formatMoney(userInfo.balance)}</Text>
                  <Text className='stat-label'>余额</Text>
                </View>
                <View className='stat-divider'></View>
                <View className='stat-item'>
                  <Text className='stat-value'>¥{formatMoney(userInfo.deposit)}</Text>
                  <Text className='stat-label'>押金</Text>
                </View>
              </View>
            )}
          </View>

          <View className='quick-menu'>
            <View className='menu-item' onClick={() => this.goPage('/pages/user/favorites')}>
              <Text className='menu-icon'>⭐</Text>
              <Text className='menu-label'>常用路线</Text>
            </View>
            <View className='menu-item' onClick={() => this.goPage('/pages/user/reputation')}>
              <Text className='menu-icon'>🏅</Text>
              <Text className='menu-label'>信誉中心</Text>
            </View>
            <View className='menu-item' onClick={() => this.goPage('/pages/user/complaints')}>
              <Text className='menu-icon'>📢</Text>
              <Text className='menu-label'>我的投诉</Text>
            </View>
            <View className='menu-item' onClick={() => this.goPage('/pages/user/notifications')}>
              <Text className='menu-icon'>🔔</Text>
              <Text className='menu-label'>消息通知</Text>
              {unreadCount > 0 && <View className='badge'>{unreadCount > 99 ? '99+' : unreadCount}</View>}
            </View>
          </View>

          <View className='menu-list'>
            <View className='menu-row' onClick={() => this.goPage('/pages/trip/myTrips')}>
              <Text className='row-icon'>🚗</Text>
              <Text className='row-label'>我的行程</Text>
              <Text className='row-arrow'>›</Text>
            </View>
            <View className='menu-row' onClick={() => Taro.switchTab({ url: '/pages/order/list' })}>
              <Text className='row-icon'>📋</Text>
              <Text className='row-label'>我的订单</Text>
              <Text className='row-arrow'>›</Text>
            </View>
            <View className='menu-row' onClick={() => this.goPage('/pages/review/list')}>
              <Text className='row-icon'>⭐</Text>
              <Text className='row-label'>我的评价</Text>
              <Text className='row-arrow'>›</Text>
            </View>
          </View>

          <View className='menu-list'>
            <View className='menu-row' onClick={() => this.goPage('/pages/user/profile')}>
              <Text className='row-icon'>👤</Text>
              <Text className='row-label'>个人资料</Text>
              <Text className='row-arrow'>›</Text>
            </View>
            <View className='menu-row'>
              <Text className='row-icon'>💳</Text>
              <Text className='row-label'>我的钱包</Text>
              <Text className='row-arrow'>›</Text>
            </View>
            <View className='menu-row'>
              <Text className='row-icon'>🛡️</Text>
              <Text className='row-label'>实名认证</Text>
              <Text className={`row-tag ${userInfo?.isVerified ? 'success' : 'warning'}`}>
                {userInfo?.isVerified ? '已认证' : '未认证'}
              </Text>
              <Text className='row-arrow'>›</Text>
            </View>
            <View className='menu-row'>
              <Text className='row-icon'>🚗</Text>
              <Text className='row-label'>司机认证</Text>
              <Text className={`row-tag ${userInfo?.role === 'driver' ? 'success' : ''}`}>
                {userInfo?.role === 'driver' ? '已认证' : '未认证'}
              </Text>
              <Text className='row-arrow'>›</Text>
            </View>
          </View>

          <View className='menu-list'>
            <View className='menu-row'>
              <Text className='row-icon'>📞</Text>
              <Text className='row-label'>联系客服</Text>
              <Text className='row-arrow'>›</Text>
            </View>
            <View className='menu-row'>
              <Text className='row-icon'>📖</Text>
              <Text className='row-label'>帮助中心</Text>
              <Text className='row-arrow'>›</Text>
            </View>
            <View className='menu-row'>
              <Text className='row-icon'>ℹ️</Text>
              <Text className='row-label'>关于我们</Text>
              <Text className='row-arrow'>›</Text>
            </View>
          </View>

          {userInfo && (
            <View className='logout-section'>
              <View className='logout-btn' onClick={this.handleLogout}>退出登录</View>
            </View>
          )}
        </ScrollView>
      </View>
    )
  }
}
