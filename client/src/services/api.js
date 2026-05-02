import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000
})

// 全局请求拦截器 - 添加角色头信息
axiosInstance.interceptors.request.use((config) => {
  const role = localStorage.getItem('dorminone_role') || 'member'
  const username = localStorage.getItem('dorminone_username') || ''
  config.headers['x-role'] = role
  config.headers['x-username'] = username
  return config
})

export const authApi = {
  login: (username, password) => axiosInstance.post('/login', { username, password }),
  validate: () => axiosInstance.get('/validate')
}

export const roommatesApi = {
  getAll: () => axiosInstance.get('/roommates'),
  create: (data) => axiosInstance.post('/roommates', data),
  update: (id, data) => axiosInstance.put(`/roommates/${id}`, data),
  delete: (id) => axiosInstance.delete(`/roommates/${id}`)
}

export const scheduleApi = {
  getAll: () => axiosInstance.get('/schedule'),
  create: (data) => axiosInstance.post('/schedule', data),
  update: (id, data) => axiosInstance.put(`/schedule/${id}`, data),
  delete: (id) => axiosInstance.delete(`/schedule/${id}`)
}

export const billsApi = {
  getAll: () => axiosInstance.get('/bills'),
  create: (data) => axiosInstance.post('/bills', data),
  update: (id, data) => axiosInstance.put(`/bills/${id}`, data),
  delete: (id) => axiosInstance.delete(`/bills/${id}`)
}

export const electricityApi = {
  getAll: () => axiosInstance.get('/electricity'),
  create: (data) => axiosInstance.post('/electricity', data),
  update: (id, data) => axiosInstance.put(`/electricity/${id}`, data),
  delete: (id) => axiosInstance.delete(`/electricity/${id}`)
}

export const itemsApi = {
  getAll: () => axiosInstance.get('/items'),
  create: (data) => axiosInstance.post('/items', data),
  update: (id, data) => axiosInstance.put(`/items/${id}`, data),
  delete: (id) => axiosInstance.delete(`/items/${id}`),
  borrow: (id, borrowerId, borrowerName) => axiosInstance.get(`/items/${id}/borrow`, { params: { borrowerId, borrowerName } }),
  return: (id) => axiosInstance.get(`/items/${id}/return`)
}

export const bedsApi = {
  getAll: () => axiosInstance.get('/beds'),
  create: (data) => axiosInstance.post('/beds', data),
  update: (id, data) => axiosInstance.put(`/beds/${id}`, data),
  delete: (id) => axiosInstance.delete(`/beds/${id}`)
}

export const repairsApi = {
  getAll: () => axiosInstance.get('/repairs'),
  create: (data) => axiosInstance.post('/repairs', data),
  update: (id, data) => axiosInstance.put(`/repairs/${id}`, data),
  delete: (id) => axiosInstance.delete(`/repairs/${id}`)
}

export const cleanApi = {
  getAll: () => axiosInstance.get('/clean'),
  create: (data) => axiosInstance.post('/clean', data),
  update: (id, data) => axiosInstance.put(`/clean/${id}`, data),
  delete: (id) => axiosInstance.delete(`/clean/${id}`)
}

export const backupApi = {
  download: () => axiosInstance.get('/backup', { responseType: 'blob' }),
  restore: (data) => axiosInstance.post('/restore', data)
}

export const utilitiesApi = {
  create: (data) => axiosInstance.post('/utilities', data)
}
