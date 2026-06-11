import { Component } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { getOrderList } from '../../services/order'
import { formatDateTime, formatMoney, getOrderStatusText, getPaymentStatusText } from '../../utils'
import './list.scss'

export default class OrderList extends Component {
  config = {
    navigationBarTitleText: '我的订单',
    enablePullDownRefresh: true
  }

  state = {
    activeTab: 'all',
    orders: [],
    loading: false
  }

  tabs = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待支付' },
    { key: 'confirmed', label: '进行中' },
    { key: 'completed', label: '已完成' },
    { key: 'cancelled', label: '已取消' }
  ]

  componentDidMount() {
    this.loadOrders()
  }

  onPullDownRefresh() {
    this.loadOrders()
    Taro.stopPullDownRefresh()
  }

  loadOrders = async () => {
    this.setState({ loading: true })
    const userInfo = Taro.getStorageSync('userInfo') || {}
    const params = { pageSize: 50 }
    if (this.state.activeTab !== 'all') {
      params.status = this.state.activeTab
    }
    try {
      const res = await getOrderList(params)
      this.setState({ orders: res.list || [] })
    } catch (e) {
      console.error(e)
    }
    this.setState({ loading: false })
  }

  switchTab = (key) => {
    this.setState({ activeTab: key }, () => this.loadOrders())
  }

  goDetail = (id) => {
    Taro.navigateTo({ url: `/pages/order/detail?id=${id}` })
  }

  goReview = (orderId) => {
    Taro.navigateTo({ url: `/pages/review/create?orderId=${orderId}` })
  }

  render() {
    const { activeTab, orders, loading } = this.state

    return (
      <View className='order-list-page'>
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

        <ScrollView className='content' scrollY>
          {loading ? (
            <View className='loading'>加载中...</View>
          ) : orders.length === 0 ? (
            <View className='empty'>
              <Text className='empty-icon'>📋</Text>
              <Text>暂无订单</Text>
            </View>
          ) : (
            orders.map(order => (
              <View key={order.id} className='order-card' onClick={() => this.goDetail(order.id)}>
                <View className='header'>
                  <Text className='order-no'>订单号: {order.orderNo}</Text>
                  <Text className={`status status-${order.orderStatus}`}>
                    {getOrderStatusText(order.orderStatus)}
                  </Text>
                </View>

                <View className='route'>
                  <View className='point'>
                    <View className='dot start'></View>
                    <Text>{order.Trip?.startPoint || '--'}</Text>
                  </View>
                  <View className='line'></View>
                  <View className='point'>
                    <View className='dot end'></View>
                    <Text>{order.Trip?.endPoint || '--'}</Text>
                  </View>
                </View>

                <View className='info'>
                  <Text>出发: {formatDateTime(order.Trip?.departureTime)}</Text>
                  <Text className='price'>¥{formatMoney(order.payAmount)}</Text>
                </View>

                <View className='footer'>
                  <Text className='payment'>{getPaymentStatusText(order.paymentStatus)}</Text>
                  <View className='actions'>
                    {order.orderStatus === 'pending' && order.paymentStatus === 'unpaid' && (
                      <View className='btn primary' onClick={(e) => { e.stopPropagation(); Taro.navigateTo({ url: `/pages/order/detail?id=${order.id}` }) }}>去支付</View>
                    )}
                    {order.orderStatus === 'completed' && (
                      <View className='btn primary' onClick={(e) => { e.stopPropagation(); this.goReview(order.id) }}>去评价</View>
                    )}
                    <View className='btn outline' onClick={(e) => { e.stopPropagation(); this.goDetail(order.id) }}>详情</View>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    )
  }
}
