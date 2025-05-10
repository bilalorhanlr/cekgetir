'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import { useEffect, useState, useRef } from 'react'
import axios from 'axios'

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
    vehiclePlate: '',
    vehicleCondition: '',
    phone: ''
  })

  const [currentVehicleIndex, setCurrentVehicleIndex] = useState(0)
  const [vehicleCount, setVehicleCount] = useState(1)
  const [isParkingDelivery, setIsParkingDelivery] = useState(false)
  const [multiVehicleData, setMultiVehicleData] = useState([{
    brand: '',
    model: '',
    year: '',
    type: '',
    plate: '',
    condition: '',
    phone: ''
  }])

  const fromInputRef = useRef(null)
  const toInputRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)

  const [showPriceModal, setShowPriceModal] = useState(false)
  const [showPrice, setShowPrice] = useState(false)
  const [calculatedPrice, setCalculatedPrice] = useState(null)
  const [map, setMap] = useState(null)
  const [directionsRenderer, setDirectionsRenderer] = useState(null)

  // Fiyat Modalı için harita referansı
  const priceMapRef = useRef(null)
  const [priceMap, setPriceMap] = useState(null)

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
      'Cabrio',
      'Coupe',
      'Roadster',
      'Hatchback',
      'Station Wagon',
      'SUV',
      'MPV',
      'Crossover',
      'Van',
      'Motorsiklet'
    ],
    types2: [
      'Crossover',
      'Karavan',
      'Pick-up',
      'Minibüs',
      'Kamyonet',
      'Çekici',
      'Çoklu Çekici',
      'Dorse',
      'İş Makinesi',
      'Kamyon',
      'Otobüs',
      'Yarım Otobüs',
      'Tanker',
      'Romorkör',
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
      description: 'Akü takviyesi, Araç arızası',
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
    },
    /* {
      id: 'agir-vasita',
      title: 'Ağır Vasıta',
      description: 'Kamyon, Tır, İş Makinesi',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      )
    } */
  ]

  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    payment: false
  })

  const [activeContract, setActiveContract] = useState(null)

  const contracts = {
    terms: {
      title: "Kullanım Koşulları ve Sözleşme",
      content: (
        <>
          <h2>1. Genel Hükümler</h2>
          <p>Bu sözleşme, Çekgetir hizmetlerinin kullanım koşullarını belirler...</p>
          <h2>2. Hizmet Kapsamı</h2>
          <p>Çekgetir, yol yardım ve araç çekme hizmetleri sunar...</p>
          <h2>3. Sorumluluklar</h2>
          <p>Hizmet sağlayıcı ve kullanıcının sorumlulukları...</p>
        </>
      )
    },
    privacy: {
      title: "KVKK ve Gizlilik Politikası",
      content: (
        <>
          <h2>Kişisel Verilerin Korunması</h2>
          <p>Kişisel verileriniz 6698 sayılı KVKK kapsamında korunmaktadır...</p>
          <h2>Veri İşleme Amaçları</h2>
          <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir...</p>
        </>
      )
    },
    payment: {
      title: "Ödeme ve Ücretlendirme Koşulları",
      content: (
        <>
          <h2>Ücretlendirme Politikası</h2>
          <p>Hizmet ücretleri mesafe ve hizmet türüne göre belirlenir...</p>
          <h2>Ödeme Koşulları</h2>
          <p>Ödemeler nakit veya kredi kartı ile yapılabilir...</p>
        </>
      )
    }
  }

  const handleAgreementChange = (agreement) => {
    setAgreements(prev => ({
      ...prev,
      [agreement]: !prev[agreement]
    }))
  }

  const canSubmitRequest = () => {
    return agreements.terms && agreements.privacy && agreements.payment
  }

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
      if (window.google) {
        setIsGoogleLoaded(true)
        return
      }

      // API'nin daha önce yüklenip yüklenmediğini kontrol et
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        setIsGoogleLoaded(true)
        return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry&language=tr`
      script.async = true
      script.defer = true
      script.onload = () => {
        console.log('Google Maps yüklendi')
        setIsGoogleLoaded(true)
      }
      script.onerror = (error) => {
        console.error('Google Maps yüklenirken hata:', error)
        setIsGoogleLoaded(false)
      }
      document.head.appendChild(script)
    }

    loadGoogleMaps()
  }, [])

  // Harita ve konum işlemleri
  const handleLocationSelect = (place, field) => {
    const location = {
      address: place.formatted_address,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    }

    setFormData(prev => ({
      ...prev,
      [field === 'from' ? 'fromLocation' : 'toLocation']: location.address,
      [field === 'from' ? 'fromLat' : 'toLat']: location.lat,
      [field === 'from' ? 'fromLng' : 'toLng']: location.lng
    }))

    if (map && markerRef.current) {
      markerRef.current.setPosition({ lat: location.lat, lng: location.lng })
      map.panTo({ lat: location.lat, lng: location.lng })
    }

    setShowMap(false)
  }

  const initMap = () => {
    if (!window.google || !mapRef.current) return

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 41.0082, lng: 28.9784 },
      zoom: 12,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    })

    const marker = new window.google.maps.Marker({
      map: map,
      draggable: true,
      animation: window.google.maps.Animation.DROP
    })

    markerRef.current = marker

    marker.addListener('dragend', () => {
      const position = marker.getPosition()
      const geocoder = new window.google.maps.Geocoder()

      geocoder.geocode({ location: position }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const address = results[0].formatted_address
          setFormData(prev => ({
            ...prev,
            [activeLocationField === 'from' ? 'fromLocation' : 'toLocation']: address,
            [activeLocationField === 'from' ? 'fromLat' : 'toLat']: position.lat(),
            [activeLocationField === 'from' ? 'fromLng' : 'toLng']: position.lng()
          }))
        }
      })
    })

    setMap(map)
  }

  const calculateRoute = () => {
    if (!window.google || !formData.fromLat || !formData.toLat) return

    const directionsService = new window.google.maps.DirectionsService()
    const renderer = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true
    })

    renderer.setMap(map)

    directionsService.route(
      {
        origin: { lat: parseFloat(formData.fromLat), lng: parseFloat(formData.fromLng) },
        destination: { lat: parseFloat(formData.toLat), lng: parseFloat(formData.toLng) },
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === 'OK') {
          renderer.setDirections(result)
          setDirectionsRenderer(renderer)

          const route = result.routes[0]
          const distance = route.legs[0].distance.value / 1000 // km cinsinden
          const duration = route.legs[0].duration.value / 60 // dakika cinsinden

          setRouteInfo({
            distance,
            duration
          })
        }
      }
    )
  }

  // Harita başlatma fonksiyonu
  useEffect(() => {
    if (isGoogleLoaded && !map && mapRef.current) {
      initMap()
    }
  }, [isGoogleLoaded, map])

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
    if (!isGoogleLoaded) {
      alert('Harita yükleniyor, lütfen bekleyin...')
      return
    }

    if (!navigator.geolocation) {
      alert('Tarayıcınız konum özelliğini desteklemiyor.')
      return
    }

    setActiveLocationField(fieldType)
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latLng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        
        try {
          const geocoder = new window.google.maps.Geocoder()
          const response = await geocoder.geocode({ location: latLng })
          
          if (response.results[0]) {
            const locationData = {
              address: response.results[0].formatted_address,
              lat: latLng.lat,
              lng: latLng.lng
            }

            setFormData(prev => ({
              ...prev,
              ...(fieldType === 'from' ? {
                fromLocation: locationData.address,
                fromLat: locationData.lat,
                fromLng: locationData.lng
              } : {
                toLocation: locationData.address,
                toLat: locationData.lat,
                toLng: locationData.lng
              })
            }))

            // Haritayı güncelle
            if (mapRef.current && markerRef.current) {
              const map = new window.google.maps.Map(mapRef.current, {
                center: latLng,
                zoom: 15
              })
              
              markerRef.current.setMap(map)
              markerRef.current.setPosition(latLng)
            }
          }
        } catch (error) {
          console.error('Geocoding hatası:', error)
          alert('Konum bilgisi alınamadı. Lütfen tekrar deneyin.')
        }
      },
      (error) => {
        console.error('Konum alınamadı:', error)
        alert('Konumunuz alınamadı. Lütfen konum izinlerini kontrol edin.')
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    )
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
    // Form gönderme işlemleri burada yapılacak
  }

  const handleServiceSelect = (serviceId) => {
    setFormData(prev => ({ ...prev, service: serviceId }))
    setCurrentStep(2) // Tüm hizmetler için 2. adımdan başla
    setShowModal(true)
  }

  const handleNextStep = () => {
    if (currentStep === 2) {
      // Konum seçimi adımında
      if (formData.service === 'yol-yardim' || formData.service === 'lastik') {
        // Yol yardımı ve lastik için sadece fromLocation kontrolü yap
        if (!formData.fromLocation) {
          alert('Lütfen konumunuzu seçin')
          return
        }
      } else {
        // Diğer hizmetler için her iki konumu da kontrol et
        if (!formData.fromLocation || !formData.toLocation) {
          alert('Lütfen her iki konumu da seçin')
          return
        }
      }
    }
    setCurrentStep(prev => prev + 1)
  }

  const handlePrevStep = () => {
    if (currentStep === 2) {
      // Eğer 2. adımdan geri dönüyorsak, hizmet seçim ekranına dön
      handleModalClose()
    } else {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handlePriceModalClose = () => {
    setShowPriceModal(false)
    setShowPrice(false)
    setCalculatedPrice(null)
    if (directionsRenderer) {
      directionsRenderer.setMap(null)
      setDirectionsRenderer(null)
    }
  }

  const calculateRouteWithRestrictions = async () => {
    try {
      const directionsService = new window.google.maps.DirectionsService();
      
      // Direkt rota hesapla
      const result = await directionsService.route({
        origin: new window.google.maps.LatLng(formData.fromLat, formData.fromLng),
        destination: new window.google.maps.LatLng(formData.toLat, formData.toLng),
        travelMode: window.google.maps.TravelMode.DRIVING,
        avoidHighways: false,
        avoidTolls: false
      });

      // Kullanılan köprüleri tespit et
      const usedBridges = [];
      const path = result.routes[0].overview_path;
      const routeSteps = result.routes[0].legs[0].steps;

      // Köprü tespiti için tüm noktaları kontrol et
      for (let i = 0; i < path.length; i++) {
        const point = path[i];
        bridges.forEach(bridge => {
          const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
            point,
            new window.google.maps.LatLng(bridge.location.lat, bridge.location.lng)
          );
          if (distance < bridge.radius) {
            if (!usedBridges.includes(bridge.name)) {
              usedBridges.push(bridge.name);
              console.log(`Köprü tespit edildi (konum): ${bridge.name} - Mesafe: ${distance.toFixed(2)} metre`);
            }
          }
        });
      }

      // Adım adım talimatları kontrol et
      for (const step of routeSteps) {
        const instructions = step.instructions.toLowerCase();
        const startPoint = step.start_location;
        const endPoint = step.end_location;

        bridges.forEach(bridge => {
          // Talimatları kontrol et
          const hasKeyword = bridge.keywords.some(keyword => instructions.includes(keyword.toLowerCase()));
          if (hasKeyword && !usedBridges.includes(bridge.name)) {
            usedBridges.push(bridge.name);
            console.log(`Köprü tespit edildi (talimat): ${bridge.name} - Talimat: ${instructions}`);
          }

          // Başlangıç ve bitiş noktalarını kontrol et
          const startDistance = window.google.maps.geometry.spherical.computeDistanceBetween(
            startPoint,
            new window.google.maps.LatLng(bridge.location.lat, bridge.location.lng)
          );
          const endDistance = window.google.maps.geometry.spherical.computeDistanceBetween(
            endPoint,
            new window.google.maps.LatLng(bridge.location.lat, bridge.location.lng)
          );

          if ((startDistance < bridge.radius || endDistance < bridge.radius) && !usedBridges.includes(bridge.name)) {
            usedBridges.push(bridge.name);
            console.log(`Köprü tespit edildi (adım): ${bridge.name} - Başlangıç mesafesi: ${startDistance.toFixed(2)}m, Bitiş mesafesi: ${endDistance.toFixed(2)}m`);
          }
        });
      }

      console.log('Tespit edilen köprüler:', usedBridges);

      // Köprü ücretini hesapla (FSM kullanılıyorsa 100 TL, kullanılmıyorsa 400 TL)
      const isFSMUsed = usedBridges.some(bridge => bridge === "FSM Köprüsü");
      const bridgeFee = isFSMUsed ? 100 : 400;

      // Rota detaylarını hazırla
      let routeDetails = {
        distance: result.routes[0].legs[0].distance.value / 1000,
        duration: result.routes[0].legs[0].duration.value / 60, // dakika cinsinden
        usedRoutes: {
          bridges: usedBridges,
        },
        bridgeFee: bridgeFee
      };

      console.log('Rota Detayları:', {
        totalDistance: routeDetails.distance.toFixed(2) + ' km',
        totalDuration: routeDetails.duration,
        usedBridges: routeDetails.usedRoutes.bridges,
        bridgeFee: routeDetails.bridgeFee + ' TL',
        pathPoints: path.length,
        startPoint: {
          lat: formData.fromLat,
          lng: formData.fromLng
        },
        endPoint: {
          lat: formData.toLat,
          lng: formData.toLng
        }
      });

      return routeDetails;
    } catch (error) {
      console.error('Rota hesaplama hatası:', error);
      alert('Rota hesaplanırken bir hata oluştu. Lütfen tekrar deneyin.');
      throw error;
    }
  };

  const calculatePrice = () => {
    if (!selectedVehicle || !selectedService || !routeInfo) return null

    const basePrice = selectedVehicle.basePrice
    const serviceMultiplier = selectedService.priceMultiplier
    const distancePrice = routeInfo.distance * selectedVehicle.pricePerKm

    return (basePrice + distancePrice) * serviceMultiplier
  }

  // UI güncellemeleri
  useEffect(() => {
    if (mounted && window.google) {
      initMap()
    }
  }, [mounted])

  useEffect(() => {
    if (formData.fromLat && formData.toLat) {
      calculateRoute()
    }
  }, [formData.fromLat, formData.toLat])

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const handleModalClose = () => {
    setShowModal(false)
    setCurrentStep(1)
    setFormData({
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
      vehiclePlate: '',
      vehicleCondition: '',
      phone: ''
    })
    setShowMap(false)
    setActiveLocationField(null)
  }

  const handleVehicleCountChange = (e) => {
    const count = parseInt(e.target.value)
    setVehicleCount(count)
    setCurrentVehicleIndex(0)
    // Araç sayısına göre multiVehicleData array'ini güncelle
    const newVehicleData = Array(count).fill().map((_, index) => ({
      ...multiVehicleData[index] || {
        brand: '',
        model: '',
        year: '',
        type: '',
        plate: '',
        condition: '',
        phone: ''
      }
    }))
    setMultiVehicleData(newVehicleData)
  }

  const handleMultiVehicleChange = (field, value) => {
    const newVehicleData = [...multiVehicleData]
    newVehicleData[currentVehicleIndex] = {
      ...newVehicleData[currentVehicleIndex],
      [field]: value
    }
    setMultiVehicleData(newVehicleData)
  }

  const handleNextVehicle = () => {
    if (currentVehicleIndex < multiVehicleData.length - 1) {
      setCurrentVehicleIndex(prev => prev + 1);
    } else {
      setCurrentVehicleIndex(0);
    }
  };

  const handlePrevVehicle = () => {
    if (currentVehicleIndex > 0) {
      setCurrentVehicleIndex(prev => prev - 1);
    } else {
      setCurrentVehicleIndex(multiVehicleData.length - 1);
    }
  };

  // Harita başlatma fonksiyonu
  const initPriceMap = () => {
    if (!window.google || !priceMapRef.current || priceMap) return

    const mapInstance = new window.google.maps.Map(priceMapRef.current, {
      center: { lat: 41.0082, lng: 28.9784 },
      zoom: 11,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        {
          featureType: "administrative.locality",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#38414e" }],
        },
        {
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [{ color: "#212a37" }],
        },
        {
          featureType: "road",
          elementType: "labels.text.fill",
          stylers: [{ color: "#9ca5b3" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry",
          stylers: [{ color: "#746855" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry.stroke",
          stylers: [{ color: "#1f2835" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#17263c" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.fill",
          stylers: [{ color: "#515c6d" }],
        },
      ],
      disableDefaultUI: true,
      zoomControl: true,
    })

    setPriceMap(mapInstance)
  }

  // Fiyat modalı açıldığında haritayı başlat
  useEffect(() => {
    if (showPriceModal && isGoogleLoaded) {
      setTimeout(() => {
        initPriceMap()
      }, 100)
    }
  }, [showPriceModal, isGoogleLoaded])

  // Rota çizme fonksiyonu güncelleme
  const drawRoute = async () => {
    if (!window.google || !formData.fromLocation) return;

    try {
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#fbbf24',
          strokeWeight: 5,
        },
      });

      // Haritayı oluştur
      const map = new window.google.maps.Map(priceMapRef.current, {
        zoom: 7,
        center: { lat: 41.0082, lng: 28.9784 },
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });

      directionsRenderer.setMap(map);

      // Ataşehir koordinatları
      const atasehirLocation = { lat: 40.9782, lng: 29.1271 };

      if (formData.service === 'yol-yardim' || formData.service === 'lastik') {
        // Yol yardım ve lastik için Ataşehir'den müşterinin konumuna rota çiz
        const request = {
          origin: atasehirLocation,
          destination: { lat: parseFloat(formData.fromLat), lng: parseFloat(formData.fromLng) },
          travelMode: window.google.maps.TravelMode.DRIVING
        };

        const result = await directionsService.route(request);
        directionsRenderer.setDirections(result);

        // Mesafeyi güncelle
        const distance = result.routes[0].legs[0].distance.value / 1000;
        setCalculatedPrice(prev => ({
          ...prev,
          distance: distance.toFixed(1)
        }));
      } else {
        // Çekici hizmetleri için normal rota çizimi
        const request = {
          origin: { lat: parseFloat(formData.fromLat), lng: parseFloat(formData.fromLng) },
          destination: { lat: parseFloat(formData.toLat), lng: parseFloat(formData.toLng) },
          travelMode: window.google.maps.TravelMode.DRIVING
        };

        const result = await directionsService.route(request);
        directionsRenderer.setDirections(result);

        const distance = result.routes[0].legs[0].distance.value / 1000;
        setCalculatedPrice(prev => ({
          ...prev,
          distance: distance.toFixed(1)
        }));
      }
    } catch (error) {
      console.error('Rota çizilirken hata:', error);
      alert('Rota çizilemedi. Lütfen konum bilgilerini kontrol edin ve tekrar deneyin.');
    }
  };

  // Konum değiştiğinde rotayı güncelle
  useEffect(() => {
    if (priceMap && formData.fromLat && formData.fromLng && showPriceModal) {
      setTimeout(() => {
        drawRoute()
      }, 200)
    }
  }, [priceMap, formData.fromLat, formData.fromLng, formData.toLat, formData.toLng, showPriceModal])

  // Modal kapandığında haritayı temizle
  useEffect(() => {
    if (!showPriceModal) {
      if (directionsRenderer) {
        directionsRenderer.setMap(null)
        setDirectionsRenderer(null)
      }
      setPriceMap(null)
    }
  }, [showPriceModal])

  const canCalculatePrice = () => {
    // Temel kontroller
    if (!formData.fromLocation) return false;

    // Çoklu çekici kontrolü
    if (formData.service === 'coklu-cekici') {
      // Her araç için zorunlu alan kontrolü
      return multiVehicleData.every(vehicle => 
        vehicle.brand && 
        vehicle.model && 
        vehicle.type && 
        vehicle.condition &&
        vehicle.phone // Her araç için telefon kontrolü eklendi
      );
    }

    // Diğer hizmetler için kontrol
    if (!formData.phone) return false; // Diğer hizmetler için telefon kontrolü

    if (formData.service === 'yol-yardim' || formData.service === 'lastik') {
      return formData.vehicleBrand && 
             formData.vehicleModel && 
             formData.vehicleType && 
             formData.vehicleCondition;
    } else {
      // Çekici hizmeti için varış noktası da gerekli
      return formData.toLocation && 
             formData.vehicleBrand && 
             formData.vehicleModel && 
             formData.vehicleType && 
             formData.vehicleCondition;
    }
  }

  const formatPhoneNumber = (value) => {
    // Sadece rakamları al
    const numbers = value.replace(/\D/g, '');
    
    // Maksimum 10 rakam
    const truncated = numbers.slice(0, 10);
    
    // Format: 05XX XXX XX XX
    if (truncated.length === 0) return '';
    if (truncated.length <= 4) return truncated.replace(/(\d{3})/, '0$1');
    if (truncated.length <= 7) return truncated.replace(/(\d{3})(\d{3})/, '0$1 $2');
    if (truncated.length <= 9) return truncated.replace(/(\d{3})(\d{3})(\d{2})/, '0$1 $2 $3');
    return truncated.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '0$1 $2 $3 $4');
  };

  const handlePhoneChange = (e, field = 'phone') => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    if (field === 'phone') {
      setFormData(prev => ({ ...prev, phone: formattedNumber }));
    } else {
      handleMultiVehicleChange('phone', formattedNumber);
    }
  };

  const canAddNewVehicle = () => {
    return multiVehicleData.length < vehicleCount;
  };

  const calculateRouteWith15TemmuzBridge = async () => {
    try {
      const directionsService = new window.google.maps.DirectionsService();
      
      // 15 Temmuz Köprüsü'nün koordinatları
      const bridgeLocation = bridges.find(b => b.name === "15 Temmuz Şehitler Köprüsü").location;
      
      // Başlangıç noktasından köprüye rota
      const toBridgeResult = await directionsService.route({
        origin: new window.google.maps.LatLng(formData.fromLat, formData.fromLng),
        destination: new window.google.maps.LatLng(bridgeLocation.lat, bridgeLocation.lng),
        travelMode: window.google.maps.TravelMode.DRIVING
      });

      // Köprüden varış noktasına rota
      const fromBridgeResult = await directionsService.route({
        origin: new window.google.maps.LatLng(bridgeLocation.lat, bridgeLocation.lng),
        destination: new window.google.maps.LatLng(formData.toLat, formData.toLng),
        travelMode: window.google.maps.TravelMode.DRIVING
      });

      // Rota detaylarını birleştir
      const totalDistance = (toBridgeResult.routes[0].legs[0].distance.value + 
                           fromBridgeResult.routes[0].legs[0].distance.value) / 1000;
      
      const totalDuration = toBridgeResult.routes[0].legs[0].duration.text + 
                           " + " + 
                           fromBridgeResult.routes[0].legs[0].duration.text;

      const routeDetails = {
        distance: totalDistance,
        duration: totalDuration,
        usedRoutes: {
          bridges: ["15 Temmuz Şehitler Köprüsü"],
        },
        bridgeFee: 150, // 15 Temmuz Köprüsü için 150 TL
        toBridgePath: toBridgeResult.routes[0].overview_path,
        fromBridgePath: fromBridgeResult.routes[0].overview_path
      };

      console.log('15 Temmuz Köprüsü Rota Detayları:', {
        totalDistance: routeDetails.distance.toFixed(2) + ' km',
        totalDuration: routeDetails.duration,
        usedBridges: routeDetails.usedRoutes.bridges,
        bridgeFee: routeDetails.bridgeFee + ' TL'
      });

      return routeDetails;
    } catch (error) {
      console.error('15 Temmuz Köprüsü rota hesaplama hatası:', error);
      alert('Rota hesaplanırken bir hata oluştu. Lütfen tekrar deneyin.');
      throw error;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:4000/api/auth/login', 
        { username, password },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      // ... existing code ...
    } catch (error) {
      console.error('Login Error:', error);
    }
  };

  const fetchVariables = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/admin/variables', {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        }
      });
      setVariables(response.data);
    } catch (error) {
      console.error('Error fetching variables:', error);
      if (error.response) {
        // Server responded with an error
        console.error('Server error:', error.response.data);
      }
    }
  };

  useEffect(() => {
    fetchVariables();
  }, []);

  if (!mounted) {
    return null
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white ">
        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex items-center">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/home.jpeg"
              alt="Çekgetir Yol Yardım"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-l from-black/95 via-black/75 to-black/30"></div>
          </div>

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center">
            {/* Sol taraf - Başlık ve Açıklama */}
            <div className="w-full lg:w-2/3 mb-8 lg:mb-0">
              <div className="text-white">
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  7/24 Yol Yardım Hizmetleri
                </h1>
                <p className="text-lg md:text-xl mb-8 text-gray-300">
                  Çekici, lastik, akü ve tüm yol yardım hizmetleriyle yanınızdayız
                </p>
              </div>
            </div>

            {/* Sağ taraf - Hizmet Seçimi ve Form Alanı */}
            <div className="w-full lg:w-1/3">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 lg:p-6 shadow-xl border border-white/20">
                {!showModal ? (
                  <>
                    <h2 className="text-xl lg:text-2xl font-semibold text-white mb-4 lg:mb-6">Hizmet Seçin</h2>
                    <div className="grid grid-cols-1 gap-3">
                      {serviceOptions.map(option => (
                        <button
                          key={option.id}
                          onClick={() => {
                            handleServiceSelect(option.id)
                            setShowModal(true)
                          }}
                          className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-colors text-left group"
                        >
                          <div className="text-yellow-400 group-hover:scale-110 transition-transform">
                            {option.icon}
                          </div>
                          <div>
                            <h4 className="font-medium text-white text-base">{option.title}</h4>
                            <p className="text-sm text-gray-300">{option.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="relative">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-semibold text-white">Hizmet Talebi</h2>
                      <button
                        onClick={handleModalClose}
                        className="text-white/70 hover:text-white"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Step 2: Konum Seçimi */}
                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-medium text-white">Konum Seçin</h3>
                        <div className="space-y-4">
                          {(formData.service === 'yol-yardim' || formData.service === 'lastik') ? (
                            <div>
                              <label className="block text-sm font-medium text-gray-200 mb-2">
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
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => getCurrentLocation('from')}
                                    className="p-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors"
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
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
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
                                  />
                                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => getCurrentLocation('from')}
                                      className="p-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors"
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
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
            </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
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
                                    required
                                  />
                                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => getCurrentLocation('to')}
                                      className="p-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors"
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
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}

                          {showMap && (
                            <div className="h-[400px] rounded-lg overflow-hidden border border-white/20">
                              <div ref={mapRef} className="w-full h-full"></div>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between mt-6">
                          <button
                            onClick={handlePrevStep}
                            className="px-4 py-2 text-gray-300 hover:text-white"
                          >
                            Geri
                          </button>
                          <button
                            onClick={handleNextStep}
                            className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors"
                          >
                            İleri
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Araç Bilgileri */}
                    {currentStep === 3 && (
                      <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                        
                        {formData.service === 'coklu-cekici' ? (
                          <div className="space-y-3">
                            {/* Otopark Teslim Seçeneği */}
                            <div className="flex items-start gap-2 rounded-lg">
                              <input
                                type="checkbox"
                                id="parkingDelivery"
                                checked={isParkingDelivery}
                                onChange={(e) => setIsParkingDelivery(e.target.checked)}
                                className="mt-1"
                              />
                              <div>
                                <label htmlFor="parkingDelivery" className="text-white font-medium">
                                  Otoparktan Teslim
                                </label>
                                <div className="flex items-center gap-2 mt-1">
                                  <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <p className="text-sm text-gray-300">
                                    Bu seçenek işaretlendiğinde, araçlar ataşehir adresindeki otoparktan teslim alınacaktır.
                                  </p>
                                </div>
                              </div>
            </div>



                            {/* Mevcut Araç Bilgileri */}
                            <div className="p-4 bg-white/5 rounded-lg space-y-4">
                              <div className="flex items-center justify-between sticky top-0 bg-gray-900/90 backdrop-blur-md p-2 rounded-lg z-10">
                                <div className="flex items-center gap-2 sm:gap-4">
                                  <h4 className="text-white font-medium text-sm sm:text-base">{currentVehicleIndex + 1} / {multiVehicleData.length}</h4>
                                  <button
                                    onClick={() => {
                                      setMultiVehicleData([...multiVehicleData, {
                                        brand: '',
                                        model: '',
                                        type: '',
                                        condition: '',
                                        phone: ''
                                      }]);
                                      setCurrentVehicleIndex(multiVehicleData.length);
                                    }}
                                    className="px-2 sm:px-3 py-1 bg-yellow-400 text-black rounded hover:bg-yellow-500 transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                                  >
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Ekle
                                  </button>
            </div>
                                {multiVehicleData.length > 1 && (
                                  <div className="flex items-center gap-1 sm:gap-2">
                                    <button
                                      onClick={handlePrevVehicle}
                                      className="px-2 sm:px-3 py-1 text-gray-300 hover:text-white disabled:opacity-50 text-xs sm:text-sm"
                                      disabled={currentVehicleIndex === 0}
                                    >
                                      Önceki
                                    </button>
                                    <button
                                      onClick={handleNextVehicle}
                                      className="px-2 sm:px-3 py-1 bg-yellow-400 text-black rounded hover:bg-yellow-500 text-xs sm:text-sm"
                                    >
                                      Sonraki
                                    </button>
          </div>
                                )}
        </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                <div>
                                  <label className="block text-xs sm:text-sm font-medium text-gray-200 mb-1">
                                    Araç Markası
                                  </label>
                                  <select
                                    value={multiVehicleData[currentVehicleIndex].brand}
                                    onChange={(e) => handleMultiVehicleChange('brand', e.target.value)}
                                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-md text-xs sm:text-sm"
                                  >
                                    <option value="">Seçiniz</option>
                                    {vehicleData.brands.map(brand => (
                                      <option key={brand.id} value={brand.id}>
                                        {brand.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-xs sm:text-sm font-medium text-gray-200 mb-1">
                                    Araç Modeli
                                  </label>
                                  <select
                                    value={multiVehicleData[currentVehicleIndex].model}
                                    onChange={(e) => handleMultiVehicleChange('model', e.target.value)}
                                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-md text-xs sm:text-sm"
                                    disabled={!multiVehicleData[currentVehicleIndex].brand}
                                  >
                                    <option value="">Seçiniz</option>
                                    {multiVehicleData[currentVehicleIndex].brand && vehicleData.models[multiVehicleData[currentVehicleIndex].brand].map(model => (
                                      <option key={model} value={model}>
                                        {model}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-xs sm:text-sm font-medium text-gray-200 mb-1">
                                    Araç Tipi
                                  </label>
                                  <select
                                    value={multiVehicleData[currentVehicleIndex].type}
                                    onChange={(e) => handleMultiVehicleChange('type', e.target.value)}
                                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-md text-xs sm:text-sm"
                                  >
                                    <option value="">Seçiniz</option>
                                    {vehicleData.types.map(type => (
                                      <option key={type} value={type}>
                                        {type}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-xs sm:text-sm font-medium text-gray-200 mb-1">
                                    Araç Durumu
                                  </label>
                                  <select
                                    value={multiVehicleData[currentVehicleIndex].condition}
                                    onChange={(e) => handleMultiVehicleChange('condition', e.target.value)}
                                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-md text-xs sm:text-sm"
                                  >
                                    <option value="">Seçiniz</option>
                                    <option value="calışmıyor">Çalışıyor</option>
                                    <option value="arızalı">Kazalı</option>
                                    <option value="yakıt_bitti">Vites Park Konumundan Çıkmıyor</option>
                                    <option value="akü">Akü Problemi</option>
                                  </select>
                                </div>

                                <div className="sm:col-span-2">
                                  <label className="block text-xs sm:text-sm font-medium text-gray-200 mb-1">
                                    Telefon
                                  </label>
                                  <input
                                    type="tel"
                                    value={multiVehicleData[currentVehicleIndex].phone || ''}
                                    onChange={(e) => handleMultiVehicleChange('phone', e.target.value)}
                                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-md text-xs sm:text-sm"
                                    placeholder="05XX XXX XX XX"
                                    maxLength={14}
                                    required
              />
            </div>
          </div>

                              {multiVehicleData.length > 1 && (
                                <div className="flex justify-start mt-3 sm:mt-4">
                                  <button
                                    onClick={() => {
                                      const newData = [...multiVehicleData];
                                      newData.splice(currentVehicleIndex, 1);
                                      setMultiVehicleData(newData);
                                      setCurrentVehicleIndex(Math.min(currentVehicleIndex, newData.length - 1));
                                    }}
                                    className="px-2 sm:px-3 py-1 text-red-400 hover:text-red-300 transition-colors text-xs sm:text-sm"
                                  >
                                    Bu Aracı Sil
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                  Araç Markası
                                </label>
                                <select
                                  name="vehicleBrand"
                                  value={formData.vehicleBrand}
                                  onChange={handleChange}
                                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-md"
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

                              <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
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
                                  <option value="">Seçiniz</option>
                                  {formData.vehicleBrand && vehicleData.models[formData.vehicleBrand].map(model => (
                                    <option key={model} value={model}>
                                      {model}
                                    </option>
                                  ))}
                                </select>
                </div>
              </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                  Model Yılı
                                </label>
                                <select
                                  name="vehicleYear"
                                  value={formData.vehicleYear}
                                  onChange={handleChange}
                                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-md"
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

                              <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                  Araç Tipi
                                </label>
                                <select
                                  name="vehicleType"
                                  value={formData.vehicleType}
                                  onChange={handleChange}
                                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-md"
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
                </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
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

                              <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                  {formData.service === 'lastik' ? 'Lastik Durumu' : 'Araç Durumu'}
                                </label>
                                <select
                                  name="vehicleCondition"
                                  value={formData.vehicleCondition}
                                  onChange={handleChange}
                                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-md"
                                  required
                                >
                                  <option value="">Seçiniz</option>
                                  {formData.service === 'lastik' ? (
                                    <>
                                      <option value="patlak">Patlak</option>
                                      <option value="inmış">İnmiş</option>
                                      <option value="değişim">Değişim Gerekli</option>
                                    </>
                                  ) : (
                                    <>
                                      <option value="calışmıyor">Çalışmıyor</option>
                                      <option value="arızalı">Arızalı</option>
                                      <option value="yakıt_bitti">Yakıt Bitti</option>
                                      <option value="akü">Akü Problemi</option>
                                    </>
                                  )}
                                </select>
                </div>
              </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-200 mb-2">
                                Telefon
                              </label>
                              <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={(e) => handlePhoneChange(e)}
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-md"
                                placeholder="05XX XXX XX XX"
                                maxLength={14}
                                required
                              />
            </div>
          </div>
                        )}

                        <div className="flex justify-between mt-6">
                          <button
                            onClick={handlePrevStep}
                            className="px-4 py-2 text-gray-300 hover:text-white"
                          >
                            Geri
                          </button>
                          <button
                            onClick={calculatePrice}
                            disabled={!canCalculatePrice()}
                            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                              canCalculatePrice()
                                ? 'bg-yellow-400 hover:bg-yellow-500 text-black'
                                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {!canCalculatePrice() ? 'Lütfen Zorunlu Alanları Doldurun' : 'Fiyat Gör'}
                          </button>
        </div>
      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Hizmetler Section */}
        <section id="hizmetler" className="py-16 px-4">
          <div className="max-w-6xl mx-auto text-black">
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
              <div className="flex items-start space-x-4 bg-white p-6 rounded-lg shadow-md">
                <div className="bg-yellow-400 text-black p-3 rounded-full">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2 text-black">Güvenilir Hizmet Ağı</h3>
          <p className="text-gray-600">Türkiye genelinde şehirler arası araç transferi ve İstanbul içerisinde 7/24 yol yardım hizmeti sunan firmamız, ihtiyaç duyduğunuz her an ulaşılabilir ve çözüm odaklı hizmet anlayışı ile yanınızdadır.</p>
        </div>
      </div>

      <div className="flex items-start space-x-4 bg-white p-6 rounded-lg shadow-md">
        <div className="bg-yellow-400 text-black p-3 rounded-full">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2 text-black">Deneyimli ve Yetkin Ekip</h3>
          <p className="text-gray-600">Tüm operasyonlarımız, alanında uzman, belgeli ve tecrübeli personellerimiz tarafından titizlikle yürütülmektedir. Sürücü kadromuz, taşıma sırasında gerekli tüm prosedürlere hakimdir.</p>
        </div>
      </div>

      <div className="flex items-start space-x-4 bg-white p-6 rounded-lg shadow-md">
        <div className="bg-yellow-400 text-black p-3 rounded-full">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2 text-black">Araç Tipine Uygun Taşıma Çözümleri</h3>
          <p className="text-gray-600">Binek araçlardan SUV'lara, çift kabin araçlardan motosikletlere kadar farklı türdeki araçlar için özel taşıma çözümleri sunmaktayız. Her araç tipi için uygun ekipman ve taşıma sistemlerine sahibiz.</p>
        </div>
      </div>

      <div className="flex items-start space-x-4 bg-white p-6 rounded-lg shadow-md">
        <div className="bg-yellow-400 text-black p-3 rounded-full">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2 text-black">Şeffaf ve Sabit Fiyat Politikası</h3>
          <p className="text-gray-600">Hizmet öncesinde net fiyat bilgisi sunulmakta, herhangi bir sürpriz ücretle karşılaşmanız önlenmektedir. Fiyatlandırmalar mesafe, araç tipi ve ek hizmetlere göre belirlenmektedir.</p>
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:+905445931640" 
                className="inline-block bg-black text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +90 544 593 16 40
              </a>
              <a 
                href="https://wa.me/905445931640" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#25D366] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-[#1EA952] transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* Fiyat Modalı */}
        {showPriceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70" onClick={handlePriceModalClose}></div>
            <div className="relative bg-[#141414] rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-semibold text-[#ebebeb]">Fiyat Bilgisi</h3>
                  <button
                    onClick={handlePriceModalClose}
                    className="text-[#ebebeb] hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {showPrice && calculatedPrice && (
                  <div className="space-y-6">
                    <div className="bg-[#404040] border border-[#404040] rounded-lg p-4 mb-6">
                      <div className="flex items-center gap-2">
                        <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-[#ebebeb] font-medium">
                          {calculatedPrice.isIntercity ? 'Şehirler Arası Hizmet' : 'Şehir İçi Hizmet'}
                        </span>
                      </div>
                      {calculatedPrice.fromCity && calculatedPrice.toCity && (
                        <div className="mt-2 text-sm text-[#ebebeb]">
                          {calculatedPrice.fromCity} {calculatedPrice.isIntercity ? '→' : '↔'} {calculatedPrice.toCity}
                        </div>
                      )}
                      <div className="mt-2 text-sm text-[#ebebeb] flex items-center gap-2">
                        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-[#ebebeb] font-medium">
                          Tahmini Varış Süresi: <span className="text-yellow-400 font-semibold">{calculatedPrice.duration || 'Hesaplanıyor...'}</span>
                        </span>
                      </div>
                    </div>

                    <div className="h-[300px] rounded-lg overflow-hidden border border-[#404040] mb-6">
                      <div ref={priceMapRef} className="w-full h-full"></div>
                    </div>

                    <div className="border-t border-[#404040] pt-6">
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex justify-between items-center w-full">
                          <div className="text-lg text-[#ebebeb]">KDV Hariç Tutar</div>
                          <div className="text-2xl font-semibold text-[#ebebeb]">
                            {Math.round(calculatedPrice.totalPrice + 
                              (calculatedPrice.usedRoutes?.bridges?.length > 0 ? 150 : 0)
                            )} ₺
                          </div>
                        </div>
                        {calculatedPrice.conditionFee > 0 && (
                          <div className="flex justify-between items-center w-full">
                            <div className="text-lg text-[#ebebeb]">Araç Durumu Ek Ücreti</div>
                            <div className="text-xl text-[#ebebeb]">
                              {calculatedPrice.conditionFee} ₺
                            </div>
                          </div>
                        )}
                        {calculatedPrice.vehicleTypeMultiplier > 1 && (
                          <div className="flex justify-between items-center w-full">
                            <div className="text-lg text-[#ebebeb]">Araç Tipi Çarpanı</div>
                            <div className="text-xl text-[#ebebeb]">
                              {calculatedPrice.vehicleTypeMultiplier.toFixed(1)}x
                            </div>
                          </div>
                        )}
                        <div className="flex justify-between items-center w-full">
                          <div className="text-lg text-[#ebebeb]">KDV (%20)</div>
                          <div className="text-xl text-[#ebebeb]">
                            {Math.round((calculatedPrice.totalPrice + 
                              (calculatedPrice.usedRoutes?.bridges?.length > 0 ? 150 : 0)) * 0.20)} ₺
                          </div>
                        </div>
                        <div className="flex justify-between items-center w-full">
                          <div className="text-lg text-[#ebebeb]">Toplam Tutar (KDV Dahil)</div>
                          <div className="text-3xl font-bold text-yellow-400">
                            {Math.round((calculatedPrice.totalPrice + 
                              (calculatedPrice.usedRoutes?.bridges?.length > 0 ? 150 : 0)) * 1.20)} ₺
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                        <button
                          onClick={handlePriceModalClose}
                          className="px-6 py-3 bg-[#404040] text-[#ebebeb] rounded-lg hover:bg-[#505050] transition-colors"
                        >
                          Geri Dön
                        </button>
                        <button
                          onClick={() => {
                            handlePriceModalClose();
                            setCurrentStep(4);
                          }}
                          className="px-6 py-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors font-medium"
                        >
                          Devam Et
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      <Footer />
      </main>
    </>
  )
}