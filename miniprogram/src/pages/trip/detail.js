import { Component } from 'react'
import { View, Text, Image, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { getTripDetail, requestJoinTrip, startTrip, completeTrip, cancelTrip, handlePassengerRequest, boardPassenger } from '../../services/trip'
import { createOrder, payOrder } from '../../services/order'
import { formatTime, formatDateTime, formatMoney, getStatusText, getReputationLevel } from '../../utils'
import './detail.scss'

export default class TripDetail extends Component {
  config = {
    navigationBarTitleText: '行程详情'
  }

  state = {
    trip: null,
    userRole: 'passenger',
    loading: true,
    isDriver: false,
    isPassenger: false,
    myBooking: null
  }

  componentDidMount() {
    this.loadData()
  }

  loadData = async () => {
    const id = this.$router.params.id
    const userInfo = Taro.getStorageSync('userInfo') || {}
    try {
      const trip = await getTripDetail(id)
      const myBooking = (trip.passengers || []).find(p => p.passengerId === userInfo.id)
      this.setState({
        trip,
        userRole: userInfo.role || 'passenger',
        isDriver: trip.driverId === userInfo.id,
        isPassenger: !!myBooking,
        myBooking
      })
    } catch (e) {
      console.error(e)
    }
    this.setState({ loading: false })
  }

  requestJoin = async () => {
    const token = Taro.getStorageSync('token')
    if (!token) {
      Taro.navigateTo({ url: '/pages/user/login' })
      return
    }

    try {
      const res = await Taro.showModal({
        title: '确认加入',
        content: `确认申请加入此行程？费用 ¥${formatMoney(this.state.trip.pricePerSeat)}/人`,
        confirmText: '确认申请'
      })
      if (!res.confirm) return

      await requestJoinTrip(this.state.trip.id, { seatsBooked: 1 })
      Taro.showToast({ title: '申请已发送', icon: 'success' })
      this.loadData()
    } catch (e) {
      console.error(e)
    }
  }

  createAndPayOrder = async () => {
    try {
      const order = await createOrder({ tripPassengerId: this.state.myBooking.id })
      const res = await Taro.showModal({
        title: '确认支付',
        content: `支付金额 ¥${formatMoney(order.payAmount)}`,
        confirmText: '确认支付'
      })
      if (!res.confirm) return

      await payOrder({ orderId: order.id, paymentMethod: 'wechat' })
      Taro.showToast({ title: '支付成功', icon: 'success' })
      setTimeout(() => {
        Taro.redirectTo({ url: `/pages/order/detail?id=${order.id}` })
      }, 1500)
    } catch (e) {
      console.error(e)
    }
  }

  handleStartTrip = async () => {
    try {
      const res = await Taro.showModal({
        title: '确认开始',
        content: '所有乘客已上车，开始行程？'
      })
      if (!res.confirm) return
      await startTrip(this.state.trip.id)
      Taro.showToast({ title: '行程已开始', icon: 'success' })
      this.loadData()
    } catch (e) {
      console.error(e)
    }
  }

  handleCompleteTrip = async () => {
    try {
      const res = await Taro.showModal({
        title: '确认完成',
        content: '已到达目的地，完成行程？'
      })
      if (!res.confirm) return
      await completeTrip(this.state.trip.id)
      Taro.showToast({ title: '行程已完成', icon: 'success' })
      this.loadData()
    } catch (e) {
      console.error(e)
    }
  }

  handleCancelTrip = async () => {
    try {
      const res = await Taro.showModal({
        title: '确认取消',
        content: '取消行程后将通知所有乘客',
        confirmText: '确认取消',
        confirmColor: '#ff4d4f'
      })
      if (!res.confirm) return
      await cancelTrip(this.state.trip.id, { reason: '司机取消' })
      Taro.showToast({ title: '已取消', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 1500)
    } catch (e) {
      console.error(e)
    }
  }

  handlePassenger = async (tpId, action) => {
    try {
      await handlePassengerRequest(tpId, { action, rejectReason: action === 'reject' ? '司机拒绝' : undefined })
      Taro.showToast({ title: action === 'accept' ? '已通过' : '已拒绝', icon: 'success' })
      this.loadData()
    } catch (e) {
      console.error(e)
    }
  }

  handleBoard = async (tpId) => {
    try {
      await boardPassenger(tpId)
      Taro.showToast({ title: '已确认上车', icon: 'success' })
      this.loadData()
    } catch (e) {
      console.error(e)
    }
  }

  render() {
    const { trip, loading, isDriver, isPassenger, myBooking } = this.state

    if (loading) {
      return <View className='loading'>加载中...</View>
    }

    if (!trip) {
      return <View className='empty'>行程不存在</View>
    }

    const canJoin = !isDriver && !isPassenger && trip.status === 'matching' && trip.availableSeats > 0
    const canPay = isPassenger && myBooking?.status === 'confirmed'
    const canStart = isDriver && trip.status === 'confirmed'
    const canComplete = isDriver && trip.status === 'in_progress'
    const canCancel = isDriver && ['matching', 'pending', 'confirmed'].includes(trip.status)

    return (
      <View className='detail-page'>
        <ScrollView className='content' scrollY>
          <View className='route-card'>
            <View className='status-bar'>
              <Text className='status-tag'>{getStatusText(trip.status)}</Text>
              <Text className='trip-no'>{trip.tripNo}</Text>
            </View>

            <View className='route-line'>
              <View className='route-point'>
                <View className='dot green'></View>
                <Text className='point-text'>{trip.startPoint}</Text>
              </View>
              <View className='line-dashed'></View>
              <View className='route-point'>
                <View className='dot red'></View>
                <Text className='point-text'>{trip.endPoint}</Text>
              </View>
            </View>

            <View className='route-info'>
              <View className='info-item'>
                <Text className='label'>出发时间</Text>
                <Text className='value'>{formatDateTime(trip.departureTime)}</Text>
              </View>
              <View className='info-item'>
                <Text className='label'>剩余座位</Text>
                <Text className='value highlight'>{trip.availableSeats}/{trip.totalSeats}座</Text>
              </View>
              <View className='info-item'>
                <Text className='label'>预估距离</Text>
                <Text className='value'>{trip.estimatedDistance || '--'}km</Text>
              </View>
              <View className='info-item'>
                <Text className='label'>价格</Text>
                <Text className='value price'>¥{formatMoney(trip.pricePerSeat)}/人</Text>
              </View>
            </View>
          </View>

          <View className='driver-card'>
            <Text className='card-title'>司机信息</Text>
            <View className='driver-info'>
              <Image
                className='avatar'
                src={trip.driver?.avatar || 'https://img.icons8.com/color/96/user-male-circle--v1.png'}
              />
              <View className='info'>
                <View className='name-row'>
                  <Text className='name'>{trip.driver?.nickname}</Text>
                  <View className={`reputation-badge reputation-${trip.driver?.reputationLevel || 'bronze'}`}>
                    {getReputationLevel(trip.driver?.reputationLevel)}
                  </View>
                </View>
                <Text className='sub-info'>信誉分 {trip.driver?.reputationScore} · 完成率 {trip.driver?.completionRate}%</Text>
                <Text className='car-info'>{trip.driver?.carModel} · {trip.driver?.carColor} · {trip.driver?.carPlate}</Text>
              </View>
            </View>
          </View>

          {trip.passengers && trip.passengers.length > 0 && (
            <View className='passengers-card'>
              <Text className='card-title'>乘客名单 ({trip.passengers.length})</Text>
              {trip.passengers.map(tp => (
                <View key={tp.id} className='passenger-item'>
                  <View className='passenger-info'>
                    <Image
                      className='avatar-sm'
                      src={tp.passenger?.avatar || 'https://img.icons8.com/color/96/user-male-circle--v1.png'}
                    />
                    <View>
                      <Text className='name'>{tp.passenger?.nickname}</Text>
                      <Text className='status-text'>{getStatusText(tp.status)} · {tp.seatsBooked}座</Text>
                    </View>
                  </View>
                  {isDriver && tp.status === 'requested' && (
                    <View className='action-btns'>
                      <Button className='btn-sm btn-accept' size='mini' onClick={() => this.handlePassenger(tp.id, 'accept')}>通过</Button>
                      <Button className='btn-sm btn-reject' size='mini' onClick={() => this.handlePassenger(tp.id, 'reject')}>拒绝</Button>
                    </View>
                  )}
                  {isDriver && tp.status === 'in_trip' && (
                    <Button className='btn-sm btn-primary' size='mini' onClick={() => this.handleBoard(tp.id)}>确认上车</Button>
                  )}
                </View>
              ))}
            </View>
          )}

          {trip.description && (
            <View className='desc-card'>
              <Text className='card-title'>行程备注</Text>
              <Text className='desc'>{trip.description}</Text>
              <View className='tags'>
                {trip.allowSmoking && <View className='tag tag-warning'>允许吸烟</View>}
                {trip.allowPets && <View className='tag tag-primary'>可带宠物</View>}
                {trip.allowLuggage && <View className='tag tag-success'>可放大件行李</View>}
              </View>
            </View>
          )}
        </ScrollView>

        <View className='footer'>
          {canJoin && (
            <Button className='footer-btn primary' onClick={this.requestJoin}>申请加入 · ¥{formatMoney(trip.pricePerSeat)}</Button>
          )}
          {canPay && (
            <Button className='footer-btn primary' onClick={this.createAndPayOrder}>去支付 · ¥{formatMoney(myBooking.totalPrice || trip.pricePerSeat)}</Button>
          )}
          {isPassenger && !canPay && myBooking?.status === 'requested' && (
            <Button className='footer-btn disabled' disabled>等待司机确认</Button>
          )}
          {canStart && (
            <Button className='footer-btn primary' onClick={this.handleStartTrip}>开始行程</Button>
          )}
          {canComplete && (
            <Button className='footer-btn primary' onClick={this.handleCompleteTrip}>完成行程</Button>
          )}
          {canCancel && (
            <Button className='footer-btn outline' onClick={this.handleCancelTrip}>取消行程</Button>
          )}
          {trip.status === 'completed' && (
            <Button className='footer-btn outline' onClick={() => Taro.navigateTo({ url: `/pages/review/create?orderId=${trip.id}` })}>去评价</Button>
          )}
        </View>
      </View>
    )
  }
}
