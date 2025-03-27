/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: { 
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/restaurant/30',
        destination: '/menus/80a7f1f4-f033-4ca8-ab9b-57453bdeacdf',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;