'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { fetchUserProfile } from '@/lib/supabase/client'
import { getIncompleteOnboardingPath } from '@/lib/onboarding/flags'
import { resolveSafeAuthNext } from '@/lib/auth/callback-query'

type OtpType = 'signup' | 'magiclink' | 'recovery' | 'invite' | 'email_change' | 'email'

// Disable static generation for this page
export const dynamic = 'force-dynamic'

export default function AuthCallback() {
  const router = useRouter()
  const hasHandledCallback = useRef(false)

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (hasHandledCallback.current) {
        return
      }

      hasHandledCallback.current = true
      const callbackCorrelationId = `authcb_${Date.now().toString(36)}`

      try {
        const searchParams = new URLSearchParams(window.location.search)
        const errorCode = searchParams.get('error_code')
        const errorDescription = searchParams.get('error_description')

        if (errorCode) {
          console.error('Auth callback provider error', { errorCode, errorDescription })
          router.push('/login?error=callback_provider_error')
          return
        }

        const code = searchParams.get('code')
        if (code) {
          const { data: beforeExchangeSession } = await supabase.auth.getSession()

          if (beforeExchangeSession.session) {
            console.info('Auth callback code exchange skipped: session already present', {
              correlationId: callbackCorrelationId,
            })
          } else {
            const { error } = await supabase.auth.exchangeCodeForSession(code)
            if (error) {
              const { data: sessionAfterExchangeFailure } = await supabase.auth.getSession()

              if (!sessionAfterExchangeFailure.session) {
                console.error('Auth callback code exchange failed', {
                  correlationId: callbackCorrelationId,
                  errorCode: (error as { code?: string }).code,
                  status: (error as { status?: number }).status,
                  message: error.message,
                  hasAuthCode: true,
                  authCodeLength: code.length,
                })
                router.push('/login?error=callback_exchange_failed')
                return
              }

              console.warn('Auth callback exchange returned error but session exists', {
                correlationId: callbackCorrelationId,
                errorCode: (error as { code?: string }).code,
                status: (error as { status?: number }).status,
                message: error.message,
              })
            }
          }
        }

        const tokenHash = searchParams.get('token_hash')
        const type = searchParams.get('type')

        if (tokenHash && type) {
          const otpType = type as OtpType
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: otpType,
          })

          if (error) {
            console.error('Auth callback OTP verification failed', {
              correlationId: callbackCorrelationId,
              type: otpType,
              code: (error as { code?: string }).code,
              status: (error as { status?: number }).status,
              message: error.message,
            })
            router.push('/login?error=callback_token_verification_failed')
            return
          }
        }

        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback session fetch failed', {
            correlationId: callbackCorrelationId,
            code: (error as { code?: string }).code,
            status: (error as { status?: number }).status,
            message: error.message,
          })
          router.push('/login?error=callback_error')
          return
        }

        if (data.session) {
          // User is authenticated, check onboarding state
          const userId = data.session.user.id
          const profile = await fetchUserProfile(userId)
          const altToken = searchParams.get('altToken')
          const safeNext = resolveSafeAuthNext(searchParams.get('next'))

          const buildIncompleteRedirect = () => {
            const incompletePath = getIncompleteOnboardingPath()
            if (incompletePath === '/meeting' && altToken) {
              return `/meeting?altToken=${encodeURIComponent(altToken)}`
            }
            return incompletePath
          }

          if (profile && profile.onboarding_complete) {
            router.push(safeNext ?? '/dash')
          } else {
            router.push(buildIncompleteRedirect())
          }
        } else {
          // No session, redirect to login
          router.push('/login')
        }
      } catch (error) {
        console.error('Unexpected error during auth callback', {
          message: error instanceof Error ? error.message : 'Unknown error',
        })
        router.push('/login?error=unexpected_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-lg">Signing you in...</p>
      </div>
    </div>
  )
} 
