import { Component } from 'react'
import { View, Text, Input, Button, Switch, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { publishTrip } from '../../services/trip'
import { getCurrentUser, updateDriverInfo } from '../../services/auth'
import './publish.scss'

export default class Publish extends Component {
  config = {
    navigationBarTitleText: '发布行程'
  }

  state = {
    startPoint: '',
    startLat: null,
    startLng: null,
    endPoint: '',
    endLat: null,
    endLng: null,
    departureTime: '',
    totalSeats: 3,
    pricePerSeat: '',
    description: '',
    estimatedDistance: '',
    estimatedDuration: '',
    allowSmoking: false,
    allowPets: false,
    allowLuggage: true,
    isDriver: false,
    loading: false
  }

  async componentDidMount() {
    try {
      const user = await getCurrentUser()
      this.setState({
        isDriver: user.role === 'driver' || user.role === 'admin',
        totalSeats: user.carSeats ? Math.min(user.carSeats - 1, 3) : 3
      })
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
      console.error(e)
    }
  }

  chooseTime = async () => {
    try {
      const res = await Taro.showActionSheet({
        itemList: ['立即出发', '1小时后', '2小时后', '3小时后', '明天上午', '明天下午', '自定义时间']
      })
      const now = new Date()
      let time
      switch (res.tapIndex) {
        case 0:
          time = new Date(now.getTime() + 30 * 60 * 1000)
          break
        case 1:
          time = new Date(now.getTime() + 60 * 60 * 1000)
          break
        case 2:
          time = new Date(now.getTime() + 2 * 60 * 60 * 1000)
          break
        case 3:
          time = new Date(now.getTime() + 3 * 60 * 60 * 1000)
          break
        case 4:
          time = new Date(now.getTime() + 24 * 60 * 60 * 1000)
          time.setHours(9, 0, 0, 0)
          break
        case 5:
          time = new Date(now.getTime() + 24 * 60 * 60 * 1000)
          time.setHours(14, 0, 0, 0)
          break
        default:
          Taro.showToast({ title: '请选择时间', icon: 'none' })
          return
      }
      this.setState({ departureTime: time.toISOString() })
    } catch (e) {}
  }

  onInput = (key, e) => {
    this.setState({ [key]: e.detail.value })
  }

  onSeatsChange = (delta) => {
    let seats = this.state.totalSeats + delta
    seats = Math.max(1, Math.min(7, seats))
    this.setState({ totalSeats: seats })
  }

  publish = async () => {
    const {
      startPoint, startLat, startLng,
      endPoint, endLat, endLng,
      departureTime, totalSeats, pricePerSeat,
      description, estimatedDistance, estimatedDuration,
      allowSmoking, allowPets, allowLuggage
    } = this.state

    if (!startPoint || !endPoint) {
      Taro.showToast({ title: '请选择起点和终点', icon: 'none' })
      return
    }
    if (!departureTime) {
      Taro.showToast({ title: '请选择出发时间', icon: 'none' })
      return
    }
    if (!pricePerSeat || parseFloat(pricePerSeat) <= 0) {
      Taro.showToast({ title: '请输入合理的价格', icon: 'none' })
      return
    }

    if (!this.state.isDriver) {
      try {
        await Taro.showModal({
          title: '提示',
          content: '您还未完善司机信息，是否去完善？',
          success: async (res) => {
            if (res.confirm) {
              Taro.navigateTo({ url: '/pages/user/profile' })
            }
          }
        })
        return
      } catch (e) {}
    }

    this.setState({ loading: true })
    try {
      const res = await publishTrip({
        startPoint, startLat, startLng,
        endPoint, endLat, endLng,
        departureTime,
        totalSeats,
        pricePerSeat: parseFloat(pricePerSeat),
        description,
        estimatedDistance: estimatedDistance ? parseFloat(estimatedDistance) : null,
        estimatedDuration: estimatedDuration ? parseInt(estimatedDuration) : null,
        allowSmoking,
        allowPets,
        allowLuggage
      })
      Taro.showToast({ title: '发布成功', icon: 'success' })
      setTimeout(() => {
        Taro.redirectTo({ url: `/pages/trip/detail?id=${res.id}` })
      }, 1500)
    } catch (e) {
      console.error(e)
    }
    this.setState({ loading: false })
  }

  formatDepartureTime = () => {
    if (!this.state.departureTime) return ''
    const d = new Date(this.state.departureTime)
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }

  render() {
    const {
      startPoint, endPoint, totalSeats, pricePerSeat,
      description, allowSmoking, allowPets, allowLuggage, loading
    } = this.state

    return (
      <View className='publish-page'>
        <View className='section'>
          <View className='form-item location-item' onClick={() => this.chooseLocation('start')}>
            <View className='label'>
              <View className='dot green'></View>
              <Text>出发地</Text>
            </View>
            <Text className={startPoint ? 'value' : 'placeholder'}>
              {startPoint || '请选择出发地'}
            </Text>
          </View>

          <View className='form-item location-item' onClick={() => this.chooseLocation('end')}>
            <View className='label'>
              <View className='dot red'></View>
              <Text>目的地</Text>
            </View>
            <Text className={endPoint ? 'value' : 'placeholder'}>
              {endPoint || '请选择目的地'}
            </Text>
          </View>

          <View className='form-item' onClick={this.chooseTime}>
            <Text className='label'>出发时间</Text>
            <Text className={this.state.departureTime ? 'value' : 'placeholder'}>
              {this.formatDepartureTime() || '请选择出发时间'}
            </Text>
          </View>

          <View className='form-item'>
            <Text className='label'>座位数</Text>
            <View className='stepper'>
              <View
                className={`stepper-btn ${totalSeats <= 1 ? 'disabled' : ''}`}
                onClick={() => this.onSeatsChange(-1)}
              >-</View>
              <Text className='stepper-value'>{totalSeats}</Text>
              <View
                className={`stepper-btn ${totalSeats >= 7 ? 'disabled' : ''}`}
                onClick={() => this.onSeatsChange(1)}
              >+</View>
              <Text className='unit'>座</Text>
            </View>
          </View>

          <View className='form-item'>
            <Text className='label'>每位价格</Text>
            <View className='price-input'>
              <Text className='currency'>¥</Text>
              <Input
                type='digit'
                placeholder='请输入'
                value={pricePerSeat}
                onInput={(e) => this.onInput('pricePerSeat', e)}
                className='input'
              />
              <Text className='unit'>元/人</Text>
            </View>
          </View>

          <View className='form-item'>
            <Text className='label'>备注说明</Text>
            <Textarea
              placeholder='例如：车内禁烟、可放行李、准时出发等'
              value={description}
              onInput={(e) => this.onInput('description', e)}
              className='textarea'
              maxLength={200}
            />
          </View>
        </View>

        <View className='section'>
          <Text className='section-title'>行程偏好</Text>

          <View className='switch-item'>
            <View>
              <Text className='switch-label'>允许吸烟</Text>
              <Text className='switch-desc'>车内是否允许吸烟</Text>
            </View>
            <Switch checked={allowSmoking} onChange={(e) => this.setState({ allowSmoking: e.detail.value })} />
          </View>

          <View className='switch-item'>
            <View>
              <Text className='switch-label'>允许宠物</Text>
              <Text className='switch-desc'>是否允许携带宠物</Text>
            </View>
            <Switch checked={allowPets} onChange={(e) => this.setState({ allowPets: e.detail.value })} />
          </View>

          <View className='switch-item'>
            <View>
              <Text className='switch-label'>大件行李</Text>
              <Text className='switch-desc'>是否允许放置大件行李</Text>
            </View>
            <Switch checked={allowLuggage} onChange={(e) => this.setState({ allowLuggage: e.detail.value })} />
          </View>
        </View>

        <View className='footer'>
          <Button
            className='submit-btn'
            loading={loading}
            onClick={this.publish}
          >发布行程</Button>
        </View>
      </View>
    )
  }
}
