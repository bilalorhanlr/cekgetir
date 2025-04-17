'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: "Araç transferi hizmeti nedir?",
      answer: "Araç transfer hizmeti, şehir içi ve şehirler arası olmak üzere araçların çekicilerimiz vasıtasıyla taşınmasıdır."
    },
    {
      question: "Yol yardım ve çekici hizmetleri hangi illeri kapsıyor?",
      answer: "Acil yol yardım hizmetimiz şu anda sadece İstanbul ili içerisinde, şehirler arası taşıma hizmetimiz ise Türkiye'nin tüm illerinde gerçekleşmektedir."
    },
    {
      question: "Hangi tür araçlara hizmet veriliyor?",
      answer: "Çekicilerimiz binek, suv, çift kabin, minivan ve motosiklet türlerinde taşıma hizmeti vermektedir."
    },
    {
      question: "Hizmet saatleri ve sıklığı nedir?",
      answer: "Şehir içi olarak İstanbul ilinde 7/24 yol yardım hizmeti vermekteyiz. Buna ek olarak şehirler arası transferlerimizde aracınızın gideceği ilin uzaklığı, aracınızın durumu ve taşımaya uygunluğu esas alınarak araç transferlerinin süresi değişkenlik gösterebilmektedir."
    },
    {
      question: "Hizmetleriniz haftanın her günü ve günün her saati aktif mi?",
      answer: "Çekicilerimiz sizlere hizmet edebilmek adına 7/24 çalışmaktadır. Buna ek olarak gece saatlerinde, bayram günlerinde ve resmi tatillerde hizmet süresi değişkenlik gösterebilmektedir."
    },
    {
      question: "Çekici hizmeti ne kadar sürede gelir?",
      answer: "İstanbul içi hizmetlerde, yoğunluğa ve bulunduğunuz konuma bağlı olarak ortalama 30-60 dakika içerisinde ekiplerimiz ulaşmaktadır. Şehirler arası taleplerde ise transfer planlaması yapılarak size uygun tarih ve saat belirlenir."
    },
    {
      question: "Hizmet almadan önce fiyat alabilir miyim?",
      answer: "Elbette. Taşıma yapılacak mesafe, araç tipi ve varsa ekstra taleplerinize göre size net bir fiyat bilgisi sunuyoruz."
    },
    {
      question: "Çekici talebini nasıl iletebilirim?",
      answer: "Web sitemiz üzerinden, WhatsApp hattımızdan ya da telefon numaramız üzerinden yardım talebinde bulunabilirsiniz. Konumunuzu bizimle paylaşmanız, işlemin hızlıca başlamasını sağlar."
    },
    {
      question: "Bozuk veya çalışmayan araçlar da taşınabiliyor mu?",
      answer: "Evet, çalışmayan ya da hasarlı araçlar da çekicilerimiz ile güvenle taşınabilmektedir."
    },
    {
      question: "Uzun mesafeli transferlerde yakıt, köprü ve otoyol ücretleri kime aittir?",
      answer: "Taşıma sırasında oluşabilecek tüm masraflar (köprü, otoyol, feribot vb.) taşıma ücretine dahildir."
    },
    {
      question: "Rezervasyon sistemi var mı?",
      answer: "Evet, özellikle şehirler arası taşımalarda önceden rezervasyon yaptırarak tarih ve saat belirtebilirsiniz. Bu sayede planlamanız kolaylaşır."
    },
    {
      question: "Ödeme yöntemleri nelerdir?",
      answer: "Havale, eft ve nakit ödeme kabul ediyoruz."
    },
    {
      question: "Şehirler arası araç transferleri nasıl gerçekleştiriliyor?",
      answer: "Cekgetir.com, Türkiye genelindeki güvenilir taşıma firmalarıyla oluşturduğu iş birliği ağı sayesinde, şehirler arası transfer taleplerinizi en hızlı ve uygun şekilde organize eder."
    },
    {
      question: "Şehirler arası çekici firmasıyım, Cekgetir.com'a nasıl başvurabilirim?",
      answer: "Cekgetir.com iş ortağı ağına katılmak isteyen şehirler arası çekici firmaları, web sitemiz üzerinden başvuru formunu doldurarak veya iletişim kanallarımız aracılığıyla bizimle iletişime geçebilir. Başvurular, hizmet kalitesi, bölgesel uygunluk ve operasyonel kapasite kriterlerine göre değerlendirilir. Uygun görülen firmalarla sözleşmeli iş ortaklığı süreci başlatılır."
    }
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-100 pt-20">
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
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                  <button
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  >
                    <h3 className="text-lg font-semibold text-gray-800">{faq.question}</h3>
                    <svg
                      className={`w-6 h-6 transform transition-transform ${openIndex === index ? 'rotate-180' : ''} text-gray-600`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openIndex === index && (
                    <div className="px-6 pb-4 bg-gray-50">
                      <p className="text-gray-700">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
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