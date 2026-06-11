import { Component } from 'react'
import { View, Text, Image, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { getTripList } from '../../services/trip'
import { getUnreadCount } from '../../services/user'
import { formatTime, getReputationLevel, formatMoney } from '../../utils'
import './index.scss'

export default class Index extends Component {
  config = {
    navigationBarTitleText: '社区拼车',
    enablePullDownRefresh: true
  }

  state = {
    startPoint: '',
    endPoint: '',
    hotTrips: [],
    myCity: '北京',
    unreadCount: 0,
    loading: false
  }

  componentDidMount() {
    this.loadData()
  }

  onPullDownRefresh() {
    this.loadData()
    Taro.stopPullDownRefresh()
  }

  loadData = async () => {
    this.setState({ loading: true })
    try {
      const tripsRes = await getTripList({ city: this.state.myCity, pageSize: 10 }).catch(e => {
        console.warn('[首页] 获取行程列表失败:', e?.message)
        return { list: [] }
      })
      const unreadRes = await getUnreadCount().catch(e => {
        console.warn('[首页] 获取未读消息失败:', e?.message)
        return { unreadCount: 0 }
      })
      this.setState({
        hotTrips: tripsRes?.list || [],
        unreadCount: unreadRes?.unreadCount || 0
      })
    } catch (e) {
      console.warn('[首页] 加载异常，降级展示:', e?.message)
      this.setState({ hotTrips: [], unreadCount: 0 })
    }
    this.setState({ loading: false })
  }

  goSearch = () => {
    Taro.navigateTo({ url: '/pages/trip/search' })
  }

  goPublish = () => {
    const token = Taro.getStorageSync('token')
    if (!token) {
      Taro.navigateTo({ url: '/pages/user/login' })
      return
    }
    Taro.navigateTo({ url: '/pages/trip/publish' })
  }

  goTripDetail = (id) => {
    Taro.navigateTo({ url: `/pages/trip/detail?id=${id}` })
  }

  goNotifications = () => {
    Taro.navigateTo({ url: '/pages/user/notifications' })
  }

  onInputStart = (e) => {
    this.setState({ startPoint: e.detail.value })
  }

  onInputEnd = (e) => {
    this.setState({ endPoint: e.detail.value })
  }

  render() {
    const { hotTrips, unreadCount } = this.state
    return (
      <View className='index-page'>
        <View className='header'>
          <View className='location'>
            <Text className='icon'>📍</Text>
            <Text className='city'>{this.state.myCity}</Text>
          </View>
          <View className='notification' onClick={this.goNotifications}>
            <Text className='icon'>🔔</Text>
            {unreadCount > 0 && <View className='badge'>{unreadCount > 99 ? '99+' : unreadCount}</View>}
          </View>
        </View>

        <View className='search-card' onClick={this.goSearch}>
          <View className='search-item'>
            <View className='dot start'></View>
            <Input
              placeholder='输入出发地'
              value={this.state.startPoint}
              onInput={this.onInputStart}
              className='search-input'
              disabled
            />
          </View>
          <View className='search-line'></View>
          <View className='search-item'>
            <View className='dot end'></View>
            <Input
              placeholder='输入目的地'
              value={this.state.endPoint}
              onInput={this.onInputEnd}
              className='search-input'
              disabled
            />
          </View>
        </View>

        <View className='quick-actions'>
          <View className='action-item' onClick={this.goPublish}>
            <View className='action-icon publish'>🚗</View>
            <Text className='action-text'>发布行程</Text>
          </View>
          <View className='action-item' onClick={this.goSearch}>
            <View className='action-icon search'>🔍</View>
            <Text className='action-text'>找顺风车</Text>
          </View>
          <View className='action-item' onClick={() => Taro.navigateTo({ url: '/pages/user/favorites' })}>
            <View className='action-icon favorite'>⭐</View>
            <Text className='action-text'>常用路线</Text>
          </View>
        </View>

        <View className='section'>
          <View className='section-header'>
            <Text className='section-title'>🔥 热门推荐</Text>
            <Text className='section-more' onClick={this.goSearch}>查看更多 ›</Text>
          </View>

          {hotTrips.length === 0 ? (
            <View className='empty'>
              <Text className='empty-icon'>🚗</Text>
              <Text>暂无行程，快去发布吧~</Text>
            </View>
          ) : (
            hotTrips.map(trip => (
              <View key={trip.id} className='trip-card' onClick={() => this.goTripDetail(trip.id)}>
                <View className='trip-route'>
                  <View className='trip-point'>
                    <View className='point-dot start'></View>
                    <Text className='point-text'>{trip.startPoint}</Text>
                  </View>
                  <View className='trip-arrow'>→</View>
                  <View className='trip-point'>
                    <View className='point-dot end'></View>
                    <Text className='point-text'>{trip.endPoint}</Text>
                  </View>
                </View>

                <View className='trip-info'>
                  <Text className='trip-time'>🕐 {formatTime(trip.departureTime)}</Text>
                  <Text className='trip-seats'>💺 剩{trip.availableSeats}座</Text>
                  <Text className='trip-price'>¥{formatMoney(trip.pricePerSeat)}/位</Text>
                </View>

                <View className='trip-driver'>
                  <Image
                    className='driver-avatar'
                    src={trip.driver?.avatar || 'https://img.icons8.com/color/96/user-male-circle--v1.png'}
                  />
                  <View className='driver-info'>
                    <Text className='driver-name'>{trip.driver?.nickname || '司机'}</Text>
                    <View className={`reputation-badge reputation-${trip.driver?.reputationLevel || 'bronze'}`}>
                      {getReputationLevel(trip.driver?.reputationLevel)}
                    </View>
                  </View>
                  {trip.matchScore && (
                    <View className='match-score'>匹配度 {trip.matchScore}%</View>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    )
  }
}
