import { Component } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { getComplaintDetail } from '../../services/user'
import { formatDateTime, getComplaintStatusText, getComplaintTypeText } from '../../utils'
import './complaintDetail.scss'

export default class ComplaintDetail extends Component {
  config = {
    navigationBarTitleText: '投诉详情'
  }

  state = {
    complaint: null,
    loading: true
  }

  statusSteps = [
    { key: 'pending', label: '提交投诉', desc: '等待客服受理' },
    { key: 'processing', label: '处理中', desc: '客服正在核实处理' },
    { key: 'resolved', label: '已解决', desc: '投诉已处理完成' },
    { key: 'rejected', label: '已驳回', desc: '投诉不符合处理条件' },
    { key: 'closed', label: '已关闭', desc: '投诉已关闭' }
  ]

  componentDidMount() {
    this.loadDetail()
  }

  loadDetail = async () => {
    const id = this.$router.params.id
    this.setState({ loading: true })
    try {
      const complaint = await getComplaintDetail(id)
      this.setState({ complaint })
    } catch (e) {
      console.error(e)
    }
    this.setState({ loading: false })
  }

  getCurrentStepIndex = (status) => {
    const idx = this.statusSteps.findIndex(s => s.key === status)
    return idx >= 0 ? idx : 0
  }

  rateSatisfaction = async (rating) => {
    Taro.showToast({ title: '感谢您的评价', icon: 'success' })
  }

  render() {
    const { complaint, loading } = this.state
    const currentStep = complaint ? this.getCurrentStepIndex(complaint.status) : 0

    return (
      <View className='complaint-detail-page'>
        <ScrollView className='content' scrollY>
          {loading ? (
            <View className='loading'>加载中...</View>
          ) : complaint ? (
            <View>
              <View className='status-header'>
                <Text className={`status status-${complaint.status}`}>
                  {getComplaintStatusText(complaint.status)}
                </Text>
                <Text className='complaint-no'>投诉编号: {complaint.complaintNo}</Text>
              </View>

              <View className='timeline-section'>
                {this.statusSteps.slice(0, complaint.status === 'rejected' || complaint.status === 'closed' ? currentStep + 1 : 3).map((step, index) => (
                  <View
                    key={step.key}
                    className={`timeline-item ${index <= currentStep ? 'active' : ''} ${index === currentStep ? 'current' : ''}`}
                  >
                    <View className='timeline-dot'></View>
                    <View className='timeline-content'>
                      <Text className='timeline-label'>{step.label}</Text>
                      <Text className='timeline-desc'>{step.desc}</Text>
                      {index === 0 && (
                        <Text className='timeline-time'>{formatDateTime(complaint.createdAt)}</Text>
                      )}
                      {index === 1 && complaint.respondedAt && (
                        <Text className='timeline-time'>{formatDateTime(complaint.respondedAt)}</Text>
                      )}
                      {index === currentStep && complaint.resolvedAt && (
                        <Text className='timeline-time'>{formatDateTime(complaint.resolvedAt)}</Text>
                      )}
                    </View>
                    {index < this.statusSteps.slice(0, complaint.status === 'rejected' || complaint.status === 'closed' ? currentStep + 1 : 3).length - 1 && (
                      <View className={`timeline-line ${index < currentStep ? 'done' : ''}`}></View>
                    )}
                  </View>
                ))}
              </View>

              <View className='info-section'>
                <View className='section-title'>投诉信息</View>

                <View className='info-row'>
                  <Text className='info-label'>投诉类型</Text>
                  <View className='type-tag'>{getComplaintTypeText(complaint.type)}</View>
                </View>

                <View className='info-row'>
                  <Text className='info-label'>投诉标题</Text>
                  <Text className='info-value'>{complaint.title}</Text>
                </View>

                <View className='info-row column'>
                  <Text className='info-label'>投诉内容</Text>
                  <Text className='content-text'>{complaint.content}</Text>
                </View>

                {complaint.images && complaint.images.length > 0 && (
                  <View className='image-list'>
                    {complaint.images.map((img, idx) => (
                      <Image
                        key={idx}
                        className='complaint-image'
                        src={img}
                        mode='aspectFill'
                        onClick={() => Taro.previewImage({ urls: complaint.images, current: img })}
                      />
                    ))}
                  </View>
                )}
              </View>

              {complaint.handleResult && (
                <View className='result-section'>
                  <View className='section-title'>处理结果</View>
                  <Text className='result-text'>{complaint.handleResult}</Text>
                  {complaint.handleRemark && (
                    <Text className='remark-text'>备注: {complaint.handleRemark}</Text>
                  )}
                </View>
              )}

              {complaint.status === 'resolved' && !complaint.complainantSatisfied && (
                <View className='satisfaction-section'>
                  <View className='section-title'>服务评价</View>
                  <Text className='satisfaction-tip'>请对本次投诉处理服务进行评价</Text>
                  <View className='rating-stars'>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Text
                        key={star}
                        className='star'
                        onClick={() => this.rateSatisfaction(star)}
                      >★</Text>
                    ))}
                  </View>
                </View>
              )}

              {complaint.status === 'resolved' && complaint.complainantSatisfied && (
                <View className='rated-section'>
                  <Text className='rated-text'>您已评价: {complaint.satisfactionRating} 星</Text>
                </View>
              )}

              {complaint.responseTime && (
                <View className='stats-section'>
                  <View className='stat-item'>
                    <Text className='stat-value'>{complaint.responseTime}</Text>
                    <Text className='stat-label'>响应时长(分钟)</Text>
                  </View>
                  {complaint.resolutionTime && (
                    <View className='stat-item'>
                      <Text className='stat-value'>{complaint.resolutionTime}</Text>
                      <Text className='stat-label'>解决时长(分钟)</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          ) : (
            <View className='empty'>
              <Text>未找到投诉详情</Text>
            </View>
          )}
        </ScrollView>
      </View>
    )
  }
}
