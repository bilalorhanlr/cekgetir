import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#191919] flex items-center justify-center p-4">
      <div className="text-center space-y-4 md:space-y-6">
        <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 md:mb-8 opacity-50">
          <Image
            src="/images/flow360.webp"
            alt="Flow360"
            width={96}
            height={96}
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-mysari druk-font">404</h1>
        <h2 className="text-xl md:text-2xl text-white druk-font">Sayfa Bulunamadı</h2>
        <p className="text-sm md:text-base text-white/70 max-w-md mx-auto">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <div className="pt-2 md:pt-4">
          <Link 
            href="/"
            className="inline-block px-4 md:px-6 py-2 md:py-3 bg-mysari text-black rounded-lg hover:bg-mysari/90 transition-colors druk-font text-sm md:text-base"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  )
} 