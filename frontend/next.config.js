/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  eslint: {
    dirs: ['src'],
  },
  experimental: {
    typedRoutes: true,
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/app/dashboard',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;