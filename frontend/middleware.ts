import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// 보호가 필요한 경로
const protectedRoutes = ["/dashboard", "/consultation"]

// 인증 페이지
const authRoutes = ["/login", "/signup"]

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value
  const { pathname } = request.nextUrl

  // 보호 경로 접근 시 토큰 검증
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    try {
      const res = await fetch("http://localhost:8000/auth/verify", {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        const response = NextResponse.redirect(new URL("/login", request.url))
        response.cookies.delete("accessToken")
        response.cookies.delete("username")
        return response
      }
    } catch (error) {
      console.error("Auth verification failed:", error)
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // 이미 로그인된 사용자가 인증 페이지 접근 시 대시보드로 이동
  if (authRoutes.includes(pathname)) {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/consultation/:path*", "/login", "/signup"],
}
