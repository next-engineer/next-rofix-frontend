/** @type {import('next').NextConfig} */
const nextConfig = {
  // React Strict Mode 활성화 (권장)
  reactStrictMode: true,

  // 빌드 시 eslint 에러 무시
  eslint: {
    ignoreDuringBuilds: true,
  },

  // 빌드 시 타입체크 에러 무시
  typescript: {
    ignoreBuildErrors: true,
  },

  // Amplify 환경에서 이미지 최적화 비활성화
  images: {
    unoptimized: true,
  },

  // 추후 백엔드 API 연동 시 필요하면 주석 해제
  // async rewrites() {
  //   return [
  //     {
  //       source: "/api/:path*",
  //       destination: "http://localhost:8080/api/:path*", // 백엔드 주소
  //     },
  //   ]
  // },
};

module.exports = nextConfig;
