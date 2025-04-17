'use client'

import { useEffect } from 'react'
import Image from 'next/image'

export default function Error({
  error,
  reset,
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#191919] flex items-center justify-center p-4">
      <div className="text-center space-y-4 md:space-y-6">
        <div className="w-32 h-32 md:w-48 md:h-48 mx-auto mb-4 md:mb-8 opacity-50">
          <Image
            src="/images/flow360.webp"
            alt="Flow360"
            width={1000}
            height={1000}
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-red-500 druk-font">Hata!</h1>
        <h2 className="text-xl md:text-2xl text-white druk-font">Bir şeyler yanlış gitti</h2>
        <p className="text-sm md:text-base text-white/70 max-w-md mx-auto">
          {error?.message || 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.'}
        </p>
        <div className="pt-2 md:pt-4 space-x-2 md:space-x-4">
          <button
            onClick={() => reset()}
            className="inline-block px-4 md:px-6 py-2 md:py-3 bg-mysari text-black rounded-lg hover:bg-mysari/90 transition-colors druk-font text-sm md:text-base"
          >
            Tekrar Dene
          </button>
          <a 
            href="/"
            className="inline-block px-4 md:px-6 py-2 md:py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors druk-font text-sm md:text-base"
          >
            Ana Sayfaya Dön
          </a>
        </div>
      </div>
    </div>
  )
} 