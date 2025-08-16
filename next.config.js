/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // Amplify에서도 안전
  },
};

module.exports = nextConfig;
