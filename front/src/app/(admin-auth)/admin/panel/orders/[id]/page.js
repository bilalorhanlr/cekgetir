'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminNavbar from '@/components/adminNavbar'
import api from '@/utils/axios'
import { use } from 'react'

export default function OrderDetailPage({ params }) {
  const router = useRouter()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const orderId = use(params).id

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get(`api/orders/${orderId}`)
      setOrder(response.data)
    } catch (error) {
      console.error('Sipariş yüklenirken hata oluştu:', error)
      setError('Sipariş yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (newStatus) => {
    try {
      setUpdatingStatus(true)
      await api.patch(`api/orders/${orderId}`, { status: newStatus })
      await fetchOrder()
    } catch (error) {
      console.error('Durum güncellenirken hata:', error)
      alert('Durum güncellenirken bir hata oluştu')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const updatePaymentStatus = async (newStatus) => {
    try {
      setUpdatingStatus(true)
      await api.patch(`api/orders/${orderId}`, { paymentStatus: newStatus })
      await fetchOrder()
    } catch (error) {
      console.error('Ödeme durumu güncellenirken hata:', error)
      alert('Ödeme durumu güncellenirken bir hata oluştu')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { text: 'Beklemede', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50' },
      'ACCEPTED': { text: 'Onaylandı', color: 'bg-blue-500/20 text-blue-500 border-blue-500/50' },
      'IN_PROGRESS': { text: 'İşlemde', color: 'bg-purple-500/20 text-purple-500 border-purple-500/50' },
      'COMPLETED': { text: 'Tamamlandı', color: 'bg-green-500/20 text-green-500 border-green-500/50' },
      'CANCELLED': { text: 'İptal Edildi', color: 'bg-red-500/20 text-red-500 border-red-500/50' }
    }

    const config = statusConfig[status] || statusConfig['PENDING']
    return (
      <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${config.color}`}>
        {config.text}
      </span>
    )
  }

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      'ODENDI': { text: 'Ödendi', color: 'bg-green-500/20 text-green-500 border-green-500/50' },
      'ODENECEK': { text: 'Ödenecek', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50' },
      'IADE_EDILDI': { text: 'İade Edildi', color: 'bg-red-500/20 text-red-500 border-red-500/50' }
    }

    const config = statusConfig[status] || statusConfig['ODENECEK']
    return (
      <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${config.color}`}>
        {config.text}
      </span>
    )
  }

  const renderServiceSpecificInfo = () => {
    switch (order.serviceType) {
      case 'YOL_YARDIM':
        return (
          <div className="bg-[#202020] rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Yol Yardım Bilgileri</h2>
            <div className="space-y-6">
              <div>
                <div className="text-gray-400 text-sm mb-1">Arıza Türü</div>
                <div className="text-white text-lg">{order.faultType || 'Belirtilmemiş'}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm mb-1">Arıza Yeri</div>
                <div className="text-white text-lg">{order.breakdownLocation}</div>
                {order.breakdownDescription && (
                  <div className="text-gray-400 text-sm mt-1">{order.breakdownDescription}</div>
                )}
              </div>
            </div>
          </div>
        )
      case 'OZEL_CEKICI':
        return (
          <div className="bg-[#202020] rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Özel Çekici Bilgileri</h2>
            <div className="space-y-6">
              <div>
                <div className="text-gray-400 text-sm mb-1">Alınacak Yer</div>
                <div className="text-white text-lg">{order.pickupLocation}</div>
                {order.isPickupFromParking && (
                  <div className="text-yellow-500 text-sm mt-1">Otoparktan Alınacak</div>
                )}
              </div>
              <div>
                <div className="text-gray-400 text-sm mb-1">Bırakılacak Yer</div>
                <div className="text-white text-lg">{order.dropoffLocation}</div>
                {order.isDeliveryToParking && (
                  <div className="text-yellow-500 text-sm mt-1">Otoparka Bırakılacak</div>
                )}
              </div>
              {order.specialNotes && (
                <div>
                  <div className="text-gray-400 text-sm mb-1">Özel Notlar</div>
                  <div className="text-white text-lg">{order.specialNotes}</div>
                </div>
              )}
            </div>
          </div>
        )
      case 'TOPLU_CEKICI':
        return (
          <div className="bg-[#202020] rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Toplu Çekici Bilgileri</h2>
            <div className="space-y-6">
              <div>
                <div className="text-gray-400 text-sm mb-1">Toplanacak Yer</div>
                <div className="text-white text-lg">{order.pickupLocation}</div>
                {order.isPickupFromParking && (
                  <div className="text-yellow-500 text-sm mt-1">Otoparktan Alınacak</div>
                )}
              </div>
              <div>
                <div className="text-gray-400 text-sm mb-1">Bırakılacak Yer</div>
                <div className="text-white text-lg">{order.dropoffLocation}</div>
                {order.isDeliveryToParking && (
                  <div className="text-yellow-500 text-sm mt-1">Otoparka Bırakılacak</div>
                )}
              </div>
              <div>
                <div className="text-gray-400 text-sm mb-1">Araç Sayısı</div>
                <div className="text-white text-lg">{order.numberOfVehicles || '1'}</div>
              </div>
              {order.specialNotes && (
                <div>
                  <div className="text-gray-400 text-sm mb-1">Özel Notlar</div>
                  <div className="text-white text-lg">{order.specialNotes}</div>
                </div>
              )}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414]">
        <AdminNavbar />
        <div className="pt-16">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
              <p className="mt-4 text-gray-400">Sipariş detayları yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#141414]">
        <AdminNavbar />
        <div className="pt-16">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">{error}</div>
              <button 
                onClick={fetchOrder}
                className="px-6 py-2.5 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors font-medium"
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#141414]">
        <AdminNavbar />
        <div className="pt-16">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">Sipariş bulunamadı</div>
              <button 
                onClick={() => router.push('/admin/panel/orders')}
                className="px-6 py-2.5 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors font-medium"
              >
                Siparişlere Dön
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      <AdminNavbar />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Sipariş Detayı</h1>
              <p className="text-gray-400 mt-1">PNR: {order.pnrNo}</p>
            </div>
            <button
              onClick={() => router.push('/admin/panel/orders')}
              className="w-full md:w-auto px-6 py-2.5 bg-[#202020] text-white rounded-lg hover:bg-[#2a2a2a] transition-all font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Siparişlere Dön
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sol Kolon - Sipariş Durumu ve Ödeme */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-gradient-to-br from-[#202020] to-[#1a1a1a] rounded-2xl p-6 shadow-xl border border-[#404040]/20">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Sipariş Durumu
                </h2>
                <div className="space-y-6">
                  <div>
                    <div className="text-gray-400 text-sm mb-3">Mevcut Durum</div>
                    <div className="flex items-center gap-2 mb-4">
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => updateOrderStatus('PENDING')}
                        disabled={updatingStatus || order.status === 'PENDING'}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          order.status === 'PENDING'
                            ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                            : 'bg-[#141414] text-white hover:bg-[#2a2a2a]'
                        }`}
                      >
                        Beklemede
                      </button>
                      <button
                        onClick={() => updateOrderStatus('ACCEPTED')}
                        disabled={updatingStatus || order.status === 'ACCEPTED'}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          order.status === 'ACCEPTED'
                            ? 'bg-blue-500 text-black shadow-lg shadow-blue-500/20'
                            : 'bg-[#141414] text-white hover:bg-[#2a2a2a]'
                        }`}
                      >
                        Onaylandı
                      </button>
                      <button
                        onClick={() => updateOrderStatus('IN_PROGRESS')}
                        disabled={updatingStatus || order.status === 'IN_PROGRESS'}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          order.status === 'IN_PROGRESS'
                            ? 'bg-purple-500 text-black shadow-lg shadow-purple-500/20'
                            : 'bg-[#141414] text-white hover:bg-[#2a2a2a]'
                        }`}
                      >
                        İşlemde
                      </button>
                      <button
                        onClick={() => updateOrderStatus('COMPLETED')}
                        disabled={updatingStatus || order.status === 'COMPLETED'}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          order.status === 'COMPLETED'
                            ? 'bg-green-500 text-black shadow-lg shadow-green-500/20'
                            : 'bg-[#141414] text-white hover:bg-[#2a2a2a]'
                        }`}
                      >
                        Tamamlandı
                      </button>
                      <button
                        onClick={() => updateOrderStatus('CANCELLED')}
                        disabled={updatingStatus || order.status === 'CANCELLED'}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          order.status === 'CANCELLED'
                            ? 'bg-red-500 text-black shadow-lg shadow-red-500/20'
                            : 'bg-[#141414] text-white hover:bg-[#2a2a2a]'
                        }`}
                      >
                        İptal Edildi
                      </button>
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-3">Ödeme Durumu</div>
                    <div className="flex items-center gap-2 mb-4">
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => updatePaymentStatus('ODENECEK')}
                        disabled={updatingStatus || order.paymentStatus === 'ODENECEK'}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          order.paymentStatus === 'ODENECEK'
                            ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                            : 'bg-[#141414] text-white hover:bg-[#2a2a2a]'
                        }`}
                      >
                        Ödenecek
                      </button>
                      <button
                        onClick={() => updatePaymentStatus('ODENDI')}
                        disabled={updatingStatus || order.paymentStatus === 'ODENDI'}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          order.paymentStatus === 'ODENDI'
                            ? 'bg-green-500 text-black shadow-lg shadow-green-500/20'
                            : 'bg-[#141414] text-white hover:bg-[#2a2a2a]'
                        }`}
                      >
                        Ödendi
                      </button>
                      <button
                        onClick={() => updatePaymentStatus('IADE_EDILDI')}
                        disabled={updatingStatus || order.paymentStatus === 'IADE_EDILDI'}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          order.paymentStatus === 'IADE_EDILDI'
                            ? 'bg-red-500 text-black shadow-lg shadow-red-500/20'
                            : 'bg-[#141414] text-white hover:bg-[#2a2a2a]'
                        }`}
                      >
                        İade
                      </button>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[#404040]/20">
                    <div className="text-gray-400 text-sm mb-2">Tutar</div>
                    <div className="text-3xl font-bold text-yellow-500">
                      {order.price.toLocaleString('tr-TR')} TL
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#202020] to-[#1a1a1a] rounded-2xl p-6 shadow-xl border border-[#404040]/20">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Hizmet Bilgileri
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Hizmet Tipi</div>
                    <div className="text-white text-lg">
                      {order.serviceType === 'YOL_YARDIM' ? 'Yol Yardım' :
                       order.serviceType === 'OZEL_CEKICI' ? 'Özel Çekici' :
                       'Toplu Çekici'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Oluşturulma Tarihi</div>
                    <div className="text-white text-lg">
                      {new Date(order.createdAt).toLocaleString('tr-TR')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hizmet Tipine Özel Bilgiler */}
              {renderServiceSpecificInfo()}
            </div>

            {/* Orta Kolon - Müşteri Bilgileri */}
            <div className="lg:col-span-4">
              <div className="bg-gradient-to-br from-[#202020] to-[#1a1a1a] rounded-2xl p-6 shadow-xl border border-[#404040]/20">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Müşteri Bilgileri
                </h2>
                <div className="space-y-6">
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Ad Soyad</div>
                    <div className="text-white text-lg">{order.customerName} {order.customerSurname}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Telefon</div>
                    <div className="text-white text-lg">{order.customerPhone}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-1">E-posta</div>
                    <div className="text-white text-lg break-all">{order.customerEmail}</div>
                  </div>
                  {order.customerTc && (
                    <div>
                      <div className="text-gray-400 text-sm mb-1">TC Kimlik</div>
                      <div className="text-white text-lg">{order.customerTc}</div>
                    </div>
                  )}
                </div>

                {order.companyName && (
                  <div className="mt-8 pt-8 border-t border-[#404040]/20">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Kurum Bilgileri
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <div className="text-gray-400 text-sm mb-1">Firma Adı</div>
                        <div className="text-white text-lg">{order.companyName}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm mb-1">Vergi No</div>
                        <div className="text-white text-lg">{order.taxNumber}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm mb-1">Vergi Dairesi</div>
                        <div className="text-white text-lg">{order.taxOffice}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sağ Kolon - Araç Bilgileri */}
            <div className="lg:col-span-4">
              <div className="bg-gradient-to-br from-[#202020] to-[#1a1a1a] rounded-2xl p-6 shadow-xl border border-[#404040]/20">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                  Araç Bilgileri
                </h2>
                {order.serviceType === 'TOPLU_CEKICI' && order.bulkVehicles ? (
                  <div className="space-y-6">
                    {order.bulkVehicles.map((vehicle, index) => (
                      <div key={vehicle.id} className="bg-[#141414] rounded-xl p-4 border border-[#404040]/20">
                        <div className="text-yellow-500 font-medium mb-3">Araç {index + 1}</div>
                        <div className="space-y-4">
                          <div>
                            <div className="text-gray-400 text-sm mb-1">Segment</div>
                            <div className="text-white text-lg">{vehicle.tip}</div>
                          </div>
                          <div>
                            <div className="text-gray-400 text-sm mb-1">Marka</div>
                            <div className="text-white text-lg">{vehicle.marka}</div>
                          </div>
                          <div>
                            <div className="text-gray-400 text-sm mb-1">Model</div>
                            <div className="text-white text-lg">{vehicle.model}</div>
                          </div>
                          <div>
                            <div className="text-gray-400 text-sm mb-1">Yıl</div>
                            <div className="text-white text-lg">{vehicle.yil}</div>
                          </div>
                          <div>
                            <div className="text-gray-400 text-sm mb-1">Plaka</div>
                            <div className="text-white text-lg font-mono">{vehicle.plaka}</div>
                          </div>
                          <div>
                            <div className="text-gray-400 text-sm mb-1">Durum</div>
                            <div className="text-white text-lg">{vehicle.condition}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <div className="text-gray-400 text-sm mb-1">Segment</div>
                      <div className="text-white text-lg">{order.vehicleSegment}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm mb-1">Marka</div>
                      <div className="text-white text-lg">{order.vehicleBrand}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm mb-1">Model</div>
                      <div className="text-white text-lg">{order.vehicleModel}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm mb-1">Yıl</div>
                      <div className="text-white text-lg">{order.vehicleYear}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm mb-1">Plaka</div>
                      <div className="text-white text-lg font-mono">{order.vehiclePlate}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm mb-1">Durum</div>
                      <div className="text-white text-lg">{order.vehicleCondition}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 