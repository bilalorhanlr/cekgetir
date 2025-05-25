'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { GoogleMap, Marker, useLoadScript, DirectionsRenderer } from '@react-google-maps/api'
import React from 'react'
import api from '@/utils/axios'
import { toast } from 'react-hot-toast'

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

const normalizeSehirAdi = (sehir) => {
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

const sehirTespiti = async (location) => {
  if (!window.google) return null;
  const geocoder = new window.google.maps.Geocoder();
  
  try {
    const response = await new Promise((resolve, reject) => {
      geocoder.geocode({ location: { lat: location.lat, lng: location.lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve(results[0]);
        } else {
          reject(new Error('Geocoding failed'));
        }
      });
    });

    // Türkiye'deki şehirleri kontrol et
    const addressComponents = response.address_components;
    const cityComponent = addressComponents.find(component => 
      component.types.includes('administrative_area_level_1')
    );

    if (cityComponent) {
      return cityComponent.long_name;
    }

    return null;
  } catch (error) {
    console.error('Şehir tespiti hatası:', error);
    return null;
  }
};

const isValidCoordinate = (value) => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

const setLocationWithValidation = (setter, location) => {
  if (location && isValidCoordinate(location.lat) && isValidCoordinate(location.lng)) {
    setter(location);
  } else {
    console.error('Invalid coordinates:', location);
  }
};

// Debounce fonksiyonu ekle
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Koordinatları düzgün parse eden yardımcı fonksiyon
const parseCoordinate = (val) => {
  if (typeof val === 'string') {
    return Number(val.replace(',', '.'));
  }
  return Number(val);
};

// Lat/Lng geçerliliğini kontrol eden yardımcı fonksiyon
const isValidLatLng = (lat, lng) => {
  const latNum = parseCoordinate(lat);
  const lngNum = parseCoordinate(lng);
  return !isNaN(latNum) && !isNaN(lngNum);
};

// Fallback: delivery otopark koordinatı yoksa pickup otopark koordinatını kullan
const getDeliveryOtoparkLat = (sehirFiyatlandirma) =>
  sehirFiyatlandirma.deliveryOtoparkLat ?? sehirFiyatlandirma.otoparkLat;
const getDeliveryOtoparkLng = (sehirFiyatlandirma) =>
  sehirFiyatlandirma.deliveryOtoparkLng ?? sehirFiyatlandirma.otoparkLng;

export default function TopluCekiciModal({ onClose }) {
  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState('')
  const [fiyatlandirma, setFiyatlandirma] = useState({
    basePrice: 0,
    kmBasiUcret: 0,
    segmentler: {},
    durumlar: {},
    sehirler: []
  })
  const [toplamFiyat, setToplamFiyat] = useState(0)
  const [pnrNumber, setPnrNumber] = useState('')
  const [pickupLocation, setPickupLocation] = useState(null)
  const [deliveryLocation, setDeliveryLocation] = useState(null)
  const [pickupSearchValue, setPickupSearchValue] = useState('')
  const [deliverySearchValue, setDeliverySearchValue] = useState('')
  const [selectedPickupCity, setSelectedPickupCity] = useState('')
  const [selectedDeliveryCity, setSelectedDeliveryCity] = useState('')
  const [routeInfo, setRouteInfo] = useState(null)
  const [pickupOtopark, setPickupOtopark] = useState(false)
  const [deliveryOtopark, setDeliveryOtopark] = useState(false)
  const [araclar, setAraclar] = useState([])
  const [musteriBilgileri, setMusteriBilgileri] = useState({
    musteriTipi: '',
    ad: '',
    soyad: '',
    tcVatandasi: true,
    tcKimlik: '',
    firmaAdi: '',
    vergiNo: '',
    vergiDairesi: '',
    telefon: '',
    email: ''
  })
  const [vehicleData, setVehicleData] = useState({
    aracMarkalari: [],
    aracModelleri: {},
    yillar: [],
    segmentler: [],
    durumlar: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedSegment, setSelectedSegment] = useState('')
  const [modelOptions, setModelOptions] = useState([])
  const [sehirFiyatlandirma, setSehirFiyatlandirma] = useState(null)
  const [selectedCity, setSelectedCity] = useState('')
  const [otoparkInfo, setOtoparkInfo] = useState({ adres: '', lat: null, lng: null })
  const citySelectRef = useRef(null)
  const [activeLocation, setActiveLocation] = useState(null)
  const [directions, setDirections] = useState(null)
  const [activeMapPanel, setActiveMapPanel] = useState(null)
  const [isLoadingTopluCekici, setIsLoadingTopluCekici] = useState(true)
  const [sehirler, setSehirler] = useState([])
  const [kmBasedFees, setKmBasedFees] = useState([]);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/variables/toplu-cekici/all');
        
        if (!data || !data.topluCekici || !data.sehirler) {
          throw new Error('Invalid data format received from API');
        }

        setFiyatlandirma({
          ...data.topluCekici,
          sehirler: data.sehirler || []
        });
        setSehirler(data.sehirler || []);
        setLoading(false);
      } catch (error) {
        console.error('❌ Veri yükleme hatası:', error);
        setError(error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Araç segmentleri ve durumlarını API'den çek
  useEffect(() => {
    const fetchSegmentsAndStatuses = async () => {
      try {
        const [segmentsRes, statusesRes, vehicleInfoRes] = await Promise.all([
          api.get('/api/variables/car-segments?type=toplu-cekici'),
          api.get('/api/variables/car-statuses?type=toplu-cekici'),
          fetch('/data/arac-info.json').then(r => r.json())
        ]);
        setVehicleData({
          aracMarkalari: vehicleInfoRes.aracMarkalari || [],
          aracModelleri: vehicleInfoRes.aracModelleri || {},
          yillar: vehicleInfoRes.yillar || [],
          segmentler: segmentsRes.data,
          durumlar: statusesRes.data
        });
      } catch (err) {
        // Hata yönetimi
        setVehicleData({
          aracMarkalari: [],
          aracModelleri: {},
          yillar: [],
          segmentler: [],
          durumlar: []
        });
      }
    };
    fetchSegmentsAndStatuses();
  }, []);

  useEffect(() => {
    const fetchKmFiyatlar = async () => {
      try {
        const response = await api.get('/api/variables/toplu-cekici/km-fiyatlar');
        setKmBasedFees(response.data);
        console.log('🚛 KM Fiyatları Yüklendi:', response.data);
      } catch (error) {
        console.error('KM fiyatları yüklenirken hata:', error);
      }
    };

    fetchKmFiyatlar();
  }, []);

  // Rota hesaplama fonksiyonu
  const calculateRoute = useCallback(async () => {
    if (!pickupLocation || !deliveryLocation || !window.google) return;

    try {
      const directionsService = new window.google.maps.DirectionsService();
      const result = await directionsService.route({
        origin: pickupLocation,
        destination: deliveryLocation,
        travelMode: window.google.maps.TravelMode.DRIVING,
      });

      const route = result.routes[0];
      const leg = route.legs[0];

      // Mesafe ve süre bilgilerini güncelle
      setRouteInfo({
        distance: leg.distance.text,
        duration: leg.duration.text,
        distanceValue: leg.distance.value, // metre cinsinden mesafe
        durationValue: leg.duration.value, // saniye cinsinden süre
        path: route.overview_path,
        bounds: route.bounds
      });

      // Directions'ı güncelle
      setDirections(result);
    } catch (error) {
      console.error('Rota hesaplama hatası:', error);
    }
  }, [pickupLocation, deliveryLocation]);

  // Konumlar değiştiğinde rotayı hesapla
  useEffect(() => {
    if (pickupLocation && deliveryLocation) {
      calculateRoute();
    }
  }, [pickupLocation, deliveryLocation, calculateRoute]);

  const getKmBasedPrice = (km, kmBasedFees) => {
    // Backend'den gelen KM fiyatlarına göre hesaplama
    const fee = kmBasedFees.find(fee => km >= fee.minKm && km <= fee.maxKm);
    return fee ? Number(fee.kmBasiUcret) : 0;
  };

  const calculateParkingFee = async (input) => {
    const { baseFee, parkingDistance, kmBasedFees, vehicle, segmentMultiplier, durumFiyati } = input;
    const kmPrice = getKmBasedPrice(parkingDistance, kmBasedFees);
    return Math.round(baseFee + (parkingDistance * kmPrice) + (durumFiyati * segmentMultiplier));
  };

  const calculateCityDeliveryFee = async (input) => {
    if (!input) return 0;
    const { distance, cityFee } = input;
    return Math.round((distance * cityFee.basePricePerKm) + cityFee.basePrice);
  };

  const getDistanceBetween = async (origin, destination) => {
    try {
      // Koordinatları parse et
      const originLat = parseCoordinate(origin.lat);
      const originLng = parseCoordinate(origin.lng);
      const destLat = parseCoordinate(destination.lat);
      const destLng = parseCoordinate(destination.lng);

      if (
        isNaN(originLat) || isNaN(originLng) ||
        isNaN(destLat) || isNaN(destLng)
      ) {
        console.error('Invalid coordinates:', { origin, destination });
        return 0;
      }

      const directionsService = new window.google.maps.DirectionsService();
      const result = await directionsService.route({
        origin: { lat: originLat, lng: originLng },
        destination: { lat: destLat, lng: destLng },
        travelMode: window.google.maps.TravelMode.DRIVING,
      });

      if (!result.routes?.[0]?.legs?.[0]) {
        console.error('Invalid route result:', result);
        return 0;
      }

      return result.routes[0].legs[0].distance.value / 1000; // km
    } catch (error) {
      console.error('Mesafe hesaplama hatası:', error);
      return 0;
    }
  };

  const calculateTotalPrice = async (input) => {
    try {
      let km = 0;
      if (input.pickupLocation && input.deliveryLocation) {
        km = await getDistanceBetween(input.pickupLocation, input.deliveryLocation);
      }

      const basePrice = Number(input.sehirFiyatlandirma.basePrice) || 0;
      const kmBasedPrice = getKmBasedPrice(km, kmBasedFees);
      const totalKmPrice = km * kmBasedPrice;

      let totalPrice = basePrice + totalKmPrice;

      for (const arac of input.araclar) {
        const segmentObj = vehicleData.segmentler.find(seg => String(seg.id) === String(arac.segment));
        const segmentMultiplier = segmentObj ? Number(segmentObj.price) : 1;
        
        const statusObj = vehicleData.durumlar.find(st => String(st.id) === String(arac.durum));
        const statusMultiplier = statusObj ? Number(statusObj.price) : 0;

        const aracBasePrice = basePrice + totalKmPrice;
        const aracPrice = (aracBasePrice * segmentMultiplier) + statusMultiplier;
        totalPrice += aracPrice;
      }

      if (input.isNight) {
        totalPrice *= input.nightPriceMultiplier;
      }

      return Math.round(totalPrice);
    } catch (error) {
      throw error;
    }
  };

  // Fiyat hesaplama useEffect'i
  useEffect(() => {
    const calculatePrice = async () => {
      if (
        pickupLocation &&
        deliveryLocation &&
        araclar.length > 0 &&
        sehirFiyatlandirma &&
        fiyatlandirma
      ) {
        const price = await calculateTotalPrice({
          pickupLocation,
          deliveryLocation,
          pickupOtopark,
          deliveryOtopark,
          araclar,
          sehirFiyatlandirma,
          fiyatlandirma
        });
        setToplamFiyat(price);
      }
    };

    calculatePrice();
  }, [pickupLocation, deliveryLocation, araclar, sehirFiyatlandirma, fiyatlandirma, pickupOtopark, deliveryOtopark]);

  // Debounce edilmiş değerler
  const debouncedPickupLocation = useDebounce(pickupLocation, 500);
  const debouncedDeliveryLocation = useDebounce(deliveryLocation, 500);
  const debouncedAraclar = useDebounce(araclar, 500);
  const debouncedRouteInfo = useDebounce(routeInfo, 500);

  // Konumlar değiştiğinde fiyat hesapla
  useEffect(() => {
    if (debouncedPickupLocation && debouncedDeliveryLocation) {
      calculateTotalPrice({
        pickupLocation,
        deliveryLocation,
        pickupOtopark,
        deliveryOtopark,
        araclar,
        sehirFiyatlandirma,
        fiyatlandirma
      });
    }
  }, [debouncedPickupLocation, debouncedDeliveryLocation, calculateTotalPrice, pickupLocation, deliveryLocation, pickupOtopark, deliveryOtopark, araclar, sehirFiyatlandirma, fiyatlandirma]);

  // Araç listesi değiştiğinde fiyat hesapla
  useEffect(() => {
    if (debouncedAraclar?.length > 0) {
      calculateTotalPrice({
        pickupLocation,
        deliveryLocation,
        pickupOtopark,
        deliveryOtopark,
        araclar,
        sehirFiyatlandirma,
        fiyatlandirma
      });
    }
  }, [debouncedAraclar, calculateTotalPrice, pickupLocation, deliveryLocation, pickupOtopark, deliveryOtopark, araclar, sehirFiyatlandirma, fiyatlandirma]);

  // Rota bilgisi güncellendiğinde fiyat hesapla
  useEffect(() => {
    if (debouncedRouteInfo) {
      calculateTotalPrice({
        pickupLocation,
        deliveryLocation,
        pickupOtopark,
        deliveryOtopark,
        araclar,
        sehirFiyatlandirma,
        fiyatlandirma
      });
    }
  }, [debouncedRouteInfo, calculateTotalPrice, pickupLocation, deliveryLocation, pickupOtopark, deliveryOtopark, araclar, sehirFiyatlandirma, fiyatlandirma]);

  // Şehir seçildiğinde fiyatlandırma ve otopark bilgisi çek
  useEffect(() => {
    if (selectedPickupCity) {
      const fetchSehirFiyat = async () => {
        try {
          const normalizedSehir = normalizeSehirAdi(selectedPickupCity);
          const response = await api.get(`/api/variables/toplu-cekici/sehirler/${normalizedSehir}`);
          setSehirFiyatlandirma(response.data);
          if (pickupOtopark) {
            setLocationWithValidation(setPickupLocation, {
              lat: Number(response.data.otoparkLat),
              lng: Number(response.data.otoparkLng),
              address: response.data.otoparkAdres
            });
            setPickupSearchValue(response.data.otoparkAdres);
          }
        } catch (err) {
          console.error('Şehir fiyatlandırma hatası:', err);
          setSehirFiyatlandirma(null);
        }
      };
      fetchSehirFiyat();
    }
  }, [selectedPickupCity, pickupOtopark]);

  useEffect(() => {
    if (selectedDeliveryCity) {
      const fetchSehirFiyat = async () => {
        try {
          const normalizedSehir = normalizeSehirAdi(selectedDeliveryCity);
          const response = await api.get(`/api/variables/toplu-cekici/sehirler/${normalizedSehir}`);
          if (deliveryOtopark) {
            setLocationWithValidation(setDeliveryLocation, {
              lat: Number(response.data.otoparkLat),
              lng: Number(response.data.otoparkLng),
              address: response.data.otoparkAdres
            });
            setDeliverySearchValue(response.data.otoparkAdres);
          }
        } catch (err) {
          console.error('Şehir fiyatlandırma hatası:', err);
        }
      };
      fetchSehirFiyat();
    }
  }, [selectedDeliveryCity, deliveryOtopark]);

  // Remove duplicate useEffect hooks and consolidate them
  useEffect(() => {
    const handleLocationUpdate = (isPickup) => {
      const city = isPickup ? selectedPickupCity : selectedDeliveryCity;
      const isOtopark = isPickup ? pickupOtopark : deliveryOtopark;
      const setLocation = isPickup ? setPickupLocation : setDeliveryLocation;
      const setSearchValue = isPickup ? setPickupSearchValue : setDeliverySearchValue;

      if (isOtopark && city && fiyatlandirma?.sehirler) {
        const sehir = fiyatlandirma.sehirler.find(s => s.id === city);
        if (sehir) {
          setSearchValue(sehir.adres);
          setLocation({
            lat: sehir.lat,
            lng: sehir.lng,
            address: sehir.adres
          });
        }
      }
    };

    handleLocationUpdate(true); // Handle pickup location
    handleLocationUpdate(false); // Handle delivery location
  }, [pickupOtopark, deliveryOtopark, selectedPickupCity, selectedDeliveryCity, fiyatlandirma]);

  // Improve geolocation error handling
  const handleCurrentLocation = async (target) => {
    if (!navigator.geolocation) {
      toast.error('Tarayıcınız konum özelliğini desteklemiyor.');
      return;
    }

    try {
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
      
      if (permissionStatus.state === 'denied') {
        toast.error('Konum izni reddedildi. Lütfen tarayıcı ayarlarından konum iznini etkinleştirin.');
        return;
      }

      const loadingToast = toast.loading('Konumunuz alınıyor...', { id: 'location' });
      
      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      };

      const getPosition = (highAccuracy = true) => {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              ...options,
              enableHighAccuracy: highAccuracy,
              timeout: highAccuracy ? 15000 : 60000
            }
          );
        });
      };

      try {
        const position = await getPosition(true);
        const { latitude, longitude } = position.coords;
        const address = await getAddressFromLatLng(latitude, longitude);
        const newLocation = { lat: latitude, lng: longitude, address };
        
        if (target === 'pickup') {
          setPickupLocation(newLocation);
          setPickupSearchValue(address);
        } else {
          setDeliveryLocation(newLocation);
          setDeliverySearchValue(address);
        }
        setActiveMapPanel(null);
        
        toast.success('Konumunuz başarıyla alındı.', { id: 'location' });
      } catch (error) {
        console.error('High accuracy geolocation error:', error);
        
        if (error.code === error.POSITION_UNAVAILABLE || error.code === error.TIMEOUT) {
          try {
            const lowAccuracyPosition = await getPosition(false);
            const { latitude, longitude } = lowAccuracyPosition.coords;
            const address = await getAddressFromLatLng(latitude, longitude);
            const newLocation = { lat: latitude, lng: longitude, address };

            if (target === 'pickup') {
              setPickupLocation(newLocation);
              setPickupSearchValue(address);
            } else {
              setDeliveryLocation(newLocation);
              setDeliverySearchValue(address);
            }
            setActiveMapPanel(null);
            
            toast.success('Konumunuz başarıyla alındı.', { id: 'location' });
            return;
          } catch (retryError) {
            console.error('Low accuracy geolocation error:', retryError);
          }
        }

        let errorMessage = 'Konum alınamadı.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Konum izni reddedildi. Lütfen tarayıcı ayarlarından konum iznini etkinleştirin.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Konum bilgisi alınamadı. Lütfen konum servislerinizin açık olduğundan emin olun ve tekrar deneyin.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Konum alma işlemi zaman aşımına uğradı. Lütfen tekrar deneyin.';
            break;
          default:
            errorMessage = 'Konum alınamadı. Lütfen manuel olarak girin.';
        }
        
        toast.error(errorMessage, { id: 'location' });
      }
    } catch (error) {
      console.error('Permission check error:', error);
      toast.error('Konum izni kontrol edilemedi. Lütfen manuel olarak girin.');
    }
  };

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
    const yeniArac = {
      id: Date.now(), // Benzersiz ID ekle
      marka: '',
      model: '',
      yil: '',
      plaka: '',
      segment: '',
      durum: ''
    };
    setAraclar(prev => [...prev, yeniArac]);
  };

  const aracSil = (id) => {
    setAraclar(prev => prev.filter(arac => arac.id !== id));
  };

  const aracGuncelle = (id, field, value) => {
    setAraclar(prev => prev.map(arac => {
      if (arac.id === id) {
        const updatedArac = { ...arac, [field]: value };
        
        // Marka değiştiğinde model seçeneklerini güncelle
        if (field === 'marka') {
          const models = vehicleData?.aracModelleri[value] || [];
          setModelOptions(models);
          // Modeli sıfırla
          updatedArac.model = '';
        }
        
        return updatedArac;
      }
      return arac;
    }));
  };

  const handleInputChange = async (e) => {
    const value = e.target.value;
    if (activeLocation === 'pickup') {
      setPickupSearchValue(value);
    } else {
      setDeliverySearchValue(value);
    }
  };

  const handlePredictionSelect = async (prediction) => {
    if (!window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    try {
      const result = await geocoder.geocode({ placeId: prediction.place_id });
      if (result.results[0]) {
        const location = {
          lat: result.results[0].geometry.location.lat(),
          lng: result.results[0].geometry.location.lng(),
          address: result.results[0].formatted_address
        };

        if (activeLocation === 'pickup') {
          setPickupLocation(location);
          setPickupSearchValue(location.address);
        } else {
          setDeliveryLocation(location);
          setDeliverySearchValue(location.address);
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  useEffect(() => {
    if (isLoaded && window.google) {
      const pickupInput = document.getElementById('pickup-input');
      const deliveryInput = document.getElementById('delivery-input');

      if (pickupInput) {
        const pickupAutocomplete = new window.google.maps.places.Autocomplete(pickupInput, {
          types: ['address'],
          componentRestrictions: { country: 'tr' }
        });

        pickupAutocomplete.addListener('place_changed', () => {
          const place = pickupAutocomplete.getPlace();
          if (place.geometry) {
            const location = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              address: place.formatted_address
            };
            setPickupLocation(location);
            setPickupSearchValue(location.address);
          }
        });
      }

      if (deliveryInput) {
        const deliveryAutocomplete = new window.google.maps.places.Autocomplete(deliveryInput, {
          types: ['address'],
          componentRestrictions: { country: 'tr' }
        });

        deliveryAutocomplete.addListener('place_changed', () => {
          const place = deliveryAutocomplete.getPlace();
          if (place.geometry) {
            const location = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              address: place.formatted_address
            };
            setDeliveryLocation(location);
            setDeliverySearchValue(location.address);
          }
        });
      }
    }
  }, [isLoaded]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      // Konum kontrolleri
      if (pickupOtopark && !selectedPickupCity) {
        toast.error('Lütfen alınacak şehri seçin');
        return;
      }
      
      if (deliveryOtopark && !selectedDeliveryCity) {
        toast.error('Lütfen teslim edilecek şehri seçin');
        return;
      }

      if (!pickupOtopark && !pickupLocation) {
        toast.error('Lütfen alınacak konumu seçin');
        return;
      }
      
      if (!deliveryOtopark && !deliveryLocation) {
        toast.error('Lütfen teslim edilecek konumu seçin');
        return;
      }

      setStep(2);
    } else if (step === 2) {
      // Araç kontrolleri
      if (araclar.length === 0) {
        toast.error('Lütfen en az bir araç ekleyin');
        return;
      }

      if (araclar.some(arac => !arac.marka || !arac.model || !arac.segment || !arac.yil || !arac.plaka)) {
        toast.error('Lütfen tüm araç bilgilerini eksiksiz doldurun');
        return;
      }

      setStep(3);
    } else if (step === 3) {
      if (!toplamFiyat) {
        toast.error('Lütfen fiyat hesaplamasını bekleyin');
        return;
      }

      setStep(4);
    } else if (step === 4) {
      // Müşteri bilgileri kontrolleri
      if (musteriBilgileri.musteriTipi === 'kisisel') {
        if (!musteriBilgileri.ad || !musteriBilgileri.soyad || !musteriBilgileri.telefon || !musteriBilgileri.email) {
          toast.error('Lütfen tüm zorunlu alanları doldurun');
          return;
        }
        if (musteriBilgileri.tcVatandasi && !musteriBilgileri.tcKimlik) {
          toast.error('Lütfen TC Kimlik numaranızı girin');
          return;
        }
      } else if (musteriBilgileri.musteriTipi === 'kurumsal') {
        if (!musteriBilgileri.firmaAdi || !musteriBilgileri.vergiNo || !musteriBilgileri.vergiDairesi || !musteriBilgileri.telefon || !musteriBilgileri.email) {
          toast.error('Lütfen tüm firma bilgilerini eksiksiz doldurun');
          return;
        }
      }

      await createOrder();
    }
  };

  const createOrder = async () => {
    try {
      // Müşteri bilgilerini hazırla
      const customerInfo = {
        ad: musteriBilgileri.ad,
        soyad: musteriBilgileri.soyad,
        telefon: musteriBilgileri.telefon,
        email: musteriBilgileri.email,
        tcKimlik: musteriBilgileri.tcKimlik || '11111111',
        firmaAdi: musteriBilgileri.firmaAdi,
        vergiNo: musteriBilgileri.vergiNo,
        vergiDairesi: musteriBilgileri.vergiDairesi
      };

      // Araç bilgilerini hazırla - Backend'in beklediği formatta
      const vehicles = araclar.map(arac => ({
        tip: arac.segment,
        marka: arac.marka,
        model: arac.model,
        yil: arac.yil,
        plaka: arac.plaka,
        condition: arac.durum
      }));

      // Sipariş verilerini hazırla
      const orderData = {
        serviceType: 'TOPLU_CEKICI',
        customerInfo,
        vehicles,
        price: toplamFiyat,
        pickupLocation: pickupLocation.address,
        dropoffLocation: deliveryLocation.address,
        isPickupFromParking: pickupOtopark,
        isDeliveryToParking: deliveryOtopark,
        specialNotes: '',
        numberOfVehicles: araclar.length
      };

      console.log('Gönderilen sipariş verisi:', orderData);

      // API'ye gönder
      const { data } = await api.post('/api/orders', orderData);

      if (!data || !data.pnr) {
        throw new Error('Talep numarası alınamadı');
      }

      setPnrNumber(data.pnr);
      setStep(5);

      // PNR'ı localStorage'a kaydet
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastPnr', data.pnr);
        
        // Sipariş bilgilerini kaydet
        const orderInfo = {
          pnr: data.pnr,
          pickupCity: selectedPickupCity,
          deliveryCity: selectedDeliveryCity,
          vehicles,
          price: toplamFiyat,
          customerInfo,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem(`order_${data.pnr}`, JSON.stringify(orderInfo));
      }

      toast.success('Siparişiniz başarıyla oluşturuldu!');
    } catch (error) {
      console.error('Sipariş oluşturma hatası:', error);
      toast.error('Sipariş oluşturulurken bir hata oluştu: ' + (error?.response?.data?.message || error?.message || 'Bilinmeyen hata'));
    }
  };

  const getAddressFromLatLng = async (lat, lng) => {
    if (!window.google) return '';
    const geocoder = new window.google.maps.Geocoder();
    return new Promise((resolve) => {
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          resolve('');
        }
      });
    });
  };

  const handleMapClick = async (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const address = await getAddressFromLatLng(lat, lng);
    const newLocation = { lat, lng, address };

    // Google Maps Geocoder ile şehir bilgisini al
    const geocoder = new window.google.maps.Geocoder();
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
            const response = await api.get(`/api/variables/toplu-cekici/sehirler/${normalizedSehir}`);
            setSehirFiyatlandirma(response.data);
          } catch (error) {
            setSehirFiyatlandirma(null);
          }
        }
      }
    });

    // Şehir tespiti yap
    const detectedCity = await sehirTespiti(newLocation);
    console.log('📍 Tespit edilen şehir:', detectedCity);

    if (activeLocation === 'pickup') {
      setLocationWithValidation(setPickupLocation, newLocation);
      setPickupSearchValue(address);
      if (detectedCity) {
        setSelectedPickupCity(detectedCity);
      }
    } else {
      setLocationWithValidation(setDeliveryLocation, newLocation);
      setDeliverySearchValue(address);
      if (detectedCity) {
        setSelectedDeliveryCity(detectedCity);
      }
    }
    setActiveMapPanel(null);
  };

  const FiyatDetaylari = ({ routeInfo, toplamFiyat }) => {
    return (
      <div className="space-y-4">
        <div className="bg-[#202020] rounded-lg p-3">
          <div className="text-[#404040] text-sm mb-1">Toplam Tutar</div>
          <div className="text-2xl font-bold text-yellow-500">
            {toplamFiyat.toLocaleString('tr-TR')} TL
          </div>
        </div>
        {routeInfo && (
          <>
            <div className="bg-[#202020] rounded-lg p-3">
              <div className="text-[#404040] text-sm mb-1">Mesafe</div>
              <div className="text-white font-medium">{routeInfo.distance}</div>
            </div>
            <div className="bg-[#202020] rounded-lg p-3">
              <div className="text-[#404040] text-sm mb-1">Tahmini Süre</div>
              <div className="text-white font-medium">{routeInfo.duration}</div>
            </div>
          </>
        )}
      </div>
    );
  };

  // Add useEffect to show route map when both locations are selected
  useEffect(() => {
    if (pickupLocation && deliveryLocation) {
      setActiveMapPanel('route');
    }
  }, [pickupLocation, deliveryLocation]);

  useEffect(() => {
    if (
      step === 3 &&
      pickupLocation &&
      deliveryLocation
    ) {
      setActiveMapPanel('route');
    }
  }, [step, pickupLocation, deliveryLocation]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-[2px]">
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
                <h3 className="text-lg font-semibold text-white mb-4">Aracı Bize Teslim Edeceğiniz Konum</h3>
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
                      Otoparka Teslim Edilecek
                    </label>
                  </div>

                  {pickupOtopark ? (
                    <div className="grid grid-cols-2 gap-4">
                      <select
                        value={selectedPickupCity}
                        onChange={(e) => setSelectedPickupCity(e.target.value)}
                        className="w-full py-2.5 px-4 bg-[#202020] text-white rounded-lg border border-[#404040] focus:outline-none focus:border-yellow-500"
                      >
                        <option value="">Şehir Seçin</option>
                        {sehirler.map((sehir) => (
                          <option key={`pickup-${sehir.id}`} value={sehir.sehirAdi}>
                            {sehir.sehirAdi}
                          </option>
                        ))}
                      </select>
                      {selectedPickupCity && (
                        <div className="bg-[#202020] rounded-lg p-3">
                          <div className="text-[#404040] text-sm mb-1">Otopark Konumu</div>
                          <div className="text-white font-medium text-sm">
                            {sehirler.find(s => s.sehirAdi === selectedPickupCity)?.otoparkAdres}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          id="pickup-input"
                          type="text"
                          value={pickupSearchValue}
                          onChange={handleInputChange}
                          onFocus={() => setActiveLocation('pickup')}
                          placeholder="Adres veya konum ara..."
                          className="w-full py-2.5 px-4 bg-[#202020] text-white rounded-lg border border-[#404040] focus:outline-none focus:border-yellow-500"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2 z-10">
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
                      {isLoaded && activeMapPanel === 'pickup' && (
                        <div style={mapStyles} className="relative mt-2">
                          <GoogleMap
                            mapContainerStyle={mapStyles}
                            center={pickupLocation || { lat: 41.0082, lng: 28.9784 }}
                            zoom={13}
                            options={mapOptions}
                            onClick={handleMapClick}
                          >
                            {pickupLocation && <Marker position={pickupLocation} clickable={false} />}
                          </GoogleMap>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-[#141414] rounded-lg p-4 border border-[#404040]">
                <h3 className="text-lg font-semibold text-white mb-4">Aracı Teslim Alacağımız Konum</h3>
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
                      Otoparktan Teslim Alınacak
                    </label>
                  </div>

                  {deliveryOtopark ? (
                    <div className="grid grid-cols-2 gap-4">
                      <select
                        value={selectedDeliveryCity}
                        onChange={(e) => setSelectedDeliveryCity(e.target.value)}
                        className="w-full py-2.5 px-4 bg-[#202020] text-white rounded-lg border border-[#404040] focus:outline-none focus:border-yellow-500"
                      >
                        <option value="">Şehir Seçin</option>
                        {sehirler.map((sehir) => (
                          <option key={`delivery-${sehir.id}`} value={sehir.sehirAdi}>
                            {sehir.sehirAdi}
                          </option>
                        ))}
                      </select>
                      {selectedDeliveryCity && (
                        <div className="bg-[#202020] rounded-lg p-3">
                          <div className="text-[#404040] text-sm mb-1">Otopark Konumu</div>
                          <div className="text-white font-medium text-sm">
                            {sehirler.find(s => s.sehirAdi === selectedDeliveryCity)?.otoparkAdres}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          id="delivery-input"
                          type="text"
                          value={deliverySearchValue}
                          onChange={handleInputChange}
                          onFocus={() => setActiveLocation('delivery')}
                          placeholder="Adres veya konum ara..."
                          className="w-full py-2.5 px-4 bg-[#202020] text-white rounded-lg border border-[#404040] focus:outline-none focus:border-yellow-500"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2 z-10">
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
                      {isLoaded && activeMapPanel === 'delivery' && (
                        <div style={mapStyles} className="relative mt-2">
                          <GoogleMap
                            mapContainerStyle={mapStyles}
                            center={deliveryLocation || { lat: 41.0082, lng: 28.9784 }}
                            zoom={13}
                            options={mapOptions}
                            onClick={handleMapClick}
                          >
                            {deliveryLocation && <Marker position={deliveryLocation} clickable={false} />}
                          </GoogleMap>
                        </div>
                      )}
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
                  {araclar.map((arac) => (
                    <div key={`arac-${arac.id}`} className="bg-[#202020] rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-white font-medium">Araç {araclar.indexOf(arac) + 1}</h4>
                        {araclar.length > 1 && (
                          <button
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
                            onChange={(e) => aracGuncelle(arac.id, 'marka', e.target.value)}
                            className="w-full py-2 px-3 bg-[#141414] text-white rounded-lg border border-[#404040] focus:outline-none focus:border-yellow-500"
                          >
                            <option value="">Seçin</option>
                            {vehicleData?.aracMarkalari.map((marka) => (
                              <option key={`marka-${marka}`} value={marka}>
                                {marka}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[#404040] text-sm mb-1">Model</label>
                          <select
                            value={arac.model}
                            onChange={(e) => aracGuncelle(arac.id, 'model', e.target.value)}
                            className="w-full py-2 px-3 bg-[#141414] text-white rounded-lg border border-[#404040] focus:outline-none focus:border-yellow-500"
                            disabled={!arac.marka}
                          >
                            <option value="">Seçin</option>
                            {vehicleData?.aracModelleri[arac.marka]?.map((model) => (
                              <option key={`model-${model}`} value={model}>
                                {model}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[#404040] text-sm mb-1">Segment</label>
                          <select
                            value={arac.segment}
                            onChange={(e) => aracGuncelle(arac.id, 'segment', e.target.value)}
                            className="w-full py-2 px-3 bg-[#141414] text-white rounded-lg border border-[#404040] focus:outline-none focus:border-yellow-500"
                          >
                            <option value="">Seçin</option>
                            {vehicleData.segmentler.map((segment) => (
                              <option key={`segment-${segment.id}`} value={segment.id}>
                                {segment.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[#404040] text-sm mb-1">Yıl</label>
                          <select
                            value={arac.yil}
                            onChange={(e) => aracGuncelle(arac.id, 'yil', e.target.value)}
                            className="w-full py-2 px-3 bg-[#141414] text-white rounded-lg border border-[#404040] focus:outline-none focus:border-yellow-500"
                          >
                            <option value="">Seçin</option>
                            {vehicleData?.yillar.map((yil) => (
                              <option key={`yil-${yil}`} value={yil}>
                                {yil}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[#404040] text-sm mb-1">Plaka</label>
                          <input
                            type="text"
                            value={arac.plaka}
                            onChange={(e) => aracGuncelle(arac.id, 'plaka', e.target.value.toUpperCase())}
                            placeholder="Plaka"
                            maxLength={8}
                            className="w-full px-4 py-3 bg-[#141414] border border-[#404040] rounded-lg text-white placeholder-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-[#404040] text-sm mb-1">Durum</label>
                          <select
                            value={arac.durum}
                            onChange={(e) => aracGuncelle(arac.id, 'durum', e.target.value)}
                            className="w-full px-4 py-3 bg-[#141414] border border-[#404040] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          >
                            <option value="">Araç Durumu Seçin</option>
                            {vehicleData.durumlar.map((durum) => (
                              <option key={`durum-${durum.id}`} value={durum.id}>
                                {durum.name}
                              </option>
                            ))}
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
                  disabled={araclar.length === 0 || araclar.some(arac => !arac.marka || !arac.model || !arac.segment || !arac.yil || !arac.plaka)}
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
                <FiyatDetaylari routeInfo={routeInfo} toplamFiyat={toplamFiyat} />
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
                    <div className="text-[#404040] text-sm mb-1">Talep Numarası</div>
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
                        * Ödemenizi yaptıktan sonra dekontunuzu Talep numaranız ile birlikte info@cekgetir.com adresine göndermeniz gerekmektedir.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    window.location.href = `/pnr-sorgula?pnr=${pnrNumber}`;
                  }}
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