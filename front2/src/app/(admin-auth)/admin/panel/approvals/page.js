'use client'

import { useState, useEffect } from 'react'
import AdminNavbar from '@/components/adminNavbar'
import api from '@/utils/axios'

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApprovals()
  }, [])

  const fetchApprovals = async () => {
    try {
      const response = await api.get('/api/approvals')
      setApprovals(response.data)
    } catch (error) {
      console.error('Error fetching approvals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      await api.post(`/api/approvals/${id}/approve`)
      fetchApprovals()
    } catch (error) {
      console.error('Error approving:', error)
    }
  }

  const handleReject = async (id) => {
    try {
      await api.post(`/api/approvals/${id}/reject`)
      fetchApprovals()
    } catch (error) {
      console.error('Error rejecting:', error)
    }
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      <AdminNavbar />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-white mb-8">Onay/Red Yönetimi</h1>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
              <p className="mt-4 text-gray-400">Yükleniyor...</p>
            </div>
          ) : (
            <div className="bg-[#202020] rounded-xl p-4 sm:p-6">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-[#404040]">
                      <th className="pb-4 px-2 sm:px-4">ID</th>
                      <th className="pb-4 px-2 sm:px-4">Başvuru Tipi</th>
                      <th className="pb-4 px-2 sm:px-4">Başvuran</th>
                      <th className="pb-4 px-2 sm:px-4">Tarih</th>
                      <th className="pb-4 px-2 sm:px-4">Durum</th>
                      <th className="pb-4 px-2 sm:px-4">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvals.map((approval) => (
                      <tr key={approval.id} className="border-b border-[#404040]">
                        <td className="py-4 px-2 sm:px-4 text-white">{approval.id}</td>
                        <td className="py-4 px-2 sm:px-4 text-white">{approval.type}</td>
                        <td className="py-4 px-2 sm:px-4 text-white">{approval.applicantName}</td>
                        <td className="py-4 px-2 sm:px-4 text-white">{new Date(approval.createdAt).toLocaleDateString('tr-TR')}</td>
                        <td className="py-4 px-2 sm:px-4">
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            approval.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                            approval.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                            'bg-red-500/20 text-red-500'
                          }`}>
                            {approval.status === 'pending' ? 'Beklemede' :
                             approval.status === 'approved' ? 'Onaylandı' :
                             'Reddedildi'}
                          </span>
                        </td>
                        <td className="py-4 px-2 sm:px-4">
                          {approval.status === 'pending' && (
                            <div className="flex flex-col sm:flex-row gap-2">
                              <button
                                onClick={() => handleApprove(approval.id)}
                                className="text-green-500 hover:text-green-400"
                              >
                                Onayla
                              </button>
                              <button
                                onClick={() => handleReject(approval.id)}
                                className="text-red-500 hover:text-red-400"
                              >
                                Reddet
                              </button>
                            </div>
                          )}
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