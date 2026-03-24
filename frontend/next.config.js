/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: { domains: ['localhost', 'your-domain.com'] },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
