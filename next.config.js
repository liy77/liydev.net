/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3'],
  },
  images: {
    formats: ['image/webp'],
  },
}

module.exports = nextConfig
