'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ChapterPageProps {
  params: Promise<{ chapter: string }>
}

/**
 * Legacy Chapter Route Handler
 * 
 * This route previously handled static chapter pages (roots, growing_up, etc.)
 * Now redirects to the new dynamic chapters system at /dash/chapters
 */
export default function ChapterPage({ params }: ChapterPageProps) {
  const { chapter: chapterParam } = use(params)
  const router = useRouter()

  useEffect(() => {
    // Check if this is a UUID (new dynamic chapter ID)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(chapterParam)

    if (isUuid) {
      router.replace(`/dash/chapters/${chapterParam}`)
    } else {
      router.replace('/dash/chapters')
    }
  }, [chapterParam, router])

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '50vh',
      color: 'rgba(255, 255, 255, 0.5)',
    }}>
      Redirecting...
    </div>
  )
}
