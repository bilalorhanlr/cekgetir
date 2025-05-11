'use client'

import { useState, useEffect } from 'react'
import AdminNavbar from '@/components/adminNavbar'
import api from '@/utils/axios'
import { toast } from 'react-hot-toast'

export default function ContactPage() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const response = await api.get('/api/contact')
      setMessages(response.data)
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error('Mesajlar yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Bu mesajı silmek istediğinizden emin misiniz?')) {
      try {
        await api.delete(`/api/contact/${id}`)
        toast.success('Mesaj başarıyla silindi')
        fetchMessages()
      } catch (error) {
        console.error('Error deleting message:', error)
        toast.error('Mesaj silinirken bir hata oluştu')
      }
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/api/contact/${id}/read`)
      toast.success('Mesaj okundu olarak işaretlendi')
      fetchMessages()
    } catch (error) {
      console.error('Error marking message as read:', error)
      toast.error('Mesaj işaretlenirken bir hata oluştu')
    }
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      <AdminNavbar />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-white mb-8">İletişim Mesajları</h1>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
              <p className="mt-4 text-gray-400">Yükleniyor...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="bg-[#202020] rounded-xl p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{message.name}</h3>
                      <p className="text-gray-400 break-all">{message.email}</p>
                      <p className="text-gray-400">{message.phone}</p>
                      <p className="text-gray-400 mt-1">
                        <span className="inline-block px-2 py-1 rounded-full text-xs bg-[#404040] text-gray-300">
                          {message.service}
                        </span>
                      </p>
                    </div>
                    <div className="text-gray-400 text-sm sm:text-base">
                      {new Date(message.createdAt).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                  <p className="text-white mb-4 whitespace-pre-wrap">{message.message}</p>
                  <div className="flex justify-end gap-2">
                    {!message.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(message.id)}
                        className="text-blue-500 hover:text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-500/10 transition-colors duration-200"
                      >
                        Okundu İşaretle
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(message.id)}
                      className="text-red-500 hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors duration-200"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400">Henüz mesaj bulunmuyor</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 