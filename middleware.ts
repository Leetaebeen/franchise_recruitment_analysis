import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 로그인이 필요한 페이지들 (보호 구역)
const protectedRoutes = ['/dashboard', '/consultation']

// 로그인하면 못 들어가는 페이지들 (이미 로그인했는데 또 로그인하면 이상하니까)
const authRoutes = ['/login', '/signup']

export function middleware(request: NextRequest) {
  // 쿠키에서 토큰 꺼내기
  const token = request.cookies.get('accessToken')?.value
  const { pathname } = request.nextUrl

  // 1. 로그인이 필요한 페이지인데 토큰이 없다? -> 로그인 페이지로 쫓아냄
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // 2. 이미 로그인했는데 로그인/회원가입 페이지로 가려고 한다? -> 대시보드로 보냄
  if (authRoutes.includes(pathname)) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

// 미들웨어가 감시할 경로 설정
export const config = {
  matcher: ['/dashboard/:path*', '/consultation/:path*', '/login', '/signup'],
}