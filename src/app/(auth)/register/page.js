'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import LoadingSpinner from '@/components/LoadingSpinner'
import PageLoading from '@/components/PageLoading'
import axios from 'axios'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    nickname: '',
    email: '',
    tel: '',
    password: '',
    passwordConfirm: '',
    tc: '',
    birthDate: '',
    city: '',
    kvkk: false
  })

  const [formErrors, setFormErrors] = useState({
    name: '',
    surname: '',
    nickname: '',
    email: '',
    tel: '',
    tc: '',
    birthDate: '',
    password: '',
    passwordConfirm: '',
    city: ''
  })

  const [passwordStrength, setPasswordStrength] = useState({
    isStrong: false,
    message: ''
  })
  const [passwordMatch, setPasswordMatch] = useState({
    isMatch: false,
    message: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [showKVKKModal, setShowKVKKModal] = useState(false)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [citySearch, setCitySearch] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [showCityList, setShowCityList] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [buttonDisabled, setButtonDisabled] = useState(false)
  const [buttonTimer, setButtonTimer] = useState(5)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (buttonDisabled && buttonTimer > 0) {
      const timer = setInterval(() => {
        setButtonTimer(prev => prev - 1)
      }, 1000)

      return () => clearInterval(timer)
    } else if (buttonTimer === 0) {
      setButtonDisabled(false)
      setButtonTimer(5)
    }
  }, [buttonDisabled, buttonTimer])

  if (!mounted) {
    return <PageLoading />
  }

  const validateField = (field, value) => {
    let error = ''
    
    switch (field) {
      case 'name':
      case 'surname':
        if (value.length < 2) {
          error = `${field === 'name' ? 'İsim' : 'Soyisim'} en az 2 karakter olmalıdır`
        }
        break
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          error = 'Geçerli bir email adresi giriniz'
        }
        break
      case 'tel':
        const phoneDigits = value.replace(/\D/g, '')
        if (phoneDigits.length !== 10) {
          error = 'Telefon numarası 10 haneli olmalıdır'
        }
        break
      case 'tc':
        if (value.length !== 11) {
          error = 'TC Kimlik numarası 11 haneli olmalıdır'
        }
        break
      case 'password':
        if (!passwordStrength.isStrong) {
          error = 'Şifre yeterince güçlü değil'
        }
        break
      case 'passwordConfirm':
        if (value !== formData.password) {
          error = 'Şifreler eşleşmiyor'
        }
        break
    }

    setFormErrors(prev => ({
      ...prev,
      [field]: error
    }))

    return error === ''
  }

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    validateField(field, value)
  }

  // Şifre kontrolü
  const handlePasswordChange = (value) => {
    handleFormChange('password', value)
    checkPasswordStrength(value)

    // Boş kontrolü
    if (!value.trim()) {
      setFormErrors(prev => ({
        ...prev,
        password: 'Şifre alanı boş bırakılamaz'
      }))
      return
    }

    // Şifre değiştiğinde şifre tekrarı ile eşleşme kontrolü yap
    if (formData.passwordConfirm) {
      if (value !== formData.passwordConfirm) {
        setPasswordMatch({
          isMatch: false,
          message: 'Şifreler eşleşmiyor'
        })
        setFormErrors(prev => ({
          ...prev,
          passwordConfirm: 'Şifreler eşleşmiyor'
        }))
      } else {
        setPasswordMatch({
          isMatch: true,
          message: 'Şifreler eşleşiyor'
        })
        setFormErrors(prev => ({
          ...prev,
          passwordConfirm: ''
        }))
      }
    }
  }

  // Şifre tekrar kontrolü
  const handlePasswordConfirm = (value) => {
    handleFormChange('passwordConfirm', value)
    
    // Boş kontrolü
    if (!value.trim()) {
      setFormErrors(prev => ({
        ...prev,
        passwordConfirm: 'Şifre tekrar alanı boş bırakılamaz'
      }))
      setPasswordMatch({
        isMatch: false,
        message: ''
      })
      return
    }

    // Şifre eşleşme kontrolü
    if (value !== formData.password) {
      setPasswordMatch({
        isMatch: false,
        message: 'Şifreler eşleşmiyor'
      })
      setFormErrors(prev => ({
        ...prev,
        passwordConfirm: 'Şifreler eşleşmiyor'
      }))
    } else {
      setPasswordMatch({
        isMatch: true,
        message: 'Şifreler eşleşiyor'
      })
      setFormErrors(prev => ({
        ...prev,
        passwordConfirm: ''
      }))
    }
  }

  // Parola güçlülük kontrolü
  const checkPasswordStrength = (value) => {
    const hasUpperCase = /[A-Z]/.test(value)
    const hasLowerCase = /[a-z]/.test(value)
    const hasNumbers = /\d/.test(value)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value)
    const isLongEnough = value.length >= 8

    if (value.length === 0) {
      setPasswordStrength({
        isStrong: false,
        message: ''
      })
    } else if (!isLongEnough) {
      setPasswordStrength({
        isStrong: false,
        message: 'Parola en az 8 karakter olmalıdır'
      })
    } else if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
      setPasswordStrength({
        isStrong: false,
        message: 'Parola büyük harf, küçük harf, rakam ve özel karakter içermelidir'
      })
    } else {
      setPasswordStrength({
        isStrong: true,
        message: 'Güçlü parola!'
      })
    }
  }

  // TC Kimlik formatı kontrolü
  const formatTCKimlik = (value) => {
    return value.replace(/\D/g, '').slice(0, 11)
  }

  // Telefon formatı kontrolü
  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
  }

  // Türkiye illeri
  const iller = [
    "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir",
    "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli",
    "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari",
    "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir",
    "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir",
    "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat",
    "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman",
    "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce",'Diğer'
  ].sort()

  // İzin verilen mail domainleri
  const mailDomains = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "icloud.com"]

  // İsim ve soyisim kontrolü (sadece harf)
  const handleNameInput = (field, value) => {
    const onlyLetters = value.replace(/[^A-Za-zğüşıöçĞÜŞİÖÇ\s]/g, '')
    handleFormChange(field, onlyLetters)
  }

  // Telefon formatı kontrolü
  const handlePhoneInput = (value) => {
    const numbers = value.replace(/\D/g, '')
    let formattedNumber = ''
    
    if (numbers.length <= 3) {
      formattedNumber = numbers
    } else if (numbers.length <= 6) {
      formattedNumber = `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`
    } else {
      formattedNumber = `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
    }
    
    handleFormChange('tel', formattedNumber)
  }

  // TC Kimlik doğrulama fonksiyonu
  const validateTCKimlik = async (tc) => {
    if (!tc || tc.length !== 11 || !/^[0-9]+$/.test(tc) || tc[0] === '0') {
      return false
    }

    try {
      const birthYear = new Date(formData.birthDate).getFullYear()
      
      const response = await fetch('/api/validate-tc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tc,
          name: formData.name,
          surname: formData.surname,
          birthYear
        })
      })

      const data = await response.json()
      return data.isValid
    } catch (error) {
      console.error('TC Kimlik doğrulama hatası:', error)
      return false
    }
  }

  // TC Kimlik input kontrolü
  const handleTCInput = async (value) => {
    const numbers = value.replace(/\D/g, '')
    const tc = numbers.slice(0, 11)
    
    handleFormChange('tc', tc)

    if (tc.length === 11 && formData.name && formData.surname && formData.birthDate) {
      const isValid = await validateTCKimlik(tc)

      if (!isValid) {
        setFormErrors(prev => ({
          ...prev,
          tc: 'TC Kimlik bilgileri doğrulanamadı. Lütfen bilgilerinizi kontrol ediniz.'
        }))
      } else {
        setFormErrors(prev => ({
          ...prev,
          tc: ''
        }))
      }
    }
  }

  // Email kontrolü
  const handleEmailInput = (value) => {
    handleFormChange('email', value)
    
    // Boş kontrolü
    if (!value.trim()) {
      setEmailError('E-posta alanı boş bırakılamaz')
      return
    }

    const [localPart, domain] = value.split('@')
    if (!domain) {
      setEmailError('Geçerli bir email adresi giriniz')
      return
    }

    if (!mailDomains.includes(domain.toLowerCase())) {
      setEmailError(`Email sadece şu domainlerden biri olabilir: ${mailDomains.join(', ')}`)
      return
    }

    setEmailError('')
  }

  // TR locale ile filtreleme
  const filteredCities = iller.filter(il => {
    return il.toLocaleLowerCase('tr-TR')
          .includes(citySearch.toLocaleLowerCase('tr-TR'))
  })

  const handleCitySelect = (city) => {
    setSelectedCity(city)
    setCitySearch(city)
    setShowCityList(false)
    setFormErrors(prev => ({
      ...prev,
      city: ''
    }))
  }

  // Form gönderme fonksiyonu
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setButtonDisabled(true) // Butonu devre dışı bırak

    try {
      let hasError = false
      const newErrors = { ...formErrors }

      // Zorunlu alanları kontrol et
      const requiredFields = {
        name: 'İsim',
        surname: 'Soyisim',
        nickname: 'Nickname',
        email: 'E-posta',
        tel: 'Telefon',
        tc: 'TC Kimlik No',
        birthDate: 'Doğum Tarihi',
        password: 'Şifre',
        passwordConfirm: 'Şifre Tekrar'
      }

      // Her alan için boş kontrolü
      Object.entries(requiredFields).forEach(([field, label]) => {
        if (!formData[field]?.trim()) {
          newErrors[field] = `${label} alanı boş bırakılamaz`
          hasError = true
        }
      })

      // Şehir kontrolü - selectedCity kullan
      if (!selectedCity) {
        newErrors.city = 'Şehir seçimi yapmalısınız'
        hasError = true
      }

      // KVKK onayı kontrolü
      if (!formData.kvkk) {
        newErrors.kvkk = 'KVKK metnini onaylamanız gerekli'
        hasError = true
      }

      // TC Kimlik kontrolü
      const isValidTC = await validateTCKimlik(formData.tc)
      if (!isValidTC) {
        newErrors.tc = 'Geçersiz TC Kimlik numarası'
        hasError = true
      }

      // Telefon format kontrolü
      if (formData.tel) {
        const phoneDigits = formData.tel.replace(/\D/g, '')
        if (phoneDigits.length !== 10) {
          newErrors.tel = 'Telefon numarası 10 haneli olmalıdır'
          hasError = true
        }
      }

      // Şifre güçlülük kontrolü
      if (!passwordStrength.isStrong) {
        newErrors.password = 'Şifre yeterince güçlü değil'
        hasError = true
      }

      // Şifre eşleşme kontrolü
      if (formData.password !== formData.passwordConfirm) {
        newErrors.passwordConfirm = 'Şifreler eşleşmiyor'
        hasError = true
      }

      if (hasError) {
        setFormErrors(newErrors)
        alert('Lütfen tüm alanları doğru şekilde doldurunuz!')
        return
      }

      // Form verilerini hazırla
      const formDataToSend = {
        name: formData.name,
        surname: formData.surname,
        nickname: formData.nickname,
        email: formData.email,
        tel: formData.tel.replace(/\D/g, ''), // Sadece rakamları al
        password: formData.password,
        tc: formData.tc,
        birthDate: formData.birthDate,
        city: selectedCity,
        kvkk: formData.kvkk // KVKK onay durumunu ekle
      }

      // Backend'e gönder
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/user`, formDataToSend)
      
      if (response.data) {
        alert('Kayıt başarılı!')
        router.push('/login') // Başarılı kayıttan sonra login sayfasına yönlendir
      }

    } catch (error) {
      // Sadece kullanıcıya genel bir hata mesajı göster
      alert('Kayıt işlemi başarılamadı. Lütfen tekrar deneyiniz.')
      
      // Hata detayını sadece geliştirme ortamında konsola yaz
      if (process.env.NODE_ENV === 'development') {
        console.error('Kayıt hatası:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Email validasyon fonksiyonu
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Alan isimlerini Türkçe karşılıklarına çeviren yardımcı fonksiyon
  const getFieldLabel = (field) => {
    const labels = {
      name: 'İsim',
      surname: 'Soyisim',
      email: 'E-posta',
      tel: 'Telefon',
      tc: 'TC Kimlik No',
      birthDate: 'Doğum Tarihi',
      password: 'Şifre',
      passwordConfirm: 'Şifre Tekrar',
      kvkk: 'KVKK Onayı'
    }
    return labels[field] || field
  }

  // Modal scroll kontrolü
  const handleModalScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target
    // Eğer en alta yaklaşıldıysa (20px tolerans)
    if (scrollHeight - scrollTop - clientHeight < 20) {
      setHasScrolledToBottom(true)
    }
  }

  // KVKK onaylama
  const handleKVKKConfirm = () => {
    handleFormChange('kvkk', true)
    setShowKVKKModal(false)
  }

  return (
    <div className="min-h-screen w-full flex relative">
      {/* Arka plan resmi */}
      <div className="absolute inset-0 hidden md:block">
        <Image
          src="/images/websitearayuz.webp"
          alt=""
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Mobilde ortalı, desktop'ta iki kolonlu layout */}
      <div className="relative w-full flex flex-col md:flex-row min-h-screen bg-black md:bg-black/70">
        {/* Logo - Mobilde gizli, desktop'ta sol kolonda */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center p-8">
          <Image
            src="/images/flow360.webp"
            alt="Flow360"
            width={1024}
            height={1024}
            className="w-full h-auto object-contain"
            priority
          />
        </div>

        {/* Form container - Mobilde ortalı, desktop'ta sağ kolonda */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <div className="w-full max-w-xl space-y-6 p-6">
            {/* Logo - Sadece mobilde görünür */}
            <div className="md:hidden w-full max-w-[200px] mx-auto mb-8">
              <Image
                src="/images/flow360.webp"
                alt="Flow360"
                width={1024}
                height={1024}
                className="w-full h-auto object-contain"
                priority
              />
            </div>

            <h2 className="text-4xl text-white font-bold druk-font text-center mb-8">
              KAYIT OL
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6 p-10">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white druk-font mb-2">
                    İsim
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 bg-black/50 border rounded-lg text-white backdrop-blur-sm focus:outline-none transition-colors ${
                      formErrors.name ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="İsim"
                    value={formData.name}
                    onChange={(e) => handleNameInput('name', e.target.value)}
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-white druk-font mb-2">
                    Soyisim
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 bg-black/50 border rounded-lg text-white backdrop-blur-sm focus:outline-none transition-colors ${
                      formErrors.surname ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Soyisim"
                    value={formData.surname}
                    onChange={(e) => handleNameInput('surname', e.target.value)}
                  />
                  {formErrors.surname && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.surname}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white druk-font mb-2">
                  Nickname
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 bg-black/50 border rounded-lg text-white backdrop-blur-sm focus:outline-none transition-colors ${
                    formErrors.nickname ? 'border-red-500' : 'border-white/20'
                  }`}
                  placeholder="Nickname"
                  value={formData.nickname}
                  onChange={(e) => handleFormChange('nickname', e.target.value)}
                />
                {formErrors.nickname && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.nickname}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white druk-font mb-2">
                  E-posta
                </label>
                <input
                  type="email"
                  className={`w-full px-4 py-3 bg-black/50 border rounded-lg text-white backdrop-blur-sm focus:outline-none transition-colors ${
                    emailError ? 'border-red-500' : 'border-white/20'
                  }`}
                  placeholder="ornek@gmail.com"
                  value={formData.email}
                  onChange={(e) => handleEmailInput(e.target.value)}
                />
                {emailError && (
                  <p className="mt-1 text-sm text-red-500">
                    {emailError}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white druk-font mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  className={`w-full px-4 py-3 bg-black/50 border rounded-lg text-white backdrop-blur-sm focus:outline-none transition-colors ${
                    formErrors.tel ? 'border-red-500' : 'border-white/20'
                  }`}
                  placeholder="(5XX) XXX-XXXX"
                  value={formData.tel}
                  onChange={(e) => handlePhoneInput(e.target.value)}
                  maxLength={14}
                />
                {formErrors.tel && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.tel}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white druk-font mb-2">
                  Şifre
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`w-full px-4 py-3 bg-black/50 border rounded-lg text-white backdrop-blur-sm focus:outline-none transition-colors ${
                      formData.password.length > 0 
                        ? passwordStrength.isStrong 
                          ? 'border-green-500' 
                          : 'border-red-500'
                        : 'border-white/20'
                    }`}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordStrength.message && (
                  <p className={`mt-1 text-sm ${
                    passwordStrength.isStrong ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {passwordStrength.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white druk-font mb-2">
                  Şifre Tekrar
                </label>
                <div className="relative">
                  <input
                    type={showPasswordConfirm ? "text" : "password"}
                    className={`w-full px-4 py-3 bg-black/50 border rounded-lg text-white backdrop-blur-sm focus:outline-none transition-colors ${
                      formData.passwordConfirm?.length > 0
                        ? passwordMatch.isMatch 
                          ? 'border-green-500' 
                          : 'border-red-500'
                        : 'border-white/20'
                    }`}
                    placeholder="••••••••"
                    value={formData.passwordConfirm}
                    onChange={(e) => handlePasswordConfirm(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  >
                    {showPasswordConfirm ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordMatch.message && (
                  <p className={`mt-1 text-sm ${
                    passwordMatch.isMatch ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {passwordMatch.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white druk-font mb-2">
                  TC Kimlik No
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 bg-black/50 border rounded-lg text-white backdrop-blur-sm focus:outline-none transition-colors ${
                    formErrors.tc ? 'border-red-500' : 'border-white/20'
                  }`}
                  placeholder="TC Kimlik No"
                  value={formData.tc}
                  onChange={(e) => handleTCInput(e.target.value)}
                  maxLength={11}
                />
                {formErrors.tc && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.tc}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white druk-font mb-2">
                  Doğum Tarihi
                </label>
                <input
                  type="date"
                  className={`w-full px-4 py-3 bg-black/50 border rounded-lg text-white backdrop-blur-sm focus:outline-none transition-colors ${
                    formErrors.birthDate ? 'border-red-500' : 'border-white/20'
                  }`}
                  max={new Date().toISOString().split('T')[0]}
                  style={{
                    colorScheme: 'dark'
                  }}
                  value={formData.birthDate}
                  onChange={(e) => handleFormChange('birthDate', e.target.value)}
                />
                {formErrors.birthDate && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.birthDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white druk-font mb-2">
                  Şehir
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className={`w-full px-4 py-3 bg-black/50 border rounded-lg text-white backdrop-blur-sm focus:outline-none transition-colors ${
                      formErrors.city && !selectedCity ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Şehir seçin"
                    value={citySearch}
                    onChange={(e) => {
                      setCitySearch(e.target.value)
                      setShowCityList(true)
                      setSelectedCity('')  // Kullanıcı yazmaya başladığında seçili şehri temizle
                    }}
                    onFocus={() => setShowCityList(true)}
                  />
                  {formErrors.city && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.city}
                    </p>
                  )}
                  {showCityList && citySearch && (
                          <div className="absolute w-full mt-1 max-h-60 overflow-y-auto bg-black/90 border border-white/20 rounded-lg">
                            {filteredCities.map((il) => (
                              <div
                                key={il}
                                className="px-4 py-2 hover:bg-white/10 cursor-pointer text-white"
                                onClick={() => handleCitySelect(il)}
                              >
                                {il}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="kvkk"
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-black/50 text-mysari focus:ring-mysari"
                  checked={formData.kvkk}
                  onChange={() => setShowKVKKModal(true)}
                />
                <label htmlFor="kvkk" className="ml-2 text-sm text-white cursor-pointer" onClick={() => setShowKVKKModal(true)}>
                  KVKK Metnini Okudum, Onaylıyorum
                </label>
              </div>

              <div className="flex gap-4">
                <Link
                  href="/login"
                  className="w-1/2 bg-white text-black druk-font py-3 px-4 rounded-lg hover:bg-white/90 transition-colors text-center"
                >
                  Giriş Yap
                </Link>
                <button
                  type="submit"
                  disabled={isLoading || buttonDisabled}
                  className={`w-1/2 bg-mysari text-black druk-font py-3 px-4 rounded-lg hover:bg-mysari/90 transition-colors disabled:opacity-50`}
                >
                  {isLoading ? <LoadingSpinner /> : 
                   buttonDisabled ? `Lütfen bekleyin (${buttonTimer})` : 'Kayıt Ol'}
                </button>
              </div>
            </form>

            <div className="text-center pb-4">
              <Link 
                href="/"
                className="text-white hover:text-mysari transition-colors text-sm"
              >
                Ana Sayfaya Dön
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* KVKK Modal */}
      {showKVKKModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#222222] rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Başlık */}
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white druk-font">
                KİŞİSEL VERİLERİN KORUNMASI KANUNU (KVKK) AYDINLATMA METNİ
              </h3>
            </div>

            {/* KVKK Modal İçeriği */}
            <div 
              className="p-6 overflow-y-auto space-y-4 text-white/80"
              onScroll={handleModalScroll}
            >
              <div className="space-y-6">
                <section>
                  <h4 className="text-lg font-bold text-white mb-2">1. Veri Sorumlusu</h4>
                  <p>
                    Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca,
                    kişisel verilerinizin flow360.com (bundan sonra "Site" olarak anılacaktır) tarafından nasıl
                    işleneceği konusunda sizi bilgilendirmek amacıyla hazırlanmıştır. Veri sorumlusu olarak,
                    flow360.com olarak sizlere ait kişisel verilerin gizliliği ve güvenliği hususunda azami özeni
                    göstermekteyiz.
                  </p>
                </section>

                <section>
                  <h4 className="text-lg font-bold text-white mb-2">2. İşlenen Kişisel Veriler</h4>
                  <p>Yarışmaya katılımınız kapsamında işlediğimiz kişisel veriler aşağıdaki gibidir:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Ad, soyad</li>
                    <li>E-posta adresi</li>
                    <li>Telefon numarası</li>
                    <li>TC Kimlik No</li>
                    <li>Doğum Tarihi</li>
                    <li>IP adresi</li>
                    <li>Yarışma performansı ile ilgili bilgiler</li>
                    <li>Yarışma süresince üretilen diğer veriler</li>
                  </ul>
                </section>

                <section>
                  <h4 className="text-lg font-bold text-white mb-2">3. Kişisel Verilerin İşlenme Amacı</h4>
                  <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Yarışma sürecinin yürütülmesi ve kazananların belirlenmesi</li>
                    <li>Yarışma kazananlarına ödüllerin teslim edilmesi</li>
                    <li>Yarışma sonuçları ile ilgili bilgilendirme yapılması</li>
                    <li>Yarışma ile ilgili her türlü iletişimin sağlanması</li>
                    <li>Site üzerindeki faaliyetlerin iyileştirilmesi ve analiz edilmesi</li>
                    <li>KVKK madde 5 ve 6 uyarınca hukuki yükümlülüklerimizin yerine getirilmesi</li>
                  </ul>
                </section>

                <section>
                  <h4 className="text-lg font-bold text-white mb-2">4. Kişisel Verilerin Aktarılması</h4>
                  <p>
                    Kişisel verileriniz, yukarıda belirtilen amaçlarla ve sadece ilgili süreçlerin yürütülmesi
                    amacıyla aşağıdaki taraflara aktarılabilir:
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>İş ortakları ve hizmet sağlayıcılar (teknik destek, kargo firmaları vb.)</li>
                    <li>İlgili resmi kurum ve kuruluşlar (talep halinde hukuki yükümlülükler gereği)</li>
                    <li>Yarışma sürecinde dış hizmet alınması durumunda ilgili hizmet sağlayıcılar</li>
                  </ul>
                </section>

                <section>
                  <h4 className="text-lg font-bold text-white mb-2">5. Kişisel Verilerin Toplanma Yöntemleri ve Hukuki Sebebi</h4>
                  <p>
                    Kişisel verileriniz, flow360.com web sitesi, mobil uygulamalar, çerezler (cookies) ve benzeri
                    yöntemlerle elektronik ortamda toplanmaktadır. Bu veriler, yarışma süreçlerinin yürütülmesi
                    ve kullanıcı memnuniyeti gibi meşru menfaatler doğrultusunda ve KVKK madde 5/2 ve
                    madde 6 kapsamında işlenmektedir.
                  </p>
                </section>

                <section>
                  <h4 className="text-lg font-bold text-white mb-2">6. Kişisel Verilerin Saklanma Süresi</h4>
                  <p>
                    Kişisel verileriniz, ilgili yasal süreler ve işleme amacının gerektirdiği süre boyunca
                    saklanacak olup, bu sürelerin sona ermesi halinde verileriniz silinecek, yok edilecek ya da
                    anonim hale getirilecektir.
                  </p>
                </section>

                <section>
                  <h4 className="text-lg font-bold text-white mb-2">7. Veri Sahibi Olarak Haklarınız</h4>
                  <p>KVKK'nın 11. maddesi kapsamında sahip olduğunuz haklar:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                    <li>İşlenmişse buna ilişkin bilgi talep etme</li>
                    <li>İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                    <li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme</li>
                    <li>Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
                    <li>KVKK'da öngörülen şartlar çerçevesinde kişisel verilerin silinmesini veya yok edilmesini talep etme</li>
                    <li>Düzeltme, silme, yok edilme taleplerinin kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
                    <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
                    <li>Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
                  </ul>
                </section>

                <section>
                  <h4 className="text-lg font-bold text-white mb-2">8. İletişim</h4>
                  <p>
                    KVKK kapsamındaki haklarınız ile ilgili taleplerinizi, web sitemizde yer alan iletişim bilgileri
                    aracılığıyla bize iletebilirsiniz. Başvurularınızı mümkün olan en kısa sürede ve en geç 30 gün
                    içinde sonuçlandıracağız.
                  </p>
                  <p className="mt-2">
                    flow360.com kişisel verilerinizin güvenliğini sağlamak için gerekli teknik ve idari tedbirleri
                    almaktadır.
                  </p>
                </section>
              </div>
            </div>

            {/* Modal Alt Kısım */}
            <div className="p-6 border-t border-white/10 flex justify-between items-center">
              <button
                type="button"
                className="px-4 py-2 text-white hover:text-mysari transition-colors"
                onClick={() => setShowKVKKModal(false)}
              >
                Kapat
              </button>
              <button
                type="button"
                className={`px-6 py-2 rounded-lg transition-colors ${
                  hasScrolledToBottom
                    ? 'bg-mysari text-black hover:bg-mysari/90'
                    : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                }`}
                disabled={!hasScrolledToBottom}
                onClick={handleKVKKConfirm}
              >
                Okudum, Onaylıyorum
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 