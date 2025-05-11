'use client'

import { useState, useEffect } from 'react'

export default function Notification() {
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    const handleNotification = (event) => {
      setNotification(event.detail)
      setTimeout(() => setNotification(null), 5000) // 5 saniye sonra kapat
    }

    window.addEventListener('showNotification', handleNotification)
    return () => window.removeEventListener('showNotification', handleNotification)
  }, [])

  if (!notification) return null

  return (
    <div className="fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md w-full 
      ${notification.type === 'success' ? 'bg-[#222222] border border-green-500' : 'bg-[#222222] border border-red-500'}">
      <div className="flex items-start gap-3">
        {notification.type === 'success' ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" 
            className="w-6 h-6 text-green-500 mt-0.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" 
            className="w-6 h-6 text-red-500 mt-0.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        )}
        <div className="flex-1">
          <h3 className={`font-medium ${notification.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
            {notification.type === 'success' ? 'Başarılı!' : 'Hata!'}
          </h3>
          <p className="text-white/60 text-sm">
            {notification.message}
          </p>
        </div>
        <button
          onClick={() => setNotification(null)}
          className="text-white/60 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
} 