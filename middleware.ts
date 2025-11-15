import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Allow waitlist page and its assets
  const allowedPaths = [
    '/waitlist',
    '/api',
    '/_next',
    '/images',
    '/favicon.ico',
  ]

  // Check if the path should be allowed
  const isAllowedPath = allowedPaths.some(allowedPath =>
    path.startsWith(allowedPath)
  )

  // Redirect all other pages to waitlist (except waitlist itself)
  if (!isAllowedPath && path !== '/waitlist') {
    return NextResponse.redirect(new URL('/waitlist', request.url))
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
