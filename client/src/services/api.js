import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000
})

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
