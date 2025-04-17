'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import { useEffect, useState, useRef } from 'react'
import Script from 'next/script'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [activeLocationField, setActiveLocationField] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [routeInfo, setRouteInfo] = useState(null)
  const [formData, setFormData] = useState({
    service: '',
    fromLocation: '',
    fromLat: '',
    fromLng: '',
    toLocation: '',
    toLat: '',
    toLng: '',
    vehicleBrand: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleType: '',
    vehicleTransmission: '',
    vehicleFuel: '',
    vehicleCondition: '',
    vehiclePlate: '',
    phone: ''
  })

  const fromInputRef = useRef(null)
  const toInputRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)

  // Araç markaları ve modelleri (örnek veri)
  const vehicleData = {
    brands: [
      { id: 'bmw', name: 'BMW' },
      { id: 'mercedes', name: 'Mercedes-Benz' },
      { id: 'audi', name: 'Audi' },
      { id: 'volkswagen', name: 'Volkswagen' },
      { id: 'toyota', name: 'Toyota' },
      { id: 'honda', name: 'Honda' },
      { id: 'ford', name: 'Ford' },
      { id: 'renault', name: 'Renault' },
      { id: 'fiat', name: 'Fiat' },
      { id: 'hyundai', name: 'Hyundai' },
    ],
    models: {
      bmw: ['1 Serisi', '2 Serisi', '3 Serisi', '4 Serisi', '5 Serisi', 'X1', 'X3', 'X5'],
      mercedes: ['A Serisi', 'B Serisi', 'C Serisi', 'E Serisi', 'S Serisi', 'GLA', 'GLC', 'GLE'],
      audi: ['A1', 'A3', 'A4', 'A5', 'A6', 'Q2', 'Q3', 'Q5'],
      volkswagen: ['Polo', 'Golf', 'Passat', 'Tiguan', 'T-Roc', 'T-Cross'],
      toyota: ['Corolla', 'Yaris', 'C-HR', 'RAV4', 'Camry'],
      honda: ['Civic', 'City', 'CR-V', 'HR-V'],
      ford: ['Fiesta', 'Focus', 'Kuga', 'Puma'],
      renault: ['Clio', 'Megane', 'Captur', 'Kadjar'],
      fiat: ['Egea', '500', 'Panda', 'Tipo'],
      hyundai: ['i10', 'i20', 'i30', 'Tucson', 'Kona'],
    },
    types: [
      'Sedan',
      'Hatchback',
      'Station Wagon',
      'SUV',
      'Crossover',
      'Pick-up',
      'Van',
      'Minibüs',
      'Kamyonet'
    ],
    transmissions: ['Manuel', 'Otomatik', 'Yarı Otomatik'],
    fuels: ['Benzin', 'Dizel', 'LPG', 'Hibrit', 'Elektrik'],
    conditions: ['Çalışır Durumda', 'Çalışmaz Durumda', 'Kaza Yapmış', 'Lastik Problemi']
  }

  // Hizmet seçenekleri
  const serviceOptions = [
    {
      id: 'yol-yardim',
      title: 'Yol Yardım',
      description: 'Acil yol yardım hizmeti',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      id: 'lastik',
      title: 'Lastik Yardımı',
      description: 'Lastik değişimi ve tamiri',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      )
    },
    {
      id: 'cekici',
      title: 'Çekici Hizmeti',
      description: 'Araç çekme ve taşıma',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      )
    },
    {
      id: 'coklu-cekici',
      title: 'Çoklu Çekici',
      description: 'Birden fazla araç taşıma',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      )
    }
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [mounted])

  // Google Maps API'sini yükle
  useEffect(() => {
    const loadGoogleMaps = () => {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&language=tr`
      script.async = true
      script.defer = true
      script.onload = () => {
        console.log('Google Maps yüklendi')
        setIsGoogleLoaded(true)
      }
      script.onerror = (error) => {
        console.error('Google Maps yüklenirken hata:', error)
      }
      document.head.appendChild(script)
    }

    if (!window.google) {
      loadGoogleMaps()
    } else {
      setIsGoogleLoaded(true)
    }
  }, [])

  // Harita işlemleri
  useEffect(() => {
    if (!isGoogleLoaded || !showMap || !mapRef.current) return

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 41.0082, lng: 28.9784 }, // İstanbul merkezi
      zoom: 11
    })

    const marker = new window.google.maps.Marker({
      map,
      draggable: true
    })

    markerRef.current = marker

    map.addListener('click', (e) => {
      marker.setPosition(e.latLng)
      updateLocationFromMarker(e.latLng)
    })

    marker.addListener('dragend', () => {
      updateLocationFromMarker(marker.getPosition())
    })
  }, [isGoogleLoaded, showMap])

  const updateLocationFromMarker = async (latLng) => {
    const geocoder = new window.google.maps.Geocoder()
    try {
      const response = await geocoder.geocode({ location: latLng })
      if (response.results[0]) {
        const locationData = {
          address: response.results[0].formatted_address,
          lat: typeof latLng.lat === 'function' ? latLng.lat() : latLng.lat,
          lng: typeof latLng.lng === 'function' ? latLng.lng() : latLng.lng
        }

        setFormData(prev => ({
          ...prev,
          ...(activeLocationField === 'from' ? {
            fromLocation: locationData.address,
            fromLat: locationData.lat,
            fromLng: locationData.lng
          } : {
            toLocation: locationData.address,
            toLat: locationData.lat,
            toLng: locationData.lng
          })
        }))

        // Konum seçildiğinde haritayı kapat
        setShowMap(false)
        setActiveLocationField(null)
      }
    } catch (error) {
      console.error('Geocoding hatası:', error)
    }
  }

  const getCurrentLocation = (fieldType) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latLng = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          
          if (markerRef.current) {
            markerRef.current.setPosition(new window.google.maps.LatLng(latLng.lat, latLng.lng))
          }
          
          setActiveLocationField(fieldType)
          await updateLocationFromMarker(latLng)
        },
        (error) => {
          console.error('Konum alınamadı:', error)
          alert('Konumunuz alınamadı. Lütfen konum izinlerini kontrol edin.')
        }
      )
    } else {
      alert('Tarayıcınız konum özelliğini desteklemiyor.')
    }
  }

  const handleMapOpen = (fieldType) => {
    setActiveLocationField(fieldType)
    setShowMap(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'vehicleBrand' ? { vehicleModel: '' } : {}) // Marka değiştiğinde modeli sıfırla
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form verileri:', formData)
  }

  const handleServiceSelect = (serviceId) => {
    setFormData(prev => ({ ...prev, service: serviceId }))
    setCurrentStep(2)
  }

  const handleNextStep = () => {
    setCurrentStep(prev => prev + 1)
  }

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1)
  }

  const calculateRoute = async () => {
    if (!window.google || !formData.fromLat || !formData.toLat) return

    const directionsService = new window.google.maps.DirectionsService()
    const directionsRenderer = new window.google.maps.DirectionsRenderer()

    const request = {
      origin: new window.google.maps.LatLng(formData.fromLat, formData.fromLng),
      destination: new window.google.maps.LatLng(formData.toLat, formData.toLng),
      travelMode: 'DRIVING'
    }

    try {
      const result = await directionsService.route(request)
      directionsRenderer.setDirections(result)
      
      const route = result.routes[0].legs[0]
      setRouteInfo({
        distance: route.distance.text,
        duration: route.duration.text,
        startAddress: route.start_address,
        endAddress: route.end_address
      })
    } catch (error) {
      console.error('Rota hesaplama hatası:', error)
    }
  }

  const calculatePrice = () => {
    if (!routeInfo) return null

    // Basit bir fiyat hesaplama örneği
    const basePrice = {
      'yol-yardim': 200,
      'lastik': 150,
      'cekici': 300,
      'coklu-cekici': 500
    }

    const distance = parseFloat(routeInfo.distance.replace(' km', ''))
    const pricePerKm = 2

    return {
      basePrice: basePrice[formData.service],
      distancePrice: distance * pricePerKm,
      total: basePrice[formData.service] + (distance * pricePerKm)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative h-[85vh] flex items-center">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/home.jpg"
              alt="Çekgetir Yol Yardım"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-l from-black/100 via-black/80 to-transparent"></div>
          </div>

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
            {/* Sol taraf - Başlık ve Açıklama */}
            <div className="text-white">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                7/24 Yol Yardım Hizmetleri
              </h1>
              <p className="text-lg md:text-xl mb-8 text-gray-300">
                Çekici, lastik, akü ve tüm yol yardım hizmetleriyle yanınızdayız
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-3 rounded-full text-lg font-semibold transition-colors inline-flex items-center gap-2"
              >
                Hizmet Talebi Oluştur
              </button>
            </div>

            {/* Sağ taraf - Hizmet Talep Formu */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/20">
              <h2 className="text-2xl font-semibold mb-6 text-white">Hizmet Talebi</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Hizmet Türü
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-md"
                  >
                    <option value="cekici" className="text-black">Çekici Hizmeti</option>
                    <option value="lastik" className="text-black">Lastik Yardımı</option>
                    <option value="aku" className="text-black">Akü Takviye</option>
                    <option value="yakit" className="text-black">Yakıt İkmali</option>
                    <option value="kurtarma" className="text-black">Araç Kurtarma</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Bulunduğunuz Konum
                  </label>
                  <div className="relative">
                    <input
                      ref={fromInputRef}
                      type="text"
                      name="fromLocation"
                      value={formData.fromLocation}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-md"
                      placeholder="Konum seçin veya yazın"
                      required
                      autoComplete="off"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => getCurrentLocation('from')}
                        className="p-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors"
                        title="Mevcut Konumu Kullan"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMapOpen('from')}
                        className="p-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors"
                        title="Haritadan Seç"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {showMap && (
                    <div className="mt-2 h-[300px] rounded-lg overflow-hidden">
                      <div ref={mapRef} className="w-full h-full"></div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Gidilecek Konum
                  </label>
                  <div className="relative">
                    <input
                      ref={toInputRef}
                      type="text"
                      name="toLocation"
                      value={formData.toLocation}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-md"
                      placeholder="Konum seçin veya yazın"
                      autoComplete="off"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => getCurrentLocation('to')}
                        className="p-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors"
                        title="Mevcut Konumu Kullan"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMapOpen('to')}
                        className="p-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors"
                        title="Haritadan Seç"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Araç Bilgileri */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                      Araç Markası
                    </label>
                    <select
                      name="vehicleBrand"
                      value={formData.vehicleBrand}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-md"
                      required
                    >
                      <option value="" className="text-black">Seçiniz</option>
                      {vehicleData.brands.map(brand => (
                        <option key={brand.id} value={brand.id} className="text-black">
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                      Araç Modeli
                    </label>
                    <select
                      name="vehicleModel"
                      value={formData.vehicleModel}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-md"
                      required
                      disabled={!formData.vehicleBrand}
                    >
                      <option value="" className="text-black">Seçiniz</option>
                      {formData.vehicleBrand && vehicleData.models[formData.vehicleBrand].map(model => (
                        <option key={model} value={model} className="text-black">
                          {model}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                      Model Yılı
                    </label>
                    <select
                      name="vehicleYear"
                      value={formData.vehicleYear}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-md"
                      required
                    >
                      <option value="" className="text-black">Seçiniz</option>
                      {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year} className="text-black">
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                      Araç Tipi
                    </label>
                    <select
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-md"
                      required
                    >
                      <option value="" className="text-black">Seçiniz</option>
                      {vehicleData.types.map(type => (
                        <option key={type} value={type} className="text-black">
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                      Vites Tipi
                    </label>
                    <select
                      name="vehicleTransmission"
                      value={formData.vehicleTransmission}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-md"
                      required
                    >
                      <option value="" className="text-black">Seçiniz</option>
                      {vehicleData.transmissions.map(transmission => (
                        <option key={transmission} value={transmission} className="text-black">
                          {transmission}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                      Yakıt Tipi
                    </label>
                    <select
                      name="vehicleFuel"
                      value={formData.vehicleFuel}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-md"
                      required
                    >
                      <option value="" className="text-black">Seçiniz</option>
                      {vehicleData.fuels.map(fuel => (
                        <option key={fuel} value={fuel} className="text-black">
                          {fuel}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                      Araç Durumu
                    </label>
                    <select
                      name="vehicleCondition"
                      value={formData.vehicleCondition}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-md"
                      required
                    >
                      <option value="" className="text-black">Seçiniz</option>
                      {vehicleData.conditions.map(condition => (
                        <option key={condition} value={condition} className="text-black">
                          {condition}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                      Plaka
                    </label>
                    <input
                      type="text"
                      name="vehiclePlate"
                      value={formData.vehiclePlate}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-md"
                      placeholder="34XX0000"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-md"
                    placeholder="05XX XXX XX XX"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-3 px-6 rounded-lg font-semibold transition-colors mt-4"
                >
                  Talep Oluştur
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Hizmetler Section */}
        <section id="hizmetler" className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Hizmetlerimiz</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4">Acil Yol Yardım</h3>
                <p className="text-gray-600">Aracınızla ilgili her türlü acil durumda 7/24 yanınızdayız. Hızlı ve güvenilir yol yardım hizmeti.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4">Çekici Hizmeti</h3>
                <p className="text-gray-600">Arızalanan veya kaza yapan aracınızı istediğiniz yere güvenle taşıyoruz.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4">Lastik Yardımı</h3>
                <p className="text-gray-600">Lastik patlaması, değişimi ve tamir hizmetleri ile yolda kalmayın.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4">Akü Takviye</h3>
                <p className="text-gray-600">Akü bitmesi durumunda takviye yapıyor, gerekirse yeni akü temin ediyoruz.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4">Yakıt İkmali</h3>
                <p className="text-gray-600">Yakıtınız bittiğinde bulunduğunuz yere yakıt getiriyoruz.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4">Araç Kurtarma</h3>
                <p className="text-gray-600">Kaza veya sapma durumlarında aracınızı güvenle kurtarıyoruz.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Neden Biz Section */}
        <section className="py-16 px-4 bg-slate-300">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">Neden Bizi Seçmelisiniz?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start space-x-4">
                <div className="bg-yellow-400 text-black p-3 rounded-full">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-black">7/24 Hizmet</h3>
                  <p className="text-gray-500">Günün her saati, yılın her günü yanınızdayız. Acil durumlarınızda bize ulaşın.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-yellow-400 text-black p-3 rounded-full">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-black">Hızlı Müdahale</h3>
                  <p className="text-gray-500">Ortalama 30 dakika içinde olay yerine ulaşıyoruz.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-yellow-400 text-black p-3 rounded-full">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-black">Profesyonel Ekip</h3>
                  <p className="text-gray-500">Uzman ekibimiz ve modern ekipmanlarımızla her türlü yol yardım hizmeti.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-yellow-400 text-black p-3 rounded-full">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-black">Uygun Fiyat</h3>
                  <p className="text-gray-500">Şeffaf ve rekabetçi fiyatlarla kaliteli hizmet sunuyoruz.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* İletişim CTA Section */}
        <section className="py-16 px-4 bg-yellow-400">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-black">Yolda mı kaldınız?</h2>
            <p className="text-xl mb-8 text-black/80">Tüm yol yardım hizmetleri için 7/24 yanınızdayız!</p>
            <a 
              href="tel:+905XXXXXXXXX" 
              className="inline-block bg-black text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-900 transition-colors"
            >
              +90 5XX XXX XX XX
            </a>
          </div>
        </section>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Hizmet Talebi</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              {/* Step 1: Hizmet Seçimi */}
              {currentStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {serviceOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => handleServiceSelect(option.id)}
                      className="p-4 border rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-yellow-400">
                          {option.icon}
                        </div>
                        <h3 className="font-semibold">{option.title}</h3>
                      </div>
                      <p className="text-gray-600 text-sm">{option.description}</p>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 2: Konum Seçimi */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bulunduğunuz Konum
                    </label>
                    <div className="relative">
                      <input
                        ref={fromInputRef}
                        type="text"
                        name="fromLocation"
                        value={formData.fromLocation}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        placeholder="Konum seçin veya yazın"
                        required
                        autoComplete="off"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => getCurrentLocation('from')}
                          className="p-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors"
                          title="Mevcut Konumu Kullan"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMapOpen('from')}
                          className="p-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors"
                          title="Haritadan Seç"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gidilecek Konum
                    </label>
                    <div className="relative">
                      <input
                        ref={toInputRef}
                        type="text"
                        name="toLocation"
                        value={formData.toLocation}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        placeholder="Konum seçin veya yazın"
                        autoComplete="off"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => getCurrentLocation('to')}
                          className="p-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors"
                          title="Mevcut Konumu Kullan"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMapOpen('to')}
                          className="p-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors"
                          title="Haritadan Seç"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {showMap && (
                    <div className="mt-2 h-[300px] rounded-lg overflow-hidden">
                      <div ref={mapRef} className="w-full h-full"></div>
                    </div>
                  )}

                  <div className="flex justify-between mt-4">
                    <button
                      onClick={handlePrevStep}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Geri
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-lg"
                    >
                      İleri
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Araç Bilgileri */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Araç Markası */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Araç Markası
                      </label>
                      <select
                        name="vehicleBrand"
                        value={formData.vehicleBrand}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        required
                      >
                        <option value="">Seçiniz</option>
                        {vehicleData.brands.map(brand => (
                          <option key={brand.id} value={brand.id}>
                            {brand.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Araç Modeli */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Araç Modeli
                      </label>
                      <select
                        name="vehicleModel"
                        value={formData.vehicleModel}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        required
                        disabled={!formData.vehicleBrand}
                      >
                        <option value="">Seçiniz</option>
                        {formData.vehicleBrand && vehicleData.models[formData.vehicleBrand].map(model => (
                          <option key={model} value={model}>
                            {model}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Model Yılı */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Model Yılı
                      </label>
                      <select
                        name="vehicleYear"
                        value={formData.vehicleYear}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        required
                      >
                        <option value="">Seçiniz</option>
                        {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Araç Tipi */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Araç Tipi
                      </label>
                      <select
                        name="vehicleType"
                        value={formData.vehicleType}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        required
                      >
                        <option value="">Seçiniz</option>
                        {vehicleData.types.map(type => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Vites Tipi */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vites Tipi
                      </label>
                      <select
                        name="vehicleTransmission"
                        value={formData.vehicleTransmission}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        required
                      >
                        <option value="">Seçiniz</option>
                        {vehicleData.transmissions.map(transmission => (
                          <option key={transmission} value={transmission}>
                            {transmission}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Yakıt Tipi */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Yakıt Tipi
                      </label>
                      <select
                        name="vehicleFuel"
                        value={formData.vehicleFuel}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        required
                      >
                        <option value="">Seçiniz</option>
                        {vehicleData.fuels.map(fuel => (
                          <option key={fuel} value={fuel}>
                            {fuel}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Araç Durumu */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Araç Durumu
                      </label>
                      <select
                        name="vehicleCondition"
                        value={formData.vehicleCondition}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        required
                      >
                        <option value="">Seçiniz</option>
                        {vehicleData.conditions.map(condition => (
                          <option key={condition} value={condition}>
                            {condition}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Plaka */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Plaka
                      </label>
                      <input
                        type="text"
                        name="vehiclePlate"
                        value={formData.vehiclePlate}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        placeholder="34XX0000"
                        required
                      />
                    </div>

                    {/* Telefon */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        placeholder="05XX XXX XX XX"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-between mt-4">
                    <button
                      onClick={handlePrevStep}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Geri
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-lg"
                    >
                      İleri
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Rota ve Fiyat Bilgisi */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  {/* Harita */}
                  <div className="h-[300px] rounded-lg overflow-hidden border">
                    <div ref={mapRef} className="w-full h-full"></div>
                  </div>

                  {/* Rota Bilgileri */}
                  {routeInfo && (
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <h3 className="font-semibold mb-4">Rota Bilgileri</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-gray-600">Başlangıç Noktası</p>
                            <p className="font-medium">{routeInfo.startAddress}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Varış Noktası</p>
                            <p className="font-medium">{routeInfo.endAddress}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-gray-600">Toplam Mesafe</p>
                            <p className="font-medium">{routeInfo.distance}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Tahmini Süre</p>
                            <p className="font-medium">{routeInfo.duration}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fiyat Detayları */}
                  {routeInfo && (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h3 className="font-semibold mb-4">Fiyat Detayları</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Seçilen Hizmet</span>
                          <span className="font-medium">
                            {serviceOptions.find(opt => opt.id === formData.service)?.title}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Temel Ücret</span>
                          <span className="font-medium">
                            {calculatePrice().basePrice} TL
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Mesafe Ücreti</span>
                          <span className="font-medium">
                            {calculatePrice().distancePrice} TL
                          </span>
                        </div>
                        <div className="border-t border-yellow-200 pt-3 mt-3">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Tahmini Toplam</span>
                            <span className="text-2xl font-bold text-yellow-600">
                              {calculatePrice().total} TL
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          * Fiyatlar tahmini olup, final fiyat hizmet sonrası belirlenir.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Onay Butonları */}
                  <div className="flex justify-between mt-4">
                    <button
                      onClick={handlePrevStep}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Geri
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold"
                    >
                      Talebi Onayla
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}