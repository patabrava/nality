'use client'

import { useRouter } from 'next/navigation'
import { use } from 'react'
import { ArrowLeft, Edit2, Calendar, FileText } from 'lucide-react'
import { useChapter } from '@/hooks/useChapters'
import { MemoryCard } from '@/components/memory/MemoryCard'
import { formatChapterTimeRange, getChapterStatusInfo } from '@nality/schema'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ChapterDetailPage({ params }: PageProps) {
  const { id: chapterId } = use(params)
  const router = useRouter()
  const { chapter, loading } = useChapter(chapterId)
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '50vh',
        color: 'rgba(255, 255, 255, 0.5)',
      }}>
        Loading chapter...
      </div>
    )
  }

  if (!chapter) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '50vh',
        textAlign: 'center',
      }}>
        <h2 style={{ color: '#fff', marginBottom: '12px' }}>Chapter not found</h2>
        <button 
          onClick={() => router.push('/dash/chapters')}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '100px',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Back to Chapters
        </button>
      </div>
    )
  }

  const timeRange = formatChapterTimeRange(chapter)
  const statusInfo = getChapterStatusInfo(chapter.status)
  
  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '24px',
    }}>
      <button 
        onClick={() => router.push('/dash/chapters')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: 'transparent',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.6)',
          cursor: 'pointer',
          marginBottom: '24px',
          fontSize: '0.9rem',
        }}
      >
        <ArrowLeft size={18} />
        Back to Chapters
      </button>
      
      <header style={{ marginBottom: '32px' }}>
        <div style={{ marginBottom: '12px' }}>
          <span style={{
            fontSize: '0.65rem',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: statusInfo.color === 'gold' ? '#D4AF37' : 'rgba(255, 255, 255, 0.5)',
            background: statusInfo.color === 'gold' ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255, 255, 255, 0.05)',
            padding: '4px 8px',
            borderRadius: '4px',
          }}>
            {statusInfo.label}
          </span>
        </div>
        
        <h1 style={{ 
          fontSize: '2rem',
          fontFamily: 'var(--font-playfair, Playfair Display, serif)',
          color: '#fff',
          marginBottom: '12px',
        }}>
          {chapter.title}
        </h1>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '0.9rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} />
            <span>{timeRange}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={14} />
            <span>{chapter.memory_count || 0} memories</span>
          </div>
        </div>
      </header>
      
      {chapter.summary && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '32px',
        }}>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            lineHeight: 1.7,
            margin: 0,
            fontFamily: 'var(--font-cormorant, Cormorant Garamond, serif)',
            fontSize: '1.05rem',
          }}>
            {chapter.summary}
          </p>
        </div>
      )}
      
      {chapter.theme_keywords && chapter.theme_keywords.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ 
            fontSize: '0.75rem', 
            color: 'rgba(255, 255, 255, 0.5)', 
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '12px',
          }}>
            Themes
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {chapter.theme_keywords.map((keyword, idx) => (
              <span 
                key={idx}
                style={{
                  fontSize: '0.8rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '6px 12px',
                  borderRadius: '100px',
                }}
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <section>
        <h3 style={{ 
          fontSize: '0.75rem', 
          color: '#D4AF37', 
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '16px',
        }}>
          Memories in this Chapter
        </h3>
        
        {chapter.memories && chapter.memories.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {chapter.memories.map((memory) => (
              <MemoryCard 
                key={memory.id} 
                memory={memory}
                onClick={() => router.push(`/dash/memory/${memory.id}`)}
              />
            ))}
          </div>
        ) : (
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem' }}>
            No memories assigned to this chapter yet.
          </p>
        )}
      </section>
    </div>
  )
}
