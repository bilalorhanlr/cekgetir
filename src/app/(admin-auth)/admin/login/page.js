'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '@/components/LoadingSpinner'
import api from '@/utils/axios'
import Cookies from 'js-cookie'


export default function AdminLoginPage() {

  const router = useRouter()
  
  // Token kontrolü için useEffect
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken') || Cookies.get('adminToken')
    if (adminToken) {
      // Token varsa direkt admin paneline yönlendir
      localStorage.removeItem('token')
      Cookies.remove('token')
      router.push('/admin/basvuru')
    }
    //if else ile eğer kullanıcı tokenı varsa login sayfasına yönlendir
    else if (Cookies.get('token')){
      localStorage.removeItem('adminToken')
      Cookies.remove('adminToken')
      router.push('/login')
    }
  }, [router])

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [verificationStep, setVerificationStep] = useState(1) // 1: login, 2: kod doğrulama
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)

  // Email ve şifre ile giriş
  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!formData.email || !formData.password) {
      setError('Tüm alanları doldurun')
      return
    }

    try {
      setIsLoading(true)

      // İlk login denemesi - sadece email/şifre kontrolü
      const loginResponse = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      })

      if (loginResponse.data) {
        try {
          await api.post('/user/password-reset/request', { 
            email: formData.email 
          })
          setVerificationStep(2)
          setCountdown(120)
          const timer = setInterval(() => {
            setCountdown(prev => {
              if (prev <= 1) {
                clearInterval(timer)
                return 0
              }
              return prev - 1
            })
          }, 1000)
        } catch (resetError) {
          console.error('Doğrulama kodu gönderme hatası:', resetError)
          setError('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.')
        }
      }
      
    } catch (err) {
      console.error('Login Error:', {
        status: err?.response?.status,
        message: err?.response?.data?.message || err.message,
        error: err
      })
      
      const status = err?.response?.status
      switch (status) {
        case 429:
          setError('Çok fazla deneme yaptınız. Lütfen daha sonra tekrar deneyin.')
          break
        case 401:
          setError('Giriş bilgileri hatalı.')
          break
        case 404:
          setError('Kullanıcı bulunamadı.')
          break
        case 500:
          setError('Sunucu hatası. Lütfen daha sonra tekrar deneyin.')
          break
        default:
          setError('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Doğrulama kodunu kontrol et
  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setError('')

    if (!verificationCode) {
      setError('Doğrulama kodu gerekli')
      return
    }

    try {
      setIsLoading(true)
      
      const verifyResponse = await api.post('/user/password-reset/verify', {
        email: formData.email,
        code: verificationCode
      })
      if (verifyResponse.data.succes === true) {
        // Kod doğruysa final login isteği
        const finalLoginResponse = await api.post('/auth/login', {
          email: formData.email,
          password: formData.password
        })

          const { access_token } = finalLoginResponse.data

        if (access_token) {
          // Önce user token'ı temizle
          Cookies.remove('token')
          localStorage.removeItem('token')
          
          // Sonra admin token'ı set et
          localStorage.setItem('adminToken', access_token)
          Cookies.set('adminToken', access_token, { 
            expires: 7,
            secure: true,
            sameSite: 'strict'
          })

          // Header'ı ayarla
          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`

          // Admin paneline yönlendir
          router.push('/admin/basvuru')
        } else {
          throw new Error('Token alınamadı')
        }
      }

    } catch (err) {
      console.error('Verification Error:', {
        status: err?.response?.status,
        message: err?.response?.data?.message || err.message,
        error: err
      })

      if (err.response?.status === 401) {
        setError('Doğrulama başarısız oldu')
        setVerificationCode('')
      } else {
        setError('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.')
        setVerificationStep(1)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#191919] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/images/cekgetir.webp"
            alt="cekgetir Logo"
            width={2000}
            height={2000}
            priority
          />
        </div>

        {/* Form */}
        <div className="bg-[#222222] rounded-xl p-6 md:p-8">
          <h1 className="text-2xl text-white font-bold mb-6 druk-font text-center">
            Admin Girişi
          </h1>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg mb-4">
              {error}
            </div>
          )}

          {verificationStep === 1 ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-white mb-2 druk-font">
                  Email Adresi
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, email: e.target.value }))
                  }}
                  className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white"
                  placeholder="ornek@cekgetir.com"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-white mb-2 druk-font">
                  Şifre
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, password: e.target.value }))
                  }}
                  className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-mysari text-black druk-font py-3 px-4 rounded-lg hover:bg-mysari/90 transition-colors disabled:opacity-50"
              >
                {isLoading ? <LoadingSpinner /> : 'Giriş Yap'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="block text-white mb-2 druk-font">
                  Doğrulama Kodu
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => {
                    setVerificationCode(e.target.value)
                  }}
                  className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white"
                  placeholder="6 haneli kod"
                  maxLength={6}
                  disabled={isLoading}
                />
                {countdown > 0 && (
                  <p className="text-white/50 text-sm mt-2">
                    Yeni kod için: {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-mysari text-black druk-font py-3 px-4 rounded-lg hover:bg-mysari/90 transition-colors disabled:opacity-50"
                >
                  {isLoading ? <LoadingSpinner /> : 'Doğrula'}
                </button>

                {countdown === 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setVerificationStep(1)
                    }}
                    className="w-full bg-transparent text-white druk-font py-3 px-4 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    Geri Dön
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
} 