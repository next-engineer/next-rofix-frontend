/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // Lambda에 필요한 최소 파일만 빌드
  distDir: ".next", // 기본 디렉토리
  images: {
    unoptimized: true, // Lambda에서 이미지 최적화 제거
  },
};

module.exports = nextConfig;
