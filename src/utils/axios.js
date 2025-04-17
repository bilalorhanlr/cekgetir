import axios from 'axios'
import Cookies from 'js-cookie'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - her istekte token kontrolü
api.interceptors.request.use(
  (config) => {
    // URL'e göre farklı token kullanımı
    if (config.url.startsWith('/admin')) {
      // Admin isteği için user token'ı temizle
      Cookies.remove('token')
      localStorage.removeItem('token')
      
      // Sadece admin token'ı kullan
      const adminToken = localStorage.getItem('adminToken') || Cookies.get('adminToken')
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`
      } else {
        // Admin token yoksa login'e yönlendir
        window.location.href = '/admin/login'
      }
    } else {
      const userToken = Cookies.get('token')
      if (userToken) {
        config.headers.Authorization = `Bearer ${userToken}`
      }
    }
    
    return config
  },
  (error) => {
    // Hata mesajını göstermek için custom event fırlat
    const event = new CustomEvent('showNotification', {
      detail: {
        type: 'error',
        message: 'İstek gönderilirken bir hata oluştu. Lütfen tekrar deneyin.'
      }
    })
    window.dispatchEvent(event)
    return Promise.reject(error)
  }
)

// Response interceptor - token geçersiz olduğunda
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'Bir hata oluştu. Lütfen tekrar deneyin.'

    if (error.response?.status === 401) {
      message = 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.'
      if (error.config.url.startsWith('/admin')) {
        // Her iki yerden de token'ı temizle
        localStorage.removeItem('adminToken')
        Cookies.remove('adminToken')
      } else {
        console.log('User 401 error - removing token and redirecting')
        localStorage.removeItem('token')
        Cookies.remove('token')
      }
      window.location.href = '/login'
    } else if (error.response?.status === 403) {
      message = 'Bu işlem için yetkiniz bulunmuyor.'
    } else if (error.response?.status === 404) {
      message = 'İstenen kaynak bulunamadı.'
    } else if (error.response?.status === 500) {
      message = 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.'
    }

    // Hata mesajını göstermek için custom event fırlat
    const event = new CustomEvent('showNotification', {
      detail: {
        type: 'error',
        message
      }
    })
    window.dispatchEvent(event)

    return Promise.reject(error)
  }
)

// Token ayarlama yardımcı fonksiyonu
export const setAuthToken = (token, isAdmin = false) => {
  if (isAdmin) {
    localStorage.setItem('adminToken', token)
    Cookies.set('adminToken', token)
  } else {
    Cookies.set('token', token)
  }
  
  // Token'ı doğrudan axios instance'ına da ekleyelim
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export const clearAuthToken = (isAdmin = false) => {
  if (isAdmin) {
    localStorage.removeItem('adminToken')
    Cookies.remove('adminToken')
  } else {
    localStorage.removeItem('token')
    Cookies.remove('token')
  }
  
  // Axios headers'dan da temizleyelim
  delete api.defaults.headers.common['Authorization']
}

export default api 