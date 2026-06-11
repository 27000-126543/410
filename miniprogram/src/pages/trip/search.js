import { Component } from 'react'
import { View, Text, Input, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { searchTrips } from '../../services/trip'
import { getFavoriteRoutes } from '../../services/user'
import { formatTime, getReputationLevel, formatMoney } from '../../utils'
import './search.scss'

export default class Search extends Component {
  config = {
    navigationBarTitleText: '找顺风车'
  }

  state = {
    startPoint: '',
    startLat: null,
    startLng: null,
    endPoint: '',
    endLat: null,
    endLng: null,
    departureDate: '',
    results: [],
    favoriteRoutes: [],
    loading: false,
    searched: false
  }

  componentDidMount() {
    this.loadFavorites()
  }

  loadFavorites = async () => {
    try {
      const res = await getFavoriteRoutes()
      this.setState({ favoriteRoutes: res })
    } catch (e) {
      console.error(e)
    }
  }

  chooseLocation = async (type) => {
    try {
      const res = await Taro.chooseLocation()
      const key = type === 'start' ? 'startPoint' : 'endPoint'
      const latKey = type === 'start' ? 'startLat' : 'endLat'
      const lngKey = type === 'start' ? 'startLng' : 'endLng'
      this.setState({
        [key]: res.name || res.address,
        [latKey]: res.latitude,
        [lngKey]: res.longitude
      })
    } catch (e) {
      if (e.errMsg && e.errMsg.includes('auth')) {
        Taro.showModal({
          title: '提示',
          content: '需要获取您的位置权限',
          showCancel: false
        })
      }
    }
  }

  chooseDate = () => {
    Taro.showActionSheet({
      itemList: ['今天', '明天', '后天', '选择日期']
    }).then(res => {
      const now = new Date()
      let date
      if (res.tapIndex === 0) date = now
      else if (res.tapIndex === 1) date = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      else if (res.tapIndex === 2) date = new Date(now.getTime() + 48 * 60 * 60 * 1000)
      else {
        Taro.navigateTo({ url: '/pages/common/date-picker' })
        return
      }
      this.setState({ departureDate: date.toISOString().split('T')[0] })
    }).catch(() => {})
  }

  search = async () => {
    const { startPoint, startLat, startLng, endPoint, endLat, endLng, departureDate } = this.state
    if (!startPoint || !endPoint) {
      Taro.showToast({ title: '请选择起点和终点', icon: 'none' })
      return
    }
    if (!startLat || !endLat) {
      Taro.showToast({ title: '请选择具体位置', icon: 'none' })
      return
    }

    this.setState({ loading: true, searched: true })
    try {
      const params = {
        startLat, startLng,
        endLat, endLng,
        radius: 10
      }
      if (departureDate) params.departureTime = departureDate
      const res = await searchTrips(params)
      this.setState({ results: res.list || [] })
    } catch (e) {
      console.error(e)
    }
    this.setState({ loading: false })
  }

  goDetail = (id) => {
    Taro.navigateTo({ url: `/pages/trip/detail?id=${id}` })
  }

  useFavoriteRoute = (route) => {
    this.setState({
      startPoint: route.startPoint,
      startLat: route.startLat,
      startLng: route.startLng,
      endPoint: route.endPoint,
      endLat: route.endLat,
      endLng: route.endLng
    })
  }

  render() {
    const { startPoint, endPoint, departureDate, results, favoriteRoutes, loading, searched } = this.state

    return (
      <View className='search-page'>
        <View className='search-form'>
          <View className='location-row'>
            <View className='location-col' onClick={() => this.chooseLocation('start')}>
              <View className='dot green'></View>
              <Input
                className='location-input'
                placeholder='请选择出发地'
                value={startPoint}
                disabled
              />
            </View>
            <View className='exchange' onClick={() => {
              const s = startPoint, sl = this.state.startLat, sg = this.state.startLng
              this.setState({
                startPoint: endPoint,
                startLat: this.state.endLat,
                startLng: this.state.endLng,
                endPoint: s,
                endLat: sl,
                endLng: sg
              })
            }}>⇅</View>
            <View className='location-col' onClick={() => this.chooseLocation('end')}>
              <View className='dot red'></View>
              <Input
                className='location-input'
                placeholder='请选择目的地'
                value={endPoint}
                disabled
              />
            </View>
          </View>

          <View className='date-row' onClick={this.chooseDate}>
            <Text className='icon'>📅</Text>
            <Text className={departureDate ? 'date-text' : 'placeholder'}>
              {departureDate || '请选择出发日期'}
            </Text>
          </View>

          <View className='search-btn' onClick={this.search}>
            {loading ? '搜索中...' : '🔍 搜索顺风车'}
          </View>
        </View>

        {favoriteRoutes.length > 0 && !searched && (
          <View className='favorites'>
            <Text className='favorites-title'>⭐ 常用路线</Text>
            <ScrollView className='favorites-list' scrollX>
              {favoriteRoutes.map(route => (
                <View
                  key={route.id}
                  className='favorite-item'
                  onClick={() => this.useFavoriteRoute(route)}
                >
                  <Text className='route-name'>{route.routeName || route.startPoint}</Text>
                  <Text className='route-desc'>{route.startPoint} → {route.endPoint}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View className='results'>
          {loading ? (
            <View className='loading'>搜索中...</View>
          ) : searched && results.length === 0 ? (
            <View className='empty'>
              <Text className='empty-icon'>😔</Text>
              <Text>暂无匹配的行程</Text>
              <Text className='tip'>试试调整搜索条件或发布自己的行程</Text>
            </View>
          ) : (
            results.map(trip => (
              <View key={trip.id} className='result-card' onClick={() => this.goDetail(trip.id)}>
                <View className='route'>
                  <View className='point'>
                    <View className='dot green'></View>
                    <Text>{trip.startPoint}</Text>
                  </View>
                  <View className='arrow-line'>
                    <Text className='arrow'>→</Text>
                    <Text className='distance'>{trip.estimatedDistance || '--'}km</Text>
                  </View>
                  <View className='point'>
                    <View className='dot red'></View>
                    <Text>{trip.endPoint}</Text>
                  </View>
                </View>

                <View className='info'>
                  <Text className='time'>🕐 {formatTime(trip.departureTime)}</Text>
                  <Text className='seats'>💺 剩{trip.availableSeats}/{trip.totalSeats}座</Text>
                  <Text className='price'>¥{formatMoney(trip.pricePerSeat)}</Text>
                </View>

                <View className='driver'>
                  <Image
                    className='avatar'
                    src={trip.driver?.avatar || 'https://img.icons8.com/color/96/user-male-circle--v1.png'}
                  />
                  <View className='driver-info'>
                    <Text className='name'>{trip.driver?.nickname}</Text>
                    <View className={`reputation-badge reputation-${trip.driver?.reputationLevel || 'bronze'}`}>
                      {getReputationLevel(trip.driver?.reputationLevel)}
                    </View>
                  </View>
                  <View className='match'>
                    <Text className='match-score'>匹配度 {trip.matchScore || 85}%</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    )
  }
}
