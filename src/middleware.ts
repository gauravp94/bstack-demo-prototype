import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySession } from './lib/auth/session'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/api/auth/login']
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

  if (isPublicPath) {
    return NextResponse.next()
  }

  // Check authentication for protected paths
  const token = request.cookies.get('prd-session')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const user = await verifySession(token)

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
