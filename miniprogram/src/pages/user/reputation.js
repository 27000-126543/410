import { Component } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { getCurrentUser } from '../../services/auth'
import { getReputationHistory } from '../../services/user'
import { getReputationLevel, formatDateTime } from '../../utils'
import './reputation.scss'

export default class Reputation extends Component {
  config = {
    navigationBarTitleText: '信誉中心',
    enablePullDownRefresh: true
  }

  state = {
    userInfo: null,
    history: [],
    loading: false,
    showLevelInfo: false
  }

  levelConfig = [
    { level: 'bronze', name: '铜牌', min: 0, max: 599, color: '#cd7f32', desc: '初始等级，享受基础服务' },
    { level: 'silver', name: '银牌', min: 600, max: 749, color: '#c0c0c0', desc: '完成10单行程可升级，享受优先匹配' },
    { level: 'gold', name: '金牌', min: 750, max: 899, color: '#ffd700', desc: '完成30单行程可升级，享受专属客服' },
    { level: 'platinum', name: '铂金', min: 900, max: 999, color: '#a6c8ff', desc: '完成50单行程可升级，享受佣金优惠' },
    { level: 'diamond', name: '钻石', min: 1000, max: 9999, color: '#00a3ff', desc: '完成100单行程可升级，享受全部特权' }
  ]

  changeTypeLabels = {
    trip_completed: '完成行程',
    review_good: '收到好评',
    review_bad: '收到差评',
    cancelled: '取消行程',
    no_show: '未乘车',
    complaint: '投诉处理',
    admin_adjust: '管理员调整',
    new_user_bonus: '新用户奖励'
  }

  componentDidMount() {
    this.loadData()
  }

  onPullDownRefresh() {
    this.loadData()
    Taro.stopPullDownRefresh()
  }

  loadData = async () => {
    this.setState({ loading: true })
    try {
      const [user, historyRes] = await Promise.all([
        getCurrentUser(),
        getReputationHistory({ pageSize: 50 }).catch(() => ({ list: [] }))
      ])
      this.setState({
        userInfo: user,
        history: historyRes.list || historyRes || []
      })
    } catch (e) {
      console.error(e)
    }
    this.setState({ loading: false })
  }

  getCurrentLevelConfig = (userLevel) => {
    return this.levelConfig.find(l => l.level === userLevel) || this.levelConfig[0]
  }

  getNextLevelConfig = (userLevel) => {
    const idx = this.levelConfig.findIndex(l => l.level === userLevel)
    if (idx >= 0 && idx < this.levelConfig.length - 1) {
      return this.levelConfig[idx + 1]
    }
    return null
  }

  getProgress = (user) => {
    const current = this.getCurrentLevelConfig(user.reputationLevel)
    const next = this.getNextLevelConfig(user.reputationLevel)
    if (!next) return 100
    const total = next.min - current.min
    const progress = user.reputationScore - current.min
    return Math.min(100, Math.max(0, (progress / total) * 100))
  }

  render() {
    const { userInfo, history, loading, showLevelInfo } = this.state

    return (
      <View className='reputation-page'>
        <ScrollView className='content' scrollY>
          {userInfo && (
            <View className='header'>
              <View className='score-section'>
                <View className={`reputation-badge reputation-${userInfo.reputationLevel}`}>
                  {getReputationLevel(userInfo.reputationLevel)}
                </View>
                <View className='score'>
                  <Text className='score-value'>{userInfo.reputationScore}</Text>
                  <Text className='score-label'>信誉分</Text>
                </View>
              </View>

              <View className='progress-section'>
                <View className='progress-bar'>
                  <View
                    className='progress-fill'
                    style={{ width: `${this.getProgress(userInfo)}%` }}
                  />
                </View>
                {this.getNextLevelConfig(userInfo.reputationLevel) ? (
                  <Text className='progress-text'>
                    距离 {this.getNextLevelConfig(userInfo.reputationLevel).name} 还需 {this.getNextLevelConfig(userInfo.reputationLevel).min - userInfo.reputationScore} 分
                  </Text>
                ) : (
                  <Text className='progress-text'>已达最高等级</Text>
                )}
              </View>

              <View className='level-info' onClick={() => this.setState({ showLevelInfo: true })}>
                <Text className='level-info-text'>等级说明</Text>
                <Text className='level-info-arrow'>›</Text>
              </View>
            </View>
          )}

          <View className='stats-section'>
            <View className='stat-item'>
              <Text className='stat-value'>{userInfo?.totalTrips || 0}</Text>
              <Text className='stat-label'>完成行程</Text>
            </View>
            <View className='stat-divider'></View>
            <View className='stat-item'>
              <Text className='stat-value'>{userInfo?.completionRate || 0}%</Text>
              <Text className='stat-label'>完成率</Text>
            </View>
            <View className='stat-divider'></View>
            <View className='stat-item'>
              <Text className='stat-value'>{userInfo?.isVerified ? '已认证' : '未认证'}</Text>
              <Text className='stat-label'>实名认证</Text>
            </View>
          </View>

          <View className='history-section'>
            <View className='section-title'>信誉变动记录</View>

            {loading ? (
              <View className='loading'>加载中...</View>
            ) : history.length === 0 ? (
              <View className='empty'>
                <Text className='empty-icon'>📊</Text>
                <Text>暂无变动记录</Text>
              </View>
            ) : (
              history.map(record => (
                <View key={record.id} className='history-item'>
                  <View className='history-icon'>
                    {record.scoreChange > 0 ? '↑' : '↓'}
                  </View>
                  <View className='history-content'>
                    <View className='history-title'>
                      <Text>{this.changeTypeLabels[record.changeType] || record.changeType}</Text>
                      <Text className={`history-change ${record.scoreChange > 0 ? 'positive' : 'negative'}`}>
                        {record.scoreChange > 0 ? '+' : ''}{record.scoreChange}
                      </Text>
                    </View>
                    {record.reason && (
                      <Text className='history-reason'>{record.reason}</Text>
                    )}
                    <Text className='history-time'>{formatDateTime(record.createdAt)}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {showLevelInfo && (
          <View className='modal-mask' onClick={() => this.setState({ showLevelInfo: false })}>
            <View className='modal-content' onClick={(e) => e.stopPropagation()}>
              <View className='modal-title'>等级说明</View>
              <View className='level-list'>
                {this.levelConfig.map(item => (
                  <View key={item.level} className='level-item'>
                    <View className='level-badge' style={{ background: item.color }}>
                      {item.name}
                    </View>
                    <View className='level-info-box'>
                      <Text className='level-range'>{item.min} - {item.max === 9999 ? '∞' : item.max} 分</Text>
                      <Text className='level-desc'>{item.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
              <View className='modal-close' onClick={() => this.setState({ showLevelInfo: false })}>
                我知道了
              </View>
            </View>
          </View>
        )}
      </View>
    )
  }
}
