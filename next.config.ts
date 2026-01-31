import type { NextConfig } from "next";
const { i18n } = require('./next-i18next.config');

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  i18n,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
      },
    ],
  },
};

export default nextConfig;