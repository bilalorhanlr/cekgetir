'use client'

// Eğer React Icons kullanacaksan:
import { FaInstagram, FaXTwitter, FaTiktok, FaYoutube } from 'react-icons/fa6'
// Logo olarak resim kullanacaksan:
import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo ve İletişim */}
          <div className="col-span-1">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/images/logo.png"
                  alt="Çekgetir Logo"
                  width={40}
                  height={40}
                  className="w-auto h-8"
                />
                <span className="text-xl font-bold text-yellow-400">Çekgetir</span>
              </Link>
            </div>
            <p className="mt-4 text-gray-400">
              7/24 profesyonel oto kurtarma ve yol yardım hizmetleri sunuyoruz.
            </p>
            <div className="mt-4 space-y-2">
              <a
                href="tel:+905XXXXXXXXX"
                className="flex items-center text-gray-400 hover:text-yellow-400"
              >
                <svg
                  className="h-5 w-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                +90 5XX XXX XX XX
              </a>
              <a
                href="mailto:info@cekgetir.com"
                className="flex items-center text-gray-400 hover:text-yellow-400"
              >
                <svg
                  className="h-5 w-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                info@cekgetir.com
              </a>
            </div>
          </div>

          {/* Hızlı Linkler */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-yellow-400">Hızlı Linkler</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-yellow-400">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link href="/hizmetler" className="text-gray-400 hover:text-yellow-400">
                  Hizmetler
                </Link>
              </li>
              <li>
                <Link href="/hakkimizda" className="text-gray-400 hover:text-yellow-400">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="text-gray-400 hover:text-yellow-400">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* Hizmetler */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-yellow-400">Hizmetlerimiz</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/hizmetler#yol-yardim" className="text-gray-400 hover:text-yellow-400">
                  Yol Yardım
                </Link>
              </li>
              <li>
                <Link href="/hizmetler#oto-cekici" className="text-gray-400 hover:text-yellow-400">
                  Oto Çekici
                </Link>
              </li>
              <li>
                <Link href="/hizmetler#lastik-yardim" className="text-gray-400 hover:text-yellow-400">
                  Lastik Yardım
                </Link>
              </li>
              <li>
                <Link href="/hizmetler#aku-yardim" className="text-gray-400 hover:text-yellow-400">
                  Akü Yardım
                </Link>
              </li>
            </ul>
          </div>

          {/* Çalışma Saatleri */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-yellow-400">Çalışma Saatleri</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Pazartesi - Cuma: 7/24</li>
              <li>Cumartesi: 7/24</li>
              <li>Pazar: 7/24</li>
            </ul>
          </div>
        </div>

        {/* Alt Footer */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Çekgetir. Tüm hakları saklıdır.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-yellow-400">
                <span className="sr-only">Instagram</span>
                <FaInstagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-400">
                <span className="sr-only">Twitter</span>
                <FaXTwitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-400">
                <span className="sr-only">TikTok</span>
                <FaTiktok className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
