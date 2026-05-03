import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000
})

axiosInstance.interceptors.request.use((config) => {
  const role = localStorage.getItem('dorminone_role') || ''
  const username = localStorage.getItem('dorminone_username') || ''
  const floorId = localStorage.getItem('dorminone_floor_id') || ''
  const dormId = localStorage.getItem('dorminone_dorm_id') || ''
  
  if (role) config.headers['x-role'] = role
  if (username) config.headers['x-username'] = username
  if (floorId) config.headers['x-floor-id'] = floorId
  if (dormId) config.headers['x-dorm-id'] = dormId
  
  return config
})

export const authApi = {
  login: (username, password) => axiosInstance.post('/login', { username, password }),
  validate: () => axiosInstance.get('/validate'),
  validateInvite: (code) => axiosInstance.post('/validate-invite', { code }),
  bindRole: (code, username, password, name, role) => 
    axiosInstance.post('/bind-role', { code, username, password, name, role }),
  getUserInfo: () => axiosInstance.get('/user-info')
}

export const floorsApi = {
  getAll: () => axiosInstance.get('/floors'),
  getById: (id) => axiosInstance.get(`/floors/${id}`),
  create: (name, buildingName) => axiosInstance.post('/floors', { name, buildingName }),
  update: (id, data) => axiosInstance.put(`/floors/${id}`, data),
  delete: (id) => axiosInstance.delete(`/floors/${id}`),
  regenerateInvite: (id) => axiosInstance.post(`/floors/${id}/regenerate-invite`)
}

export const dormitoriesApi = {
  getAll: () => axiosInstance.get('/dormitories'),
  getById: (id) => axiosInstance.get(`/dormitories/${id}`),
  create: (floorId, name, className) => axiosInstance.post('/dormitories', { floorId, name, className }),
  update: (id, data) => axiosInstance.put(`/dormitories/${id}`, data),
  delete: (id) => axiosInstance.delete(`/dormitories/${id}`),
  regenerateInvite: (id) => axiosInstance.post(`/dormitories/${id}/regenerate-invite`)
}

export const usersApi = {
  getAll: () => axiosInstance.get('/users'),
  getById: (id) => axiosInstance.get(`/users/${id}`),
  create: (username, password, name) => axiosInstance.post('/users', { username, password, name }),
  update: (id, data) => axiosInstance.put(`/users/${id}`, data),
  delete: (id) => axiosInstance.delete(`/users/${id}`)
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
  restore: (data) => axiosInstance.post('/restore', data),
  deleteAllData: () => axiosInstance.delete('/all-data')
}

export const utilitiesApi = {
  create: (data) => axiosInstance.post('/utilities', data)
}

export const userSettingsApi = {
  get: (userId) => axiosInstance.get(`/user-settings/${userId}`),
  update: (userId, data) => axiosInstance.put(`/user-settings/${userId}`, data),
  changePassword: (userId, oldPassword, newPassword) => 
    axiosInstance.post(`/user-settings/${userId}/change-password`, { oldPassword, newPassword })
}

export const dormSettingsApi = {
  get: (dormId) => axiosInstance.get(`/dorm-settings/${dormId}`),
  update: (dormId, data) => axiosInstance.put(`/dorm-settings/${dormId}`, data),
  addAnnouncement: (dormId, title, content, style) => 
    axiosInstance.post(`/dorm-settings/${dormId}/announcement`, { title, content, style }),
  deleteAnnouncement: (dormId, announcementId) => 
    axiosInstance.delete(`/dorm-settings/${dormId}/announcement/${announcementId}`)
}

export const avatarsApi = {
  getAll: () => axiosInstance.get('/avatars')
}