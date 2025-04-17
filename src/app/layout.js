import { Inter } from 'next/font/google'
import './globals.css'
import ErrorBoundary from '@/components/ErrorBoundary'
import Notification from '@/components/Notification'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  metadataBase: new URL('https://flow360.com'),
  title: 'Flow360 | Türkiye\'nin En Büyük Rap Yarışması',
  description: 'Flow360, Türkiye\'nin en prestijli rap yarışması. Birçok ünlü rapçinin jüri olduğu yarışmaya sen de katıl!',
  keywords: [
    'rap yarışması', 
    'flow360', 
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
    title: 'Flow360 | Türkiye\'nin En Büyük Rap Yarışması',
    description: 'Flow360, Türkiye\'nin en prestijli rap yarışması. Ünlü rapçilerin jüri olduğu yarışmaya sen de katıl!',
    url: 'https://flow360.com',
    siteName: 'Flow360',
    images: [
      {
        url: '/images/flow360.webp',
        width: 1200,
        height: 630,
        alt: 'Flow360 Rap Yarışması',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flow360 | Türkiye\'nin En Büyük Rap Yarışması',
    description: 'Flow360, Türkiye\'nin en prestijli rap yarışması. Ünlü rapçilerin jüri olduğu yarışmaya sen de katıl!',
    images: ['/images/flow360.webp'],
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
    canonical: 'https://flow360.com',
  },
  authors: [{ name: 'Flow360 Team' }],
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
