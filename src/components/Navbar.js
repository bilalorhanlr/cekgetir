'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-black/90 backdrop-blur-md py-6' : 'bg-transparent py-8'
    }`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/logo.png"
              alt="Çekgetir Logo"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="text-2xl font-bold text-yellow-400">Çekgetir</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className={`text-lg font-medium transition-colors ${
                pathname === '/' ? 'text-yellow-400' : 'text-white hover:text-yellow-400'
              }`}
            >
              Ana Sayfa
            </Link>
            <Link 
              href="/#hizmetler" 
              className="text-lg font-medium text-white hover:text-yellow-400 transition-colors"
            >
              Hizmetler
            </Link>
            <Link 
              href="/sss" 
              className={`text-lg font-medium transition-colors ${
                pathname === '/sss' ? 'text-yellow-400' : 'text-white hover:text-yellow-400'
              }`}
            >
              SSS
            </Link>
            <Link 
              href="/iletisim" 
              className={`text-lg font-medium transition-colors ${
                pathname === '/iletisim' ? 'text-yellow-400' : 'text-white hover:text-yellow-400'
              }`}
            >
              İletişim
            </Link>
            <div className="flex items-center space-x-4">
              <a 
                href="tel:+905445931640" 
                className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Hemen Ara
              </a>
              <a 
                href="https://wa.me/905445931640" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#1EA952] transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <Link 
              href="/" 
              className={`block text-lg font-medium transition-colors ${
                pathname === '/' ? 'text-yellow-400' : 'text-white hover:text-yellow-400'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Ana Sayfa
            </Link>
            <Link 
              href="/#hizmetler" 
              className="block text-lg font-medium text-white hover:text-yellow-400 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Hizmetler
            </Link>
            <Link 
              href="/sss" 
              className={`block text-lg font-medium transition-colors ${
                pathname === '/sss' ? 'text-yellow-400' : 'text-white hover:text-yellow-400'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              SSS
            </Link>
            <Link 
              href="/iletisim" 
              className={`block text-lg font-medium transition-colors ${
                pathname === '/iletisim' ? 'text-yellow-400' : 'text-white hover:text-yellow-400'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              İletişim
            </Link>
            <div className="flex flex-col space-y-4 pt-4">
              <a 
                href="tel:+905445931640" 
                className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Hemen Ara
              </a>
              <a 
                href="https://wa.me/905445931640" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#1EA952] transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}