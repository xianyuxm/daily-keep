const storage = require('../../utils/storage')
const remote = require('../../utils/remote')
Page({
  data: {
    list: []
  },
  async onShow() {
    if (remote.hasToken()) {
      try {
        const list = await remote.listEntries()
        const mapped = (list || []).map(i => Object.assign({}, i, { tagText: (i.tags || []).join('、') }))
        this.setData({ list: mapped })
        return
      } catch (err) {}
    }
    wx.navigateTo({ url: '/pages/login/login' })
  }
})
