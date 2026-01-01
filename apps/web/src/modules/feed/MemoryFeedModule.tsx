'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Mic, Home } from 'lucide-react'
import { useMemories } from '@/hooks/useMemories'
import { MemoryCard } from '@/components/memory/MemoryCard'
import { TextMemoryInput } from '@/components/memory/TextMemoryInput'
import { VoiceModeSelector } from '@/components/voice/VoiceModeSelector'
import { InterviewInterface } from '@/components/voice/InterviewInterface'
import { formatDateHeader } from '@nality/schema'
import type { Memory } from '@nality/schema'

interface MemoryFeedModuleProps {
  showChapterPrompt?: boolean
}

export function MemoryFeedModule({ showChapterPrompt }: MemoryFeedModuleProps) {
  const router = useRouter()
  const { memories, loading, error, refetch, getMemoriesByDate } = useMemories()
  
  const [showVoiceSelector, setShowVoiceSelector] = useState(false)
  const [showInterview, setShowInterview] = useState(false)
  const [showFreeTalk, setShowFreeTalk] = useState(false)
  const [showTextInput, setShowTextInput] = useState(false)
  
  const groupedMemories = useMemo(() => {
    return getMemoriesByDate()
  }, [getMemoriesByDate])
  
  const handleVoiceModeSelect = (mode: 'interview' | 'free-talk' | 'text') => {
    setShowVoiceSelector(false)
    switch (mode) {
      case 'interview':
        setShowInterview(true)
        break
      case 'free-talk':
        setShowFreeTalk(true)
        break
      case 'text':
        setShowTextInput(true)
        break
    }
  }
  
  const handleMemoryComplete = () => {
    setShowInterview(false)
    setShowFreeTalk(false)
    setShowTextInput(false)
    refetch()
  }

  const handleMemoryClick = (memory: Memory) => {
    router.push(`/dash/memory/${memory.id}`)
  }
  
  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '32px',
      }}>
        <div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '1.75rem', 
            fontFamily: 'var(--font-playfair, Playfair Display, serif)',
            color: '#fff',
          }}>
            Your Memories
          </h1>
          <p style={{ 
            margin: '4px 0 0', 
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '0.9rem',
          }}>
            {memories.length} memories captured
          </p>
        </div>
        
        <button
          onClick={() => setShowVoiceSelector(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: 'linear-gradient(135deg, #D4AF37, rgba(180, 140, 20, 1))',
            border: 'none',
            borderRadius: '100px',
            color: '#050505',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          <Plus size={18} />
          Add Memory
        </button>
      </header>
      
      {loading ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '200px',
          color: 'rgba(255, 255, 255, 0.5)',
        }}>
          Loading memories...
        </div>
      ) : memories.length === 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '50vh',
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
            <Mic size={32} style={{ color: '#D4AF37' }} />
          </div>
          <h2 style={{ 
            marginBottom: '12px', 
            color: '#fff',
            fontFamily: 'var(--font-playfair, Playfair Display, serif)',
          }}>
            Start capturing your story
          </h2>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.6)', 
            maxWidth: '400px', 
            marginBottom: '24px',
            lineHeight: 1.6,
          }}>
            Record your first memory to begin building your autobiography. 
            Speak freely, answer questions, or write it down.
          </p>
          <button
            onClick={() => setShowVoiceSelector(true)}
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
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            <Plus size={20} />
            Add Your First Memory
          </button>
        </div>
      ) : (
        <div className="feed-content">
          {Object.entries(groupedMemories)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([dateKey, dayMemories]) => (
              <div key={dateKey} style={{ marginBottom: '32px' }}>
                <h2 style={{
                  fontSize: '0.85rem',
                  color: '#D4AF37',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '16px',
                  fontWeight: 500,
                }}>
                  {formatDateHeader(dateKey)}
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {dayMemories.map((memory) => (
                    <MemoryCard 
                      key={memory.id} 
                      memory={memory}
                      onClick={() => handleMemoryClick(memory)}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
      
      {showVoiceSelector && (
        <VoiceModeSelector
          onSelect={handleVoiceModeSelect}
          onClose={() => setShowVoiceSelector(false)}
        />
      )}
      
      {showInterview && (
        <InterviewInterface
          onClose={() => setShowInterview(false)}
          onMemorySaved={handleMemoryComplete}
          onComplete={handleMemoryComplete}
        />
      )}
      
      {showFreeTalk && (
        <InterviewInterface
          onClose={() => setShowFreeTalk(false)}
          onMemorySaved={handleMemoryComplete}
          onComplete={handleMemoryComplete}
        />
      )}
      
      {showTextInput && (
        <TextMemoryInput
          onClose={() => setShowTextInput(false)}
          onSave={handleMemoryComplete}
        />
      )}
    </div>
  )
}
