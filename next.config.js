/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Restrict to specific trusted domains for security
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.ratemyaccom.com.au', // Add your CDN domain
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Enable strict mode for better React practices
  reactStrictMode: true,
  // Optimize production builds
  swcMinify: true,
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },
  // Compression
  compress: true,
  // PoweredBy header removal for security
  poweredByHeader: false,
};

module.exports = nextConfig;
