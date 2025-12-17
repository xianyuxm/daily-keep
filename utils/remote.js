const api = require('./api')
function isLocalTemp(p) {
  return typeof p === 'string' && (/^wxfile:\/\//.test(p) || /^https?:\/\/tmp\//.test(p))
}
function hasToken() {
  return !!wx.getStorageSync('token')
}
async function uploadPhotos(paths) {
  const res = []
  for (const p of paths || []) {
    if (!p || typeof p !== 'string') continue
    if (isLocalTemp(p)) {
      const r = await api.upload({ url: '/entries/upload', filePath: p })
      const url = r.url || p
      const full = url.startsWith('http') ? url : (api.BASE_URL + url)
      res.push(full)
      continue
    }
    res.push(p)
  }
  return res
}
async function upsertEntry(entry) {
  const saved = await api.request({ url: '/entries', method: 'POST', data: entry })
  return saved
}
async function listEntries() {
  return await api.request({ url: '/entries', method: 'GET' })
}
async function search(params) {
  const q = []
  Object.keys(params || {}).forEach(k => {
    const v = params[k]
    if (v === undefined || v === null || v === '') return
    if (Array.isArray(v)) v.forEach(item => q.push(`${k}=${encodeURIComponent(item)}`))
    else q.push(`${k}=${encodeURIComponent(v)}`)
  })
  const url = '/search' + (q.length ? `?${q.join('&')}` : '')
  return await api.request({ url, method: 'GET' })
}
async function monthStats(year, month) {
  return await api.request({ url: `/stats/month?year=${year}&month=${month}`, method: 'GET' })
}
module.exports = { hasToken, uploadPhotos, upsertEntry, listEntries, search, monthStats }
