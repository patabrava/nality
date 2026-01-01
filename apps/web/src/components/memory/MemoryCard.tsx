'use client'

import { Mic, Type, MessageSquare } from 'lucide-react'
import type { Memory } from '@nality/schema'
import { getMemoryExcerpt, getMemoryModeLabel } from '@nality/schema'

interface MemoryCardProps {
  memory: Memory
  onClick?: () => void
}

export function MemoryCard({ memory, onClick }: MemoryCardProps) {
  const displayText = getMemoryExcerpt(memory, 120)
  
  const captureTime = new Date(memory.captured_at || memory.created_at || Date.now()).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })
  
  const SourceIcon = memory.source === 'voice' ? Mic : Type
  const modeLabel = getMemoryModeLabel(memory.capture_mode)
  
  return (
    <article 
      className="memory-card group"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        padding: '16px 20px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      <div className="memory-content">
        <p style={{
          color: 'var(--md-sys-color-on-surface, #fff)',
          fontSize: '0.95rem',
          lineHeight: 1.6,
          margin: 0,
        }}>
          {displayText}
        </p>
      </div>
      
      <footer style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '12px',
        paddingTop: '12px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SourceIcon size={14} style={{ color: '#D4AF37', opacity: 0.7 }} />
          <span style={{ 
            fontSize: '0.75rem', 
            color: 'rgba(255, 255, 255, 0.5)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            {modeLabel}
          </span>
        </div>
        
        <time style={{ 
          fontSize: '0.8rem', 
          color: 'rgba(255, 255, 255, 0.4)',
        }}>
          {captureTime}
        </time>
      </footer>
      
      {memory.chapter_id && (
        <div style={{
          marginTop: '8px',
          fontSize: '0.7rem',
          color: '#D4AF37',
          opacity: 0.8,
        }}>
          Part of a chapter
        </div>
      )}
      
      <style jsx>{`
        .memory-card:hover {
          background: rgba(255, 255, 255, 0.04) !important;
          border-color: rgba(212, 175, 55, 0.2) !important;
          transform: translateY(-1px);
        }
        .memory-card:focus-visible {
          outline: 2px solid #D4AF37;
          outline-offset: 2px;
        }
      `}</style>
    </article>
  )
}
