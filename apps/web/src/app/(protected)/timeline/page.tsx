'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function TimelineRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    console.log('[MONOCODE] Timeline redirect: Navigating from /timeline to /dash/timeline')
    router.push('/dash/timeline')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p>Redirecting to new timeline location...</p>
      </div>
    </div>
  )
}
