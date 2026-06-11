import { Component, PropsWithChildren } from 'react'
import './app.scss'

class App extends Component<PropsWithChildren> {

  componentDidMount () {
    const token = Taro.getStorageSync('token')
    if (token) {
      Taro.checkSession({
        success: () => {},
        fail: () => {
          Taro.removeStorageSync('token')
          Taro.removeStorageSync('userInfo')
        }
      })
    }
  }

  componentDidShow () {}

  componentDidHide () {}

  render () {
    return this.props.children
  }
}

export default App
