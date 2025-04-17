import { Inter } from 'next/font/google'
import './globals.css'
import ErrorBoundary from '@/components/ErrorBoundary'
import Notification from '@/components/Notification'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  metadataBase: new URL('https://cekgetir.com'),
  title: 'cekgetir | Türkiye\'nin En Büyük Rap Yarışması',
  description: 'cekgetir, Türkiye\'nin en prestijli rap yarışması. Birçok ünlü rapçinin jüri olduğu yarışmaya sen de katıl!',
  keywords: [
    'rap yarışması', 
    'cekgetir', 
    'türkçe rap',
    'freestyle',
    'hiphop yarışması',
    'rap battle',
    'türkçe freestyle',
    'rap şampiyonası',
    'rap turnuvası',
    'underground rap',
    'rap yetenek yarışması'
  ].join(', '),
  openGraph: {
    title: 'cekgetir | Türkiye\'nin En Büyük Rap Yarışması',
    description: 'cekgetir, Türkiye\'nin en prestijli rap yarışması. Ünlü rapçilerin jüri olduğu yarışmaya sen de katıl!',
    url: 'https://cekgetir.com',
    siteName: 'cekgetir',
    images: [
      {
        url: '/images/cekgetir.webp',
        width: 1200,
        height: 630,
        alt: 'cekgetir Rap Yarışması',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'cekgetir | Türkiye\'nin En Büyük Rap Yarışması',
    description: 'cekgetir, Türkiye\'nin en prestijli rap yarışması. Ünlü rapçilerin jüri olduğu yarışmaya sen de katıl!',
    images: ['/images/cekgetir.webp'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code', // Google Search Console doğrulama kodu
  },
  alternates: {
    canonical: 'https://cekgetir.com',
  },
  authors: [{ name: 'cekgetir Team' }],
  category: 'Müzik',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script src="https://www.google.com/recaptcha/api.js" async defer></script>
        <script dangerouslySetInnerHTML={{
          __html: `            function onReCAPTCHASubmit(token) {
              document.getElementById('login-form').dispatchEvent(
                new Event('submit', { cancelable: true })
              );
            }
          `
        }} />
      </head>
      <body suppressHydrationWarning className="antialiased overflow-x-hidden max-w-[100vw]">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Notification />
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
