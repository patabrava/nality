'use client'

import { useRouter } from 'next/navigation'
import { use } from 'react'
import { ArrowLeft, Mic, Type, Edit2, Trash2, FolderOpen, Calendar, Clock } from 'lucide-react'
import { useMemory } from '@/hooks/useMemories'
import { useChapters } from '@/hooks/useChapters'
import { getMemoryModeLabel } from '@nality/schema'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function MemoryDetailPage({ params }: PageProps) {
  const { id: memoryId } = use(params)
  const router = useRouter()
  const { memory, loading, updateMemory, deleteMemory, deleting } = useMemory(memoryId)
  const { chapters } = useChapters()
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '50vh',
        color: 'rgba(255, 255, 255, 0.5)',
      }}>
        Loading memory...
      </div>
    )
  }

  if (!memory) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '50vh',
        textAlign: 'center',
      }}>
        <h2 style={{ color: '#fff', marginBottom: '12px' }}>Memory not found</h2>
        <button 
          onClick={() => router.push('/dash')}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '100px',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Back to Feed
        </button>
      </div>
    )
  }
  
  const captureDate = new Date(memory.captured_at || memory.created_at || Date.now())
  const sourceLabel = memory.source === 'voice' ? 'Voice Recording' : 'Written'
  const modeLabel = getMemoryModeLabel(memory.capture_mode)
  
  const handleChangeChapter = async (chapterId: string | null) => {
    await updateMemory({ chapter_id: chapterId })
  }
  
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this memory?')) {
      const success = await deleteMemory()
      if (success) {
        router.push('/dash')
      }
    }
  }
  
  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '24px',
    }}>
      <button 
        onClick={() => router.back()}
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
        Back to Feed
      </button>
      
      {memory.capture_mode === 'interview' && memory.interview_question && (
        <div style={{
          background: 'rgba(212, 175, 55, 0.05)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
        }}>
          <span style={{ 
            fontSize: '0.75rem', 
            color: '#D4AF37',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            Question Asked
          </span>
          <p style={{ 
            margin: '8px 0 0', 
            fontStyle: 'italic',
            color: 'rgba(255, 255, 255, 0.8)',
          }}>
            "{memory.interview_question}"
          </p>
        </div>
      )}
      
      <article style={{
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '24px',
      }}>
        <p style={{
          fontSize: '1.1rem',
          lineHeight: 1.8,
          color: '#fff',
          whiteSpace: 'pre-wrap',
          fontFamily: 'var(--font-cormorant, Cormorant Garamond, serif)',
        }}>
          {memory.cleaned_content || memory.raw_transcript}
        </p>
      </article>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '12px',
          padding: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Calendar size={14} style={{ color: '#D4AF37' }} />
            <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase' }}>
              Captured
            </span>
          </div>
          <p style={{ color: '#fff', fontSize: '0.9rem', margin: 0 }}>
            {captureDate.toLocaleDateString(undefined, { 
              weekday: 'long',
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
            })}
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem', margin: '4px 0 0' }}>
            {captureDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
          </p>
        </div>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '12px',
          padding: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            {memory.source === 'voice' ? <Mic size={14} style={{ color: '#D4AF37' }} /> : <Type size={14} style={{ color: '#D4AF37' }} />}
            <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase' }}>
              Source
            </span>
          </div>
          <p style={{ color: '#fff', fontSize: '0.9rem', margin: 0 }}>
            {sourceLabel}
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem', margin: '4px 0 0' }}>
            {modeLabel}
          </p>
        </div>
        
        {memory.suggested_category && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '12px',
            padding: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Clock size={14} style={{ color: '#D4AF37' }} />
              <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase' }}>
                Suggested Category
              </span>
            </div>
            <p style={{ color: '#fff', fontSize: '0.9rem', margin: 0, textTransform: 'capitalize' }}>
              {memory.suggested_category}
            </p>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem', margin: '4px 0 0' }}>
              {Math.round((memory.suggestion_confidence || 0) * 100)}% confident
            </p>
          </div>
        )}
      </div>
      
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '32px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <FolderOpen size={18} style={{ color: '#D4AF37' }} />
          <span style={{ fontWeight: 500, color: '#fff' }}>Chapter Assignment</span>
        </div>
        
        {memory.chapter_id ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Part of a chapter
            </span>
            <button 
              onClick={() => handleChangeChapter(null)}
              style={{
                padding: '6px 12px',
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
                fontSize: '0.8rem',
              }}
            >
              Remove
            </button>
          </div>
        ) : (
          <div>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', marginBottom: '12px', fontSize: '0.9rem' }}>
              Not assigned to a chapter yet
            </p>
            {chapters.length > 0 && (
              <select 
                onChange={(e) => handleChangeChapter(e.target.value || null)}
                defaultValue=""
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem',
                }}
              >
                <option value="">Select a chapter...</option>
                {chapters.map(ch => (
                  <option key={ch.id} value={ch.id}>{ch.title}</option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '12px' }}>
        <button 
          onClick={handleDelete}
          disabled={deleting}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 16px',
            background: 'transparent',
            border: '1px solid rgba(186, 26, 26, 0.3)',
            borderRadius: '8px',
            color: 'rgba(186, 26, 26, 0.8)',
            cursor: deleting ? 'wait' : 'pointer',
            fontSize: '0.85rem',
          }}
        >
          <Trash2 size={16} />
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  )
}
