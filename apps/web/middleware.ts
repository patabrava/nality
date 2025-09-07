import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes that require authentication
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/(protected)') || 
    ['/dash', '/timeline', '/onboarding'].some(path => 
      request.nextUrl.pathname.startsWith(path)
    )

  // Auth routes that should redirect authenticated users
  const isAuthRoute = ['/login', '/signup'].includes(request.nextUrl.pathname)

  // Special routes that bypass terms check
  const isTermsRoute = request.nextUrl.pathname === '/terms'
  const isAuthCallback = request.nextUrl.pathname === '/auth/callback'

  if (!user && isProtectedRoute) {
    // Redirect unauthenticated users to login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && isAuthRoute) {
    // Redirect authenticated users away from auth pages
    return NextResponse.redirect(new URL('/dash', request.url))
  }

  if (user && isProtectedRoute && !isTermsRoute && !isAuthCallback) {
    // Check if user has accepted terms
    try {
      const { data: termsAcceptance } = await supabase
        .from('user_terms_acceptance')
        .select('id')
        .eq('user_id', user.id)
        .eq('terms_version', '1.0')
        .single()

      if (!termsAcceptance) {
        // User hasn't accepted terms, redirect to terms page
        return NextResponse.redirect(new URL('/terms', request.url))
      }
    } catch (error: any) {
      // If table doesn't exist or other database errors during development, 
      // allow access to continue (graceful degradation)
      if (error?.code === '42P01' || error?.message?.includes('does not exist')) {
        console.warn('Terms acceptance table not found - allowing development access')
      } else {
        console.error('Error checking terms acceptance:', error)
        // For other errors, still redirect to terms for safety
        return NextResponse.redirect(new URL('/terms', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}