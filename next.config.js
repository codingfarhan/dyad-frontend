/** @type {import('next').NextConfig} */
const nextConfig = {
  // disable type checking
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  output: "export",
  webpack: config => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    return config
  },
  images: { unoptimized: true },
  async headers() {
    return [{
      source: '/manifest.json',
      headers: [
        {
          key: 'Access-Control-Allow-Origin',
          value: '*'
        },
        {
          key: 'Access-Control-Allow-Methods',
          value: 'GET'
        },
        {
          key: 'Access-Control-Allow-Headers',
          value: 'X-Requested-With, content-type, Authorization'
        }
      ]
    }]
  }
};

module.exports = nextConfig;
