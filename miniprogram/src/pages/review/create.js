import { Component } from 'react'
import { View, Text, Textarea, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { createReview } from '../../services/review'
import { getOrderDetail } from '../../services/order'
import { formatMoney } from '../../utils'
import './create.scss'

export default class ReviewCreate extends Component {
  config = {
    navigationBarTitleText: '发表评价'
  }

  state = {
    order: null,
    overallRating: 5,
    punctualityRating: 5,
    attitudeRating: 5,
    drivingRating: 5,
    cleanlinessRating: 5,
    content: '',
    tags: [],
    loading: false
  }

  availableTags = [
    { label: '准时', key: 'punctual' },
    { label: '车内整洁', key: 'clean' },
    { label: '驾驶平稳', key: 'smooth' },
    { label: '态度友好', key: 'friendly' },
    { label: '路线熟悉', key: 'familiar' },
    { label: '沟通顺畅', key: 'communicative' }
  ]

  async componentDidMount() {
    const orderId = this.$router.params.orderId
    try {
      const order = await getOrderDetail(orderId)
      this.setState({ order })
    } catch (e) {
      console.error(e)
    }
  }

  setRating = (key, value) => {
    this.setState({ [key]: value })
  }

  toggleTag = (key) => {
    const { tags } = this.state
    if (tags.includes(key)) {
      this.setState({ tags: tags.filter(t => t !== key) })
    } else {
      this.setState({ tags: [...tags, key] })
    }
  }

  submit = async () => {
    const {
      overallRating, punctualityRating, attitudeRating,
      drivingRating, cleanlinessRating, content, tags, order
    } = this.state

    if (!overallRating) {
      Taro.showToast({ title: '请选择评分', icon: 'none' })
      return
    }

    this.setState({ loading: true })
    try {
      await createReview({
        orderId: order.id,
        overallRating,
        punctualityRating,
        attitudeRating,
        drivingRating,
        cleanlinessRating,
        content,
        tags
      })
      Taro.showToast({ title: '评价成功', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 1500)
    } catch (e) {
      console.error(e)
    }
    this.setState({ loading: false })
  }

  renderStars = (key, value, label) => (
    <View className='rating-item'>
      <Text className='rating-label'>{label}</Text>
      <View className='stars'>
        {[1, 2, 3, 4, 5].map(star => (
          <Text
            key={star}
            className={`star ${star <= value ? 'active' : ''}`}
            onClick={() => this.setRating(key, star)}
          >★</Text>
        ))}
        <Text className='rating-value'>{value}.0</Text>
      </View>
    </View>
  )

  render() {
    const {
      order, overallRating, punctualityRating, attitudeRating,
      drivingRating, cleanlinessRating, content, tags, loading
    } = this.state

    return (
      <View className='review-create-page'>
        {order && (
          <View className='order-info'>
            <View className='route'>
              <Text>{order.Trip?.startPoint}</Text>
              <Text className='arrow'>→</Text>
              <Text>{order.Trip?.endPoint}</Text>
            </View>
            <Text className='amount'>¥{formatMoney(order.payAmount)}</Text>
          </View>
        )}

        <View className='rating-section'>
          <Text className='section-title'>综合评分</Text>
          <View className='overall-rating'>
            {[1, 2, 3, 4, 5].map(star => (
              <Text
                key={star}
                className={`overall-star ${star <= overallRating ? 'active' : ''}`}
                onClick={() => this.setRating('overallRating', star)}
              >★</Text>
            ))}
          </View>
          <Text className='rating-hint'>
            {overallRating >= 5 ? '非常满意' : overallRating >= 4 ? '比较满意' : overallRating >= 3 ? '一般' : '不满意'}
          </Text>
        </View>

        <View className='detail-rating'>
          {this.renderStars('punctualityRating', punctualityRating, '准时度')}
          {this.renderStars('attitudeRating', attitudeRating, '服务态度')}
          {this.renderStars('drivingRating', drivingRating, '驾驶技术')}
          {this.renderStars('cleanlinessRating', cleanlinessRating, '车内整洁')}
        </View>

        <View className='tags-section'>
          <Text className='section-title'>选择标签</Text>
          <View className='tags-list'>
            {this.availableTags.map(tag => (
              <View
                key={tag.key}
                className={`tag-item ${tags.includes(tag.key) ? 'active' : ''}`}
                onClick={() => this.toggleTag(tag.key)}
              >
                {tag.label}
              </View>
            ))}
          </View>
        </View>

        <View className='content-section'>
          <Text className='section-title'>评价内容</Text>
          <Textarea
            className='content-input'
            placeholder='分享您的乘车体验，帮助其他乘客做出更好的选择...'
            value={content}
            onInput={(e) => this.setState({ content: e.detail.value })}
            maxLength={500}
          />
          <Text className='word-count'>{content.length}/500</Text>
        </View>

        <View className='footer'>
          <Button className='submit-btn' loading={loading} onClick={this.submit}>
            提交评价
          </Button>
        </View>
      </View>
    )
  }
}
