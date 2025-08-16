/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // 권장 옵션
  swcMinify: true, // 빌드 최적화
  images: {
    unoptimized: false, // Amplify SSR에서 자동 최적화 사용
  },
};

module.exports = nextConfig;
