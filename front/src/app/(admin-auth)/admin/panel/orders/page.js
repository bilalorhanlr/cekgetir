'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminNavbar from '@/components/adminNavbar'
import api from '@/utils/axios'

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('api/orders')
      console.log('Siparişler yüklendi:', response.data)
      setOrders(response.data)
    } catch (error) {
      console.error('Siparişler yüklenirken hata oluştu:', error)
      setError('Siparişler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true)
      await api.patch(`api/orders/${orderId}`, { status: newStatus })
      await fetchOrders()
    } catch (error) {
      console.error('Durum güncellenirken hata:', error)
      alert('Durum güncellenirken bir hata oluştu')
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
      'ODENECEK': { text: 'Ödenecek', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50' }
    }

    const config = statusConfig[status] || statusConfig['ODENECEK']
    return (
      <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${config.color}`}>
        {config.text}
      </span>
    )
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.pnrNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${order.customerName} ${order.customerSurname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm) ||
      order.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-[#141414]">
      <AdminNavbar />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Siparişler</h1>
              <p className="text-gray-400 mt-1">Toplam {filteredOrders.length} sipariş</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <input
                  type="text"
                  placeholder="PNR, Müşteri veya Plaka ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 px-4 py-2.5 bg-[#202020] text-white rounded-lg border border-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                />
                <svg className="w-5 h-5 text-gray-400 absolute right-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#202020] text-white rounded-lg border border-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
              >
                <option value="ALL">Tüm Durumlar</option>
                <option value="PENDING">Beklemede</option>
                <option value="ACCEPTED">Onaylandı</option>
                <option value="IN_PROGRESS">İşlemde</option>
                <option value="COMPLETED">Tamamlandı</option>
                <option value="CANCELLED">İptal Edildi</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
              <p className="mt-4 text-gray-400">Siparişler yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">{error}</div>
              <button 
                onClick={fetchOrders}
                className="px-6 py-2.5 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-all font-medium"
              >
                Tekrar Dene
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">Sipariş bulunamadı</div>
              <button 
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('ALL')
                }}
                className="px-6 py-2.5 bg-[#202020] text-white rounded-lg hover:bg-[#2a2a2a] transition-all font-medium"
              >
                Filtreleri Temizle
              </button>
            </div>
          ) : (
            <div className="bg-[#202020] rounded-xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-[#404040]">
                      <th className="px-6 py-4 font-medium whitespace-nowrap">PNR</th>
                      <th className="px-6 py-4 font-medium whitespace-nowrap">Müşteri</th>
                      <th className="px-6 py-4 font-medium whitespace-nowrap">Hizmet</th>
                      <th className="px-6 py-4 font-medium whitespace-nowrap">Araç</th>
                      <th className="px-6 py-4 font-medium whitespace-nowrap">Tarih</th>
                      <th className="px-6 py-4 font-medium whitespace-nowrap">Durum</th>
                      <th className="px-6 py-4 font-medium whitespace-nowrap">Ödeme</th>
                      <th className="px-6 py-4 font-medium whitespace-nowrap">Tutar</th>
                      <th className="px-6 py-4 font-medium whitespace-nowrap">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b border-[#404040] hover:bg-[#2a2a2a] transition-all">
                        <td className="px-6 py-4">
                          <span className="font-mono text-white">{order.pnrNo}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-white font-medium">
                            {order.customerName} {order.customerSurname}
                          </div>
                          <div className="text-sm text-gray-400">
                            {order.customerPhone}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-white">
                            {order.serviceType === 'YOL_YARDIM' ? 'Yol Yardım' :
                             order.serviceType === 'OZEL_CEKICI' ? 'Özel Çekici' :
                             'Toplu Çekici'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-white font-medium">
                            {order.vehicleBrand} {order.vehicleModel}
                          </div>
                          <div className="text-sm text-gray-400">
                            {order.vehiclePlate}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-white whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-6 py-4">
                          {getPaymentStatusBadge(order.paymentStatus)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white font-medium">
                            {order.price.toLocaleString('tr-TR')} TL
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button 
                              className="px-3 py-1.5 bg-blue-500/20 text-blue-500 rounded-lg hover:bg-blue-500/30 transition-all font-medium"
                              onClick={() => router.push(`/admin/panel/orders/${order.id}`)}
                            >
                              Detay
                            </button>
                            {order.status === 'PENDING' && (
                              <button 
                                className="px-3 py-1.5 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-all font-medium"
                                onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                              >
                                İptal
                              </button>
                            )}
                          </div>
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