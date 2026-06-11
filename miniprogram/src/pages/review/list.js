import { Component } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { getMyReviews } from '../../services/user'
import { formatDateTime, maskPhone } from '../../utils'
import './list.scss'

export default class ReviewList extends Component {
  config = {
    navigationBarTitleText: '我的评价',
    enablePullDownRefresh: true
  }

  state = {
    activeTab: 'received',
    reviews: [],
    loading: false
  }

  tabs = [
    { key: 'received', label: '收到的评价' },
    { key: 'given', label: '发出的评价' }
  ]

  tagLabels = {
    punctual: '准时',
    clean: '车内整洁',
    smooth: '驾驶平稳',
    friendly: '态度友好',
    familiar: '路线熟悉',
    communicative: '沟通顺畅'
  }

  componentDidMount() {
    this.loadReviews()
  }

  onPullDownRefresh() {
    this.loadReviews()
    Taro.stopPullDownRefresh()
  }

  loadReviews = async () => {
    this.setState({ loading: true })
    try {
      const res = await getMyReviews({ type: this.state.activeTab })
      this.setState({ reviews: res.list || res || [] })
    } catch (e) {
      console.error(e)
    }
    this.setState({ loading: false })
  }

  switchTab = (key) => {
    this.setState({ activeTab: key }, () => this.loadReviews())
  }

  renderStars = (rating) => {
    const fullStars = Math.floor(rating)
    const stars = []
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Text key={i} className={`star ${i < fullStars ? 'active' : ''}`}>★</Text>
      )
    }
    return stars
  }

  goReply = (review) => {
    Taro.navigateTo({ url: `/pages/review/create?orderId=${review.orderId}` })
  }

  render() {
    const { activeTab, reviews, loading } = this.state

    return (
      <View className='review-list-page'>
        <View className='tabs'>
          {this.tabs.map(tab => (
            <View
              key={tab.key}
              className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => this.switchTab(tab.key)}
            >
              {tab.label}
            </View>
          ))}
        </View>

        <ScrollView className='content' scrollY>
          {loading ? (
            <View className='loading'>加载中...</View>
          ) : reviews.length === 0 ? (
            <View className='empty'>
              <Text className='empty-icon'>⭐</Text>
              <Text>暂无评价</Text>
            </View>
          ) : (
            reviews.map(review => {
              const user = activeTab === 'received' ? review.Reviewer : review.Reviewee
              return (
                <View key={review.id} className='review-card'>
                  <View className='header'>
                    <Image
                      className='avatar'
                      src={user?.avatar || 'https://img.icons8.com/color/96/user-male-circle--v1.png'}
                    />
                    <View className='user-info'>
                      <Text className='name'>{user?.nickname || '用户'}</Text>
                      <View className='rating'>
                        {this.renderStars(review.overallRating)}
                        <Text className='rating-value'>{review.overallRating}</Text>
                      </View>
                    </View>
                    <Text className='time'>{formatDateTime(review.createdAt)}</Text>
                  </View>

                  {review.content && (
                    <View className='content-text'>{review.content}</View>
                  )}

                  {review.tags && review.tags.length > 0 && (
                    <View className='tags'>
                      {review.tags.map(tag => (
                        <View key={tag} className='tag'>{this.tagLabels[tag] || tag}</View>
                      ))}
                    </View>
                  )}

                  {review.replyContent && (
                    <View className='reply'>
                      <Text className='reply-label'>我的回复：</Text>
                      <Text className='reply-content'>{review.replyContent}</Text>
                    </View>
                  )}

                  {activeTab === 'received' && !review.replyContent && (
                    <View className='actions'>
                      <View className='btn' onClick={() => this.goReply(review)}>回复评价</View>
                    </View>
                  )}
                </View>
              )
            })
          )}
        </ScrollView>
      </View>
    )
  }
}
