import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();

  // CORS 헤더 설정
  response.headers.set('Access-Control-Allow-Origin', 'http://localhost:8080'); // 백엔드 서버 주소
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  // Preflight 요청(OPTIONS) 처리
  if (request.method === 'OPTIONS') {
    return NextResponse.json({}, { status: 200, headers: response.headers });
  }

  return response;
}

export const config = {
  matcher: '/api/:path*', // /api로 시작하는 모든 경로에 미들웨어를 적용
};