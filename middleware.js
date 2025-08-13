import { NextResponse } from 'next/server';

/**
 *  로그인해야만 접근 가능한 경로를 여기에 추가합니다.
 *  @TODO 추후에 /mypage 추가 필요 */ 
const PROTECTED_ROUTES = ['/wardrobe', '/mypage']; 
const AUTH_PAGES = ['/signup']; // 로그인/회원가입 페이지 경로

export function middleware(request) {
  const response = NextResponse.next();
  // 백엔드에서 설정한 세션 쿠키 이름 ('JSESSIONID') 사용 - 만약에 레디스 적용할 경우 SESSION으로 수정
  const sessionCookie = request.cookies.get('JSESSIONID'); 
  
  // --- 로그인 상태 확인 로직 시작 ---
  // const isProtected = PROTECTED_ROUTES.includes(request.nextUrl.pathname);
  // const isLoginPage = request.nextUrl.pathname === '/signup'; // 로그인 페이지 경로
  const isLoggedIn = !!sessionCookie;


  /**
   * CORS 헤더 설정 
   * @TODO prod 서버 주소도 추가 필요
   */
  response.headers.set('Access-Control-Allow-Origin', 'http://localhost:8080'); // 백엔드 서버 주소
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  // Preflight 요청(OPTIONS) 처리
  if (request.method === 'OPTIONS') {
    return NextResponse.json({}, { status: 200, headers: response.headers });
  }


  // 보호된 경로에 접근했고, 세션 쿠키가 없으며, 현재 페이지가 로그인 페이지가 아닐 경우
  // if (isProtected && !sessionCookie && !isLoginPage) {
  //   // 로그인 페이지로 리디렉션합니다.
  //   return NextResponse.redirect(new URL('/signup', request.url));
  // }

  if (isLoggedIn && AUTH_PAGES.includes(request.nextUrl.pathname)) {
    // 로그인 상태에서 /signup 접근 → 메인으로
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  if (!isLoggedIn && PROTECTED_ROUTES.includes(request.nextUrl.pathname)) {
    // 로그인 안 한 상태에서 보호 페이지 접근 → 로그인 페이지로
    return NextResponse.redirect(new URL('/signup', request.url));
  }

  return response;
}

export const config = {
  /**
   *  /api로 시작하는 모든 경로에 미들웨어를 적용
   *  @TODO 추후에 /mypage 추가 필요 */ 
  matcher: ['/api/:path*', '/wardrobe', '/mypage'],
};