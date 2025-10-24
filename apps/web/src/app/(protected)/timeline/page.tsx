'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function TimelineRedirectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Preserve any query parameters during the redirect
    const queryString = searchParams.toString()
    const redirectUrl = queryString ? `/dash/timeline?${queryString}` : '/dash/timeline'
    
    console.log('[MONOCODE] Timeline redirect: Navigating from /timeline to', redirectUrl)
    router.push(redirectUrl)
  }, [router, searchParams])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p>Redirecting to new timeline location...</p>
      </div>
    </div>
  )
}
