'use client'

import { useState, useEffect } from 'react'
import AdminNavbar from '@/components/adminNavbar'
import api from '@/utils/axios'

export default function ValuesPage() {
  const [variables, setVariables] = useState({
    topluCekici: {
      sehirler: [],
      fiyatlandirma: {
        baseUcret: 2000,
        kmBasiUcret: 10,
        ozelCekiciUcreti: {},
        segmentler: {},
        aracSayisiKatsayisi: {}
      }
    },
    ortak: {
      aracMarkalari: [],
      aracModelleri: {},
      segmentler: []
    },
    yolYardim: {
      arizaTipleri: [],
      fiyatlandirma: {
        arizaTiplerineGore: {},
        kmBasiUcret: 15,
        geceUcreti: 2,
        geceBaslangic: "21:00",
        geceBitis: "08:00",
        merkezKonum: {
          lat: 40.9877,
          lng: 29.1267,
          address: ""
        }
      }
    },
    ozelCekici: {
      fiyatlandirma: {
        baseUcret: 500,
        kmBasiUcret: 5,
        segmentler: {},
        aracSayisiKatsayisi: {}
      }
    }
  })

  useEffect(() => {
    fetchVariables()
  }, [])

  const fetchVariables = async () => {
    try {
      const [topluCekiciRes, ozelCekiciRes, yolYardimRes] = await Promise.all([
        api.get('/api/variables/toplu-cekici/all'),
        api.get('/api/variables/ozel-cekici/all'),
        api.get('/api/variables/yol-yardim/all')
      ])

      setVariables({
        topluCekici: topluCekiciRes.data,
        ozelCekici: ozelCekiciRes.data,
        yolYardim: yolYardimRes.data
      })
    } catch (error) {
      console.error('Error fetching variables:', error)
    }
  }

  const handleSave = async () => {
    try {
      await Promise.all([
        api.post('/api/variables/toplu-cekici', variables.topluCekici),
        api.post('/api/variables/ozel-cekici', variables.ozelCekici),
        api.post('/api/variables/yol-yardim', variables.yolYardim)
      ])
      alert('Değişkenler başarıyla kaydedildi!')
    } catch (error) {
      console.error('Error saving variables:', error)
      alert('Değişkenler kaydedilirken bir hata oluştu!')
    }
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      <AdminNavbar />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h1 className="text-2xl font-bold text-white">Değişkenler</h1>
            <button
              onClick={handleSave}
              className="w-full sm:w-auto bg-[#404040] text-white px-4 py-2 rounded-lg hover:bg-[#505050] transition-colors duration-200"
            >
              Kaydet
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
            {/* Toplu Çekici */}
            <div className="bg-[#202020] rounded-xl p-4 sm:p-6">
              <h2 className="text-xl font-bold text-white mb-4">Toplu Çekici</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Base Ücret</label>
                  <input
                    type="number"
                    value={variables.topluCekici.fiyatlandirma.baseUcret}
                    onChange={(e) => setVariables(prev => ({
                      ...prev,
                      topluCekici: {
                        ...prev.topluCekici,
                        fiyatlandirma: {
                          ...prev.topluCekici.fiyatlandirma,
                          baseUcret: Number(e.target.value)
                        }
                      }
                    }))}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#404040] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#404040]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">KM Başı Ücret</label>
                  <input
                    type="number"
                    value={variables.topluCekici.fiyatlandirma.kmBasiUcret}
                    onChange={(e) => setVariables(prev => ({
                      ...prev,
                      topluCekici: {
                        ...prev.topluCekici,
                        fiyatlandirma: {
                          ...prev.topluCekici.fiyatlandirma,
                          kmBasiUcret: Number(e.target.value)
                        }
                      }
                    }))}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#404040] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#404040]"
                  />
                </div>
              </div>
            </div>

            {/* Özel Çekici */}
            <div className="bg-[#202020] rounded-xl p-4 sm:p-6">
              <h2 className="text-xl font-bold text-white mb-4">Özel Çekici</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Base Ücret</label>
                  <input
                    type="number"
                    value={variables.ozelCekici.fiyatlandirma.baseUcret}
                    onChange={(e) => setVariables(prev => ({
                      ...prev,
                      ozelCekici: {
                        ...prev.ozelCekici,
                        fiyatlandirma: {
                          ...prev.ozelCekici.fiyatlandirma,
                          baseUcret: Number(e.target.value)
                        }
                      }
                    }))}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#404040] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#404040]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">KM Başı Ücret</label>
                  <input
                    type="number"
                    value={variables.ozelCekici.fiyatlandirma.kmBasiUcret}
                    onChange={(e) => setVariables(prev => ({
                      ...prev,
                      ozelCekici: {
                        ...prev.ozelCekici,
                        fiyatlandirma: {
                          ...prev.ozelCekici.fiyatlandirma,
                          kmBasiUcret: Number(e.target.value)
                        }
                      }
                    }))}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#404040] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#404040]"
                  />
                </div>
              </div>
            </div>

            {/* Yol Yardım */}
            <div className="bg-[#202020] rounded-xl p-4 sm:p-6 lg:col-span-2">
              <h2 className="text-xl font-bold text-white mb-4">Yol Yardım</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">KM Başı Ücret</label>
                  <input
                    type="number"
                    value={variables.yolYardim.fiyatlandirma.kmBasiUcret}
                    onChange={(e) => setVariables(prev => ({
                      ...prev,
                      yolYardim: {
                        ...prev.yolYardim,
                        fiyatlandirma: {
                          ...prev.yolYardim.fiyatlandirma,
                          kmBasiUcret: Number(e.target.value)
                        }
                      }
                    }))}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#404040] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#404040]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Gece Ücreti</label>
                  <input
                    type="number"
                    value={variables.yolYardim.fiyatlandirma.geceUcreti}
                    onChange={(e) => setVariables(prev => ({
                      ...prev,
                      yolYardim: {
                        ...prev.yolYardim,
                        fiyatlandirma: {
                          ...prev.yolYardim.fiyatlandirma,
                          geceUcreti: Number(e.target.value)
                        }
                      }
                    }))}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#404040] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#404040]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Gece Başlangıç</label>
                  <input
                    type="time"
                    value={variables.yolYardim.fiyatlandirma.geceBaslangic}
                    onChange={(e) => setVariables(prev => ({
                      ...prev,
                      yolYardim: {
                        ...prev.yolYardim,
                        fiyatlandirma: {
                          ...prev.yolYardim.fiyatlandirma,
                          geceBaslangic: e.target.value
                        }
                      }
                    }))}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#404040] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#404040]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Gece Bitiş</label>
                  <input
                    type="time"
                    value={variables.yolYardim.fiyatlandirma.geceBitis}
                    onChange={(e) => setVariables(prev => ({
                      ...prev,
                      yolYardim: {
                        ...prev.yolYardim,
                        fiyatlandirma: {
                          ...prev.yolYardim.fiyatlandirma,
                          geceBitis: e.target.value
                        }
                      }
                    }))}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#404040] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#404040]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 