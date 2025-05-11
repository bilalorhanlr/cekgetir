'use client'

import { useState, useEffect, useCallback } from 'react'
import { GoogleMap, Marker, useLoadScript, DirectionsRenderer } from '@react-google-maps/api'
import React from 'react'
import api from '@/utils/axios'

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

export default function TopluCekiciModal({ onClose }) {
  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState(null)
  const [fiyatlandirma, setFiyatlandirma] = useState(null)
  const [toplamFiyat, setToplamFiyat] = useState(null)
  const [pnrNumber, setPnrNumber] = useState(null)
  const [pickupLocation, setPickupLocation] = useState(null)
  const [deliveryLocation, setDeliveryLocation] = useState(null)
  const [selectedPickupCity, setSelectedPickupCity] = useState(null)
  const [selectedDeliveryCity, setSelectedDeliveryCity] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const [pickupOtopark, setPickupOtopark] = useState(null)
  const [deliveryOtopark, setDeliveryOtopark] = useState(null)
  const [araclar, setAraclar] = useState([])
  const [musteriBilgileri, setMusteriBilgileri] = useState({})
  const [vehicleData, setVehicleData] = useState({
    aracMarkalari: [],
    aracModelleri: {},
    yillar: [],
    segmentler: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedSegment, setSelectedSegment] = useState('')
  const [modelOptions, setModelOptions] = useState([])

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: variablesData } = await api.get('/api/variables/toplu-cekici/all');
        setFiyatlandirma(variablesData.topluCekici);

        const vehicleResponse = await api.get('/data/arac-info.json');
        setVehicleData(vehicleResponse.data);
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      }
    };
    fetchData();
  }, []);

  // Konumlar değiştiğinde fiyat hesapla
  useEffect(() => {
    if (pickupLocation && deliveryLocation) {
      fiyatHesapla();
    }
  }, [pickupLocation, deliveryLocation, fiyatHesapla]);

  // Araç listesi değiştiğinde fiyat hesapla
  useEffect(() => {
    if (araclar.length > 0) {
      fiyatHesapla();
    }
  }, [araclar, fiyatHesapla]);

  // Rota bilgisi güncellendiğinde fiyat hesapla
  useEffect(() => {
    if (routeInfo) {
      fiyatHesapla();
    }
  }, [routeInfo, fiyatHesapla]);

  // Fiyat hesaplama fonksiyonu
  const fiyatHesapla = useCallback(async () => {
    // Gerekli kontroller
    if (!pickupLocation || !deliveryLocation || !araclar?.length) {
        setToplamFiyat(0);
        return;
    }

    // Fiyat hesaplama bileşenleri
    const basePrice = fiyatlandirma?.basePrice || 0;  // Temel fiyat
    const distanceMultiplier = routeInfo?.distance ? routeInfo.distance * (fiyatlandirma?.distanceMultiplier || 0) : 0;  // Mesafe çarpanı
    const vehicleCountMultiplier = araclar.length * (fiyatlandirma?.vehicleCountMultiplier || 1);  // Araç sayısı çarpanı
    
    // Araç durumlarına göre ek fiyatlar
    const vehicleStatusMultiplier = araclar.reduce((total, arac) => {
      const statusMultiplier = fiyatlandirma?.vehicleStatusMultipliers?.[arac.durum] || 1;
      return total + statusMultiplier;
    }, 0) / araclar.length; // Ortalama durum çarpanı
    
    // Toplam fiyat hesaplama
    const totalPrice = (basePrice + distanceMultiplier) * vehicleCountMultiplier * vehicleStatusMultiplier;
    setToplamFiyat(totalPrice);
  }, [pickupLocation, deliveryLocation, araclar, routeInfo, fiyatlandirma]);

  // Sipariş oluşturma fonksiyonu
  const createOrder = async () => {
    try {
      const { data } = await api.post('/api/orders', {
        pickupCity: selectedPickupCity,
        deliveryCity: selectedDeliveryCity,
        vehicles: araclar,
        price: toplamFiyat,
        customerInfo: musteriBilgileri,
        pickupLocation,
        deliveryLocation,
        routeInfo,
        pickupOtopark,
        deliveryOtopark
      });

      setPnrNumber(data.pnr);
      setStep(5);

      // PNR'ı localStorage'a kaydet
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastPnr', data.pnr);
      }
    } catch (error) {
      console.error('Sipariş oluşturma hatası:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      if (!selectedService) {
        alert('Lütfen bir hizmet seçin');
        return;
      }

      if (selectedService === 'ozel') {
        setStep(2);
        return;
      } else if (selectedService === 'toplu') {
        setStep(2);
        return;
      }
    } else if (step === 2) {
      if (araclar.length === 0 || araclar.some(arac => !arac.marka || !arac.model || !arac.segment)) {
        alert('Lütfen en az bir araç seçin');
        return;
      }

      setStep(3);
    } else if (step === 3) {
      if (!toplamFiyat) {
        alert('Lütfen fiyat hesaplamasını bekleyin');
        return;
      }

      setStep(4);
    } else if (step === 4) {
      if (musteriBilgileri.musteriTipi === 'kisisel') {
        if (!musteriBilgileri.ad || !musteriBilgileri.soyad || !musteriBilgileri.telefon || !musteriBilgileri.email) {
          alert('Lütfen tüm zorunlu alanları doldurun');
          return;
        }
        if (musteriBilgileri.tcVatandasi && !musteriBilgileri.tcKimlik) {
          alert('Lütfen TC Kimlik numaranızı girin');
          return;
        }
      } else {
        if (!musteriBilgileri.firmaAdi || !musteriBilgileri.vergiNo || !musteriBilgileri.vergiDairesi || !musteriBilgileri.telefon || !musteriBilgileri.email) {
          alert('Lütfen tüm zorunlu alanları doldurun');
          return;
        }
      }

      await createOrder();
    }
  };

  useEffect(() => {
    if (pickupOtopark && selectedPickupCity) {
      const sehir = sehirler.find(s => s.id === selectedPickupCity)
      if (sehir) {
        setPickupSearchValue(sehir.adres)
        setPickupLocation({
          lat: sehir.lat,
          lng: sehir.lng,
          address: sehir.adres
        })
      }
    }
  }, [pickupOtopark, selectedPickupCity, sehirler])

  useEffect(() => {
    if (deliveryOtopark && selectedDeliveryCity) {
      const sehir = sehirler.find(s => s.id === selectedDeliveryCity)
      if (sehir) {
        setDeliverySearchValue(sehir.adres)
        setDeliveryLocation({
          lat: sehir.lat,
          lng: sehir.lng,
          address: sehir.adres
        })
      }
    }
  }, [deliveryOtopark, selectedDeliveryCity, sehirler])

  if (loadError) {
    console.error('Google Maps yüklenirken hata oluştu:', loadError)
    return null
  }

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141414]/90 backdrop-blur-sm">
        <div className="relative bg-[#202020] rounded-2xl shadow-2xl max-w-2xl w-full p-6">
          <div className="text-white text-center">Yükleniyor...</div>
        </div>
      </div>
    )
  }

  const getAddressFromLatLng = async (lat, lng) => {
    if (!window.google) return ''
    const geocoder = new window.google.maps.Geocoder()
    return new Promise((resolve) => {
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve(results[0].formatted_address)
        } else {
          resolve('')
        }
      })
    })
  }

  const handlePlaceChanged = async (e) => {
    const place = e.detail.place
    if (place && place.geometry) {
      const newLocation = {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        address: place.formatted_address
      }

      // Şehir tespiti yap
      const detectedCity = await sehirTespiti(newLocation)
      console.log('📍 Tespit edilen şehir:', detectedCity)

      if (activeLocation === 'pickup') {
        setPickupLocation(newLocation)
        setPickupSearchValue(place.formatted_address)
        if (detectedCity) {
          setSelectedPickupCity(detectedCity)
        }
      } else {
        setDeliveryLocation(newLocation)
        setDeliverySearchValue(place.formatted_address)
        if (detectedCity) {
          setSelectedDeliveryCity(detectedCity)
        }
      }
      setActiveMapPanel(null)
    }
  }

  const handleMapClick = async (e) => {
    const lat = e.latLng.lat()
    const lng = e.latLng.lng()
    const address = await getAddressFromLatLng(lat, lng)
    const newLocation = { lat, lng, address }

    // Şehir tespiti yap
    const detectedCity = await sehirTespiti(newLocation)
    console.log('📍 Tespit edilen şehir:', detectedCity)

    if (activeLocation === 'pickup') {
      setPickupLocation(newLocation)
      setPickupSearchValue(address)
      if (detectedCity) {
        setSelectedPickupCity(detectedCity)
      }
    } else {
      setDeliveryLocation(newLocation)
      setDeliverySearchValue(address)
      if (detectedCity) {
        setSelectedDeliveryCity(detectedCity)
      }
    }
    setActiveMapPanel(null)
  }

  const handleCurrentLocation = async (target) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          const address = await getAddressFromLatLng(latitude, longitude)
          const newLocation = { lat: latitude, lng: longitude, address }

          // Şehir tespiti yap
          const detectedCity = await sehirTespiti(newLocation)
          console.log('📍 Tespit edilen şehir:', detectedCity)

          if (target === 'pickup') {
            setPickupLocation(newLocation)
            setPickupSearchValue(address)
            if (detectedCity) {
              setSelectedPickupCity(detectedCity)
            }
          } else {
            setDeliveryLocation(newLocation)
            setDeliverySearchValue(address)
            if (detectedCity) {
              setSelectedDeliveryCity(detectedCity)
            }
          }
          setActiveMapPanel(null)
        },
        (error) => {
          console.error('Geolocation error:', error)
        }
      )
    }
  }

  const handleClose = () => {
    if (pnrNumber) {
      // PNR'ı localStorage'a kaydet
      localStorage.setItem('lastPnr', pnrNumber);
      
      // Sipariş bilgilerini kaydet
      const orderInfo = {
        pnr: pnrNumber,
        pickupCity: selectedPickupCity,
        deliveryCity: selectedDeliveryCity,
        vehicles: araclar,
        price: toplamFiyat,
        customerInfo: musteriBilgileri,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(`order_${pnrNumber}`, JSON.stringify(orderInfo));
      
      // PNR sorgulama sayfasına yönlendir
      window.location.href = `/pnr-sorgula?pnr=${pnrNumber}`;
    }
    onClose();
  };

  const aracEkle = () => {
    setAraclar([...araclar, {
      marka: '',
      model: '',
      yil: '',
      plaka: '',
      segment: '',
      durum: ''
    }])
  }

  const aracSil = (id) => {
    setAraclar(araclar.filter(arac => arac.id !== id))
  }

  const aracGuncelle = (index, field, value) => {
    const yeniAraclar = [...araclar]
    yeniAraclar[index] = { ...yeniAraclar[index], [field]: value }
    setAraclar(yeniAraclar)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141414]/70 backdrop-blur-sm">
      <div className="relative bg-[#202020]/95 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[#404040] hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            {step === 1 ? 'Konum Seçimi' : 
             step === 2 ? 'Araç Bilgileri' : 
             step === 3 ? 'Fiyat ve Rota' : 
             step === 4 ? 'Müşteri Bilgileri' :
             'Sipariş Tamamlandı'}
          </h2>

          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-[#141414] rounded-lg p-4 border border-[#404040]">
                <h3 className="text-lg font-semibold text-white mb-4">Alınacak Konum</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="pickupOtopark"
                      checked={pickupOtopark}
                      onChange={(e) => setPickupOtopark(e.target.checked)}
                      className="w-4 h-4 text-yellow-500 bg-[#202020] border-[#404040] rounded focus:ring-yellow-500 focus:ring-2"
                    />
                    <label htmlFor="pickupOtopark" className="text-white">
                      Otoparktan Alınacak
                    </label>
                  </div>

                  {pickupOtopark ? (
                    <select
                      value={selectedPickupCity}
                      onChange={(e) => {
                        const selectedId = e.target.value
                        console.log('📍 Alınacak şehir seçildi:', {
                          id: selectedId,
                          sehir: sehirler.find(s => s.id === selectedId)?.title
                        })
                        setSelectedPickupCity(selectedId)
                      }}
                      className="w-full py-2.5 px-4 bg-[#202020] text-white rounded-lg border border-[#404040] focus:outline-none focus:border-yellow-500"
                    >
                      <option key="pickup-default" value="">Şehir Seçin</option>
                      {sehirler.map((sehir) => (
                        <option key={`pickup-${sehir.id}`} value={sehir.id}>
                          {sehir.title}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          type="text"
                          value={pickupSearchValue}
                          onChange={(e) => setPickupSearchValue(e.target.value)}
                          placeholder="Adres veya konum ara..."
                          className="w-full py-2.5 px-4 bg-[#202020] text-white rounded-lg border border-[#404040] focus:outline-none focus:border-yellow-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleCurrentLocation('pickup')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#404040] hover:text-white transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                      </div>
                      <div style={mapStyles} className="relative">
                        <GoogleMap
                          mapContainerStyle={mapStyles}
                          center={pickupLocation || { lat: 41.0082, lng: 28.9784 }}
                          zoom={13}
                          options={mapOptions}
                          onClick={handleMapClick}
                        >
                          {pickupLocation && <Marker position={pickupLocation} />}
                        </GoogleMap>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-[#141414] rounded-lg p-4 border border-[#404040]">
                <h3 className="text-lg font-semibold text-white mb-4">Teslim Edilecek Konum</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="deliveryOtopark"
                      checked={deliveryOtopark}
                      onChange={(e) => setDeliveryOtopark(e.target.checked)}
                      className="w-4 h-4 text-yellow-500 bg-[#202020] border-[#404040] rounded focus:ring-yellow-500 focus:ring-2"
                    />
                    <label htmlFor="deliveryOtopark" className="text-white">
                      Otoparka Teslim Edilecek
                    </label>
                  </div>

                  {deliveryOtopark ? (
                    <select
                      value={selectedDeliveryCity}
                      onChange={(e) => {
                        const selectedId = e.target.value
                        console.log('📍 Teslim edilecek şehir seçildi:', {
                          id: selectedId,
                          sehir: sehirler.find(s => s.id === selectedId)?.title
                        })
                        setSelectedDeliveryCity(selectedId)
                      }}
                      className="w-full py-2.5 px-4 bg-[#202020] text-white rounded-lg border border-[#404040] focus:outline-none focus:border-yellow-500"
                    >
                      <option key="delivery-default" value="">Şehir Seçin</option>
                      {sehirler.map((sehir) => (
                        <option key={`delivery-${sehir.id}`} value={sehir.id}>
                          {sehir.title}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          type="text"
                          value={deliverySearchValue}
                          onChange={(e) => setDeliverySearchValue(e.target.value)}
                          placeholder="Adres veya konum ara..."
                          className="w-full py-2.5 px-4 bg-[#202020] text-white rounded-lg border border-[#404040] focus:outline-none focus:border-yellow-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleCurrentLocation('delivery')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#404040] hover:text-white transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                      </div>
                      <div style={mapStyles} className="relative">
                        <GoogleMap
                          mapContainerStyle={mapStyles}
                          center={deliveryLocation || { lat: 41.0082, lng: 28.9784 }}
                          zoom={13}
                          options={mapOptions}
                          onClick={handleMapClick}
                        >
                          {deliveryLocation && <Marker position={deliveryLocation} />}
                        </GoogleMap>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={!pickupLocation || !deliveryLocation || (pickupOtopark && !selectedPickupCity) || (deliveryOtopark && !selectedDeliveryCity)}
                className="w-full py-2.5 px-4 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Devam Et
              </button>
            </form>
          ) : step === 2 ? (
            <div className="space-y-6">
              <div className="bg-[#141414] rounded-lg p-4 border border-[#404040]">
                <h3 className="text-lg font-semibold text-white mb-4">Araç Bilgileri</h3>
                <div className="space-y-4">
                  {araclar.map((arac, index) => (
                    <div key={`arac-${arac.id}`} className="bg-[#202020] rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-white font-medium">Araç {index + 1}</h4>
                        {araclar.length > 1 && (
                          <button
                            key={`delete-${arac.id}`}
                            type="button"
                            onClick={() => aracSil(arac.id)}
                            className="text-[#404040] hover:text-white transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[#404040] text-sm mb-1">Marka</label>
                          <select
                            value={arac.marka}
                            onChange={(e) => aracGuncelle(index, 'marka', e.target.value)}
                            className="w-full py-2 px-3 bg-[#141414] text-white rounded-lg border border-[#404040] focus:outline-none focus:border-yellow-500"
                          >
                            <option key={`marka-default-${arac.id}`} value="">Seçin</option>
                            {vehicleData?.aracMarkalari.map((marka, index) => (
                              <option key={`marka-${arac.id}-${marka || index}`} value={marka || ''}>
                                {marka || 'Bilinmeyen Marka'}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[#404040] text-sm mb-1">Model</label>
                          <select
                            value={arac.model}
                            onChange={(e) => aracGuncelle(index, 'model', e.target.value)}
                            className="w-full py-2 px-3 bg-[#141414] text-white rounded-lg border border-[#404040] focus:outline-none focus:border-yellow-500"
                            disabled={!arac.marka}
                          >
                            <option key={`model-default-${arac.id}`} value="">Seçin</option>
                            {arac.marka &&
                              vehicleData?.aracModelleri[arac.marka]?.map((model, index) => (
                                <option key={`model-${arac.id}-${model || index}`} value={model || ''}>
                                  {model || 'Bilinmeyen Model'}
                                </option>
                              ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[#404040] text-sm mb-1">Segment</label>
                          <select
                            value={arac.segment}
                            onChange={(e) => aracGuncelle(index, 'segment', e.target.value)}
                            className="w-full py-2 px-3 bg-[#141414] text-white rounded-lg border border-[#404040] focus:outline-none focus:border-yellow-500"
                          >
                            <option key={`segment-default-${arac.id}`} value="">Seçin</option>
                            {vehicleData?.segmentler.map((segment, index) => (
                              <option key={`segment-${arac.id}-${segment?.id || index}`} value={segment?.id || ''}>
                                {segment?.title || 'Bilinmeyen Segment'}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[#404040] text-sm mb-1">Yıl</label>
                          <select
                            value={arac.yil}
                            onChange={(e) => aracGuncelle(index, 'yil', e.target.value)}
                            className="w-full py-2 px-3 bg-[#141414] text-white rounded-lg border border-[#404040] focus:outline-none focus:border-yellow-500"
                          >
                            <option key={`yil-default-${arac.id}`} value="">Seçin</option>
                            {vehicleData?.yillar.map((yil, index) => (
                              <option key={`yil-${arac.id}-${yil || index}`} value={yil || ''}>
                                {yil || 'Bilinmeyen Yıl'}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[#404040] text-sm mb-1">Plaka</label>
                          <input
                            type="text"
                            value={arac.plaka}
                            onChange={(e) => aracGuncelle(index, 'plaka', e.target.value.toUpperCase())}
                            placeholder="Plaka"
                            maxLength={8}
                            className="w-full px-4 py-3 bg-[#141414] border border-[#404040] rounded-lg text-white placeholder-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-[#404040] text-sm mb-1">Durum</label>
                          <select
                            value={arac.durum}
                            onChange={(e) => aracGuncelle(index, 'durum', e.target.value)}
                            className="w-full px-4 py-3 bg-[#141414] border border-[#404040] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          >
                            <option value="">Araç Durumu Seçin</option>
                            <option value="calisiyor">Çalışıyor</option>
                            <option value="kazali">Kazalı</option>
                            <option value="vites_p">Vites P'de Kaldı</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}

                  {araclar.length < 10 && (
                    <button
                      type="button"
                      onClick={aracEkle}
                      className="w-full py-3 px-4 bg-[#141414] text-[#404040] font-medium rounded-lg hover:bg-[#202020] hover:text-white transition-colors border border-[#404040]"
                    >
                      + Araç Ekle
                    </button>
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
                  type="button"
                  onClick={handleSubmit}
                  disabled={araclar.length === 0 || araclar.some(arac => !arac.marka || !arac.model || !arac.segment)}
                  className="flex-1 py-2.5 px-4 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Devam Et
                </button>
              </div>
            </div>
          ) : step === 3 ? (
            <div className="space-y-6">
              <div className="bg-[#141414] rounded-lg p-4 border border-[#404040]">
                <h3 className="text-lg font-semibold text-white mb-4">Rota Bilgileri</h3>
                <div className="space-y-4">
                  <div className="bg-[#202020] rounded-lg p-3">
                    <div className="text-[#404040] text-sm mb-1">Alınacak Konum</div>
                    <div className="text-white font-medium text-sm" title={pickupSearchValue}>
                      {pickupSearchValue}
                    </div>
                  </div>
                  <div className="bg-[#202020] rounded-lg p-3">
                    <div className="text-[#404040] text-sm mb-1">Teslim Edilecek Konum</div>
                    <div className="text-white font-medium text-sm" title={deliverySearchValue}>
                      {deliverySearchValue}
                    </div>
                  </div>
                  {routeInfo && (
                    <React.Fragment key="routeInfo">
                      <div key="distance" className="bg-[#202020] rounded-lg p-3">
                        <div className="text-[#404040] text-sm mb-1">Mesafe</div>
                        <div className="text-white font-medium">{routeInfo.distance}</div>
                      </div>
                      <div key="duration" className="bg-[#202020] rounded-lg p-3">
                        <div className="text-[#404040] text-sm mb-1">Tahmini Süre</div>
                        <div className="text-white font-medium">{routeInfo.duration}</div>
                      </div>
                    </React.Fragment>
                  )}
                </div>
              </div>

              <div className="bg-[#141414] rounded-lg p-4 border border-[#404040]">
                <h3 className="text-lg font-semibold text-white mb-4">Fiyat Teklifi</h3>
                <div className="space-y-4">
                  <div className="bg-[#202020] rounded-lg p-3">
                    <div className="text-[#404040] text-sm mb-1">Toplam Araç Sayısı</div>
                    <div className="text-white font-medium text-sm">
                      {araclar.reduce((acc, arac) => acc + arac.adet, 0)} Araç
                    </div>
                  </div>
                  <div className="bg-[#202020] rounded-lg p-3">
                    <div className="text-[#404040] text-sm mb-1">Toplam Tutar</div>
                    <div className="text-2xl font-bold text-yellow-500">
                      {toplamFiyat.toLocaleString('tr-TR')} TL
                    </div>
                  </div>
                </div>
              </div>

              {isLoaded && (
                <div key="map" style={mapStyles} className="relative mt-2">
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
                  >
                    {pickupLocation && <Marker key="pickup" position={pickupLocation} clickable={false} />}
                    {deliveryLocation && <Marker key="delivery" position={deliveryLocation} clickable={false} />}
                    {directions && (
                      <DirectionsRenderer
                        key="directions"
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

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 py-2.5 px-4 bg-[#141414] text-[#404040] font-medium rounded-lg hover:bg-[#202020] hover:text-white transition-colors"
                >
                  Geri
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 py-2.5 px-4 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  Siparişi Tamamla
                </button>
              </div>
            </div>
          ) : step === 4 ? (
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
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, '');
                          setMusteriBilgileri({ ...musteriBilgileri, ad: value });
                        }}
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
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, '');
                          setMusteriBilgileri({ ...musteriBilgileri, soyad: value });
                        }}
                        required
                        className="w-full px-4 py-2.5 bg-[#141414] border border-[#404040] rounded-lg text-white placeholder-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        placeholder="Soyadınız"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#404040] mb-2">
                        TC Kimlik No
                      </label>
                      <div className="space-y-2">
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
                        {musteriBilgileri.tcVatandasi && (
                          <input
                            type="text"
                            value={musteriBilgileri.tcKimlik}
                            onChange={(e) => setMusteriBilgileri({ ...musteriBilgileri, tcKimlik: e.target.value })}
                            required
                            maxLength={11}
                            className="w-full px-4 py-2.5 bg-[#141414] border border-[#404040] rounded-lg text-white placeholder-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            placeholder="TC Kimlik No"
                          />
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
                  onClick={() => setStep(3)}
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
              <div className="bg-[#141414] rounded-lg p-4 border border-[#404040]">
                <h3 className="text-lg font-semibold text-white mb-4">Sipariş Tamamlandı</h3>
                <div className="space-y-4">
                  <div className="bg-[#202020] rounded-lg p-3">
                    <div className="text-[#404040] text-sm mb-1">PNR Numarası</div>
                    <div className="text-2xl font-bold text-yellow-500">{pnrNumber}</div>
                  </div>
                  <div className="bg-[#202020] rounded-lg p-3">
                    <div className="text-[#404040] text-sm mb-1">Toplam Tutar</div>
                    <div className="text-2xl font-bold text-yellow-500">
                      {toplamFiyat.toLocaleString('tr-TR')} TL
                    </div>
                  </div>
                  <div className="bg-[#202020] rounded-lg p-3">
                    <div className="text-[#404040] text-sm mb-1">Ödeme Bilgileri</div>
                    <div className="space-y-2">
                      <div className="text-white">
                        <span className="font-medium">Banka:</span> Garanti Bankası
                      </div>
                      <div className="text-white">
                        <span className="font-medium">IBAN:</span> TR12 3456 7890 1234 5678 9012 34
                      </div>
                      <div className="text-white">
                        <span className="font-medium">Hesap Sahibi:</span> Çekgetir A.Ş.
                      </div>
                      <div className="text-[#404040] text-sm mt-2">
                        * Ödemenizi yaptıktan sonra dekontunuzu PNR numaranız ile birlikte info@cekgetir.com adresine göndermeniz gerekmektedir.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2.5 px-4 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors"
              >
                Kapat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 