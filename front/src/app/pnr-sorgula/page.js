'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import Navbar from '@/components/Navbar'

export default function PnrSorgula() {
  const [pnr, setPnr] = useState('')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Sayfa yüklendiğinde localStorage'dan PNR'ı kontrol et
  useEffect(() => {
    const savedPnr = localStorage.getItem('lastPnr')
    if (savedPnr) {
      setPnr(savedPnr)
      handlePnrQuery(savedPnr)
    }
  }, [])

  const handlePnrQuery = async (pnrNumber) => {
    setLoading(true)
    setError(null)
    setOrder(null)

    try {
      const response = await axios.get(`/api/orders/pnr/${pnrNumber}`)
      setOrder(response.data)
      // Başarılı sorgulamada PNR'ı localStorage'a kaydet
      localStorage.setItem('lastPnr', pnrNumber)
    } catch (err) {
      setError(err.response?.data?.message || 'Sipariş bulunamadı')
      // Hata durumunda localStorage'dan PNR'ı sil
      localStorage.removeItem('lastPnr')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    handlePnrQuery(pnr)
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>
      
      <div className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-white mb-3">Talep No Sorgulama</h1>
            <p className="text-gray-400 text-base">Talep numaranızı girerek siparişinizin durumunu öğrenebilirsiniz.</p>
          </div>

          <div className="bg-[#202020] rounded-2xl p-8 shadow-xl border border-[#404040] mb-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="pnr" className="block text-base font-medium text-white mb-2">
                  Talep No Numarası
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="pnr"
                    value={pnr}
                    onChange={(e) => setPnr(e.target.value)}
                    className="w-full px-5 py-3 bg-[#141414] border-2 border-[#404040] rounded-xl text-white placeholder-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-base transition-all duration-300"
                    placeholder="Talep numaranızı girin"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <svg className="w-5 h-5 text-[#404040]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-medium rounded-xl hover:from-yellow-500 hover:to-yellow-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-yellow-400/20 hover:scale-[1.02] active:scale-[0.98] text-base"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>Sorgulanıyor...</span>
                  </div>
                ) : 'Sorgula'}
              </button>
            </form>
          </div>

          {error && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                <svg className="w-10 h-10 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-500 text-base">{error}</p>
              </div>
            </div>
          )}

          {order && (
            <div className="mt-8">
              <div className="bg-[#202020] rounded-2xl p-8 border border-[#404040] shadow-xl">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                  {/* Sol Kolon - Temel Bilgiler */}
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-white">Sipariş Detayları</h2>
                      <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                        order.status === 'COMPLETED' ? 'bg-green-500/20 text-green-500' :
                        order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500' :
                        order.status === 'CANCELLED' ? 'bg-red-500/20 text-red-500' :
                        order.status === 'IN_PROGRESS' ? 'bg-purple-500/20 text-purple-500' :
                        'bg-blue-500/20 text-blue-500'
                      }`}>
                        {order.status === 'COMPLETED' ? 'Tamamlandı' :
                         order.status === 'PENDING' ? 'Beklemede' :
                         order.status === 'CANCELLED' ? 'İptal Edildi' :
                         order.status === 'IN_PROGRESS' ? 'İşlemde' :
                         'Onaylandı'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-[#141414] rounded-xl p-4 border border-[#404040]">
                        <div className="text-[#404040] text-sm mb-1">Talep No</div>
                        <div className="text-white font-medium">{order.pnrNo}</div>
                      </div>

                      <div className="bg-[#141414] rounded-xl p-4 border border-[#404040]">
                        <div className="text-[#404040] text-sm mb-1">Ödeme Durumu</div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${
                          order.paymentStatus === 'ODENDI' ? 'bg-green-500/20 text-green-500' :
                          order.paymentStatus === 'IADE_EDILDI' ? 'bg-red-500/20 text-red-500' :
                          'bg-yellow-500/20 text-yellow-500'
                        }`}>
                          {order.paymentStatus === 'ODENDI' ? 'Ödendi' :
                           order.paymentStatus === 'IADE_EDILDI' ? 'İade Edildi' :
                           'Ödenecek'}
                        </div>
                      </div>

                      <div className="bg-[#141414] rounded-xl p-4 border border-[#404040]">
                        <div className="text-[#404040] text-sm mb-1">Sipariş Tarihi</div>
                        <div className="text-white font-medium">
                          {new Date(order.createdAt).toLocaleString('tr-TR')}
                        </div>
                      </div>

                      <div className="bg-[#141414] rounded-xl p-4 border border-[#404040]">
                        <div className="text-[#404040] text-sm mb-1">Tutar</div>
                        <div className="text-2xl font-bold text-yellow-500">
                          {order.price.toLocaleString('tr-TR')} TL
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-[#404040] text-sm mb-2">Konum</div>
                      <div className="text-white font-medium">
                        {order.serviceType === 'YOL_YARDIM' ? (
                          <div className="bg-[#141414] rounded-xl p-4 border border-[#404040]">
                            {order.breakdownLocation}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-[#141414] rounded-xl p-4 border border-[#404040]">
                              <div className="text-[#404040] text-sm mb-1">Teslim Alınacak</div>
                              <div>{order.pickupLocation}</div>
                            </div>
                            <div className="bg-[#141414] rounded-xl p-4 border border-[#404040]">
                              <div className="text-[#404040] text-sm mb-1">Bırakılacak</div>
                              <div>{order.dropoffLocation}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sağ Kolon - Araç ve Müşteri Bilgileri */}
                  <div className="flex-1 space-y-6">
                    <div>
                      <div className="text-[#404040] text-sm mb-2">Araç Bilgileri</div>
                      {order.serviceType === 'TOPLU_CEKICI' && order.bulkVehicles ? (
                        <div className="space-y-4">
                          {order.bulkVehicles.map((vehicle, index) => (
                            <div key={vehicle.id} className="bg-[#141414] rounded-xl p-4 border border-[#404040]">
                              <div className="text-yellow-500 font-medium mb-2">Araç {index + 1}</div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className="text-[#404040] text-sm mb-1">Segment</div>
                                  <div className="text-white">{vehicle.tip}</div>
                                </div>
                                <div>
                                  <div className="text-[#404040] text-sm mb-1">Marka</div>
                                  <div className="text-white">{vehicle.marka}</div>
                                </div>
                                <div>
                                  <div className="text-[#404040] text-sm mb-1">Model</div>
                                  <div className="text-white">{vehicle.model}</div>
                                </div>
                                <div>
                                  <div className="text-[#404040] text-sm mb-1">Yıl</div>
                                  <div className="text-white">{vehicle.yil}</div>
                                </div>
                                <div>
                                  <div className="text-[#404040] text-sm mb-1">Plaka</div>
                                  <div className="text-white font-mono">{vehicle.plaka}</div>
                                </div>
                                <div>
                                  <div className="text-[#404040] text-sm mb-1">Durum</div>
                                  <div className="text-white">{vehicle.condition}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-[#141414] rounded-xl p-4 border border-[#404040]">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-[#404040] text-sm mb-1">Segment</div>
                              <div className="text-white">{order.vehicleSegment}</div>
                            </div>
                            <div>
                              <div className="text-[#404040] text-sm mb-1">Marka</div>
                              <div className="text-white">{order.vehicleBrand}</div>
                            </div>
                            <div>
                              <div className="text-[#404040] text-sm mb-1">Model</div>
                              <div className="text-white">{order.vehicleModel}</div>
                            </div>
                            <div>
                              <div className="text-[#404040] text-sm mb-1">Yıl</div>
                              <div className="text-white">{order.vehicleYear}</div>
                            </div>
                            <div>
                              <div className="text-[#404040] text-sm mb-1">Plaka</div>
                              <div className="text-white font-mono">{order.vehiclePlate}</div>
                            </div>
                            <div>
                              <div className="text-[#404040] text-sm mb-1">Durum</div>
                              <div className="text-white">{order.vehicleCondition}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-[#404040] text-sm mb-2">Müşteri Bilgileri</div>
                      <div className="bg-[#141414] rounded-xl p-4 border border-[#404040]">
                        {order.companyName ? (
                          <>
                            <div className="text-white font-medium mb-2">{order.companyName}</div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-[#404040] text-sm mb-1">Vergi No</div>
                                <div className="text-white">{order.taxNumber}</div>
                              </div>
                              <div>
                                <div className="text-[#404040] text-sm mb-1">Vergi Dairesi</div>
                                <div className="text-white">{order.taxOffice}</div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="text-white font-medium">{order.customerName} {order.customerSurname}</div>
                        )}
                        <div className="mt-2 text-white">{order.customerPhone}</div>
                        {order.customerEmail && (
                          <div className="text-white">{order.customerEmail}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 