const KEY = 'daily_entries'
function read() {
  const data = wx.getStorageSync(KEY)
  if (!data) return []
  try {
    const list = JSON.parse(data)
    if (Array.isArray(list)) return list
    return []
  } catch (e) {
    return []
  }
}
function write(list) {
  wx.setStorageSync(KEY, JSON.stringify(list || []))
}
function formatDate(ts) {
  const d = ts ? new Date(ts) : new Date()
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}
function findByDate(list, date) {
  return list.find(i => i.date === date)
}
function persistImage(path) {
  return new Promise((resolve, reject) => {
    wx.getFileSystemManager().saveFile({
      tempFilePath: path,
      success(res) {
        resolve(res.savedFilePath)
      },
      fail(err) {
        resolve(path)
      }
    })
  })
}
async function addOrUpdateEntry({ date, title, text, photos, tags, mood, rating, checkin }) {
  const list = read()
  const d = date || formatDate()
  const existing = findByDate(list, d)
  const savedPhotos = []
  if (Array.isArray(photos)) {
    for (const p of photos) {
      const sp = await persistImage(p)
      savedPhotos.push(sp)
    }
  }
  if (existing) {
    existing.title = title !== undefined ? title : (existing.title || '')
    existing.text = text || existing.text || ''
    existing.photos = savedPhotos.length ? savedPhotos : existing.photos || []
    existing.tags = Array.isArray(tags) ? tags : (existing.tags || [])
    existing.mood = mood !== undefined ? mood : (existing.mood || '')
    existing.rating = typeof rating === 'number' ? rating : (existing.rating || 0)
    existing.checkin = typeof checkin === 'boolean' ? checkin : !!existing.checkin
    existing.updatedAt = Date.now()
  } else {
    const entry = {
      id: `${d}-${Date.now()}`,
      date: d,
      title: title || '',
      text: text || '',
      photos: savedPhotos,
      tags: Array.isArray(tags) ? tags : [],
      mood: mood || '',
      rating: typeof rating === 'number' ? rating : 0,
      checkin: !!checkin,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    list.push(entry)
  }
  list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  write(list)
  return findByDate(list, d)
}
function getEntries() {
  return read()
}
function searchEntries({ keyword, tags, startDate, endDate, mood, minRating, checkin }) {
  const list = read()
  return list.filter(e => {
    if (keyword && !((e.title || '').includes(keyword) || (e.text || '').includes(keyword))) return false
    if (Array.isArray(tags) && tags.length && !tags.every(t => (e.tags || []).includes(t))) return false
    if (mood && e.mood !== mood) return false
    if (typeof minRating === 'number' && (e.rating || 0) < minRating) return false
    if (typeof checkin === 'boolean' && !!e.checkin !== checkin) return false
    if (startDate && new Date(e.date) < new Date(startDate)) return false
    if (endDate && new Date(e.date) > new Date(endDate)) return false
    return true
  })
}
function monthStats(year, month) {
  const ym = `${year}-${`${month}`.padStart(2, '0')}`
  const list = read().filter(e => (e.date || '').startsWith(ym))
  const days = new Set(list.map(e => e.date))
  const tagCount = {}
  list.forEach(e => (e.tags || []).forEach(t => { tagCount[t] = (tagCount[t] || 0) + 1 }))
  const topTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t, c]) => ({ tag: t, count: c }))
  return { totalDays: days.size, topTags, days: Array.from(days) }
}
function getEntryByDate(date) {
  const list = read()
  return findByDate(list, date)
}
function removePhoto(date, path) {
  const list = read()
  const e = findByDate(list, date)
  if (!e) return
  e.photos = (e.photos || []).filter(p => p !== path)
  e.updatedAt = Date.now()
  write(list)
}
module.exports = {
  addOrUpdateEntry,
  getEntries,
  searchEntries,
  getEntryByDate,
  removePhoto,
  formatDate,
  monthStats
}
