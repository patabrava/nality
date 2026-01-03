'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Root page that redirects to default locale
export default function RootPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/de')
  }, [router])
  
  return null
}
