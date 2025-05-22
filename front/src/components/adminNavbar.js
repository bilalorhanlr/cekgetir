'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export default function AdminNavbar() {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/admin/login')
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const navLinks = [
    { href: '/admin/panel/values', label: 'Değişkenler' },
    { href: '/admin/panel/orders', label: 'Siparişler' },
    { href: '/admin/panel/faq', label: 'SSS' },
    { href: '/admin/panel/contact', label: 'İletişim' }
  ]

  return (
    <div className="bg-[#202020] border-b border-[#404040] fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex items-center">
              <Image
                src="/images/logo.png"
                alt="Çekgetir Logo"
                width={32}
                height={32}
                className="w-6 h-6 sm:w-8 sm:h-8"
                priority
              />
              <span className="ml-2 text-lg sm:text-xl font-bold text-white">Cekgetir</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="bg-[#404040] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#505050] transition-colors duration-200 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Çıkış Yap
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-300 hover:text-white p-2 rounded-md"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-[#303030]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  handleLogout()
                }}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-[#303030] flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Çıkış Yap
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
