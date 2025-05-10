'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function PanelPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('variables')
  const [variables, setVariables] = useState({
    basePrice: 0,
    pricePerKm: 0,
    minPrice: 0,
    bridgeRestriction: false,
    bridgeRestrictionPrice: 0,
    // Add more variables as needed
  })

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken')
    if (0) {
      router.push('/admin/login')
      return
    }
    // Fetch variables from backend
    fetchVariables()
    setIsLoading(false)
  }, [router])

  const fetchVariables = async () => {
    try {
      const response = await fetch('/api/admin/variables')
      const data = await response.json()
      setVariables(data)
    } catch (error) {
      console.error('Error fetching variables:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/admin/login')
  }

  const handleVariableChange = (e) => {
    const { name, value, type } = e.target
    setVariables(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? e.target.checked : value
    }))
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/admin/variables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(variables),
      })
      if (response.ok) {
        alert('Değişkenler başarıyla kaydedildi!')
      }
    } catch (error) {
      console.error('Error saving variables:', error)
      alert('Değişkenler kaydedilirken bir hata oluştu!')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#191919] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#191919]">
      {/* Header */}
      <div className="bg-[#222222] p-4 md:p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Image
              src="/images/logo.png"
              alt="Çekgetir Logo"
              width={40}
              height={40}
              className="w-10 h-10"
              priority
            />
            <h1 className="text-white text-xl text-yellow-400 font-bold">Cekgetir</h1>
          </div>
          <h1 className="text-white text-xl font-bold text-center">Admin Panel</h1>
          <button
            onClick={handleLogout}
            className="bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg hover:bg-yellow-400/90 transition-colors"
          >
            Çıkış Yap
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="bg-[#222222] rounded-xl p-6 md:p-8 min-h-[calc(100vh-120px)]">
          {/* Tabs */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('variables')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'variables'
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-700 text-white'
              }`}
            >
              Değişkenler
            </button>
            <button
              onClick={() => setActiveTab('calculations')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'calculations'
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-700 text-white'
              }`}
            >
              Hesaplamalar
            </button>
          </div>

          {/* Variables Tab */}
          {activeTab === 'variables' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-white mb-2">Baz Fiyat</label>
                    <input
                      type="number"
                      name="basePrice"
                      value={variables.basePrice}
                      onChange={handleVariableChange}
                      className="w-full p-2 rounded-lg bg-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">Kilometre Başına Fiyat</label>
                    <input
                      type="number"
                      name="pricePerKm"
                      value={variables.pricePerKm}
                      onChange={handleVariableChange}
                      className="w-full p-2 rounded-lg bg-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">Minimum Fiyat</label>
                    <input
                      type="number"
                      name="minPrice"
                      value={variables.minPrice}
                      onChange={handleVariableChange}
                      className="w-full p-2 rounded-lg bg-gray-700 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="bridgeRestriction"
                      checked={variables.bridgeRestriction}
                      onChange={handleVariableChange}
                      className="w-4 h-4"
                    />
                    <label className="text-white">Köprü Kısıtlaması</label>
                  </div>
                  <div>
                    <label className="block text-white mb-2">Köprü Kısıtlaması Fiyatı</label>
                    <input
                      type="number"
                      name="bridgeRestrictionPrice"
                      value={variables.bridgeRestrictionPrice}
                      onChange={handleVariableChange}
                      className="w-full p-2 rounded-lg bg-gray-700 text-white"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={handleSave}
                className="bg-yellow-400 text-black font-bold px-6 py-3 rounded-lg hover:bg-yellow-400/90 transition-colors"
              >
                Değişiklikleri Kaydet
              </button>
            </div>
          )}

          {/* Calculations Tab */}
          {activeTab === 'calculations' && (
            <div className="space-y-6">
              <div className="bg-gray-700 p-6 rounded-lg">
                <h2 className="text-white text-xl font-bold mb-4">Hesaplama Formülü</h2>
                <p className="text-white">
                  Toplam Fiyat = Baz Fiyat + (Mesafe × Kilometre Başına Fiyat)
                </p>
                <p className="text-white mt-2">
                  Eğer Köprü Kısıtlaması varsa: Toplam Fiyat + Köprü Kısıtlaması Fiyatı
                </p>
                <p className="text-white mt-2">
                  Minimum Fiyat kontrolü: Eğer hesaplanan fiyat minimum fiyattan düşükse, minimum fiyat uygulanır.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
