import { type NextRequest, NextResponse } from 'next/server'

const PROTECTED = ['/checkout', '/profile', '/orders']
// Supabase stores the session token in sb-<projectRef>-auth-token
const PROJECT_REF = 'yharweliruemjexmuuxn'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED.some(p => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  // Check for a valid Supabase session cookie
  const tokenCookie =
    request.cookies.get(`sb-${PROJECT_REF}-auth-token`) ||
    request.cookies.get(`sb-${PROJECT_REF}-auth-token.0`) ||
    request.cookies.get('sb-access-token')

  if (!tokenCookie) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/checkout/:path*', '/profile/:path*', '/orders/:path*'],
}
