'use client'

import { useState, useEffect } from 'react'
import AdminNavbar from '@/components/adminNavbar'
import api from '@/utils/axios'

export default function FAQPage() {
  const [faqs, setFaqs] = useState([])
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' })
  const [editingFaq, setEditingFaq] = useState(null)

  useEffect(() => {
    fetchFaqs()
  }, [])

  const fetchFaqs = async () => {
    try {
      const response = await api.get('/api/faq')
      setFaqs(response.data)
    } catch (error) {
      console.error('Error fetching FAQs:', error)
    }
  }

  const handleCreateFaq = async () => {
    try {
      await api.post('/api/faq', newFaq)
      setNewFaq({ question: '', answer: '' })
      fetchFaqs()
    } catch (error) {
      console.error('Error creating FAQ:', error)
    }
  }

  const handleUpdateFaq = async (id, updatedFaq) => {
    try {
      await api.patch(`/api/faq/${id}`, updatedFaq)
      setEditingFaq(null)
      fetchFaqs()
    } catch (error) {
      console.error('Error updating FAQ:', error)
    }
  }

  const handleDeleteFaq = async (id) => {
    try {
      await api.delete(`/api/faq/${id}`)
      fetchFaqs()
    } catch (error) {
      console.error('Error deleting FAQ:', error)
    }
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      <AdminNavbar />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-white mb-8">SSS Yönetimi</h1>

          {/* Yeni SSS Ekleme Formu */}
          <div className="bg-[#202020] rounded-xl p-4 sm:p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Yeni SSS Ekle</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Soru</label>
                <input
                  type="text"
                  value={newFaq.question}
                  onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                  className="w-full px-3 py-2 bg-[#141414] border border-[#404040] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#404040]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Cevap</label>
                <textarea
                  value={newFaq.answer}
                  onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                  className="w-full px-3 py-2 bg-[#141414] border border-[#404040] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#404040] h-32"
                />
              </div>
              <button
                onClick={handleCreateFaq}
                className="w-full sm:w-auto bg-[#404040] text-white px-4 py-2 rounded-lg hover:bg-[#505050] transition-colors duration-200"
              >
                SSS Ekle
              </button>
            </div>
          </div>

          {/* Mevcut SSS Listesi */}
          <div className="bg-[#202020] rounded-xl p-4 sm:p-6">
            <h2 className="text-xl font-bold text-white mb-4">Mevcut SSS'ler</h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.id} className="bg-[#141414] rounded-lg p-4">
                  {editingFaq?.id === faq.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Soru</label>
                        <input
                          type="text"
                          value={editingFaq.question}
                          onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                          className="w-full px-3 py-2 bg-[#202020] border border-[#404040] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#404040]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Cevap</label>
                        <textarea
                          value={editingFaq.answer}
                          onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                          className="w-full px-3 py-2 bg-[#202020] border border-[#404040] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#404040] h-32"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleUpdateFaq(faq.id, editingFaq)}
                          className="w-full sm:w-auto bg-[#404040] text-white px-4 py-2 rounded-lg hover:bg-[#505050] transition-colors duration-200"
                        >
                          Kaydet
                        </button>
                        <button
                          onClick={() => setEditingFaq(null)}
                          className="w-full sm:w-auto bg-[#303030] text-white px-4 py-2 rounded-lg hover:bg-[#404040] transition-colors duration-200"
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                        <h3 className="text-white font-medium">{faq.question}</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingFaq(faq)}
                            className="text-gray-400 hover:text-blue-500 transition-colors duration-200"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteFaq(faq.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-300">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 