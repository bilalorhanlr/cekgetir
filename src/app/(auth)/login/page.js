'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import LoadingSpinner from '@/components/LoadingSpinner'
import api from '@/utils/axios'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import ReCAPTCHA from 'react-google-recaptcha'
import { toast } from 'react-hot-toast'

export default function LoginPage() {
    const router = useRouter()
    // Tüm state'leri en üste taşıyalım
    const [mounted, setMounted] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [formErrors, setFormErrors] = useState({
        email: '',
        password: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
    const [passwordStrength, setPasswordStrength] = useState({
        isStrong: false,
        message: ''
    })
    
    // Şifremi unuttum modal state'leri
    const [showForgotModal, setShowForgotModal] = useState(false)
    const [forgotStep, setForgotStep] = useState(1)
    const [resetEmail, setResetEmail] = useState('')
    const [resetCode, setResetCode] = useState('')
    const [emailError, setEmailError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [remainingAttempts, setRemainingAttempts] = useState(3) // Deneme hakkı için yeni state
    const [resetToken, setResetToken] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
    const [countdown, setCountdown] = useState(0) // Geri sayaç için state ekle
    const [isCodeButtonDisabled, setIsCodeButtonDisabled] = useState(false)
    const [isVerifyButtonDisabled, setIsVerifyButtonDisabled] = useState(false)
    const [isUpdateButtonDisabled, setIsUpdateButtonDisabled] = useState(false)
    const [buttonTimer, setButtonTimer] = useState(5)
    const [verifyTimer, setVerifyTimer] = useState(5)
    const [updateTimer, setUpdateTimer] = useState(5)
    const [buttonDisabled, setButtonDisabled] = useState(false)
    const [captchaValue, setCaptchaValue] = useState(null)
    const [captchaLoaded, setCaptchaLoaded] = useState(false)
    const [recaptchaError, setRecaptchaError] = useState(null)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Timer effect'i
    useEffect(() => {

        if (Cookies.get('token')){
        //kullanıcı tokenı varsa admintokenı temizle
        localStorage.removeItem('adminToken')
        Cookies.remove('adminToken')
        router.push('/user/bilgilerim')
        }
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

    useEffect(() => {
        // ReCAPTCHA yüklenme durumunu kontrol et
        if (!window.grecaptcha) {
            console.error('ReCAPTCHA yüklenemedi')
            setRecaptchaError('ReCAPTCHA yüklenemedi')
        }
    }, [])

    if (!mounted) {
        return null // veya loading spinner
    }

    // Mail domain kontrolü için izin verilen domainler
    const mailDomains = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "icloud.com"]
    
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

    // Mail format kontrolü
    const validateEmail = (email) => {
        if (!email) {
            setEmailError('Email adresi gerekli')
            return false
        }

        const [localPart, domain] = email.split('@')
        if (!domain) {
            setEmailError('Geçerli bir email adresi giriniz')
            return false
        }

        if (!mailDomains.includes(domain.toLowerCase())) {
            setEmailError(`Email sadece şu domainlerden biri olabilir: ${mailDomains.join(', ')}`)
            return false
        }

        setEmailError('')
        return true
    }

    // Geri sayaç başlatma fonksiyonu
    const startCountdown = () => {
        setCountdown(180) // 3 dakika = 180 saniye
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    // Geri sayacı formatla (3:00 gibi)
    const formatCountdown = (seconds) => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    // Butonları disable etme fonksiyonları
    const disableCodeButton = () => {
        setIsCodeButtonDisabled(true)
        setButtonTimer(15)

        const timer = setInterval(() => {
            setButtonTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    setIsCodeButtonDisabled(false)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    const disableVerifyButton = () => {
        setIsVerifyButtonDisabled(true)
        setVerifyTimer(5)

        const timer = setInterval(() => {
            setVerifyTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    setIsVerifyButtonDisabled(false)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    const disableUpdateButton = () => {
        setIsUpdateButtonDisabled(true)
        setUpdateTimer(5)

        const timer = setInterval(() => {
            setUpdateTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    setIsUpdateButtonDisabled(false)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    // Şifre sıfırlama işlemi
    const handleForgotSubmit = async (e) => {
        e.preventDefault()
        console.log('Şifremi unuttum işlemi başlatıldı - Adım:', forgotStep)

        if (forgotStep === 1) {
            if (isCodeButtonDisabled) {
                setEmailError(`Lütfen ${buttonTimer} saniye bekleyiniz`)
                return
            }

            console.log('Email doğrulama başladı:', resetEmail)
            if (!validateEmail(resetEmail)) {
                console.log('Email doğrulama başarısız')
                return
            }

            try {
                disableCodeButton()
                
                console.log('Kod gönderme isteği atılıyor...')
                const response = await api.post('/user/password-reset/request', {
                    email: resetEmail
                })
                console.log('Kod gönderme yanıtı:', response)
                setForgotStep(2)
                setEmailError('')
                setRemainingAttempts(3)
                startCountdown()
                console.log('Kod gönderildi, 2. adıma geçildi')
            } catch (error) {
                console.error('Kod gönderme hatası:', error)
                setEmailError('Email gönderilirken bir hata oluştu')
            }
        } 
        else if (forgotStep === 2) {
            if (isVerifyButtonDisabled) {
                setEmailError(`Lütfen ${verifyTimer} saniye bekleyiniz`)
                return
            }

            console.log('Kod doğrulama başladı. Girilen kod:', resetCode)
            if (!resetCode) {
                console.log('Kod boş girildi')
                setEmailError('Doğrulama kodu gerekli')
                return
            }

            if (resetCode.length !== 6) {
                console.log('Kod 6 haneli değil:', resetCode.length)
                setEmailError('Doğrulama kodu 6 haneli olmalıdır')
                return
            }

            if (countdown === 0) {
                console.log('Süre doldu')
                setEmailError('Süre doldu. Lütfen tekrar kod talep edin.')
                setTimeout(() => {
                    setForgotStep(1)
                    setResetCode('')
                    setResetEmail('')
                    setRemainingAttempts(3)
                }, 2000)
                return
            }

            try {
                disableVerifyButton()
                console.log('Kod doğrulama isteği atılıyor...')
                const response = await api.post('/user/password-reset/verify', {
                    email: resetEmail,
                    code: resetCode
                })
                console.log('Kod doğrulama yanıtı:', response)
                
                if (response.data.statusCode === 200) {
                    console.log('Kod doğrulama başarılı, 3. adıma geçiliyor')
                    setForgotStep(3)
                    setEmailError('')
                    setResetCode('')
                } else {
                    console.log('Kod doğrulama başarısız')
                    setRemainingAttempts(prev => {
                        const newAttempts = prev - 1
                        console.log('Kalan deneme hakkı:', newAttempts)
                        if (newAttempts <= 0) {
                            console.log('Deneme hakkı bitti')
                            setEmailError('Deneme hakkınız kalmadı. Lütfen tekrar kod talep edin.')
                            setTimeout(() => {
                                setForgotStep(1)
                                setResetEmail('')
                                setResetCode('')
                                return 3
                            }, 3000)
                        } else {
                            setEmailError(`Geçersiz doğrulama kodu. ${newAttempts} hakkınız kaldı.`)
                            setResetCode('')
                        }
                        return newAttempts
                    })
                }
            } catch (error) {
                console.error('Kod doğrulama hatası:', error)
                setRemainingAttempts(prev => {
                    const newAttempts = prev - 1
                    console.log('Hata sonrası kalan deneme hakkı:', newAttempts)
                    if (newAttempts <= 0) {
                        console.log('Hata sonrası deneme hakkı bitti')
                        setEmailError('Deneme hakkınız kalmadı. Lütfen tekrar kod talep edin.')
                        setTimeout(() => {
                            setForgotStep(1)
                            setResetEmail('')
                            setResetCode('')
                            return 3
                        }, 3000)
                    } else {
                        setEmailError(`Geçersiz doğrulama kodu. ${newAttempts} hakkınız kaldı.`)
                        setResetCode('')
                    }
                    return newAttempts
                })
            }
        }
        else if (forgotStep === 3) {
            if (isUpdateButtonDisabled) {
                setEmailError(`Lütfen ${updateTimer} saniye bekleyiniz`)
                return
            }

            console.log('Yeni şifre belirleme başladı')
            if (!newPassword || !newPasswordConfirm) {
                console.log('Şifre alanları boş')
                setEmailError('Tüm alanları doldurunuz')
                return
            }

            if (newPassword !== newPasswordConfirm) {
                console.log('Şifreler eşleşmiyor')
                setEmailError('Şifreler eşleşmiyor')
                return
            }

            if (!passwordStrength.isStrong) {
                console.log('Şifre yeterince güçlü değil')
                setEmailError('Lütfen güçlü bir şifre belirleyin')
                return
            }

            try {
                disableUpdateButton()
                console.log('Şifre güncelleme isteği atılıyor...')
                const response = await api.patch(`/user/password/${resetEmail}`, {
                    password: newPassword
                })
                console.log('Şifre güncelleme yanıtı:', response)
                
                if (response.data.statusCode === 200) {
                    console.log('Şifre başarıyla güncellendi')
                    setShowForgotModal(false)
                    setForgotStep(1)
                    setResetEmail('')
                    setResetCode('')
                    setNewPassword('')
                    setNewPasswordConfirm('')
                    setEmailError('')

                    // Başarı mesajı göster
                    const successModal = document.createElement('div')
                    successModal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4'
                    successModal.innerHTML = `
                        <div class="bg-[#222222] rounded-lg max-w-md w-full p-6 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-16 h-16 text-mysari mx-auto mb-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 class="text-xl md:text-2xl text-white font-bold druk-font mb-4">
                                ŞİFRE GÜNCELLENDİ
                            </h3>
                            <p class="text-white/60 mb-6">
                                Şifreniz başarıyla güncellendi. Yeni şifrenizle giriş yapabilirsiniz.
                            </p>
                        </div>
                    `
                    document.body.appendChild(successModal)
                    
                    // 3 saniye sonra mesajı kaldır ve giriş sayfasına yönlendir
                    setTimeout(() => {
                        successModal.remove()
                        router.push('/login')
                    }, 3000)
                }
            } catch (error) {
                console.error('Şifre güncelleme hatası:', error)
                setEmailError('Şifre güncellenirken bir hata oluştu')
            }
        }
    }

    // Form validation
    const validateField = (field, value) => {
        let error = ''
        
        switch (field) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                if (!emailRegex.test(value)) {
                    error = 'Geçerli bir email adresi giriniz'
                }
                break
            case 'password':
                if (value.length < 8) {
                    error = 'Şifre en az 8 karakter olmalıdır'
                }
                break
        }

        setFormErrors(prev => ({
            ...prev,
            [field]: error
        }))

        return error === ''
    }

    // ReCAPTCHA callback'inde biraz daha detaylı loglama ekleyelim
    const onReCAPTCHAChange = (token) => {
        console.log('ReCAPTCHA doğrulaması başarılı')
        setCaptchaValue(token)
    }

    // Form submit'te daha detaylı hata yakalama
    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            // ... mevcut kod ...
        } catch (error) {
            console.error('Login hatası:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            })
            
            // Spesifik hata mesajları
            if (error.response?.status === 400) {
                toast.error('Geçersiz ReCAPTCHA. Lütfen tekrar deneyin.')
            } else {
                toast.error(error.response?.data?.message || 'Giriş yapılırken bir hata oluştu')
            }
            
            // ReCAPTCHA'yı sıfırla
            if (window.grecaptcha) {
                window.grecaptcha.reset()
            }
            setCaptchaValue(null)
        }
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
                        src="/images/cekgetir.webp"
                        alt="cekgetir"
                        width={1024}
                        height={1024}
                        className="w-full h-auto object-contain"
                        priority
                    />
                </div>

                {/* Form container - Mobilde ortalı, desktop'ta sağ kolonda */}
                <div className="w-full md:w-1/2 flex items-center justify-center p-10">
                    <div className="w-full max-w-md space-y-6">
                        {/* Logo - Sadece mobilde görünür */}
                        <div className="md:hidden mb-8 text-center">
                            <Image
                                src="/images/cekgetir.webp"
                                alt="cekgetir"
                                width={300}
                                height={100}
                                className="w-48 mx-auto"
                            />
                        </div>

                        <h2 className="text-2xl md:text-3xl text-white font-bold druk-font text-center mb-6">
                            GİRİŞ YAP
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6" id="login-form">
                            <div>
                                <label className="block text-sm md:text-base font-medium text-white druk-font mb-2">
                                    E-posta
                                </label>
                                <input
                                    type="email"
                                    className={`w-full px-3 md:px-4 py-2 md:py-3 bg-black/50 border rounded-lg text-white text-sm md:text-base ${
                                        formErrors.email ? 'border-red-500' : 'border-white/20'
                                    }`}
                                    placeholder="ornek@gmail.com"
                                    value={formData.email}
                                    onChange={(e) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            email: e.target.value
                                        }))
                                        validateField('email', e.target.value)
                                    }}
                                />
                                {formErrors.email && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {formErrors.email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm md:text-base font-medium text-white druk-font mb-2">
                                    Şifre
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className={`w-full px-3 md:px-4 py-2 md:py-3 bg-black/50 border rounded-lg text-white text-sm md:text-base ${
                                            formErrors.password ? 'border-red-500' : 'border-white/20'
                                        }`}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                password: e.target.value
                                            }))
                                            validateField('password', e.target.value)
                                        }}
                                    />

                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.007 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* ReCAPTCHA */}
                            <div className="w-full flex justify-center flex-col items-center">
                                <ReCAPTCHA
                                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                                    onChange={onReCAPTCHAChange}
                                    theme="dark"
                                    onErrored={() => {
                                        console.error('ReCAPTCHA hata verdi')
                                        setRecaptchaError('ReCAPTCHA yüklenirken bir hata oluştu')
                                    }}
                                />
                                {recaptchaError && (
                                    <p className="text-red-500 text-sm mt-2">{recaptchaError}</p>
                                )}
                                {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? null : (
                                    <p className="text-red-500 text-sm mt-2">
                                        ReCAPTCHA site key bulunamadı
                                    </p>
                                )}
                            </div>

                            {/* Şifremi Unuttum butonu */}
                            <div className="flex items-center justify-between">
                                <button 
                                    type="button" 
                                    className="text-mysari text-sm md:text-base hover:text-mysari/80"
                                    onClick={() => setShowForgotModal(true)}
                                >
                                    Şifremi Unuttum
                                </button>
                            </div>

                            <div className="flex gap-4">
                                <Link
                                    href="/register"
                                    className="w-1/2 bg-white text-black druk-font py-4 px-4 rounded-lg hover:bg-white/90 transition-colors text-center text-sm md:text-base"
                                >
                                    Kayıt Ol
                                </Link>
                                <button
                                    type="submit"
                                    className="w-1/2 bg-mysari text-black druk-font py-3 rounded-lg hover:bg-mysari/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isLoading || buttonDisabled || !captchaValue}
                                >
                                    {isLoading ? <LoadingSpinner /> : 
                                     buttonDisabled ? `Lütfen bekleyin` : 'Giriş Yap'}
                                </button>
                            </div>
                        </form>

                        <div className="text-center mt-6">
                            <Link 
                                href="/"
                                className="text-white hover:text-mysari transition-colors text-sm md:text-base"
                            >
                                Ana Sayfaya Dön
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Şifremi Unuttum Modal */}
            {showForgotModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#222222] rounded-lg max-w-md w-full p-6">
                        <h3 className="text-xl md:text-2xl text-white font-bold druk-font mb-6">
                            {forgotStep === 1 ? 'ŞİFREMİ UNUTTUM' : 
                             forgotStep === 2 ? 'DOĞRULAMA KODU' : 
                             'YENİ ŞİFRE'}
                        </h3>

                        <form onSubmit={handleForgotSubmit} className="space-y-4 md:space-y-6">
                            {forgotStep === 1 && (
                                <div>
                                    <label className="block text-sm md:text-base font-medium text-white druk-font mb-2">
                                        E-posta
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full px-3 md:px-4 py-2 md:py-3 bg-black/50 border border-white/20 rounded-lg text-white text-sm md:text-base"
                                        placeholder="ornek@gmail.com"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                    />
                                    {isCodeButtonDisabled && (
                                        <p className="mt-2 text-sm text-mysari">
                                            Yeni kod gönderimi için: {buttonTimer} saniye
                                        </p>
                                    )}
                                </div>
                            )}

                            {forgotStep === 2 && (
                                <div>
                                    <label className="block text-sm md:text-base font-medium text-white druk-font mb-2">
                                        Doğrulama Kodu
                                    </label>
                                    <p className="text-sm text-white/60 mb-4">
                                        {resetEmail} adresine gönderilen 6 haneli kodu giriniz
                                    </p>
                                    <input
                                        type="text"
                                        className="w-full px-3 md:px-4 py-2 md:py-3 bg-black/50 border border-white/20 rounded-lg text-white text-sm md:text-base"
                                        placeholder="6 haneli kodu giriniz"
                                        value={resetCode}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                                            setResetCode(value)
                                        }}
                                        maxLength={6}
                                        pattern="\d{6}"
                                    />
                                    <div className="mt-2 flex justify-between items-center text-sm">
                                        <span className="text-white/60">
                                            Kalan deneme hakkı: {remainingAttempts}
                                        </span>
                                        <span className="text-mysari">
                                            Kalan süre: {formatCountdown(countdown)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {forgotStep === 3 && (
                                <>
                                    <div>
                                        <label className="block text-sm md:text-base font-medium text-white druk-font mb-2">
                                            Yeni Şifre
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                className="w-full px-3 md:px-4 py-2 md:py-3 bg-black/50 border border-white/20 rounded-lg text-white text-sm md:text-base"
                                                placeholder="••••••••"
                                                value={newPassword}
                                                onChange={(e) => {
                                                    setNewPassword(e.target.value)
                                                    checkPasswordStrength(e.target.value)
                                                }}
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
                                        {!passwordStrength.isStrong && newPassword && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {passwordStrength.message}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm md:text-base font-medium text-white druk-font mb-2">
                                            Yeni Şifre Tekrar
                                        </label>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="w-full px-3 md:px-4 py-2 md:py-3 bg-black/50 border border-white/20 rounded-lg text-white text-sm md:text-base"
                                            placeholder="••••••••"
                                            value={newPasswordConfirm}
                                            onChange={(e) => setNewPasswordConfirm(e.target.value)}
                                        />
                                    </div>
                                </>
                            )}

                            {emailError && (
                                <p className="mt-1 text-sm text-red-500">
                                    {emailError}
                                </p>
                            )}

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    className="w-1/2 bg-white text-black druk-font py-2 md:py-3 px-4 rounded-lg hover:bg-white/90 transition-colors text-sm md:text-base"
                                    onClick={() => {
                                        setShowForgotModal(false)
                                        setForgotStep(1)
                                        setResetEmail('')
                                        setResetCode('')
                                        setNewPassword('')
                                        setNewPasswordConfirm('')
                                        setEmailError('')
                                        setIsCodeButtonDisabled(false)
                                        setButtonTimer(15)
                                    }}
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={
                                        (forgotStep === 1 && isCodeButtonDisabled) ||
                                        (forgotStep === 2 && isVerifyButtonDisabled) ||
                                        (forgotStep === 3 && isUpdateButtonDisabled)
                                    }
                                    className={`w-1/2 bg-mysari text-black druk-font py-2 md:py-3 px-4 rounded-lg transition-colors text-sm md:text-base
                                        ${(forgotStep === 1 && isCodeButtonDisabled) ||
                                          (forgotStep === 2 && isVerifyButtonDisabled) ||
                                          (forgotStep === 3 && isUpdateButtonDisabled)
                                            ? 'opacity-50 cursor-not-allowed' 
                                            : 'hover:bg-mysari/90'}`}
                                >
                                    {forgotStep === 1 
                                        ? (isCodeButtonDisabled ? `${buttonTimer}s` : 'Kod Gönder')
                                        : forgotStep === 2 
                                        ? (isVerifyButtonDisabled ? `${verifyTimer}s` : 'Doğrula')
                                        : (isUpdateButtonDisabled ? `${updateTimer}s` : 'Şifreyi Güncelle')
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
