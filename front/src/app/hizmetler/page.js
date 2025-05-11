'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'

export default function Services() {
  const services = [
    {
      title: 'Yol Yardım',
      description: 'Aracınız yolda kaldığında 7/24 yanınızdayız. Profesyonel ekibimiz ve modern ekipmanlarımızla hızlı ve güvenilir yol yardım hizmeti sunuyoruz.',
      image: '/images/yol-yardim.jpg',
      features: [
        '7/24 Acil Yol Yardım',
        'Hızlı Müdahale',
        'Profesyonel Ekip',
        'Uygun Fiyat'
      ]
    },
    {
      title: 'Çekici Hizmeti',
      description: 'Aracınızı güvenle istediğiniz yere taşıyoruz. Modern çekici filomuz ve uzman ekibimizle profesyonel çekici hizmeti sunuyoruz.',
      image: '/images/cekici.jpg',
      features: [
        'Şehirler Arası Çekici',
        'Güvenli Taşıma',
        'Sigortalı Hizmet',
        'Uygun Fiyat'
      ]
    },
    {
      title: 'Lastik Yardım',
      description: 'Lastik değişimi ve tamir hizmetleri ile yolda kalmayın. Profesyonel ekibimiz ve modern ekipmanlarımızla lastik yardım hizmeti sunuyoruz.',
      image: '/images/lastik-yardim.jpg',
      features: [
        'Lastik Değişimi',
        'Lastik Tamiri',
        'Yol Yardım',
        '7/24 Hizmet'
      ]
    },
    {
      title: 'Akü Yardım',
      description: 'Akü problemi yaşadığınızda yanınızdayız. Profesyonel ekibimiz ve modern ekipmanlarımızla akü yardım hizmeti sunuyoruz.',
      image: '/images/aku-yardim.jpg',
      features: [
        'Akü Takviye',
        'Akü Değişimi',
        'Hızlı Müdahale',
        '7/24 Hizmet'
      ]
    }
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        {/* Hero Section */}
        <section className="relative h-[40vh] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/services-hero.jpg"
              alt="Hizmetler"
              fill
              className="object-cover brightness-50"
              priority
            />
          </div>
          <div className="relative z-10 text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Hizmetlerimiz</h1>
            <p className="text-lg md:text-xl">Profesyonel çözümler için yanınızdayız</p>
          </div>
        </section>

        {/* Hizmetler Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {services.map((service, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="relative h-64">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">{service.title}</h2>
                    <p className="text-gray-600 mb-6">{service.description}</p>
                    <ul className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-gray-600">
                          <svg className="w-5 h-5 text-blue-800 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6">
                      <a
                        href="tel:+905XXXXXXXXX"
                        className="inline-block bg-blue-800 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-900 transition-colors"
                      >
                        Hemen Ara
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-blue-800">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl font-bold mb-6">Yardıma mı ihtiyacınız var?</h2>
            <p className="text-xl mb-8">7/24 hizmetinizdeyiz. Hemen arayın!</p>
            <a 
              href="tel:+905XXXXXXXXX" 
              className="inline-block bg-white text-blue-800 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors"
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