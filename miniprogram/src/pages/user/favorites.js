import { Component } from 'react'
import { View, Text, Input, ScrollView, Button, Switch } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { getFavoriteRoutes, addFavoriteRoute, deleteFavoriteRoute, updateFavoriteRoute } from '../../services/user'
import { formatDateTime } from '../../utils'
import './favorites.scss'

export default class Favorites extends Component {
  config = {
    navigationBarTitleText: '常用路线',
    enablePullDownRefresh: true
  }

  state = {
    routes: [],
    loading: false,
    showAddModal: false,
    showEditModal: false,
    editingRoute: null,
    form: {
      routeName: '',
      startPoint: '',
      endPoint: '',
      city: '',
      preferredTime: '',
      matchNotification: true
    }
  }

  componentDidMount() {
    this.loadRoutes()
  }

  onPullDownRefresh() {
    this.loadRoutes()
    Taro.stopPullDownRefresh()
  }

  loadRoutes = async () => {
    this.setState({ loading: true })
    try {
      const res = await getFavoriteRoutes()
      this.setState({ routes: res.list || res || [] })
    } catch (e) {
      console.error(e)
    }
    this.setState({ loading: false })
  }

  openAddModal = () => {
    this.setState({
      showAddModal: true,
      form: {
        routeName: '',
        startPoint: '',
        endPoint: '',
        city: '',
        preferredTime: '',
        matchNotification: true
      }
    })
  }

  openEditModal = (route) => {
    this.setState({
      showEditModal: true,
      editingRoute: route,
      form: {
        routeName: route.routeName || '',
        startPoint: route.startPoint || '',
        endPoint: route.endPoint || '',
        city: route.city || '',
        preferredTime: route.preferredTime || '',
        matchNotification: route.matchNotification !== false
      }
    })
  }

  closeModal = () => {
    this.setState({
      showAddModal: false,
      showEditModal: false,
      editingRoute: null
    })
  }

  chooseLocation = (field) => {
    Taro.chooseLocation({
      success: (res) => {
        this.setState({
          form: {
            ...this.state.form,
            [field]: res.name || res.address,
            city: this.state.form.city || res.address?.split('市')[0] + '市' || ''
          }
        })
      },
      fail: () => {
        Taro.showModal({
          title: `输入${field === 'startPoint' ? '起点' : '终点'}`,
          editable: true,
          placeholderText: `请输入${field === 'startPoint' ? '起点' : '终点'}地址`,
          success: (res) => {
            if (res.confirm && res.content) {
              this.setState({
                form: {
                  ...this.state.form,
                  [field]: res.content
                }
              })
            }
          }
        })
      }
    })
  }

  chooseTime = () => {
    Taro.showActionSheet({
      itemList: ['早上 (7:00-9:00)', '上午 (9:00-12:00)', '下午 (12:00-18:00)', '晚上 (18:00-21:00)', '夜间 (21:00-24:00)'],
      success: (res) => {
        const times = ['7:00-9:00', '9:00-12:00', '12:00-18:00', '18:00-21:00', '21:00-24:00']
        this.setState({
          form: {
            ...this.state.form,
            preferredTime: times[res.tapIndex]
          }
        })
      }
    })
  }

  submitRoute = async () => {
    const { form, showAddModal, editingRoute } = this.state
    if (!form.startPoint.trim()) {
      Taro.showToast({ title: '请输入起点', icon: 'none' })
      return
    }
    if (!form.endPoint.trim()) {
      Taro.showToast({ title: '请输入终点', icon: 'none' })
      return
    }

    this.setState({ loading: true })
    try {
      if (showAddModal) {
        await addFavoriteRoute(form)
        Taro.showToast({ title: '添加成功', icon: 'success' })
      } else {
        await updateFavoriteRoute(editingRoute.id, form)
        Taro.showToast({ title: '修改成功', icon: 'success' })
      }
      this.closeModal()
      this.loadRoutes()
    } catch (e) {
      console.error(e)
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
    this.setState({ loading: false })
  }

  deleteRoute = async (route) => {
    const res = await Taro.showModal({
      title: '提示',
      content: '确定要删除这条路线吗？'
    })
    if (!res.confirm) return

    try {
      await deleteFavoriteRoute(route.id)
      Taro.showToast({ title: '删除成功', icon: 'success' })
      this.loadRoutes()
    } catch (e) {
      console.error(e)
      Taro.showToast({ title: '删除失败', icon: 'none' })
    }
  }

  useRoute = (route) => {
    Taro.redirectTo({
      url: `/pages/trip/search?startPoint=${encodeURIComponent(route.startPoint)}&endPoint=${encodeURIComponent(route.endPoint)}`
    })
  }

  render() {
    const { routes, loading, showAddModal, showEditModal, form } = this.state

    return (
      <View className='favorites-page'>
        <ScrollView className='content' scrollY>
          {loading ? (
            <View className='loading'>加载中...</View>
          ) : routes.length === 0 ? (
            <View className='empty'>
              <Text className='empty-icon'>⭐</Text>
              <Text className='empty-text'>暂无收藏路线</Text>
              <Text className='empty-tip'>收藏常用路线，一键搜索更方便</Text>
            </View>
          ) : (
            routes.map(route => (
              <View key={route.id} className='route-card'>
                {route.isDefault && <View className='default-tag'>默认</View>}
                <View className='route-header'>
                  <Text className='route-name'>
                    {route.routeName || `${route.startPoint} - ${route.endPoint}`}
                  </Text>
                  {route.preferredTime && (
                    <View className='time-tag'>🕐 {route.preferredTime}</View>
                  )}
                </View>

                <View className='route-detail'>
                  <View className='point'>
                    <View className='dot start'></View>
                    <Text className='point-text'>{route.startPoint}</Text>
                  </View>
                  <View className='line'></View>
                  <View className='point'>
                    <View className='dot end'></View>
                    <Text className='point-text'>{route.endPoint}</Text>
                  </View>
                </View>

                {route.city && (
                  <Text className='city'>📍 {route.city}</Text>
                )}

                <View className='route-footer'>
                  <View className='footer-left'>
                    <Text className='search-count'>已搜索 {route.searchCount || 0} 次</Text>
                    {route.lastUsedAt && (
                      <Text className='last-used'>{formatDateTime(route.lastUsedAt)}</Text>
                    )}
                  </View>
                  <View className='actions'>
                    <View className='action-btn edit' onClick={() => this.openEditModal(route)}>编辑</View>
                    <View className='action-btn delete' onClick={() => this.deleteRoute(route)}>删除</View>
                    <View className='action-btn use' onClick={() => this.useRoute(route)}>使用</View>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        <View className='footer'>
          <Button className='add-btn' onClick={this.openAddModal}>
            + 新增路线
          </Button>
        </View>

        {(showAddModal || showEditModal) && (
          <View className='modal-mask' onClick={this.closeModal}>
            <View className='modal-content' onClick={(e) => e.stopPropagation()}>
              <View className='modal-title'>{showAddModal ? '新增路线' : '编辑路线'}</View>

              <View className='form-item'>
                <Text className='label'>路线名称</Text>
                <Input
                  className='input'
                  placeholder='请输入路线名称（选填）'
                  value={form.routeName}
                  onInput={(e) => this.setState({ form: { ...form, routeName: e.detail.value } })}
                  maxLength={20}
                />
              </View>

              <View className='form-item' onClick={() => this.chooseLocation('startPoint')}>
                <Text className='label'>起点</Text>
                <View className='value'>
                  <Text className={form.startPoint ? '' : 'placeholder'}>
                    {form.startPoint || '请选择起点'}
                  </Text>
                  <Text className='arrow'>›</Text>
                </View>
              </View>

              <View className='form-item' onClick={() => this.chooseLocation('endPoint')}>
                <Text className='label'>终点</Text>
                <View className='value'>
                  <Text className={form.endPoint ? '' : 'placeholder'}>
                    {form.endPoint || '请选择终点'}
                  </Text>
                  <Text className='arrow'>›</Text>
                </View>
              </View>

              <View className='form-item' onClick={this.chooseTime}>
                <Text className='label'>偏好时间</Text>
                <View className='value'>
                  <Text className={form.preferredTime ? '' : 'placeholder'}>
                    {form.preferredTime || '请选择偏好时间（选填）'}
                  </Text>
                  <Text className='arrow'>›</Text>
                </View>
              </View>

              <View className='form-item'>
                <Text className='label'>匹配通知</Text>
                <Switch
                  checked={form.matchNotification}
                  onChange={(e) => this.setState({ form: { ...form, matchNotification: e.detail.value } })}
                  color='#1890ff'
                />
              </View>

              <View className='modal-actions'>
                <View className='modal-btn cancel' onClick={this.closeModal}>取消</View>
                <View className='modal-btn confirm' onClick={this.submitRoute}>
                  {showAddModal ? '确认添加' : '保存修改'}
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    )
  }
}
