'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TimelineModule } from '@/modules/timeline/TimelineModule'
import { getChapterById, isValidChapterId } from '@/lib/chapters'
import type { ChapterId } from '@nality/schema'

interface ChapterPageProps {
  params: Promise<{ chapter: string }>
}

export default function ChapterPage({ params }: ChapterPageProps) {
  const { chapter: chapterParam } = use(params)
  const router = useRouter()
  
  // Validate chapter ID and redirect if invalid
  const isValid = isValidChapterId(chapterParam)
  const chapterId = isValid ? (chapterParam as ChapterId) : null
  const chapter = chapterId ? getChapterById(chapterId) : null

  useEffect(() => {
    if (!isValid || !chapter) {
      router.replace('/dash')
    }
  }, [isValid, chapter, router])

  // Show nothing while redirecting
  if (!chapter) {
    return null
  }

  console.log(`📖 Chapter page mounted: ${chapter.name}`)

  return (
    <div className="h-full flex flex-col">
      {/* Chapter Header */}
      <div 
        style={{
          padding: '12px 20px',
          borderBottom: '1px solid var(--md-sys-color-outline-variant)',
          background: 'var(--md-sys-color-surface-container)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        {/* Back Button */}
        <button
          onClick={() => router.push('/dash')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--md-sys-color-on-surface)',
            transition: 'background 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'var(--md-sys-color-surface-container-high)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          aria-label="Back to dashboard"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Chapter Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <span style={{ fontSize: '1.75rem' }}>{chapter.icon}</span>
          <div>
            <h1 
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--md-sys-color-on-surface)',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {chapter.name}
            </h1>
            <p 
              style={{
                fontSize: '0.8rem',
                color: 'var(--md-sys-color-on-surface-variant)',
                margin: 0,
              }}
            >
              {chapter.subtitle}
            </p>
          </div>
        </div>
      </div>
      
      {/* Timeline filtered by chapter categories */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <TimelineModule 
          chapterId={chapter.id}
          categoryFilter={chapter.categories}
        />
      </div>
    </div>
  )
}
