'use client'

import { Calendar, FileText } from 'lucide-react'
import type { Chapter } from '@nality/schema'
import { formatChapterTimeRange, getChapterStatusInfo } from '@nality/schema'

interface ChapterCardProps {
  chapter: Chapter
  onClick?: () => void
}

export function ChapterCard({ chapter, onClick }: ChapterCardProps) {
  const timeRange = formatChapterTimeRange(chapter)
  const statusInfo = getChapterStatusInfo(chapter.status)
  
  return (
    <article 
      className="chapter-card group"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        padding: '24px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
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
      
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: 600,
        marginBottom: '8px',
        color: '#fff',
        fontFamily: 'var(--font-playfair, Playfair Display, serif)',
      }}>
        {chapter.title}
      </h3>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '12px',
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: '0.85rem',
      }}>
        <Calendar size={14} />
        <span>{timeRange}</span>
      </div>
      
      {chapter.summary && (
        <p style={{
          color: 'rgba(255, 255, 255, 0.7)',
          lineHeight: 1.6,
          marginBottom: '16px',
          fontSize: '0.9rem',
        }}>
          {chapter.summary}
        </p>
      )}
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: '0.8rem',
      }}>
        <FileText size={14} />
        <span>{chapter.memory_count || 0} memories</span>
      </div>

      {chapter.theme_keywords && chapter.theme_keywords.length > 0 && (
        <div style={{
          marginTop: '12px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
        }}>
          {chapter.theme_keywords.slice(0, 4).map((keyword, idx) => (
            <span 
              key={idx}
              style={{
                fontSize: '0.7rem',
                color: 'rgba(255, 255, 255, 0.5)',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '2px 8px',
                borderRadius: '100px',
              }}
            >
              {keyword}
            </span>
          ))}
        </div>
      )}
      
      <style jsx>{`
        .chapter-card:hover {
          background: rgba(255, 255, 255, 0.04) !important;
          border-color: rgba(212, 175, 55, 0.2) !important;
          transform: translateY(-2px);
        }
        .chapter-card:focus-visible {
          outline: 2px solid #D4AF37;
          outline-offset: 2px;
        }
      `}</style>
    </article>
  )
}
