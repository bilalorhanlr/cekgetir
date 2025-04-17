'use client'

import { useEffect, useState } from 'react'

// Auth layout - login ve register sayfaları için ortak layout
export default function AuthLayout({ children }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-black">
      {children}
    </div>
  )
} 