const storage = require('../../utils/storage')
const remote = require('../../utils/remote')
function markdownToNodes(text) {
  const nodes = []
  const lines = (text || '').split(/\r?\n/)
  let inCode = false
  let codeLines = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.trim() === '```') {
      if (!inCode) {
        inCode = true
        codeLines = []
      } else {
        inCode = false
        nodes.push({ name: 'pre', children: [{ type: 'text', text: codeLines.join('\n') }] })
      }
      continue
    }
    if (inCode) {
      codeLines.push(line)
      continue
    }
    const h = line.match(/^(#{1,6})\s+(.*)$/)
    if (h) {
      const level = h[1].length
      const content = h[2]
      nodes.push({ name: 'h' + level, children: [{ type: 'text', text: content }] })
      continue
    }
    let html = line
    html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>')
    html = html.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    html = html.replace(/\*([^*]+)\*/g, '<i>$1</i>')
    if (/^\s*-\s+/.test(html)) {
      const content = html.replace(/^\s*-\s+/, '• ')
      nodes.push({ name: 'p', children: [{ type: 'text', text: content }] })
      continue
    }
    nodes.push({ name: 'p', children: [{ type: 'text', text: html }] })
  }
  return nodes
}
Page({
  data: {
    date: '',
    title: '',
    text: '',
    photos: [],
    showTextModal: false,
    tab: 'edit',
    previewNodes: [],
    weatherOptions: ['晴','多云','阴','小雨','大雨','雪','雾','霾','风'],
    weatherIndex: 0,
    weather: '',
    temperature: ''
  },
  async onLoad(options) {
    const d = options && options.date ? options.date : storage.formatDate()
    let e = null
    if (remote.hasToken()) {
      try {
        const list = await remote.listEntries()
        e = (list || []).find(i => i.date === d) || null
      } catch (err) {
        wx.showToast({ title: '网络错误', icon: 'none' })
        wx.navigateTo({ url: '/pages/login/login' })
        return
      }
    } else {
      wx.navigateTo({ url: '/pages/login/login' })
      return
    }
    this.setData({
      date: d,
      title: e ? (e.title || '') : '',
      text: e ? e.text : '',
      photos: e ? (e.photos || []) : [],
      previewNodes: markdownToNodes(e ? (e.text || '') : ''),
      weather: e ? (e.weather || '') : '',
      temperature: e ? ((e.temperature === null || e.temperature === undefined) ? '' : String(e.temperature)) : '',
      weatherIndex: this.data.weatherOptions.indexOf(e ? (e.weather || '') : '') >= 0 ? this.data.weatherOptions.indexOf(e ? (e.weather || '') : '') : 0
    })
  },
  async onDateChange(e) {
    const d = e.detail.value
    let entry = null
    if (remote.hasToken()) {
      try {
        const list = await remote.listEntries()
        entry = (list || []).find(i => i.date === d) || null
      } catch (err) {
        wx.showToast({ title: '网络错误', icon: 'none' })
        return
      }
    } else {
      wx.navigateTo({ url: '/pages/login/login' })
      return
    }
    this.setData({
      date: d,
      title: entry ? (entry.title || '') : '',
      text: entry ? entry.text : '',
      photos: entry ? (entry.photos || []) : [],
      previewNodes: markdownToNodes(entry ? (entry.text || '') : ''),
      weather: entry ? (entry.weather || '') : '',
      temperature: entry ? ((entry.temperature === null || entry.temperature === undefined) ? '' : String(entry.temperature)) : '',
      weatherIndex: this.data.weatherOptions.indexOf(entry ? (entry.weather || '') : '') >= 0 ? this.data.weatherOptions.indexOf(entry ? (entry.weather || '') : '') : 0
    })
  },
  onTitleInput(e) {
    this.setData({ title: e.detail.value })
  },
  onTextInput(e) {
    const v = e.detail.value
    this.setData({ text: v, previewNodes: markdownToNodes(v) })
  },
  openTextModal() {
    this.setData({ showTextModal: true, tab: 'edit' })
  },
  closeTextModal() {
    this.setData({ previewNodes: markdownToNodes(this.data.text || ''), showTextModal: false })
  },
  setTab(e) {
    const t = e.currentTarget.dataset.tab
    this.setData({ tab: t })
    if (t === 'preview') {
      this.setData({ previewNodes: markdownToNodes(this.data.text || '') })
    }
  },
  onWeatherSelect(e) {
    const idx = Number(e.detail.value)
    const w = this.data.weatherOptions[idx] || ''
    this.setData({ weatherIndex: idx, weather: w })
  },
  onTempInput(e) {
    const raw = e.detail.value
    const clean = raw.replace(/[^\d-]/g, '')
    this.setData({ temperature: clean })
  },
  onChooseImage() {
    wx.chooseImage({
      count: 9,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        const list = this.data.photos.concat(res.tempFilePaths || [])
        this.setData({ photos: list })
      }
    })
  },
  onRemovePhoto(e) {
    const path = e.currentTarget.dataset.path
    const list = (this.data.photos || []).filter(p => p !== path)
    this.setData({ photos: list })
    storage.removePhoto(this.data.date, path)
  },
  async onSave() {
    let saved = null
    if (remote.hasToken()) {
      const uploaded = await remote.uploadPhotos(this.data.photos || [])
      const payload = {
        date: this.data.date,
        title: this.data.title,
        text: this.data.text,
        photos: uploaded,
        weather: this.data.weather,
        temperature: (this.data.temperature === '' ? null : Number(this.data.temperature))
      }
      try {
        saved = await remote.upsertEntry(payload)
      } catch (err) {
        saved = payload
      }
    } else {
      wx.navigateTo({ url: '/pages/login/login' })
      return
    }
    this.setData({
      title: saved.title || '',
      text: saved.text,
      photos: saved.photos || [],
      weather: saved.weather || '',
      temperature: (saved.temperature === null || saved.temperature === undefined) ? '' : String(saved.temperature),
      weatherIndex: this.data.weatherOptions.indexOf(saved.weather || '') >= 0 ? this.data.weatherOptions.indexOf(saved.weather || '') : 0,
      previewNodes: markdownToNodes(saved.text || '')
    })
    wx.showToast({ title: '已保存', icon: 'success' })
  }
})
