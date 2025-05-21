'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { GoogleMap, Marker, useLoadScript, DirectionsRenderer } from '@react-google-maps/api'
import api from '@/utils/axios'
import axios from 'axios'

const libraries = ['places']

const mapStyles = {
  width: '100%',
  height: '300px',
  borderRadius: '0.75rem',
  border: '1px solid rgba(64, 64, 64, 0.4)'
}

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  clickableIcons: false
}

// Şehir adını normalize eden fonksiyon
function normalizeSehirAdi(sehir) {
  return sehir
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/İ/g, 'i');
}

export default function OzelCekiciModal({ onClose }) {
  const [step, setStep] = useState(1)
  const [pickupLocation, setPickupLocation] = useState(null)
  const [deliveryLocation, setDeliveryLocation] = useState(null)
  const [pickupSearchValue, setPickupSearchValue] = useState('')
  const [deliverySearchValue, setDeliverySearchValue] = useState('')
  const [activeLocation, setActiveLocation] = useState('pickup')
  const [aracBilgileri, setAracBilgileri] = useState({
    marka: '',
    model: '',
    yil: '',
    plaka: '',
    tip: '',
    durum: ''
  })

  const [musteriBilgileri, setMusteriBilgileri] = useState({
    ad: '',
    soyad: '',
    telefon: '',
    email: '',
    musteriTipi: 'kisisel',
    firmaAdi: '',
    vergiNo: '',
    vergiDairesi: '',
    tcKimlik: '',
    tcVatandasi: true
  })
  const [price, setPrice] = useState(null)
  const [pricingData, setPricingData] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const [directions, setDirections] = useState(null)
  const [pnrNumber, setPnrNumber] = useState(null)
  const [activeMapPanel, setActiveMapPanel] = useState(null)
  const [vehicleData, setVehicleData] = useState({
    aracMarkalari: [],
    aracModelleri: {},
    yillar: [],
    segmentler: [],
    durumlar: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sehirFiyatlandirma, setSehirFiyatlandirma] = useState(null)
  const mapRef = useRef(null)

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          { data: ozelCekiciData },
          { data: segmentsData },
          { data: statusesData },
          { data: vehicleInfoData }
        ] = await Promise.all([
          api.get('/api/variables/ozel-cekici'),
          api.get('/api/variables/car-segments?type=ozel-cekici'),
          api.get('/api/variables/car-statuses?type=ozel-cekici'),
          axios.get('/data/arac-info.json')
        ]);

        setPricingData({
          ...ozelCekiciData,
          segments: segmentsData.map(segment => ({
            id: segment.id,
            name: segment.name,
            price: segment.price
          })),
          statuses: statusesData.map(status => ({
            id: status.id,
            name: status.name,
            price: status.price
          }))
        });

        setVehicleData({
          segments: segmentsData,
          brands: vehicleInfoData.aracMarkalari,
          models: vehicleInfoData.aracModelleri,
          years: vehicleInfoData.yillar
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Konumdan adres reverse geocode için
  const getAddressFromLatLng = async (lat, lng) => {
    if (!window.google) return ''
    const geocoder = new window.google.maps.Geocoder()
    return new Promise((resolve) => {
      geocoder.geocode({ location: { lat, lng } }, async (results, status) => {
        if (status === 'OK' && results[0]) {
          const address = results[0].formatted_address;
          
          // Şehir bilgisini bul
          let sehir = '';
          for (const component of results[0].address_components) {
            if (component.types.includes('administrative_area_level_1')) {
              sehir = component.long_name;
              break;
            }
          }

          // Şehir fiyatlandırmasını getir
          if (sehir) {
            try {
              const normalizedSehir = normalizeSehirAdi(sehir);
              const response = await api.get(`/api/variables/ozel-cekici/sehirler/${normalizedSehir}`);
              setSehirFiyatlandirma(response.data);
            } catch (error) {
              console.error('Şehir fiyatlandırması getirilemedi:', error);
              setSehirFiyatlandirma(null);
            }
          }

          resolve(address);
        } else {
          resolve('');
        }
      });
    });
  }

  // Fiyat hesaplama fonksiyonu
  const fiyatHesapla = useCallback(() => {
    // Gerekli kontroller
    if (!pickupLocation || !deliveryLocation || !aracBilgileri.tip || !aracBilgileri.durum) {
        setPrice(0);
        return;
    }

    // Şehir adı normalize edilmiş şekilde alınmalı!
    const isIstanbul = sehirFiyatlandirma && (
      sehirFiyatlandirma.sehirAdi?.toLocaleLowerCase('tr-TR') === 'istanbul'
        || sehirFiyatlandirma.sehirAdi?.toLocaleLowerCase('tr-TR') === 'i̇stanbul'
    );

    const currentHour = new Date().getHours();
    const isNightTime = (currentHour >= 22 || currentHour < 8);

    const nightMultiplier = (isIstanbul && isNightTime)
      ? (pricingData?.nightPrice || 1)
      : 1;
    
    // Fiyat hesaplama bileşenleri
    const basePrice = Number(sehirFiyatlandirma?.basePrice) || 0;  // Şehir bazlı temel fiyat
    const distanceMultiplier = routeInfo?.distance ? routeInfo.distance * (Number(sehirFiyatlandirma?.basePricePerKm) || 0) : 0;  // Şehir bazlı km ücreti
    
    // Araç tipine göre segment katsayısı (diziden bul)
    const segmentObj = pricingData?.segments?.find(seg => String(seg.id) === String(aracBilgileri.tip));
    const segmentMultiplier = segmentObj ? Number(segmentObj.price) : 1;
    
    // Araç durumuna göre durum katsayısı (diziden bul)
    const statusObj = pricingData?.statuses?.find(st => String(st.id) === String(aracBilgileri.durum));
    const statusMultiplier = statusObj ? Number(statusObj.price) : 1;
    
    // Toplam fiyat hesaplama
    const totalPrice = (basePrice + distanceMultiplier) * segmentMultiplier * statusMultiplier * nightMultiplier;
    setPrice(Math.round(totalPrice));
  }, [pickupLocation, deliveryLocation, aracBilgileri, routeInfo, pricingData, sehirFiyatlandirma]);

  // Fiyat hesaplamayı useEffect ile tetikle
  useEffect(() => {
    if (
      pickupLocation &&
      deliveryLocation &&
      aracBilgileri.tip &&
      aracBilgileri.durum &&
      routeInfo &&
      pricingData &&
      sehirFiyatlandirma
    ) {
      fiyatHesapla();
    }
  }, [pickupLocation, deliveryLocation, aracBilgileri, routeInfo, pricingData, sehirFiyatlandirma, fiyatHesapla]);

  // Rota hesaplama fonksiyonu
  const calculateRoute = useCallback(async () => {
    if (!pickupLocation || !deliveryLocation || !window.google) return

    const directionsService = new window.google.maps.DirectionsService()
    const request = {
      origin: new window.google.maps.LatLng(pickupLocation.lat, pickupLocation.lng),
      destination: new window.google.maps.LatLng(deliveryLocation.lat, deliveryLocation.lng),
      travelMode: window.google.maps.TravelMode.DRIVING
    }

    try {
      const result = await new Promise((resolve, reject) => {
        directionsService.route(request, (result, status) => {
          if (status === 'OK') {
            resolve(result)
          } else {
            reject(new Error(`Directions request failed: ${status}`))
          }
        })
      })

      const route = result.routes[0]
      const distance = route.legs[0].distance.value / 1000 // km
      const duration = route.legs[0].duration.value / 60 // dk

      setDirections(result)
      setRouteInfo({
        distance,
        duration,
        steps: route.legs[0].steps.map(step => ({
          instruction: step.instructions,
          distance: step.distance.text,
          duration: step.duration.text
        }))
      })
    } catch (error) {
      console.error('Error calculating route:', error)
    }
  }, [pickupLocation, deliveryLocation])

  // Adres arama ile konum seçimi
  const handlePlaceChanged = async (e) => {
    const place = e.detail.place
    if (place && place.geometry) {
      const newLocation = {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        address: place.formatted_address
      }

      // Şehir bilgisini bul
      let sehir = '';
      for (const component of place.address_components) {
        if (component.types.includes('administrative_area_level_1')) {
          sehir = component.long_name;
          break;
        }
      }

      // Şehir fiyatlandırmasını getir
      if (sehir) {
        try {
          const normalizedSehir = normalizeSehirAdi(sehir);
          const response = await api.get(`/api/variables/ozel-cekici/sehirler/${normalizedSehir}`);
          setSehirFiyatlandirma(response.data);
        } catch (error) {
          console.error('Şehir fiyatlandırması getirilemedi:', error);
          setSehirFiyatlandirma(null);
        }
      }

      if (activeLocation === 'pickup') {
        setPickupLocation(newLocation)
        setPickupSearchValue(place.formatted_address)
      } else {
        setDeliveryLocation(newLocation)
        setDeliverySearchValue(place.formatted_address)
      }
      setActiveMapPanel(null) // Konum seçilince harita kapansın
    }
  }

  // Haritaya tıklayınca konum seçimi
  const handleMapClick = async (e) => {
    const lat = e.latLng.lat()
    const lng = e.latLng.lng()
    const address = await getAddressFromLatLng(lat, lng)
    const newLocation = { lat, lng, address }

    // Google Maps Geocoder ile şehir bilgisini al
    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ location: { lat, lng } }, async (results, status) => {
      if (status === 'OK' && results[0]) {
        let sehir = '';
        for (const component of results[0].address_components) {
          if (component.types.includes('administrative_area_level_1')) {
            sehir = component.long_name;
            break;
          }
        }

        // Şehir fiyatlandırmasını getir
        if (sehir) {
          try {
            const normalizedSehir = normalizeSehirAdi(sehir);
            const response = await api.get(`/api/variables/ozel-cekici/sehirler/${normalizedSehir}`);
            setSehirFiyatlandirma(response.data);
          } catch (error) {
            console.error('Şehir fiyatlandırması getirilemedi:', error);
            setSehirFiyatlandirma(null);
          }
        }
      }
    });

    if (activeLocation === 'pickup') {
      setPickupLocation(newLocation)
      setPickupSearchValue(address)
    } else {
      setDeliveryLocation(newLocation)
      setDeliverySearchValue(address)
    }
    setActiveMapPanel(null) // Konum seçilince harita kapansın
  }

  // Konumumu kullan
  const handleCurrentLocation = useCallback((target) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          const address = await getAddressFromLatLng(latitude, longitude)
          const newLocation = { lat: latitude, lng: longitude, address }
          if (target === 'pickup') {
            setPickupLocation(newLocation)
            setPickupSearchValue(address)
          } else {
            setDeliveryLocation(newLocation)
            setDeliverySearchValue(address)
          }
          setActiveMapPanel(null) // Konum seçilince harita kapansın
        },
        (error) => {
          console.error('Geolocation error:', error)
        }
      )
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      setActiveMapPanel('pickup');
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      await createOrder();
    }
  };

  // Add useEffect for route calculation
  useEffect(() => {
    if (pickupLocation && deliveryLocation && isLoaded) {
      calculateRoute()
    }
  }, [pickupLocation, deliveryLocation, isLoaded, calculateRoute])

  // Sipariş oluşturma fonksiyonu
  const createOrder = async () => {
    try {
      const { data } = await api.post('/api/orders', {
        vehicles: [aracBilgileri],
        price,
        customerInfo: musteriBilgileri,
        pickupLocation,
        deliveryLocation,
        routeInfo
      });

      setPnrNumber(data.pnr);
      setStep(4);

      // PNR'ı localStorage'a kaydet
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastPnr', data.pnr);
      }
    } catch (error) {
      console.error('Sipariş oluşturma hatası:', error);
    }
  };

  const renderAracBilgileri = () => (
    <div className="space-y-4">zz
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#404040] mb-2">
            Araç Segmenti
          </label>
          <select
            value={aracBilgileri.tip}
            onChange={(e) => setAracBilgileri({ ...aracBilgileri, tip: e.target.value })}
            className="w-full px-4 py-3 bg-[#141414] border border-[#404040] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            <option value="">Segment Seçin</option>
            {vehicleData?.segments?.map((segment) => (
              <option key={segment.id} value={segment.id}>{segment.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#404040] mb-2">
            Marka
          </label>
          <select
            value={aracBilgileri.marka}
            onChange={(e) => setAracBilgileri({ ...aracBilgileri, marka: e.target.value, model: '' })}
            className="w-full px-4 py-3 bg-[#141414] border border-[#404040] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            <option value="">Marka Seçin</option>
            {vehicleData?.brands?.map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#404040] mb-2">
            Model
          </label>
          <select
            value={aracBilgileri.model}
            onChange={(e) => setAracBilgileri({ ...aracBilgileri, model: e.target.value })}
            disabled={!aracBilgileri.marka}
            className="w-full px-4 py-3 bg-[#141414] border border-[#404040] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:opacity-50"
          >
            <option value="">Model Seçin</option>
            {aracBilgileri.marka && vehicleData?.models?.[aracBilgileri.marka]?.map((model) => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#404040] mb-2">
            Yıl
          </label>
          <select
            value={aracBilgileri.yil}
            onChange={(e) => setAracBilgileri({ ...aracBilgileri, yil: e.target.value })}
            className="w-full px-4 py-3 bg-[#141414] border border-[#404040] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            <option value="">Yıl Seçin</option>
            {vehicleData?.years?.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-[#404040] mb-2">
            Plaka
          </label>
          <input
            type="text"
            value={aracBilgileri.plaka}
            onChange={(e) => setAracBilgileri({ ...aracBilgileri, plaka: e.target.value })}
            placeholder="Plaka"
            maxLength={8}
            className="w-full px-4 py-3 bg-[#141414] border border-[#404040] rounded-lg text-white placeholder-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#404040] mb-2">
          Araç Durumu
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {pricingData?.statuses?.map((status) => (
            <button
              key={status.id}
              type="button"
              onClick={() => setAracBilgileri({ ...aracBilgileri, durum: status.id })}
              className={`p-2 rounded-lg border transition-colors text-sm font-medium ${
                aracBilgileri.durum === status.id
                  ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500'
                  : 'bg-[#141414] border-[#404040] text-[#404040] hover:bg-[#202020] hover:text-white'
              }`}
            >
              {status.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (loadError) {
    return <div className="p-8 text-white">Harita yüklenemedi.</div>
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141414]/90 backdrop-blur-sm">
      <div className="relative bg-[#202020] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#404040] hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            {step === 1 ? 'Özel Çekici Talebi' : step === 2 ? 'Fiyat Teklifi' : step === 3 ? 'Sipariş Onayı' : 'Sipariş Tamamlandı'}
          </h2>

          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {/* Alınacak Konum */}
                <div>
                  <label className="block text-sm font-medium text-[#404040] mb-2">
                    Alınacak Konum
                  </label>
                  <div className="relative">
                    {isLoaded && (
                      <div className="w-full">
                        <input
                          type="text"
                          value={pickupSearchValue}
                          onChange={e => setPickupSearchValue(e.target.value)}
                          placeholder="Adres girin veya haritadan seçin"
                          className="w-full pr-16 px-4 py-3 bg-[#141414] border border-[#404040] rounded-lg text-white placeholder-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          onClick={() => setActiveLocation('pickup')}
                        />
                        <gmp-place-autocomplete
                          onPlaceChanged={handlePlaceChanged}
                          placeholder="Adres girin veya haritadan seçin"
                          style={{ display: 'none' }}
                        />
                      </div>
                    )}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2 bg-[#141414] z-10">
                      <button
                        type="button"
                        onClick={() => handleCurrentLocation('pickup')}
                        className="text-[#404040] hover:text-white transition-colors"
                        title="Mevcut Konumu Kullan"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveLocation('pickup');
                          setActiveMapPanel(activeMapPanel === 'pickup' ? null : 'pickup');
                        }}
                        className={`text-[#404040] hover:text-yellow-500 transition-colors ${activeMapPanel === 'pickup' ? 'text-yellow-500' : ''}`}
                        title="Haritadan Seç"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h2.28a2 2 0 011.7.95l.94 1.57a2 2 0 001.7.95h5.34a2 2 0 011.7-.95l.94-1.57A2 2 0 0116.72 3H19a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Teslim Edilecek Konum */}
                <div>
                  <label className="block text-sm font-medium text-[#404040] mb-2">
                    Teslim Edilecek Konum
                  </label>
                  <div className="relative">
                    {isLoaded && (
                      <div className="w-full">
                        <input
                          type="text"
                          value={deliverySearchValue}
                          onChange={e => setDeliverySearchValue(e.target.value)}
                          placeholder="Adres girin veya haritadan seçin"
                          className="w-full pr-16 px-4 py-3 bg-[#141414] border border-[#404040] rounded-lg text-white placeholder-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          onClick={() => setActiveLocation('delivery')}
                        />
                        <gmp-place-autocomplete
                          onPlaceChanged={handlePlaceChanged}
                          placeholder="Adres girin veya haritadan seçin"
                          style={{ display: 'none' }}
                        />
                      </div>
                    )}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2 bg-[#141414] z-10">
                      <button
                        type="button"
                        onClick={() => handleCurrentLocation('delivery')}
                        className="text-[#404040] hover:text-white transition-colors"
                        title="Mevcut Konumu Kullan"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveLocation('delivery');
                          setActiveMapPanel(activeMapPanel === 'delivery' ? null : 'delivery');
                        }}
                        className={`text-[#404040] hover:text-yellow-500 transition-colors ${activeMapPanel === 'delivery' ? 'text-yellow-500' : ''}`}
                        title="Haritadan Seç"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h2.28a2 2 0 011.7.95l.94 1.57a2 2 0 001.7.95h5.34a2 2 0 011.7-.95l.94-1.57A2 2 0 0116.72 3H19a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {isLoaded && activeMapPanel === activeLocation && (
                  <div style={mapStyles} className="relative mt-2">
                    <GoogleMap
                      mapContainerStyle={mapStyles}
                      center={
                        pickupLocation && deliveryLocation
                          ? {
                              lat: (pickupLocation.lat + deliveryLocation.lat) / 2,
                              lng: (pickupLocation.lng + deliveryLocation.lng) / 2
                            }
                          : { lat: 41.0082, lng: 28.9784 }
                      }
                      zoom={13}
                      options={mapOptions}
                      onClick={handleMapClick}
                      onLoad={map => (mapRef.current = map)}
                    >
                      {pickupLocation && <Marker position={pickupLocation} clickable={false} />}
                      {deliveryLocation && <Marker position={deliveryLocation} clickable={false} />}
                      {directions && (
                        <DirectionsRenderer
                          directions={directions}
                          options={{
                            suppressMarkers: true,
                            polylineOptions: {
                              strokeColor: '#EAB308',
                              strokeWeight: 5,
                              strokeOpacity: 0.8
                            }
                          }}
                        />
                      )}
                    </GoogleMap>
                  </div>
                )}

                <div>
                  {loading ? (
                    <div className="text-[#404040]">Yükleniyor...</div>
                  ) : error ? (
                    <div className="text-red-500">{error}</div>
                  ) : (
                    renderAracBilgileri()
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={!pickupLocation || !deliveryLocation || !aracBilgileri.marka || !aracBilgileri.model || !aracBilgileri.yil || !aracBilgileri.plaka || !aracBilgileri.tip}
                className="w-full py-3 px-6 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Devam Et
              </button>
            </form>
          ) : step === 2 ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Fiyat Teklifi */}
                <div className="bg-[#141414] rounded-lg p-4 border border-[#404040]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">Fiyat Teklifi</h3>
                    <div className="text-3xl font-bold text-yellow-500">
                      {price?.toLocaleString('tr-TR')} TL
                    </div>
                  </div>
                  <div className="block text-sm">
                    <div className="bg-[#202020] rounded-lg p-2 mb-3">
                      <div className="text-[#404040]">Araç</div>
                      <div className="text-white font-medium truncate" title={`${aracBilgileri.marka} ${aracBilgileri.model} (${aracBilgileri.yil})`}>
                        {aracBilgileri.marka} {aracBilgileri.model} ({aracBilgileri.yil})
                      </div>
                    </div>
                    <div className="bg-[#202020] rounded-lg p-2 mb-3">
                      <div className="text-[#404040]">Plaka</div>
                      <div className="text-white font-medium">{aracBilgileri.plaka}</div>
                    </div>
                    <div className="bg-[#202020] rounded-lg p-2 mb-3">
                      <div className="text-[#404040]">Alınacak Konum</div>
                      <div className="text-white font-medium text-xs" title={pickupLocation?.address}>
                        {pickupLocation?.address}
                      </div>
                    </div>
                    <div className="bg-[#202020] rounded-lg p-2 text-center">
                      <div className="text-[#404040] text-xs">Teslim Edilecek Konum</div>
                      <div className="text-white font-medium text-xs" title={deliveryLocation?.address}>
                        {deliveryLocation?.address}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rota ve Harita */}
                <div className="bg-[#141414] rounded-lg border border-[#404040] overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-white">Rota Bilgileri</h3>
                      <button
                        type="button"
                        onClick={() => setActiveMapPanel(activeMapPanel === 'route' ? null : 'route')}
                        className="text-yellow-500 hover:text-yellow-400 transition-colors text-sm flex items-center gap-1 bg-[#202020] px-3 py-1.5 rounded-lg"
                      >
                        {activeMapPanel === 'route' ? 'Haritayı Kapat' : 'Haritayı Göster'}
                      </button>
                    </div>
                    {routeInfo && (
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-[#202020] rounded-lg p-2 text-center">
                          <div className="text-[#404040] text-xs">Mesafe</div>
                          <div className="text-white font-medium text-sm">{routeInfo.distance.toFixed(1)} km</div>
                        </div>
                        <div className="bg-[#202020] rounded-lg p-2 text-center">
                          <div className="text-[#404040] text-xs">Süre</div>
                          <div className="text-white font-medium text-sm">{Math.round(routeInfo.duration)} dk</div>
                        </div>
                      </div>
                    )}
                  </div>
                  {activeMapPanel === 'route' && isLoaded && (
                    <div style={{ height: '200px' }}>
                      <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={pickupLocation || { lat: 41.0082, lng: 28.9784 }}
                        zoom={13}
                        options={mapOptions}
                      >
                        {pickupLocation && <Marker position={pickupLocation} clickable={false} />}
                        {deliveryLocation && <Marker position={deliveryLocation} clickable={false} />}
                        {directions && (
                          <DirectionsRenderer
                            directions={directions}
                            options={{
                              suppressMarkers: true,
                              polylineOptions: {
                                strokeColor: '#EAB308',
                                strokeWeight: 5,
                                strokeOpacity: 0.8
                              }
                            }}
                          />
                        )}
                      </GoogleMap>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-2.5 px-4 bg-[#141414] text-[#404040] font-medium rounded-lg hover:bg-[#202020] hover:text-white transition-colors"
                >
                  Geri
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  İlerle
                </button>
              </div>
            </form>
          ) : step === 3 ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-[#141414] rounded-lg p-4 border border-[#404040] mb-4">
                <h3 className="text-lg font-semibold text-white mb-4">Müşteri Tipi</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMusteriBilgileri({ ...musteriBilgileri, musteriTipi: 'kisisel' })}
                    className={`p-3 rounded-lg border transition-colors ${
                      musteriBilgileri.musteriTipi === 'kisisel'
                        ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500'
                        : 'bg-[#202020] border-[#404040] text-[#404040] hover:bg-[#202020] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Kişisel</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMusteriBilgileri({ ...musteriBilgileri, musteriTipi: 'kurumsal' })}
                    className={`p-3 rounded-lg border transition-colors ${
                      musteriBilgileri.musteriTipi === 'kurumsal'
                        ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500'
                        : 'bg-[#202020] border-[#404040] text-[#404040] hover:bg-[#202020] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>Kurumsal</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {musteriBilgileri.musteriTipi === 'kurumsal' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[#404040] mb-2">
                        Firma Adı
                      </label>
                      <input
                        type="text"
                        value={musteriBilgileri.firmaAdi}
                        onChange={(e) => setMusteriBilgileri({ ...musteriBilgileri, firmaAdi: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 bg-[#141414] border border-[#404040] rounded-lg text-white placeholder-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        placeholder="Firma Adı"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#404040] mb-2">
                        Vergi Numarası
                      </label>
                      <input
                        type="text"
                        value={musteriBilgileri.vergiNo}
                        onChange={(e) => setMusteriBilgileri({ ...musteriBilgileri, vergiNo: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 bg-[#141414] border border-[#404040] rounded-lg text-white placeholder-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        placeholder="Vergi Numarası"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#404040] mb-2">
                        Vergi Dairesi
                      </label>
                      <input
                        type="text"
                        value={musteriBilgileri.vergiDairesi}
                        onChange={(e) => setMusteriBilgileri({ ...musteriBilgileri, vergiDairesi: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 bg-[#141414] border border-[#404040] rounded-lg text-white placeholder-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        placeholder="Vergi Dairesi"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[#404040] mb-2">
                        Ad
                      </label>
                      <input
                        type="text"
                        value={musteriBilgileri.ad}
                        onChange={(e) => setMusteriBilgileri({ ...musteriBilgileri, ad: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 bg-[#141414] border border-[#404040] rounded-lg text-white placeholder-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        placeholder="Adınız"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#404040] mb-2">
                        Soyad
                      </label>
                      <input
                        type="text"
                        value={musteriBilgileri.soyad}
                        onChange={(e) => setMusteriBilgileri({ ...musteriBilgileri, soyad: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 bg-[#141414] border border-[#404040] rounded-lg text-white placeholder-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        placeholder="Soyadınız"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <div className="bg-[#141414] rounded-lg p-4 border border-[#404040]">
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-medium text-[#404040]">
                            Kimlik Bilgileri
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="tcVatandasi"
                              checked={musteriBilgileri.tcVatandasi}
                              onChange={(e) => {
                                const newTcVatandasi = e.target.checked;
                                setMusteriBilgileri({
                                  ...musteriBilgileri,
                                  tcVatandasi: newTcVatandasi,
                                  tcKimlik: newTcVatandasi ? '' : '11111111111'
                                });
                              }}
                              className="w-4 h-4 rounded border-[#404040] bg-[#141414] text-yellow-500 focus:ring-yellow-500 focus:ring-offset-[#141414]"
                            />
                            <label htmlFor="tcVatandasi" className="text-sm text-[#404040]">
                              TC Vatandaşıyım
                            </label>
                          </div>
                        </div>
                        {musteriBilgileri.tcVatandasi ? (
                          <input
                            type="text"
                            value={musteriBilgileri.tcKimlik}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
                              setMusteriBilgileri({ ...musteriBilgileri, tcKimlik: value });
                            }}
                            required
                            maxLength={11}
                            className="w-full px-4 py-2.5 bg-[#202020] border border-[#404040] rounded-lg text-white placeholder-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            placeholder="TC Kimlik No"
                          />
                        ) : (
                          <div className="w-full px-4 py-2.5 bg-[#202020] border border-[#404040] rounded-lg text-[#404040]">
                            Yabancı Uyruklu
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-[#404040] mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={musteriBilgileri.telefon}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
                      setMusteriBilgileri({ ...musteriBilgileri, telefon: value });
                    }}
                    required
                    maxLength={11}
                    className="w-full px-4 py-2.5 bg-[#141414] border border-[#404040] rounded-lg text-white placeholder-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="05XX XXX XX XX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#404040] mb-2">
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={musteriBilgileri.email}
                    onChange={(e) => setMusteriBilgileri({ ...musteriBilgileri, email: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 bg-[#141414] border border-[#404040] rounded-lg text-white placeholder-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="ornek@email.com"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 py-2.5 px-4 bg-[#141414] text-[#404040] font-medium rounded-lg hover:bg-[#202020] hover:text-white transition-colors"
                >
                  Geri
                </button>
                <button
                  type="submit"
                  disabled={
                    musteriBilgileri.musteriTipi === 'kisisel'
                      ? (!musteriBilgileri.ad || !musteriBilgileri.soyad || !musteriBilgileri.telefon || !musteriBilgileri.email || (musteriBilgileri.tcVatandasi && !musteriBilgileri.tcKimlik))
                      : (!musteriBilgileri.firmaAdi || !musteriBilgileri.vergiNo || !musteriBilgileri.vergiDairesi || !musteriBilgileri.telefon || !musteriBilgileri.email)
                  }
                  className="flex-1 py-2.5 px-4 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  İlerle
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Siparişiniz Alındı!</h3>
                <p className="text-[#404040] mb-4">
                  Siparişiniz başarıyla oluşturuldu. Aşağıdaki bilgileri kullanarak ödemenizi yapabilirsiniz.
                </p>
                <div className="bg-[#141414] rounded-lg p-4 mb-4">
                  <div className="text-[#404040] text-sm mb-1">PNR Numaranız</div>
                  <div className="text-2xl font-bold text-yellow-500">{pnrNumber}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Ödeme Bilgileri */}
                <div className="bg-[#141414] rounded-lg p-4 border border-[#404040]">
                  <h3 className="text-lg font-semibold text-white mb-4">Ödeme Bilgileri</h3>
                  <div className="space-y-3">
                    <div className="bg-[#202020] rounded-lg p-3">
                      <div className="text-[#404040] text-sm mb-1">Banka</div>
                      <div className="text-white font-medium">Garanti Bankası</div>
                    </div>
                    <div className="bg-[#202020] rounded-lg p-3">
                      <div className="text-[#404040] text-sm mb-1">IBAN</div>
                      <div className="text-white font-medium">TR12 3456 7890 1234 5678 9012 34</div>
                    </div>
                    <div className="bg-[#202020] rounded-lg p-3">
                      <div className="text-[#404040] text-sm mb-1">Tutar</div>
                      <div className="text-2xl font-bold text-yellow-500">{price?.toLocaleString('tr-TR')} TL</div>
                    </div>
                    <div className="bg-[#202020] rounded-lg p-3">
                      <div className="text-[#404040] text-sm mb-1">Açıklama</div>
                      <div className="text-white font-medium">PNR: {pnrNumber}</div>
                    </div>
                  </div>
                </div>

                {/* Sipariş Detayları */}
                <div className="bg-[#141414] rounded-lg p-4 border border-[#404040]">
                  <h3 className="text-lg font-semibold text-white mb-4">Sipariş Detayları</h3>
                  <div className="space-y-3">
                    <div className="bg-[#202020] rounded-lg p-3">
                      <div className="text-[#404040] text-sm mb-1">Araç Bilgileri</div>
                      <div className="text-white font-medium">
                        {aracBilgileri.marka} {aracBilgileri.model} ({aracBilgileri.yil})
                      </div>
                      <div className="text-white font-medium">{aracBilgileri.plaka}</div>
                    </div>
                    <div className="bg-[#202020] rounded-lg p-3">
                      <div className="text-[#404040] text-sm mb-1">Alınacak Konum</div>
                      <div className="text-white font-medium text-sm" title={pickupLocation?.address}>
                        {pickupLocation?.address}
                      </div>
                    </div>
                    <div className="bg-[#202020] rounded-lg p-3">
                      <div className="text-[#404040] text-sm mb-1">Teslim Edilecek Konum</div>
                      <div className="text-white font-medium text-sm" title={deliveryLocation?.address}>
                        {deliveryLocation?.address}
                      </div>
                    </div>
                    <div className="bg-[#202020] rounded-lg p-3">
                      <div className="text-[#404040] text-sm mb-1">İletişim</div>
                      <div className="text-white font-medium">{musteriBilgileri.telefon}</div>
                      <div className="text-white font-medium">{musteriBilgileri.email}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#141414] rounded-lg p-4 border border-[#404040]">
                <h3 className="text-lg font-semibold text-white mb-4">Önemli Bilgiler</h3>
                <ul className="space-y-2 text-[#404040]">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-yellow-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Ödemenizi yaptıktan sonra size SMS ve e-posta ile bilgilendirme yapılacaktır.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-yellow-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>PNR numaranızı kullanarak siparişinizin durumunu web sitemizden takip edebilirsiniz.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-yellow-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Herhangi bir sorunuz olursa 7/24 müşteri hizmetlerimizi arayabilirsiniz.</span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  href="/pnr-sorgula"
                  className="px-6 py-3 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  Tamam
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
