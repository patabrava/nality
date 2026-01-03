import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/lib/i18n'

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

  // Handle locale routing
  const pathnameHasLocale = SUPPORTED_LOCALES.some(
    (locale) => path.startsWith(`/${locale}/`) || path === `/${locale}`
  )

  // If it's the root path without locale, redirect to default locale (German)
  if (path === '/') {
    // Check if authenticated user should be redirected first
    if (user) {
      const url = request.nextUrl.clone()
      url.pathname = onboardingComplete ? '/dash' : '/onboarding'
      return NextResponse.redirect(url)
    }
    // Redirect to German locale for landing page
    const url = request.nextUrl.clone()
    url.pathname = `/de`
    return NextResponse.redirect(url)
  }

  // Handle locale paths - check for authenticated user redirection
  if (path === '/de' || path === '/en') {
    if (user) {
      const url = request.nextUrl.clone()
      url.pathname = onboardingComplete ? '/dash' : '/onboarding'
      return NextResponse.redirect(url)
    }
    // Let the [locale] route handle the rendering
    return NextResponse.next()
  }

  // Protected routes - redirect to login if not authenticated
  const protectedPaths = ['/dash', '/chat', '/onboarding']
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
    const redirectTo = onboardingComplete ? (redirectParam || '/dash') : '/onboarding'
    const url = request.nextUrl.clone()
    url.pathname = redirectTo
    url.searchParams.delete('redirectTo')
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/',
    '/de',
    '/en',
    '/login',
    '/auth/:path*',
    '/onboarding',
    '/dash/:path*',
    '/chat/:path*',
    '/timeline',
  ],
}
