/** @type {import('next').NextConfig} */
const nextConfig = {
  // Base path for reverse proxy access through HMS Gateway
  
  // Suppress React DevTools console message in production
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'react-dom/client': 'react-dom/client',
        'react-dom': 'react-dom'
      }
    }
    return config
  },
  
  // Additional optimizations for production
  experimental: {
    optimizePackageImports: ['date-fns', 'lodash']
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: 'MYCE'
  }
}

module.exports = nextConfig