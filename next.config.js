/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Note: On Render, standalone output optimizes deployment size
  output: process.env.STANDALONE === 'true' ? 'standalone' : undefined,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
