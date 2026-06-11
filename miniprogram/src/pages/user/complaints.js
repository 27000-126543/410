import { Component } from 'react'
import { View, Text, ScrollView, Button, Input, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { getMyComplaints, createComplaint } from '../../services/user'
import { formatDateTime, getComplaintStatusText, getComplaintTypeText } from '../../utils'
import './complaints.scss'

export default class Complaints extends Component {
  config = {
    navigationBarTitleText: '我的投诉',
    enablePullDownRefresh: true
  }

  state = {
    activeTab: 'all',
    complaints: [],
    loading: false,
    showCreateModal: false,
    form: {
      type: '',
      title: '',
      content: '',
      orderId: ''
    }
  }

  tabs = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待处理' },
    { key: 'processing', label: '处理中' },
    { key: 'resolved', label: '已解决' },
    { key: 'rejected', label: '已驳回' }
  ]

  complaintTypes = [
    { key: 'attitude', label: '态度问题' },
    { key: 'punctuality', label: '准时问题' },
    { key: 'safety', label: '安全问题' },
    { key: 'cleanliness', label: '卫生问题' },
    { key: 'overcharge', label: '收费问题' },
    { key: 'cancellation', label: '取消问题' },
    { key: 'other', label: '其他问题' }
  ]

  componentDidMount() {
    this.loadComplaints()
  }

  onPullDownRefresh() {
    this.loadComplaints()
    Taro.stopPullDownRefresh()
  }

  loadComplaints = async () => {
    this.setState({ loading: true })
    const params = { pageSize: 50 }
    if (this.state.activeTab !== 'all') {
      params.status = this.state.activeTab
    }
    try {
      const res = await getMyComplaints(params)
      this.setState({ complaints: res.list || res || [] })
    } catch (e) {
      console.error(e)
    }
    this.setState({ loading: false })
  }

  switchTab = (key) => {
    this.setState({ activeTab: key }, () => this.loadComplaints())
  }

  goDetail = (id) => {
    Taro.navigateTo({ url: `/pages/user/complaintDetail?id=${id}` })
  }

  openCreateModal = () => {
    this.setState({
      showCreateModal: true,
      form: {
        type: '',
        title: '',
        content: '',
        orderId: ''
      }
    })
  }

  closeModal = () => {
    this.setState({ showCreateModal: false })
  }

  chooseType = () => {
    Taro.showActionSheet({
      itemList: this.complaintTypes.map(t => t.label),
      success: (res) => {
        this.setState({
          form: {
            ...this.state.form,
            type: this.complaintTypes[res.tapIndex].key
          }
        })
      }
    })
  }

  submitComplaint = async () => {
    const { type, title, content } = this.state.form
    if (!type) {
      Taro.showToast({ title: '请选择投诉类型', icon: 'none' })
      return
    }
    if (!title.trim()) {
      Taro.showToast({ title: '请输入投诉标题', icon: 'none' })
      return
    }
    if (!content.trim()) {
      Taro.showToast({ title: '请输入投诉内容', icon: 'none' })
      return
    }

    this.setState({ loading: true })
    try {
      await createComplaint(this.state.form)
      Taro.showToast({ title: '投诉提交成功', icon: 'success' })
      this.closeModal()
      this.loadComplaints()
    } catch (e) {
      console.error(e)
      Taro.showToast({ title: '提交失败', icon: 'none' })
    }
    this.setState({ loading: false })
  }

  render() {
    const { activeTab, complaints, loading, showCreateModal, form } = this.state

    return (
      <View className='complaints-page'>
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
          ) : complaints.length === 0 ? (
            <View className='empty'>
              <Text className='empty-icon'>📢</Text>
              <Text>暂无投诉记录</Text>
            </View>
          ) : (
            complaints.map(complaint => (
              <View
                key={complaint.id}
                className='complaint-card'
                onClick={() => this.goDetail(complaint.id)}
              >
                <View className='header'>
                  <Text className='complaint-no'>{complaint.complaintNo}</Text>
                  <Text className={`status status-${complaint.status}`}>
                    {getComplaintStatusText(complaint.status)}
                  </Text>
                </View>

                <View className='type-row'>
                  <View className='type-tag'>{getComplaintTypeText(complaint.type)}</View>
                </View>

                <Text className='title'>{complaint.title}</Text>
                <Text className='content-text'>{complaint.content}</Text>

                <View className='footer'>
                  <Text className='time'>{formatDateTime(complaint.createdAt)}</Text>
                  <Text className='arrow'>›</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        <View className='footer-bar'>
          <Button className='create-btn' onClick={this.openCreateModal}>
            + 新建投诉
          </Button>
        </View>

        {showCreateModal && (
          <View className='modal-mask' onClick={this.closeModal}>
            <View className='modal-content' onClick={(e) => e.stopPropagation()}>
              <View className='modal-title'>新建投诉</View>

              <View className='form-item' onClick={this.chooseType}>
                <Text className='label'>投诉类型</Text>
                <View className='value'>
                  <Text className={form.type ? '' : 'placeholder'}>
                    {form.type ? getComplaintTypeText(form.type) : '请选择投诉类型'}
                  </Text>
                  <Text className='arrow'>›</Text>
                </View>
              </View>

              <View className='form-item'>
                <Text className='label'>投诉标题</Text>
                <Input
                  className='input'
                  placeholder='请简要描述问题'
                  value={form.title}
                  onInput={(e) => this.setState({ form: { ...form, title: e.detail.value } })}
                  maxLength={50}
                />
              </View>

              <View className='form-item column'>
                <Text className='label'>投诉内容</Text>
                <Textarea
                  className='textarea'
                  placeholder='请详细描述您遇到的问题...'
                  value={form.content}
                  onInput={(e) => this.setState({ form: { ...form, content: e.detail.value } })}
                  maxLength={500}
                />
                <Text className='word-count'>{form.content.length}/500</Text>
              </View>

              <View className='modal-actions'>
                <View className='modal-btn cancel' onClick={this.closeModal}>取消</View>
                <View className='modal-btn confirm' onClick={this.submitComplaint}>提交投诉</View>
              </View>
            </View>
          </View>
        )}
      </View>
    )
  }
}
