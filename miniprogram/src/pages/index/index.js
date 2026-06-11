import { Component } from 'react'
import { View, Text, Image, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { getTripList } from '../../services/trip'
import { getUnreadCount } from '../../services/user'
import { formatTime, getReputationLevel, formatMoney } from '../../utils'
import './index.scss'

var Index = (function (_super) {
  function Index() {
    var _this = _super !== null && _super.apply(this, arguments) || this
    _this.config = {
      navigationBarTitleText: '社区拼车',
      enablePullDownRefresh: true
    }
    _this.state = {
      startPoint: '',
      endPoint: '',
      hotTrips: [],
      myCity: '北京',
      unreadCount: 0,
      loading: false
    }
    return _this
  }
  if (_super) Index.prototype = Object.create(_super.prototype)
  Index.prototype.constructor = Index

  Index.prototype.componentDidMount = function () {
    this.loadData()
  }

  Index.prototype.onPullDownRefresh = function () {
    this.loadData()
    Taro.stopPullDownRefresh()
  }

  Index.prototype.loadData = function () {
    var _this2 = this
    this.setState({ loading: true })
    var city = this.state.myCity
    var params = { city: city, pageSize: 10 }

    getTripList(params).then(function (data) {
      var trips = (data && data.list) || []
      _this2.setState({ hotTrips: trips })
    }).catch(function (err) {
      var msg = (err && err.message) || (err && err.errMsg) || ''
      console.warn('[首页] 行程列表获取失败，降级为空', msg)
      _this2.setState({ hotTrips: [] })
    })

    getUnreadCount().then(function (data) {
      var count = (data && data.unreadCount) || 0
      _this2.setState({ unreadCount: count })
    }).catch(function (err) {
      var msg = (err && err.message) || (err && err.errMsg) || ''
      console.warn('[首页] 未读消息获取失败，降级为0', msg)
      _this2.setState({ unreadCount: 0 })
    }).then(function () {
      _this2.setState({ loading: false })
    })
  }

  Index.prototype.goSearch = function () {
    Taro.navigateTo({ url: '/pages/trip/search' })
  }

  Index.prototype.goPublish = function () {
    var token = ''
    try { token = Taro.getStorageSync('token') || '' } catch (e) { token = '' }
    if (!token) {
      Taro.navigateTo({ url: '/pages/user/login' })
      return
    }
    Taro.navigateTo({ url: '/pages/trip/publish' })
  }

  Index.prototype.goTripDetail = function (id) {
    Taro.navigateTo({ url: '/pages/trip/detail?id=' + id })
  }

  Index.prototype.goNotifications = function () {
    Taro.navigateTo({ url: '/pages/user/notifications' })
  }

  Index.prototype.onInputStart = function (e) {
    var val = (e && e.detail && e.detail.value) || ''
    this.setState({ startPoint: val })
  }

  Index.prototype.onInputEnd = function (e) {
    var val = (e && e.detail && e.detail.value) || ''
    this.setState({ endPoint: val })
  }

  Index.prototype.render = function () {
    var _this3 = this
    var hotTrips = this.state.hotTrips || []
    var unreadCount = this.state.unreadCount || 0
    var city = this.state.myCity

    var emptyView = View({ className: 'empty', key: 'empty' }, [
      Text({ className: 'empty-icon', key: 'i' }, '🚗'),
      Text({ key: 't' }, '暂无行程，快去发布吧~')
    ])

    var tripCards = hotTrips.length === 0 ? emptyView : hotTrips.map(function (trip) {
      var driver = trip.driver || {}
      var avatar = driver.avatar || 'https://img.icons8.com/color/96/user-male-circle--v1.png'
      var nickname = driver.nickname || '司机'
      var repLevel = driver.reputationLevel || 'bronze'
      var badgeClass = 'reputation-badge reputation-' + repLevel

      var matchView = null
      if (trip.matchScore) {
        matchView = View({ className: 'match-score', key: 'match' }, '匹配度 ' + trip.matchScore + '%')
      }

      return View({
        key: trip.id,
        className: 'trip-card',
        onClick: function () { _this3.goTripDetail(trip.id) }
      }, [
        View({ className: 'trip-route', key: 'route' }, [
          View({ className: 'trip-point', key: 's' }, [
            View({ className: 'point-dot start', key: 'd' }),
            Text({ className: 'point-text', key: 't' }, trip.startPoint || '')
          ]),
          View({ className: 'trip-arrow', key: 'a' }, '→'),
          View({ className: 'trip-point', key: 'e' }, [
            View({ className: 'point-dot end', key: 'd' }),
            Text({ className: 'point-text', key: 't' }, trip.endPoint || '')
          ])
        ]),
        View({ className: 'trip-info', key: 'info' }, [
          Text({ className: 'trip-time', key: 't' }, '🕐 ' + formatTime(trip.departureTime)),
          Text({ className: 'trip-seats', key: 's' }, '💺 剩' + (trip.availableSeats || 0) + '座'),
          Text({ className: 'trip-price', key: 'p' }, '¥' + formatMoney(trip.pricePerSeat) + '/位')
        ]),
        View({ className: 'trip-driver', key: 'driver' }, [
          Image({ className: 'driver-avatar', key: 'img', src: avatar }),
          View({ className: 'driver-info', key: 'di' }, [
            Text({ className: 'driver-name', key: 'n' }, nickname),
            View({ className: badgeClass, key: 'b' }, getReputationLevel(repLevel))
          ]),
          matchView
        ])
      ])
    })

    var badgeView = null
    if (unreadCount > 0) {
      var showCount = unreadCount > 99 ? '99+' : unreadCount
      badgeView = View({ className: 'badge', key: 'bd' }, showCount)
    }

    return View({ className: 'index-page' }, [
      View({ className: 'header', key: 'h' }, [
        View({ className: 'location', key: 'loc' }, [
          Text({ className: 'icon', key: 'i' }, '📍'),
          Text({ className: 'city', key: 'c' }, city)
        ]),
        View({ className: 'notification', key: 'notif', onClick: function () { _this3.goNotifications() } }, [
          Text({ className: 'icon', key: 'i' }, '🔔'),
          badgeView
        ])
      ]),
      View({ className: 'search-card', key: 'sc', onClick: function () { _this3.goSearch() } }, [
        View({ className: 'search-item', key: 'si1' }, [
          View({ className: 'dot start', key: 'd' }),
          Input({
            placeholder: '输入出发地',
            value: _this3.state.startPoint,
            onInput: function (e) { _this3.onInputStart(e) },
            className: 'search-input',
            disabled: true
          })
        ]),
        View({ className: 'search-line', key: 'sl' }),
        View({ className: 'search-item', key: 'si2' }, [
          View({ className: 'dot end', key: 'd' }),
          Input({
            placeholder: '输入目的地',
            value: _this3.state.endPoint,
            onInput: function (e) { _this3.onInputEnd(e) },
            className: 'search-input',
            disabled: true
          })
        ])
      ]),
      View({ className: 'quick-actions', key: 'qa' }, [
        View({ className: 'action-item', key: 'a1', onClick: function () { _this3.goPublish() } }, [
          View({ className: 'action-icon publish', key: 'i' }, '🚗'),
          Text({ className: 'action-text', key: 't' }, '发布行程')
        ]),
        View({ className: 'action-item', key: 'a2', onClick: function () { _this3.goSearch() } }, [
          View({ className: 'action-icon search', key: 'i' }, '🔍'),
          Text({ className: 'action-text', key: 't' }, '找顺风车')
        ]),
        View({ className: 'action-item', key: 'a3', onClick: function () { Taro.navigateTo({ url: '/pages/user/favorites' }) } }, [
          View({ className: 'action-icon favorite', key: 'i' }, '⭐'),
          Text({ className: 'action-text', key: 't' }, '常用路线')
        ])
      ]),
      View({ className: 'section', key: 'sec' }, [
        View({ className: 'section-header', key: 'sh' }, [
          Text({ className: 'section-title', key: 'st' }, '🔥 热门推荐'),
          Text({ className: 'section-more', key: 'sm', onClick: function () { _this3.goSearch() } }, '查看更多 ›')
        ]),
        tripCards
      ])
    ])
  }

  return Index
})(Component)

export default Index
