import { Component } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/user'
import { formatDateTime } from '../../utils'
import './notifications.scss'

export default class Notifications extends Component {
  config = {
    navigationBarTitleText: '消息通知',
    enablePullDownRefresh: true
  }

  state = {
    activeTab: 'all',
    notifications: [],
    loading: false
  }

  tabs = [
    { key: 'all', label: '全部' },
    { key: 'system', label: '系统通知' },
    { key: 'trip_match', label: '匹配通知' },
    { key: 'order_status', label: '订单通知' },
    { key: 'review', label: '评价通知' }
  ]

  typeConfig = {
    system: { icon: '📢', label: '系统通知', color: '#1890ff' },
    trip_match: { icon: '🚗', label: '匹配通知', color: '#52c41a' },
    route_match: { icon: '🔔', label: '路线匹配', color: '#52c41a' },
    order_status: { icon: '📋', label: '订单通知', color: '#fa8c16' },
    payment: { icon: '💰', label: '支付通知', color: '#fa8c16' },
    review: { icon: '⭐', label: '评价通知', color: '#722ed1' },
    complaint: { icon: '📢', label: '投诉通知', color: '#ff4d4f' },
    reputation: { icon: '🏅', label: '信誉通知', color: '#eb2f96' }
  }

  componentDidMount() {
    this.loadNotifications()
  }

  onPullDownRefresh() {
    this.loadNotifications()
    Taro.stopPullDownRefresh()
  }

  loadNotifications = async () => {
    this.setState({ loading: true })
    const params = { pageSize: 50 }
    if (this.state.activeTab !== 'all') {
      params.type = this.state.activeTab
    }
    try {
      const res = await getNotifications(params)
      this.setState({ notifications: res.list || res || [] })
    } catch (e) {
      console.error(e)
    }
    this.setState({ loading: false })
  }

  switchTab = (key) => {
    this.setState({ activeTab: key }, () => this.loadNotifications())
  }

  handleRead = async (notification) => {
    if (notification.isRead) return
    try {
      await markNotificationRead(notification.id)
      this.loadNotifications()
    } catch (e) {
      console.error(e)
    }
  }

  markAllRead = async () => {
    try {
      await markAllNotificationsRead()
      Taro.showToast({ title: '已全部标记为已读', icon: 'success' })
      this.loadNotifications()
    } catch (e) {
      console.error(e)
    }
  }

  goDetail = (notification) => {
    this.handleRead(notification)
    if (notification.relatedType === 'order') {
      Taro.navigateTo({ url: `/pages/order/detail?id=${notification.relatedId}` })
    } else if (notification.relatedType === 'trip') {
      Taro.navigateTo({ url: `/pages/trip/detail?id=${notification.relatedId}` })
    } else if (notification.relatedType === 'complaint') {
      Taro.navigateTo({ url: `/pages/user/complaintDetail?id=${notification.relatedId}` })
    }
  }

  getUnreadCount = () => {
    return this.state.notifications.filter(n => !n.isRead).length
  }

  render() {
    const { activeTab, notifications, loading } = this.state
    const unreadCount = this.getUnreadCount()

    return (
      <View className='notifications-page'>
        <View className='header-bar'>
          <ScrollView className='tabs' scrollX>
            {this.tabs.map(tab => (
              <View
                key={tab.key}
                className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => this.switchTab(tab.key)}
              >
                {tab.label}
              </View>
            ))}
          </ScrollView>
          {unreadCount > 0 && (
            <View className='mark-all' onClick={this.markAllRead}>
              全部已读
            </View>
          )}
        </View>

        <ScrollView className='content' scrollY>
          {loading ? (
            <View className='loading'>加载中...</View>
          ) : notifications.length === 0 ? (
            <View className='empty'>
              <Text className='empty-icon'>🔔</Text>
              <Text>暂无消息通知</Text>
            </View>
          ) : (
            notifications.map(notification => {
              const typeInfo = this.typeConfig[notification.type] || this.typeConfig.system
              return (
                <View
                  key={notification.id}
                  className={`notification-card ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => this.goDetail(notification)}
                >
                  {!notification.isRead && <View className='unread-dot'></View>}
                  <View className='notification-icon' style={{ background: `${typeInfo.color}15`, color: typeInfo.color }}>
                    {typeInfo.icon}
                  </View>
                  <View className='notification-content'>
                    <View className='notification-header'>
                      <Text className='notification-title'>{notification.title}</Text>
                      <Text className='notification-type'>{typeInfo.label}</Text>
                    </View>
                    {notification.content && (
                      <Text className='notification-text'>{notification.content}</Text>
                    )}
                    <Text className='notification-time'>{formatDateTime(notification.createdAt)}</Text>
                  </View>
                </View>
              )
            })
          )}
        </ScrollView>
      </View>
    )
  }
}
