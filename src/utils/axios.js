import axios from 'axios'
import Cookies from 'js-cookie'

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('adminToken') || Cookies.get('adminToken')
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token'ı temizle
      localStorage.removeItem('adminToken')
      Cookies.remove('adminToken')
      // Login sayfasına yönlendir
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)

export default api 