const storage = require('../../utils/storage')
const remote = require('../../utils/remote')
function buildCalendar(year, month, daysWithData, todayStr) {
  const first = new Date(year, month - 1, 1)
  const startWeekday = first.getDay()
  const totalDays = new Date(year, month, 0).getDate()
  const cells = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${`${month}`.padStart(2, '0')}-${`${d}`.padStart(2, '0')}`
    cells.push({ day: d, date: dateStr, has: daysWithData.includes(dateStr), isToday: dateStr === todayStr })
  }
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7).map(c => c || { day: '', date: '', has: false, isToday: false }))
  }
  return weeks
}
Page({
  data: {
    year: new Date().getFullYear(),
    month: `${new Date().getMonth() + 1}`.padStart(2, '0'),
    stats: { totalDays: 0, topTags: [], days: [] },
    weeks: [],
    today: `${new Date().getFullYear()}-${`${new Date().getMonth() + 1}`.padStart(2, '0')}-${`${new Date().getDate()}`.padStart(2, '0')}`
  },
  onLoad() {
    const nowYear = new Date().getFullYear()
    const years = []
    for (let y = nowYear - 5; y <= nowYear + 5; y++) years.push(`${y}`)
    const months = []
    for (let m = 1; m <= 12; m++) months.push(`${m}`.padStart(2, '0'))
    const yIndex = years.indexOf(`${this.data.year}`)
    const mIndex = months.indexOf(`${this.data.month}`)
    this.setData({ yearOptions: years, monthOptions: months, yearIndex: yIndex > -1 ? yIndex : 5, monthIndex: mIndex > -1 ? mIndex : (new Date().getMonth()) })
  },
  async refresh() {
    let s = null
    if (remote.hasToken()) {
      try {
        s = await remote.monthStats(this.data.year, Number(this.data.month))
      } catch (err) {}
    }
    if (!s) {
      wx.navigateTo({ url: '/pages/login/login' })
      return
    }
    const weeks = buildCalendar(this.data.year, Number(this.data.month), s.days || [], this.data.today)
    this.setData({ stats: s, weeks })
  },
  onShow() {
    this.setData({ isLogin: remote.hasToken() })
    this.refresh()
  },
  onMonthChange(e) {
    const [y, m] = e.detail.value.split('-')
    this.setData({ year: Number(y), month: m })
    this.refresh()
  },
  onPrevMonth() {
    const y = this.data.year
    const m = Number(this.data.month)
    const nm = m === 1 ? 12 : m - 1
    const ny = m === 1 ? y - 1 : y
    const months = this.data.monthOptions || []
    const years = this.data.yearOptions || []
    const yIndex = years.indexOf(`${ny}`)
    const mIndex = months.indexOf(`${nm}`.padStart(2, '0'))
    this.setData({ year: ny, month: `${nm}`.padStart(2, '0'), yearIndex: yIndex, monthIndex: mIndex })
    this.refresh()
  },
  onNextMonth() {
    const y = this.data.year
    const m = Number(this.data.month)
    const nm = m === 12 ? 1 : m + 1
    const ny = m === 12 ? y + 1 : y
    const months = this.data.monthOptions || []
    const years = this.data.yearOptions || []
    const yIndex = years.indexOf(`${ny}`)
    const mIndex = months.indexOf(`${nm}`.padStart(2, '0'))
    this.setData({ year: ny, month: `${nm}`.padStart(2, '0'), yearIndex: yIndex, monthIndex: mIndex })
    this.refresh()
  },
  onYearSelect(e) {
    const idx = Number(e.detail.value)
    const yearStr = this.data.yearOptions[idx]
    this.setData({ year: Number(yearStr), yearIndex: idx })
    this.refresh()
  },
  onMonthSelect(e) {
    const idx = Number(e.detail.value)
    const monthStr = this.data.monthOptions[idx]
    this.setData({ month: monthStr, monthIndex: idx })
    this.refresh()
  },
  onLoginTap() {
    wx.navigateTo({ url: '/pages/login/login' })
  },
  onLogoutTap() {
    wx.removeStorageSync('token')
    wx.reLaunch({ url: '/pages/login/login' })
  }
})
