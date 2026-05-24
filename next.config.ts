import type { NextConfig } from 'next'
import BundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = BundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '3000', pathname: '/uploads/**' },
    ],
  },

  experimental: {
    // Tree-shake icon and animation libraries — only bundle what's imported
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  webpack(config, { isServer }) {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // React core — changes rarely, long cache life
          framework: {
            name: 'framework',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            priority: 40,
            enforce: true,
          },
          // Leaflet loaded only on map pages
          maps: {
            name: 'maps',
            test: /[\\/]node_modules[\\/](leaflet|react-leaflet)[\\/]/,
            priority: 30,
            reuseExistingChunk: true,
          },
          // Socket.IO client — only loaded on tracking pages
          realtime: {
            name: 'realtime',
            test: /[\\/]node_modules[\\/](socket\.io-client|engine\.io-client)[\\/]/,
            priority: 30,
            reuseExistingChunk: true,
          },
          // Everything else from node_modules shared across 2+ chunks
          lib: {
            name: 'lib',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            reuseExistingChunk: true,
            minChunks: 2,
          },
        },
      }

      // Stable module IDs across builds — improves long-term cache hits
      config.optimization.moduleIds = 'deterministic'
    }

    return config
  },
}

export default withBundleAnalyzer(nextConfig)
