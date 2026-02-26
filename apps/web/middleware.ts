import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getIncompleteOnboardingPath } from './src/lib/onboarding/flags'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do NOT use getSession() here - always use getUser() for security
  // getSession() reads from cookies which could be tampered with
  // getUser() validates the session with the Supabase Auth server
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Determine onboarding completion to drive redirects
  let onboardingComplete: boolean | null = null
  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('onboarding_complete')
      .eq('id', user.id)
      .single()

    if (!profileError) {
      onboardingComplete = profile?.onboarding_complete ?? null
    }
  }

  const path = request.nextUrl.pathname
  const incompletePath = getIncompleteOnboardingPath()
  const hasCompletedOnboarding = onboardingComplete === true
  const needsOnboarding = onboardingComplete !== true

  // Protected routes - redirect to login if not authenticated
  const protectedPaths = ['/dash', '/chat', '/onboarding', '/meeting']
  const isProtectedPath = protectedPaths.some(protectedPath =>
    path.startsWith(protectedPath)
  )

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // If user is authenticated and on login page, redirect to dashboard
  if (user && path === '/login') {
    const redirectParam = request.nextUrl.searchParams.get('redirectTo')
    const redirectTo = hasCompletedOnboarding ? (redirectParam || '/dash') : incompletePath
    const url = request.nextUrl.clone()
    url.pathname = redirectTo
    url.searchParams.delete('redirectTo')
    return NextResponse.redirect(url)
  }

  // If user is authenticated and hits the landing page, send them to the right place
  if (user && path === '/') {
    const url = request.nextUrl.clone()
    url.pathname = hasCompletedOnboarding ? '/dash' : incompletePath
    return NextResponse.redirect(url)
  }

  // Keep onboarding-incomplete users out of dashboard/chat routes
  if (user && needsOnboarding && (path.startsWith('/dash') || path.startsWith('/chat'))) {
    const url = request.nextUrl.clone()
    url.pathname = incompletePath
    return NextResponse.redirect(url)
  }

  // If meeting onboarding is enabled, nudge incomplete users from legacy route to meeting route
  if (user && needsOnboarding && incompletePath === '/meeting' && path === '/onboarding') {
    const url = request.nextUrl.clone()
    url.pathname = '/meeting'
    return NextResponse.redirect(url)
  }

  // Completed users should not stay on onboarding routes
  if (user && hasCompletedOnboarding && (path === '/onboarding' || path === '/meeting')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dash'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/auth/:path*',
    '/onboarding',
    '/meeting',
    '/dash/:path*',
    '/chat/:path*',
    '/timeline',
  ],
}
