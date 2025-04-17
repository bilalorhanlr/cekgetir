'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'

export default function FAQ() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-20">
        {/* Hero Section */}
        <section className="relative h-[40vh] flex items-center">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/home.jpeg"
              alt="Çekgetir SSS"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-l from-black/95 via-black/75 to-black/30"></div>
          </div>
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Sıkça Sorulan Sorular</h1>
            <p className="text-xl text-gray-300">Merak ettiğiniz tüm soruların cevapları burada</p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Hizmet bölgeniz neresi?</h3>
                <p className="text-gray-600">İstanbul'un tüm ilçelerinde hizmet vermekteyiz. Avrupa ve Anadolu yakasında 7/24 yol yardım hizmeti sunuyoruz.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Ne kadar sürede ulaşıyorsunuz?</h3>
                <p className="text-gray-600">Ortalama 30-45 dakika içinde olay yerine ulaşıyoruz. Trafik durumuna göre bu süre değişebilir.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Ödeme yöntemleri nelerdir?</h3>
                <p className="text-gray-600">Nakit, kredi kartı ve havale/EFT ile ödeme yapabilirsiniz. Fatura ve fiş hizmetimiz mevcuttur.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Hangi araçlara hizmet veriyorsunuz?</h3>
                <p className="text-gray-600">Otomobil, SUV, minibüs, kamyonet, kamyon, tır ve iş makineleri dahil tüm araçlara hizmet veriyoruz.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Sigorta anlaşmanız var mı?</h3>
                <p className="text-gray-600">Tüm büyük sigorta şirketleriyle anlaşmalıyız. Sigortalı araçlar için ekstra ücret talep etmiyoruz.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Acil durumlarda ne yapmalıyım?</h3>
                <p className="text-gray-600">Hemen bizi arayın: +90 544 593 16 40. Konumunuzu paylaşın, en kısa sürede yanınızda olacağız.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Çoklu araç çekme hizmetiniz var mı?</h3>
                <p className="text-gray-600">Evet, aynı anda birden fazla aracı çekebiliyoruz. Her ek araç için özel fiyatlandırma yapıyoruz.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Otopark teslim hizmetiniz var mı?</h3>
                <p className="text-gray-600">Evet, aracınızı otoparktan teslim alıp, istediğiniz otoparka teslim edebiliyoruz. Bu hizmet için ek ücret alınmaktadır.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-yellow-400">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-black">Başka sorunuz var mı?</h2>
            <p className="text-xl mb-8 text-black/80">7/24 yanınızdayız!</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:+905445931640" 
                className="inline-block bg-black text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +90 544 593 16 40
              </a>
              <a 
                href="https://wa.me/905445931640" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#25D366] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-[#1EA952] transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
} 