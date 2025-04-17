'use client'

import { Component } from 'react'
import Image from 'next/image'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#191919] flex items-center justify-center p-4">
          <div className="text-center space-y-4 md:space-y-6">
            <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 md:mb-8 opacity-50">
              <Image
                src="/images/cekgetir.webp"
                alt="cekgetir"
                width={96}
                height={96}
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-red-500 druk-font">Oops!</h1>
            <h2 className="text-xl md:text-2xl text-white druk-font">Beklenmeyen Bir Hata</h2>
            <p className="text-sm md:text-base text-white/70 max-w-md mx-auto">
              {this.state.error?.message || 'Bir hata oluştu. Lütfen sayfayı yenileyin.'}
            </p>
            <div className="pt-2 md:pt-4">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                  window.location.reload()
                }}
                className="inline-block px-4 md:px-6 py-2 md:py-3 bg-mysari text-black rounded-lg hover:bg-mysari/90 transition-colors druk-font text-sm md:text-base"
              >
                Sayfayı Yenile
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
} 