import { Component } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { getMyTrips, getTripList } from '../../services/trip'
import { formatTime, formatMoney, getStatusText } from '../../utils'
import './myTrips.scss'

export default class MyTrips extends Component {
  config = {
    navigationBarTitleText: '我的行程',
    enablePullDownRefresh: true
  }

  state = {
    activeTab: 'driving',
    drivingTrips: [],
    passengerTrips: [],
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
    const userInfo = Taro.getStorageSync('userInfo') || {}
    try {
      const [driving, passenger] = await Promise.all([
        getMyTrips({ pageSize: 50 }).catch(() => ({ list: [] })),
        getTripList({ passengerId: userInfo.id, pageSize: 50 }).catch(() => ({ list: [] }))
      ])
      this.setState({
        drivingTrips: driving.list || [],
        passengerTrips: passenger.list || []
      })
    } catch (e) {
      console.error(e)
    }
    this.setState({ loading: false })
  }

  switchTab = (tab) => {
    this.setState({ activeTab: tab })
  }

  goDetail = (id) => {
    Taro.navigateTo({ url: `/pages/trip/detail?id=${id}` })
  }

  renderTripCard = (trip, isDriver) => (
    <View key={trip.id} className='trip-card' onClick={() => this.goDetail(trip.id)}>
      <View className='header'>
        <Text className={`status status-${trip.status}`}>{getStatusText(trip.status)}</Text>
        <Text className='time'>{formatTime(trip.departureTime)}</Text>
      </View>

      <View className='route'>
        <View className='point'>
          <View className='dot start'></View>
          <Text className='point-text'>{trip.startPoint}</Text>
        </View>
        <View className='line'></View>
        <View className='point'>
          <View className='dot end'></View>
          <Text className='point-text'>{trip.endPoint}</Text>
        </View>
      </View>

      <View className='footer'>
        <View className='info'>
          <Text className='seats'>剩{trip.availableSeats}/{trip.totalSeats}座</Text>
          <Text className='price'>¥{formatMoney(trip.pricePerSeat)}/人</Text>
        </View>
        {isDriver ? (
          <Text className='role-tag driver'>我是司机</Text>
        ) : (
          <Text className='role-tag passenger'>我是乘客</Text>
        )}
      </View>
    </View>
  )

  render() {
    const { activeTab, drivingTrips, passengerTrips } = this.state
    const list = activeTab === 'driving' ? drivingTrips : passengerTrips

    return (
      <View className='my-trips-page'>
        <View className='tabs'>
          <View
            className={`tab ${activeTab === 'driving' ? 'active' : ''}`}
            onClick={() => this.switchTab('driving')}
          >
            我发布的
            <Text className='count'>{drivingTrips.length}</Text>
          </View>
          <View
            className={`tab ${activeTab === 'passenger' ? 'active' : ''}`}
            onClick={() => this.switchTab('passenger')}
          >
            我乘坐的
            <Text className='count'>{passengerTrips.length}</Text>
          </View>
        </View>

        <ScrollView className='content' scrollY>
          {list.length === 0 ? (
            <View className='empty'>
              <Text className='empty-icon'>🚗</Text>
              <Text>暂无行程</Text>
              <Text className='tip'>去发布或搜索行程吧</Text>
            </View>
          ) : (
            <View className='trip-list'>
              {list.map(trip => this.renderTripCard(trip, activeTab === 'driving'))}
            </View>
          )}
        </ScrollView>
      </View>
    )
  }
}
