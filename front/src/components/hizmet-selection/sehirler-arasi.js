'use client'

import { useState, useEffect, useCallback } from 'react'
import OzelCekiciModal from './ozel-cekici'
import TopluCekiciModal from './toplu-cekici'
import api from '@/utils/axios'
import axios from 'axios'
export default function SehirlerArasiModal({ onClose }) {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const vehicleResponse = await axios.get('/data/arac-info.json');
        setVehicleData(vehicleResponse.data);
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        setError('Veriler yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
      const orderData = {
        serviceType: selectedService === 'ozel' ? 'OZEL_CEKICI' : 'TOPLU_CEKICI',
        vehicles: araclar.map(arac => ({
          tip: arac.tip,
          marka: arac.marka,
          model: arac.model,
          yil: arac.yil,
          plaka: arac.plaka,
          condition: arac.durum
        })),
        price: toplamFiyat,
        customerInfo: {
          ad: musteriBilgileri.ad,
          soyad: musteriBilgileri.soyad,
          telefon: musteriBilgileri.telefon,
          email: musteriBilgileri.email,
          tcKimlik: musteriBilgileri.tcKimlik,
          firmaAdi: musteriBilgileri.firmaAdi,
          vergiNo: musteriBilgileri.vergiNo,
          vergiDairesi: musteriBilgileri.vergiDairesi
        },
        pickupLocation: pickupLocation.address,
        dropoffLocation: deliveryLocation.address,
        isPickupFromParking: pickupOtopark ? true : false,
        isDeliveryToParking: deliveryOtopark ? true : false,
        specialNotes: ''
      };

      console.log('Gönderilen veri:', orderData);

      const { data } = await api.post('/api/orders', orderData);
      console.log('API yanıtı:', data);

      if (!data.pnr) {
        throw new Error('PNR numarası alınamadı');
      }

      setPnrNumber(data.pnr);
      setStep(5);

      // PNR'ı localStorage'a kaydet
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastPnr', data.pnr);
      }
    } catch (error) {
      console.error('Sipariş oluşturma hatası:', error);
      alert('Sipariş oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
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

  // Araç ekleme fonksiyonu
  const aracEkle = () => {
    setAraclar([...araclar, {
      marka: '',
      model: '',
      yil: '',
      plaka: '',
      segment: '',
      durum: '' // Yeni eklenen alan
    }])
  }

  // Araç bilgilerini güncelleme fonksiyonu
  const aracGuncelle = (index, field, value) => {
    const yeniAraclar = [...araclar]
    yeniAraclar[index] = { ...yeniAraclar[index], [field]: value }
    setAraclar(yeniAraclar)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px]">
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
          <h2 className="text-2xl font-bold text-white mb-6">Şehirler Arası Çekici Talebi</h2>

          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedService('ozel')}
                  className={`p-6 bg-[#141414] border border-[#404040] rounded-lg text-left hover:border-yellow-500 transition-colors ${
                    selectedService === 'ozel' ? 'border-yellow-500' : ''
                  }`}
                >
                  <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Özel Çekici</h3>
                  <p className="text-[#404040] text-sm">
                    Tek bir araç için özel çekici hizmeti. Hızlı ve güvenli teslimat.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedService('toplu')}
                  className={`p-6 bg-[#141414] border border-[#404040] rounded-lg text-left hover:border-yellow-500 transition-colors ${
                    selectedService === 'toplu' ? 'border-yellow-500' : ''
                  }`}
                >
                  <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Toplu Çekici</h3>
                  <p className="text-[#404040] text-sm">
                    Birden fazla araç için toplu çekici hizmeti. Ekonomik ve verimli çözüm.
                  </p>
                </button>
              </div>

              <button
                type="submit"
                disabled={!selectedService}
                className="w-full py-3 px-6 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Devam Et
              </button>
            </form>
          ) : step === 2 ? (
            selectedService === 'ozel' ? (
              <OzelCekiciModal onClose={onClose} />
            ) : (
              <TopluCekiciModal onClose={onClose} />
            )
          ) : null}

          {step === 5 && (
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
          )}
        </div>
      </div>
    </div>
  )
}
