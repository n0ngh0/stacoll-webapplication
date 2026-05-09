import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const userCookie = request.cookies.get('user')?.value
  
  let user = null
  if (userCookie) {
    try {
      user = JSON.parse(userCookie)
    } catch (e) {
      console.error("Failed to parse user cookie")
    }
  }

  const { pathname } = request.nextUrl

  // 1. ถ้าพยายามเข้าหน้า /user หรือ /admin แต่ไม่มี token ให้ส่งไปหน้า signin
  if (!token && (pathname.startsWith('/user') || pathname.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  // 2. ถ้าเข้าหน้า /admin แต่ Role ไม่ใช่ admin ให้ดีดไปหน้า /user
  if (pathname.startsWith('/admin') && user?.role !== 'admin') {
    return NextResponse.redirect(new URL('/user', request.url))
  }

  // 3. ถ้ามี token แล้วพยายามเข้าหน้า auth (signin/signup) ให้ส่งไปหน้า /user
  if (token && (pathname.startsWith('/signin') || pathname.startsWith('/signup'))) {
    return NextResponse.redirect(new URL('/explore', request.url))
  }

  return NextResponse.next()
}

// กำหนดขอบเขตการทำงานของ Middleware
export const config = {
  matcher: [
    '/user/:path*',
    '/admin/:path*',
    '/signin',
    '/signup'
  ],
}
