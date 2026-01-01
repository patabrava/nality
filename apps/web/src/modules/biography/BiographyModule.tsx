'use client'

import { useState } from 'react'
import { Edit, RefreshCw, Download, FileText, Palette } from 'lucide-react'
import { useBiography } from '@/hooks/useBiography'
import { getToneDisplayInfo, countBiographyWords, getReadingTime } from '@nality/schema'
import type { BiographyToneType } from '@nality/schema'

export function BiographyModule() {
  const { 
    biography, 
    loading, 
    canGenerate, 
    generate, 
    regenerate, 
    updateTone,
    generating 
  } = useBiography()
  
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState('')
  const [selectedTone, setSelectedTone] = useState<BiographyToneType>('neutral')
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '50vh',
        color: 'rgba(255, 255, 255, 0.5)',
      }}>
        Loading biography...
      </div>
    )
  }
  
  if (!biography) {
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
          <FileText size={32} style={{ color: '#D4AF37', opacity: 0.6 }} />
        </div>
        <h2 style={{ 
          marginBottom: '16px', 
          color: '#fff',
          fontFamily: 'var(--font-playfair, Playfair Display, serif)',
        }}>
          Your Biography
        </h2>
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.6)', 
          maxWidth: '400px', 
          marginBottom: '24px',
          lineHeight: 1.6,
        }}>
          Generate a beautifully written narrative from your life chapters
        </p>
        
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.85rem',
          }}>
            Choose a writing style
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['neutral', 'poetic', 'formal'] as BiographyToneType[]).map((tone) => {
              const info = getToneDisplayInfo(tone)
              return (
                <button
                  key={tone}
                  onClick={() => setSelectedTone(tone)}
                  style={{
                    padding: '10px 16px',
                    background: selectedTone === tone ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: selectedTone === tone ? '1px solid #D4AF37' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: selectedTone === tone ? '#D4AF37' : 'rgba(255, 255, 255, 0.7)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                >
                  {info.label}
                </button>
              )
            })}
          </div>
        </div>
        
        {canGenerate ? (
          <button 
            onClick={() => generate(selectedTone)}
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
            {generating ? 'Generating...' : 'Generate Biography'}
          </button>
        ) : (
          <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.9rem' }}>
            Create chapters first to generate your biography
          </p>
        )}
      </div>
    )
  }

  const wordCount = countBiographyWords(biography.content)
  const readingTime = getReadingTime(biography.content)
  const toneInfo = getToneDisplayInfo(biography.tone)
  
  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '32px 24px' 
    }}>
      <header style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '32px',
      }}>
        <div>
          <h1 style={{ 
            marginBottom: '4px', 
            color: '#fff',
            fontFamily: 'var(--font-playfair, Playfair Display, serif)',
            fontSize: '1.75rem',
          }}>
            Your Biography
          </h1>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.5)', 
            fontSize: '0.85rem' 
          }}>
            Version {biography.version} · {wordCount} words · {readingTime} min read
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
          }}>
            <Palette size={14} style={{ color: '#D4AF37' }} />
            <select 
              value={biography.tone}
              onChange={(e) => updateTone(e.target.value as BiographyToneType)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <option value="neutral">Neutral</option>
              <option value="poetic">Poetic</option>
              <option value="formal">Formal</option>
            </select>
          </div>
        </div>
      </header>
      
      <article style={{
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '16px',
        padding: '40px',
        marginBottom: '24px',
      }}>
        {isEditing ? (
          <textarea
            value={editedContent || biography.content}
            onChange={(e) => setEditedContent(e.target.value)}
            style={{
              width: '100%',
              minHeight: '400px',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '16px',
              color: '#fff',
              fontSize: '1.05rem',
              lineHeight: 1.8,
              resize: 'vertical',
              outline: 'none',
            }}
          />
        ) : (
          <div style={{
            fontSize: '1.05rem',
            lineHeight: 1.9,
            color: '#fff',
            whiteSpace: 'pre-wrap',
            fontFamily: 'var(--font-cormorant, Cormorant Garamond, serif)',
          }}>
            {biography.content}
          </div>
        )}
      </article>
      
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button 
          onClick={() => {
            if (isEditing) {
              setIsEditing(false)
              setEditedContent('')
            } else {
              setEditedContent(biography.content)
              setIsEditing(true)
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 16px',
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: 'rgba(255, 255, 255, 0.7)',
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}
        >
          <Edit size={16} />
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
        <button 
          onClick={() => regenerate()}
          disabled={generating}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 16px',
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: 'rgba(255, 255, 255, 0.7)',
            cursor: generating ? 'wait' : 'pointer',
            fontSize: '0.85rem',
          }}
        >
          <RefreshCw size={16} />
          {generating ? 'Regenerating...' : 'Regenerate'}
        </button>
        <button 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 16px',
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: 'rgba(255, 255, 255, 0.7)',
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}
        >
          <Download size={16} />
          Export
        </button>
      </div>
    </div>
  )
}
