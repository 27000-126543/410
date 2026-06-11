import { Component } from 'react'
import { View, Text, Image, Input, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { getCurrentUser, updateProfile, realNameAuth, updateDriverInfo } from '../../services/auth'
import { getReputationLevel } from '../../utils'
import './profile.scss'

export default class Profile extends Component {
  config = {
    navigationBarTitleText: '个人资料'
  }

  state = {
    userInfo: null,
    nickname: '',
    gender: '',
    city: '',
    avatar: '',
    loading: false,
    realNameForm: {
      realName: '',
      idCard: ''
    },
    driverForm: {
      plateNumber: '',
      vehicleType: '',
      driverLicense: ''
    },
    showRealNameModal: false,
    showDriverModal: false
  }

  genders = [
    { key: 'male', label: '男' },
    { key: 'female', label: '女' }
  ]

  vehicleTypes = ['经济型', '舒适型', '豪华型', 'SUV', 'MPV']

  componentDidMount() {
    this.loadUserInfo()
  }

  loadUserInfo = async () => {
    try {
      const user = await getCurrentUser()
      this.setState({
        userInfo: user,
        nickname: user.nickname || '',
        gender: user.gender || '',
        city: user.city || '',
        avatar: user.avatar || ''
      })
      Taro.setStorageSync('userInfo', user)
    } catch (e) {
      console.error(e)
    }
  }

  chooseAvatar = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setState({ avatar: res.tempFilePaths[0] })
      }
    })
  }

  chooseGender = () => {
    Taro.showActionSheet({
      itemList: this.genders.map(g => g.label),
      success: (res) => {
        this.setState({ gender: this.genders[res.tapIndex].key })
      }
    })
  }

  chooseCity = () => {
    Taro.chooseLocation({
      success: (res) => {
        this.setState({ city: res.name || res.address })
      },
      fail: () => {
        Taro.showModal({
          title: '输入城市',
          editable: true,
          placeholderText: '请输入城市名称',
          success: (res) => {
            if (res.confirm && res.content) {
              this.setState({ city: res.content })
            }
          }
        })
      }
    })
  }

  saveProfile = async () => {
    const { nickname, gender, city, avatar } = this.state
    if (!nickname.trim()) {
      Taro.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }

    this.setState({ loading: true })
    try {
      await updateProfile({ nickname, gender, city, avatar })
      Taro.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 1500)
    } catch (e) {
      console.error(e)
      Taro.showToast({ title: '保存失败', icon: 'none' })
    }
    this.setState({ loading: false })
  }

  goRealNameAuth = () => {
    this.setState({ showRealNameModal: true })
  }

  submitRealName = async () => {
    const { realName, idCard } = this.state.realNameForm
    if (!realName.trim()) {
      Taro.showToast({ title: '请输入真实姓名', icon: 'none' })
      return
    }
    if (!/^\d{17}[\dXx]$/.test(idCard)) {
      Taro.showToast({ title: '请输入正确的身份证号', icon: 'none' })
      return
    }

    this.setState({ loading: true })
    try {
      await realNameAuth({ realName, idCard })
      Taro.showToast({ title: '认证提交成功', icon: 'success' })
      this.setState({ showRealNameModal: false })
      this.loadUserInfo()
    } catch (e) {
      console.error(e)
      Taro.showToast({ title: '提交失败', icon: 'none' })
    }
    this.setState({ loading: false })
  }

  goDriverAuth = () => {
    this.setState({ showDriverModal: true })
  }

  chooseVehicleType = () => {
    Taro.showActionSheet({
      itemList: this.vehicleTypes,
      success: (res) => {
        this.setState({
          driverForm: {
            ...this.state.driverForm,
            vehicleType: this.vehicleTypes[res.tapIndex]
          }
        })
      }
    })
  }

  submitDriverAuth = async () => {
    const { plateNumber, vehicleType, driverLicense } = this.state.driverForm
    if (!plateNumber.trim()) {
      Taro.showToast({ title: '请输入车牌号', icon: 'none' })
      return
    }
    if (!vehicleType) {
      Taro.showToast({ title: '请选择车辆类型', icon: 'none' })
      return
    }

    this.setState({ loading: true })
    try {
      await updateDriverInfo({ plateNumber, vehicleType, driverLicense })
      Taro.showToast({ title: '认证提交成功', icon: 'success' })
      this.setState({ showDriverModal: false })
      this.loadUserInfo()
    } catch (e) {
      console.error(e)
      Taro.showToast({ title: '提交失败', icon: 'none' })
    }
    this.setState({ loading: false })
  }

  render() {
    const { userInfo, nickname, gender, city, avatar, loading, showRealNameModal, showDriverModal, realNameForm, driverForm } = this.state

    return (
      <View className='profile-page'>
        <ScrollView className='content' scrollY>
          <View className='avatar-section'>
            <Image
              className='avatar'
              src={avatar || 'https://img.icons8.com/color/96/user-male-circle--v1.png'}
              onClick={this.chooseAvatar}
            />
            <Text className='avatar-tip' onClick={this.chooseAvatar}>点击更换头像</Text>
          </View>

          <View className='form-section'>
            <View className='form-item'>
              <Text className='label'>昵称</Text>
              <Input
                className='input'
                placeholder='请输入昵称'
                value={nickname}
                onInput={(e) => this.setState({ nickname: e.detail.value })}
                maxLength={20}
              />
            </View>

            <View className='form-item' onClick={this.chooseGender}>
              <Text className='label'>性别</Text>
              <View className='value'>
                <Text className={gender ? '' : 'placeholder'}>
                  {gender ? this.genders.find(g => g.key === gender)?.label : '请选择性别'}
                </Text>
                <Text className='arrow'>›</Text>
              </View>
            </View>

            <View className='form-item' onClick={this.chooseCity}>
              <Text className='label'>城市</Text>
              <View className='value'>
                <Text className={city ? '' : 'placeholder'}>
                  {city || '请选择城市'}
                </Text>
                <Text className='arrow'>›</Text>
              </View>
            </View>
          </View>

          {userInfo && (
            <View className='info-section'>
              <View className='info-row'>
                <Text className='info-label'>信誉等级</Text>
                <View className={`reputation-badge reputation-${userInfo.reputationLevel}`}>
                  {getReputationLevel(userInfo.reputationLevel)}
                </View>
              </View>
              <View className='info-row'>
                <Text className='info-label'>信誉分</Text>
                <Text className='info-value'>{userInfo.reputationScore}</Text>
              </View>
              <View className='info-row'>
                <Text className='info-label'>完成率</Text>
                <Text className='info-value'>{userInfo.completionRate}%</Text>
              </View>
            </View>
          )}

          <View className='auth-section'>
            <View className='section-title'>认证中心</View>

            <View className='auth-item' onClick={this.goRealNameAuth}>
              <View className='auth-icon'>🛡️</View>
              <View className='auth-info'>
                <Text className='auth-name'>实名认证</Text>
                <Text className='auth-desc'>完成实名认证，提升信誉等级</Text>
              </View>
              <View className={`auth-status ${userInfo?.isVerified ? 'verified' : ''}`}>
                {userInfo?.isVerified ? '已认证' : '去认证'}
              </View>
            </View>

            <View className='auth-item' onClick={this.goDriverAuth}>
              <View className='auth-icon'>🚗</View>
              <View className='auth-info'>
                <Text className='auth-name'>司机认证</Text>
                <Text className='auth-desc'>成为司机，发布行程接单</Text>
              </View>
              <View className={`auth-status ${userInfo?.role === 'driver' ? 'verified' : ''}`}>
                {userInfo?.role === 'driver' ? '已认证' : '去认证'}
              </View>
            </View>
          </View>

          <View className='footer'>
            <Button className='save-btn' loading={loading} onClick={this.saveProfile}>
              保存修改
            </Button>
          </View>
        </ScrollView>

        {showRealNameModal && (
          <View className='modal-mask' onClick={() => this.setState({ showRealNameModal: false })}>
            <View className='modal-content' onClick={(e) => e.stopPropagation()}>
              <View className='modal-title'>实名认证</View>
              <View className='form-item'>
                <Text className='label'>真实姓名</Text>
                <Input
                  className='input'
                  placeholder='请输入真实姓名'
                  value={realNameForm.realName}
                  onInput={(e) => this.setState({ realNameForm: { ...realNameForm, realName: e.detail.value } })}
                />
              </View>
              <View className='form-item'>
                <Text className='label'>身份证号</Text>
                <Input
                  className='input'
                  placeholder='请输入18位身份证号'
                  value={realNameForm.idCard}
                  onInput={(e) => this.setState({ realNameForm: { ...realNameForm, idCard: e.detail.value } })}
                  maxLength={18}
                />
              </View>
              <View className='modal-actions'>
                <View className='modal-btn cancel' onClick={() => this.setState({ showRealNameModal: false })}>取消</View>
                <View className='modal-btn confirm' onClick={this.submitRealName}>提交认证</View>
              </View>
            </View>
          </View>
        )}

        {showDriverModal && (
          <View className='modal-mask' onClick={() => this.setState({ showDriverModal: false })}>
            <View className='modal-content' onClick={(e) => e.stopPropagation()}>
              <View className='modal-title'>司机认证</View>
              <View className='form-item'>
                <Text className='label'>车牌号</Text>
                <Input
                  className='input'
                  placeholder='请输入车牌号'
                  value={driverForm.plateNumber}
                  onInput={(e) => this.setState({ driverForm: { ...driverForm, plateNumber: e.detail.value } })}
                />
              </View>
              <View className='form-item' onClick={this.chooseVehicleType}>
                <Text className='label'>车辆类型</Text>
                <View className='value'>
                  <Text className={driverForm.vehicleType ? '' : 'placeholder'}>
                    {driverForm.vehicleType || '请选择车辆类型'}
                  </Text>
                  <Text className='arrow'>›</Text>
                </View>
              </View>
              <View className='form-item'>
                <Text className='label'>驾驶证号</Text>
                <Input
                  className='input'
                  placeholder='请输入驾驶证号（选填）'
                  value={driverForm.driverLicense}
                  onInput={(e) => this.setState({ driverForm: { ...driverForm, driverLicense: e.detail.value } })}
                />
              </View>
              <View className='modal-actions'>
                <View className='modal-btn cancel' onClick={() => this.setState({ showDriverModal: false })}>取消</View>
                <View className='modal-btn confirm' onClick={this.submitDriverAuth}>提交认证</View>
              </View>
            </View>
          </View>
        )}
      </View>
    )
  }
}
