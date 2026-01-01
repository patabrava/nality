'use client'

import { useRouter } from 'next/navigation'
import { Book, Sparkles, FileText } from 'lucide-react'
import { useChapters } from '@/hooks/useChapters'
import { ChapterCard } from '@/components/chapters/ChapterCard'

export function ChaptersModule() {
  const router = useRouter()
  const { 
    chapters, 
    loading, 
    canGenerateChapters, 
    generateChapters, 
    generating 
  } = useChapters()
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '50vh',
        color: 'rgba(255, 255, 255, 0.5)',
      }}>
        Loading chapters...
      </div>
    )
  }
  
  if (chapters.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60vh',
        textAlign: 'center',
        padding: '32px',
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(212, 175, 55, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
        }}>
          <Book size={32} style={{ color: '#D4AF37', opacity: 0.6 }} />
        </div>
        <h2 style={{ 
          marginBottom: '16px', 
          color: '#fff',
          fontFamily: 'var(--font-playfair, Playfair Display, serif)',
        }}>
          Your Story Awaits
        </h2>
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.6)', 
          maxWidth: '400px', 
          marginBottom: '32px',
          lineHeight: 1.6,
        }}>
          Once you have enough memories, we'll help you organize them into 
          meaningful chapters of your life story.
        </p>
        
        {canGenerateChapters ? (
          <button 
            onClick={() => generateChapters()}
            disabled={generating}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 32px',
              background: 'linear-gradient(135deg, #D4AF37, rgba(180, 140, 20, 1))',
              border: 'none',
              borderRadius: '100px',
              color: '#050505',
              fontWeight: 600,
              cursor: generating ? 'wait' : 'pointer',
              opacity: generating ? 0.7 : 1,
              fontSize: '1rem',
            }}
          >
            <Sparkles size={18} />
            {generating ? 'Generating Chapters...' : 'Generate Chapters'}
          </button>
        ) : (
          <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.9rem' }}>
            Add at least 5 memories to generate chapters
          </p>
        )}
      </div>
    )
  }
  
  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          marginBottom: '8px', 
          color: '#fff',
          fontFamily: 'var(--font-playfair, Playfair Display, serif)',
          fontSize: '1.75rem',
        }}>
          Your Chapters
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          The chapters of your life story, organized from your memories
        </p>
      </header>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {chapters.map((chapter) => (
          <ChapterCard
            key={chapter.id}
            chapter={chapter}
            onClick={() => router.push(`/dash/chapters/${chapter.id}`)}
          />
        ))}
      </div>
      
      <div style={{
        marginTop: '48px',
        padding: '24px',
        background: 'rgba(212, 175, 55, 0.05)',
        border: '1px solid rgba(212, 175, 55, 0.2)',
        borderRadius: '16px',
        textAlign: 'center',
      }}>
        <FileText size={24} style={{ color: '#D4AF37', marginBottom: '12px' }} />
        <h3 style={{ 
          marginBottom: '12px', 
          color: '#fff',
          fontFamily: 'var(--font-playfair, Playfair Display, serif)',
        }}>
          Ready to Create Your Biography?
        </h3>
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.6)', 
          marginBottom: '20px',
          fontSize: '0.9rem',
        }}>
          Transform your chapters into a flowing narrative
        </p>
        <button 
          onClick={() => router.push('/dash/biography')}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            border: '1px solid #D4AF37',
            borderRadius: '100px',
            color: '#D4AF37',
            fontWeight: 500,
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          View Biography
        </button>
      </div>
    </div>
  )
}
