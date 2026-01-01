'use client'

import { useState } from 'react'
import { X, Send } from 'lucide-react'
import { useMemories } from '@/hooks/useMemories'

interface TextMemoryInputProps {
  onClose: () => void
  onSave?: () => void
}

export function TextMemoryInput({ onClose, onSave }: TextMemoryInputProps) {
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const { createMemory } = useMemories()

  const handleSave = async () => {
    if (!content.trim()) return

    setSaving(true)
    try {
      await createMemory({
        raw_transcript: content.trim(),
        capture_mode: 'text',
        source: 'text',
        processing_status: 'pending',
      })
      onSave?.()
      onClose()
    } catch (error) {
      console.error('Error saving memory:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div 
      className="text-memory-modal"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 5, 5, 0.95)',
        backdropFilter: 'blur(20px)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.125rem', color: '#fff' }}>
            Write a Memory
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.75rem', opacity: 0.6, color: '#fff' }}>
            Capture your thoughts in writing
          </p>
        </div>
        <button 
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.6)',
            cursor: 'pointer',
            padding: '8px',
          }}
        >
          <X size={20} />
        </button>
      </header>

      <main style={{
        flex: 1,
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind? Share a memory, a thought, or something you want to remember..."
          autoFocus
          style={{
            flex: 1,
            width: '100%',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '20px',
            color: '#fff',
            fontSize: '1rem',
            lineHeight: 1.7,
            resize: 'none',
            outline: 'none',
          }}
        />
      </main>

      <footer style={{
        padding: '16px 24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
      }}>
        <button
          onClick={onClose}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '100px',
            color: 'rgba(255, 255, 255, 0.7)',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!content.trim() || saving}
          style={{
            padding: '12px 24px',
            background: content.trim() ? 'linear-gradient(135deg, #D4AF37, rgba(180, 140, 20, 1))' : 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '100px',
            color: content.trim() ? '#050505' : 'rgba(255, 255, 255, 0.3)',
            cursor: content.trim() ? 'pointer' : 'not-allowed',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Send size={16} />
          {saving ? 'Saving...' : 'Save Memory'}
        </button>
      </footer>
    </div>
  )
}
