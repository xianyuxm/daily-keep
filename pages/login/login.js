const api = require('../../utils/api')
Page({
  data: {
    username: '',
    password: ''
  },
  onUserInput(e) {
    this.setData({ username: e.detail.value })
  },
  onPassInput(e) {
    this.setData({ password: e.detail.value })
  },
  async onLogin() {
    const res = await api.request({ url: '/auth/login', method: 'POST', data: { username: this.data.username, password: this.data.password } })
    if (res && res.token) {
      wx.setStorageSync('token', res.token)
      wx.showToast({ title: '已登录', icon: 'success' })
      wx.reLaunch({ url: '/pages/calendar/calendar' })
    } else {
      wx.showToast({ title: '登录失败', icon: 'none' })
    }
  },
  async onRegister() {
    const u = (this.data.username || '').trim()
    const p = (this.data.password || '')
    if (!u || !p) {
      wx.showToast({ title: '请输入用户名和密码', icon: 'none' })
      return
    }
    const res = await api.request({ url: '/auth/register', method: 'POST', data: { username: u, password: p } })
    if (res && res.ok) {
      wx.showToast({ title: '注册成功', icon: 'success' })
    } else {
      wx.showToast({ title: '注册失败', icon: 'none' })
    }
  }
})
