import { Component } from 'react'
import { View, Text, Image, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { getOrderDetail, payOrder, cancelOrder, requestInvoice, getAgreement } from '../../services/order'
import { formatDateTime, formatMoney, getOrderStatusText, getPaymentStatusText, getReputationLevel } from '../../utils'
import './detail.scss'

export default class OrderDetail extends Component {
  config = {
    navigationBarTitleText: '订单详情'
  }

  state = {
    order: null,
    agreement: null,
    loading: true,
    isDriver: false,
    isPassenger: false
  }

  componentDidMount() {
    this.loadData()
  }

  loadData = async () => {
    const id = this.$router.params.id
    const userInfo = Taro.getStorageSync('userInfo') || {}
    try {
      const order = await getOrderDetail(id)
      this.setState({
        order,
        isDriver: order.driverId === userInfo.id,
        isPassenger: order.passengerId === userInfo.id
      })
      if (order.invoiceRequested) {
        try {
          const agreement = await getAgreement(id)
          this.setState({ agreement })
        } catch (e) {}
      }
    } catch (e) {
      console.error(e)
    }
    this.setState({ loading: false })
  }

  handlePay = async () => {
    try {
      const res = await Taro.showModal({
        title: '确认支付',
        content: `支付金额 ¥${formatMoney(this.state.order.payAmount)}`,
        confirmText: '确认支付'
      })
      if (!res.confirm) return

      await payOrder({ orderId: this.state.order.id, paymentMethod: 'wechat' })
      Taro.showToast({ title: '支付成功', icon: 'success' })
      this.loadData()
    } catch (e) {
      console.error(e)
    }
  }

  handleCancel = async () => {
    try {
      const res = await Taro.showModal({
        title: '确认取消',
        content: '确定要取消该订单吗？',
        confirmColor: '#ff4d4f'
      })
      if (!res.confirm) return

      await cancelOrder(this.state.order.id, { reason: '用户取消' })
      Taro.showToast({ title: '已取消', icon: 'success' })
      this.loadData()
    } catch (e) {
      console.error(e)
    }
  }

  handleInvoice = async () => {
    Taro.navigateTo({
      url: `/pages/user/invoice?orderId=${this.state.order.id}`
    })
  }

  handleReview = () => {
    Taro.navigateTo({ url: `/pages/review/create?orderId=${this.state.order.id}` })
  }

  handleAgreement = () => {
    Taro.navigateTo({ url: `/pages/user/agreement?orderId=${this.state.order.id}` })
  }

  render() {
    const { order, agreement, loading, isPassenger } = this.state

    if (loading) {
      return <View className='loading'>加载中...</View>
    }

    if (!order) {
      return <View className='empty'>订单不存在</View>
    }

    const canPay = isPassenger && order.orderStatus === 'pending' && order.paymentStatus === 'unpaid'
    const canCancel = ['pending', 'confirmed'].includes(order.orderStatus)
    const canReview = order.orderStatus === 'completed'
    const canInvoice = order.paymentStatus === 'paid'

    return (
      <View className='order-detail-page'>
        <ScrollView className='content' scrollY>
          <View className='status-card'>
            <Text className={`status-text status-${order.orderStatus}`}>
              {getOrderStatusText(order.orderStatus)}
            </Text>
            <Text className='payment-text'>{getPaymentStatusText(order.paymentStatus)}</Text>
          </View>

          <View className='route-card'>
            <View className='point'>
              <View className='dot start'></View>
              <Text className='point-text'>{order.Trip?.startPoint}</Text>
            </View>
            <View className='line'></View>
            <View className='point'>
              <View className='dot end'></View>
              <Text className='point-text'>{order.Trip?.endPoint}</Text>
            </View>
            <View className='info'>
              <Text>出发时间: {formatDateTime(order.Trip?.departureTime)}</Text>
              <Text>座位数: {order.seatCount}座</Text>
            </View>
          </View>

          <View className='user-card'>
            <Text className='card-title'>司乘信息</Text>
            <View className='user-row'>
              <Image
                className='avatar'
                src={order.driver?.avatar || 'https://img.icons8.com/color/96/user-male-circle--v1.png'}
              />
              <View className='user-info'>
                <View className='name-row'>
                  <Text className='name'>{order.driver?.nickname}</Text>
                  <View className={`reputation-badge reputation-${order.driver?.reputationLevel || 'bronze'}`}>
                    {getReputationLevel(order.driver?.reputationLevel)}
                  </View>
                  <Text className='role-tag'>司机</Text>
                </View>
                <Text className='sub'>{order.driver?.carModel} · {order.driver?.carPlate}</Text>
              </View>
            </View>

            <View className='divider'></View>

            <View className='user-row'>
              <Image
                className='avatar'
                src={order.passenger?.avatar || 'https://img.icons8.com/color/96/user-male-circle--v1.png'}
              />
              <View className='user-info'>
                <View className='name-row'>
                  <Text className='name'>{order.passenger?.nickname}</Text>
                  <Text className='role-tag passenger'>乘客</Text>
                </View>
                <Text className='sub'>预订{order.seatCount}座</Text>
              </View>
            </View>
          </View>

          <View className='fee-card'>
            <Text className='card-title'>费用明细</Text>
            <View className='fee-row'>
              <Text>座位费</Text>
              <Text>¥{formatMoney(order.totalAmount)}</Text>
            </View>
            <View className='fee-row'>
              <Text>平台服务费</Text>
              <Text>¥{formatMoney(order.platformFee)}</Text>
            </View>
            <View className='fee-row total'>
              <Text>实付金额</Text>
              <Text className='total-amount'>¥{formatMoney(order.payAmount)}</Text>
            </View>
          </View>

          <View className='info-card'>
            <View className='info-row'>
              <Text className='label'>订单编号</Text>
              <Text className='value'>{order.orderNo}</Text>
            </View>
            <View className='info-row'>
              <Text className='label'>创建时间</Text>
              <Text className='value'>{formatDateTime(order.createdAt)}</Text>
            </View>
            {order.paidAt && (
              <View className='info-row'>
                <Text className='label'>支付时间</Text>
                <Text className='value'>{formatDateTime(order.paidAt)}</Text>
              </View>
            )}
            {order.transactionId && (
              <View className='info-row'>
                <Text className='label'>交易单号</Text>
                <Text className='value'>{order.transactionId}</Text>
              </View>
            )}
          </View>

          <View className='extra-actions'>
            <View className='extra-item' onClick={this.handleAgreement}>
              <Text>📝 电子拼车协议</Text>
              <Text className='arrow'>›</Text>
            </View>
            {canInvoice && (
              <View className='extra-item' onClick={this.handleInvoice}>
                <Text>🧾 申请电子发票</Text>
                <Text className='arrow'>›</Text>
              </View>
            )}
          </View>
        </ScrollView>

        <View className='footer'>
          {canPay && (
            <Button className='footer-btn primary' onClick={this.handlePay}>去支付 · ¥{formatMoney(order.payAmount)}</Button>
          )}
          {canCancel && (
            <Button className='footer-btn outline' onClick={this.handleCancel}>取消订单</Button>
          )}
          {canReview && (
            <Button className='footer-btn primary' onClick={this.handleReview}>去评价</Button>
          )}
        </View>
      </View>
    )
  }
}
