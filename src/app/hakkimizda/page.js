'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'

export default function About() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative h-[40vh] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/about-hero.jpg"
              alt="Çekgetir Hakkımızda"
              fill
              className="object-cover brightness-50"
              priority
            />
          </div>
          <div className="relative z-10 text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Hakkımızda</h1>
            <p className="text-lg md:text-xl">20 yıllık tecrübemizle tüm yol yardım hizmetlerinde yanınızdayız</p>
          </div>
        </section>

        {/* İçerik Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-black">Biz Kimiz?</h2>
                <p className="text-gray-600 mb-6">
                  Çekgetir olarak, 20 yılı aşkın süredir İstanbul'da kapsamlı yol yardım hizmetleri sunuyoruz. 
                  Çekici hizmetinden lastik değişimine, akü takviyesinden yakıt ikmaline kadar tüm yol yardım 
                  ihtiyaçlarınızda profesyonel ekibimiz ve modern araç filomuzla yanınızdayız.
                </p>
                <p className="text-gray-600">
                  Müşteri memnuniyeti odaklı çalışma prensibimiz ve kaliteli hizmet anlayışımızla, 
                  sektörde güvenilir bir marka olmayı başardık. 7/24 hizmet veren ekibimiz, 
                  her türlü acil durumda en hızlı şekilde yanınızda olmaya devam edecektir.
                </p>
              </div>
              <div className="relative h-80 rounded-lg overflow-hidden shadow-lg">
                <Image
                  src="/images/about-team.jpg"
                  alt="Çekgetir Ekibi"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="relative h-80 rounded-lg overflow-hidden shadow-lg order-2 md:order-1">
                <Image
                  src="/images/about-mission.jpg"
                  alt="Çekgetir Misyonu"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="order-1 md:order-2">
                <h2 className="text-3xl font-bold mb-6 text-black">Misyonumuz</h2>
                <p className="text-gray-600 mb-6">
                  Çekgetir olarak misyonumuz, müşterilerimize en hızlı ve güvenilir yol yardım hizmetlerini sunmaktır. 
                  Modern ekipmanlarımız ve uzman personelimizle, çekici hizmetinden lastik değişimine, akü takviyesinden 
                  yakıt ikmaline kadar tüm yol yardım hizmetlerinde yanınızdayız.
                </p>
                <p className="text-gray-600">
                  Müşteri memnuniyetini her şeyin üstünde tutarak, sektörde öncü ve güvenilir bir marka olmaya devam ediyoruz. 
                  Kaliteli hizmet anlayışımız ve profesyonel yaklaşımımızla, müşterilerimizin güvenini kazanmaya devam ediyoruz.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* İstatistikler */}
        <section className="py-16 px-4 bg-black text-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-yellow-400">Rakamlarla Çekgetir</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 text-yellow-400">20+</div>
                <div className="text-lg text-gray-400">Yıllık Tecrübe</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 text-yellow-400">50+</div>
                <div className="text-lg text-gray-400">Araç Filosu</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 text-yellow-400">100+</div>
                <div className="text-lg text-gray-400">Uzman Personel</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 text-yellow-400">10,000+</div>
                <div className="text-lg text-gray-400">Mutlu Müşteri</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-yellow-400">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-black">Yolda mı kaldınız?</h2>
            <p className="text-xl mb-8 text-black/80">Tüm yol yardım hizmetleri için 7/24 yanınızdayız!</p>
            <a 
              href="tel:+905XXXXXXXXX" 
              className="inline-block bg-black text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-900 transition-colors"
            >
              +90 5XX XXX XX XX
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
} 