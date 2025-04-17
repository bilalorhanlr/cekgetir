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
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.googleapis.com https://*.gstatic.com https://maps.googleapis.com; style-src 'self' 'unsafe-inline' https://*.googleapis.com; img-src 'self' blob: data: https://*.googleapis.com https://*.gstatic.com; font-src 'self' https://*.gstatic.com; connect-src 'self' https://*.googleapis.com https://maps.googleapis.com"
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig