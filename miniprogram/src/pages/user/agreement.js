import { Component } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { getAgreement } from '../../services/order'
import { formatDateTime, formatMoney } from '../../utils'
import './agreement.scss'

export default class Agreement extends Component {
  config = {
    navigationBarTitleText: '电子协议'
  }

  state = {
    agreement: null,
    loading: true,
    agreed: false
  }

  componentDidMount() {
    this.loadAgreement()
  }

  loadAgreement = async () => {
    const orderId = this.$router.params.orderId
    if (!orderId) {
      this.setState({ loading: false })
      return
    }
    this.setState({ loading: true })
    try {
      const agreement = await getAgreement(orderId)
      this.setState({
        agreement,
        agreed: agreement?.status === 'signed'
      })
    } catch (e) {
      console.error(e)
    }
    this.setState({ loading: false })
  }

  signAgreement = async () => {
    if (!this.state.agreed) {
      Taro.showToast({ title: '请先阅读并同意协议', icon: 'none' })
      return
    }

    try {
      Taro.showToast({ title: '签署成功', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 1500)
    } catch (e) {
      console.error(e)
      Taro.showToast({ title: '签署失败', icon: 'none' })
    }
  }

  downloadPdf = () => {
    Taro.showToast({ title: '下载功能开发中', icon: 'none' })
  }

  getStatusConfig = (status) => {
    const config = {
      draft: { label: '草稿', color: '#999', bg: '#f5f5f5' },
      pending_sign: { label: '待签署', color: '#fa8c16', bg: '#fff7e6' },
      signed: { label: '已签署', color: '#52c41a', bg: '#f6ffed' },
      void: { label: '已作废', color: '#ff4d4f', bg: '#fff1f0' }
    }
    return config[status] || config.draft
  }

  render() {
    const { agreement, loading, agreed } = this.state
    const statusConfig = agreement ? this.getStatusConfig(agreement.status) : null

    return (
      <View className='agreement-page'>
        <ScrollView className='content' scrollY>
          {loading ? (
            <View className='loading'>加载中...</View>
          ) : agreement ? (
            <View>
              <View className='header'>
                <View className='header-content'>
                  <Text className='agreement-title'>拼车服务协议</Text>
                  <Text className='agreement-no'>协议编号: {agreement.agreementNo}</Text>
                  {statusConfig && (
                    <View className='agreement-status' style={{ color: statusConfig.color, background: statusConfig.bg }}>
                      {statusConfig.label}
                    </View>
                  )}
                </View>
              </View>

              <View className='trip-info'>
                <View className='section-title'>行程信息</View>
                <View className='info-row'>
                  <Text className='info-label'>起点</Text>
                  <Text className='info-value'>{agreement.startPoint || '--'}</Text>
                </View>
                <View className='info-row'>
                  <Text className='info-label'>终点</Text>
                  <Text className='info-value'>{agreement.endPoint || '--'}</Text>
                </View>
                <View className='info-row'>
                  <Text className='info-label'>出发时间</Text>
                  <Text className='info-value'>{agreement.departureTime ? formatDateTime(agreement.departureTime) : '--'}</Text>
                </View>
                <View className='info-row'>
                  <Text className='info-label'>座位数</Text>
                  <Text className='info-value'>{agreement.seats || 1} 座</Text>
                </View>
                <View className='info-row'>
                  <Text className='info-label'>总费用</Text>
                  <Text className='info-value price'>¥{formatMoney(agreement.totalPrice)}</Text>
                </View>
              </View>

              <View className='parties'>
                <View className='section-title'>协议双方</View>
                <View className='party'>
                  <Text className='party-label'>司机</Text>
                  <View className='party-info'>
                    <Text className='party-name'>{agreement.Driver?.nickname || '司机用户'}</Text>
                    {agreement.driverSignedAt && (
                      <Text className='sign-status signed'>已签署 {formatDateTime(agreement.driverSignedAt)}</Text>
                    )}
                    {!agreement.driverSignedAt && (
                      <Text className='sign-status pending'>待签署</Text>
                    )}
                  </View>
                </View>
                <View className='party'>
                  <Text className='party-label'>乘客</Text>
                  <View className='party-info'>
                    <Text className='party-name'>{agreement.Passenger?.nickname || '乘客用户'}</Text>
                    {agreement.passengerSignedAt && (
                      <Text className='sign-status signed'>已签署 {formatDateTime(agreement.passengerSignedAt)}</Text>
                    )}
                    {!agreement.passengerSignedAt && (
                      <Text className='sign-status pending'>待签署</Text>
                    )}
                  </View>
                </View>
              </View>

              <View className='agreement-content'>
                <View className='section-title'>协议内容</View>
                <View className='content-body'>
                  {agreement.agreementContent ? (
                    agreement.agreementContent.split('\n').map((paragraph, idx) => (
                      <Text key={idx} className='paragraph'>{paragraph}</Text>
                    ))
                  ) : (
                    <View>
                      <Text className='paragraph'>第一条 服务内容</Text>
                      <Text className='paragraph'>司机同意按照本协议约定的时间、地点和路线，为乘客提供拼车出行服务。乘客同意按照约定支付相应的服务费用。</Text>

                      <Text className='paragraph'>第二条 双方权利与义务</Text>
                      <Text className='paragraph'>1. 司机应保证车辆状况良好，具备合法营运资质，按时到达约定地点。</Text>
                      <Text className='paragraph'>2. 乘客应按时到达约定地点，配合司机完成行程，不得携带危险物品。</Text>
                      <Text className='paragraph'>3. 双方应保持良好沟通，尊重彼此，文明出行。</Text>

                      <Text className='paragraph'>第三条 费用与支付</Text>
                      <Text className='paragraph'>乘客应在行程开始前或行程结束后按照约定方式支付服务费用。费用标准以平台公示或双方约定为准。</Text>

                      <Text className='paragraph'>第四条 安全保障</Text>
                      <Text className='paragraph'>司机应遵守交通规则，安全驾驶。乘客应系好安全带，不得干扰司机正常驾驶。如遇紧急情况，双方应及时联系平台或报警。</Text>

                      <Text className='paragraph'>第五条 违约责任</Text>
                      <Text className='paragraph'>1. 如司机无故取消行程，应提前通知乘客并承担相应违约责任。</Text>
                      <Text className='paragraph'>2. 如乘客无故取消行程，应按照平台规则承担相应费用。</Text>
                      <Text className='paragraph'>3. 任何一方违反本协议约定给对方造成损失的，应承担赔偿责任。</Text>

                      <Text className='paragraph'>第六条 争议解决</Text>
                      <Text className='paragraph'>因本协议引起的争议，双方应友好协商解决；协商不成的，可向平台投诉或通过法律途径解决。</Text>

                      <Text className='paragraph'>第七条 其他条款</Text>
                      <Text className='paragraph'>本协议自双方签署之日起生效，一式两份，双方各执一份，具有同等法律效力。</Text>
                    </View>
                  )}
                </View>
              </View>

              {agreement.signedAt && (
                <View className='sign-info'>
                  <Text className='sign-text'>双方于 {formatDateTime(agreement.signedAt)} 完成签署</Text>
                </View>
              )}
            </View>
          ) : (
            <View className='empty'>
              <Text className='empty-icon'>📄</Text>
              <Text>未找到协议信息</Text>
            </View>
          )}
        </ScrollView>

        {agreement && agreement.status !== 'signed' && agreement.status !== 'void' && (
          <View className='footer'>
            <View className='agree-section'>
              <View
                className={`checkbox ${agreed ? 'checked' : ''}`}
                onClick={() => this.setState({ agreed: !agreed })}
              >
                {agreed && <Text className='check-mark'>✓</Text>}
              </View>
              <Text className='agree-text'>我已阅读并同意以上协议内容</Text>
            </View>
            <View className='footer-actions'>
              <Button className='btn secondary' onClick={this.downloadPdf}>下载PDF</Button>
              <Button className='btn primary' onClick={this.signAgreement}>确认签署</Button>
            </View>
          </View>
        )}

        {agreement && agreement.status === 'signed' && (
          <View className='footer'>
            <Button className='btn primary full' onClick={this.downloadPdf}>下载协议PDF</Button>
          </View>
        )}
      </View>
    )
  }
}
