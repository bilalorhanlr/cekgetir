'use client'

import { useState } from 'react'
import axios from 'axios'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function PnrSorgula() {
  const [pnr, setPnr] = useState('')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setOrder(null)

    try {
      const response = await axios.get(`/order/${pnr}`)
      setOrder(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Sipariş bulunamadı')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#141414] py-12 px-4 sm:px-6 lg:px-8">
      <Navbar />
      
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-8">PNR Sorgulama</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="pnr" className="block text-sm font-medium text-[#404040] mb-2">
              PNR Numarası
            </label>
            <input
              type="text"
              id="pnr"
              value={pnr}
              onChange={(e) => setPnr(e.target.value)}
              className="w-full px-4 py-3 bg-[#202020] border border-[#404040] rounded-lg text-white placeholder-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="PNR numaranızı girin"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sorgulanıyor...' : 'Sorgula'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
            {error}
          </div>
        )}

        {order && (
          <div className="mt-8 space-y-6">
            <div className="bg-[#202020] rounded-lg p-6 border border-[#404040]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Sipariş Detayları</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.status === 'onaylandi' ? 'bg-green-500/20 text-green-500' :
                  order.status === 'beklemede' ? 'bg-yellow-500/20 text-yellow-500' :
                  order.status === 'iptal' ? 'bg-red-500/20 text-red-500' :
                  'bg-blue-500/20 text-blue-500'
                }`}>
                  {order.status === 'onaylandi' ? 'Onaylandı' :
                   order.status === 'beklemede' ? 'Beklemede' :
                   order.status === 'iptal' ? 'İptal' :
                   'Tamamlandı'}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-[#404040] text-sm mb-1">PNR</div>
                  <div className="text-white font-medium">{order.pnr}</div>
                </div>

                <div>
                  <div className="text-[#404040] text-sm mb-1">Araç Bilgileri</div>
                  {order.vehicles.map((vehicle, index) => (
                    <div key={index} className="text-white font-medium">
                      {vehicle.marka} {vehicle.model} ({vehicle.yil}) - {vehicle.plaka}
                    </div>
                  ))}
                </div>

                <div>
                  <div className="text-[#404040] text-sm mb-1">Konum</div>
                  <div className="text-white font-medium">
                    {order.pickupCity} → {order.deliveryCity}
                  </div>
                </div>

                <div>
                  <div className="text-[#404040] text-sm mb-1">Müşteri Bilgileri</div>
                  <div className="text-white font-medium">
                    {order.customerInfo.musteriTipi === 'kisisel' ? (
                      <>
                        {order.customerInfo.ad} {order.customerInfo.soyad}
                      </>
                    ) : (
                      order.customerInfo.firmaAdi
                    )}
                  </div>
                  <div className="text-white font-medium">{order.customerInfo.telefon}</div>
                  <div className="text-white font-medium">{order.customerInfo.email}</div>
                </div>

                <div>
                  <div className="text-[#404040] text-sm mb-1">Tutar</div>
                  <div className="text-2xl font-bold text-yellow-500">
                    {order.price.toLocaleString('tr-TR')} TL
                  </div>
                </div>

                <div>
                  <div className="text-[#404040] text-sm mb-1">Sipariş Tarihi</div>
                  <div className="text-white font-medium">
                    {new Date(order.createdAt).toLocaleString('tr-TR')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
} 