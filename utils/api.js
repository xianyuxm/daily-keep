const BASE_URL = 'http://localhost:8080'
function getToken() {
  return wx.getStorageSync('token') || ''
}
function request({ url, method = 'GET', data, header = {} }) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + url,
      method,
      data,
      header: Object.assign(
        {},
        header,
        { Authorization: `Bearer ${getToken()}` },
        (method === 'POST' || method === 'PUT') ? { 'content-type': 'application/json' } : {}
      ),
      success(res) {
        const code = res.statusCode || 0
        if (code >= 200 && code < 300) {
          resolve(res.data)
        } else {
          reject(res)
        }
      },
      fail(err) {
        reject(err)
      }
    })
  })
}
function upload({ url, filePath, name = 'file', formData = {} }) {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: BASE_URL + url,
      filePath,
      name,
      formData,
      header: { Authorization: `Bearer ${getToken()}` },
      success(res) {
        try {
          resolve(JSON.parse(res.data))
        } catch (e) {
          resolve(res.data)
        }
      },
      fail(err) {
        reject(err)
      }
    })
  })
}
module.exports = { request, upload, BASE_URL }
