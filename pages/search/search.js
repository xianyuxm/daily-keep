const storage = require('../../utils/storage')
const remote = require('../../utils/remote')
Page({
  data: {
    keyword: '',
    startDate: '',
    endDate: '',
    results: []
  },
  onKeywordInput(e) {
    this.setData({ keyword: e.detail.value })
  },
  onStartDateChange(e) {
    this.setData({ startDate: e.detail.value })
  },
  onEndDateChange(e) {
    this.setData({ endDate: e.detail.value })
  },
  async onSearch() {
    if (remote.hasToken()) {
      try {
        const res = await remote.search({
          keyword: this.data.keyword,
          startDate: this.data.startDate,
          endDate: this.data.endDate
        })
        this.setData({ results: res || [] })
        return
      } catch (err) {}
    }
    wx.navigateTo({ url: '/pages/login/login' })
  }
})
