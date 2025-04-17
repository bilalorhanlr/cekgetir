/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Punycode uyarısını gizle
    config.ignoreWarnings = [
      { module: /node_modules\/punycode/ }
    ];
    
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/.well-known/pki-validation/:path*',
        destination: '/api/validation/:path*'
      }
    ]
  },
  images: {
    domains: ['localhost'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-src 'self' https://www.google.com/ https://*.googleapis.com/ https://*.google.com/ https://*.gstatic.com/;"
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig