'use client'

import { useState, useEffect } from 'react'
import AdminNavbar from '@/components/adminNavbar'
import api from '@/utils/axios'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await api.get('/api/orders')
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      <AdminNavbar />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-white mb-8">Siparişler</h1>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
              <p className="mt-4 text-gray-400">Yükleniyor...</p>
            </div>
          ) : (
            <div className="bg-[#202020] rounded-xl p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-[#404040]">
                      <th className="pb-4">Sipariş No</th>
                      <th className="pb-4">Müşteri</th>
                      <th className="pb-4">Tarih</th>
                      <th className="pb-4">Durum</th>
                      <th className="pb-4">Tutar</th>
                      <th className="pb-4">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-[#404040]">
                        <td className="py-4 text-white">{order.id}</td>
                        <td className="py-4 text-white">{order.customerName}</td>
                        <td className="py-4 text-white">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                            order.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                            'bg-red-500/20 text-red-500'
                          }`}>
                            {order.status === 'pending' ? 'Beklemede' :
                             order.status === 'completed' ? 'Tamamlandı' :
                             'İptal Edildi'}
                          </span>
                        </td>
                        <td className="py-4 text-white">{order.total} TL</td>
                        <td className="py-4">
                          <button className="text-blue-500 hover:text-blue-400 mr-2">
                            Detay
                          </button>
                          <button className="text-red-500 hover:text-red-400">
                            İptal
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}