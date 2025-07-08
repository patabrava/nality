'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

// Disable static generation for this page
export const dynamic = 'force-dynamic'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/login?error=callback_error')
          return
        }

        if (data.session) {
          // User is authenticated, redirect to timeline
          router.push('/timeline')
        } else {
          // No session, redirect to login
          router.push('/login')
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error)
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