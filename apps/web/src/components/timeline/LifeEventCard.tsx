'use client'

import { useState } from 'react'
import type { TimelineEvent } from '@nality/schema'

// ──────────────────────
// Component Props
// ──────────────────────

interface LifeEventCardProps {
  event: TimelineEvent
  variant?: 'standard' | 'featured' | 'featured-media'
  onEdit?: (event: TimelineEvent) => void
  onDelete?: (eventId: string) => void
  onDismiss?: (eventId: string) => void
  className?: string
}

// ──────────────────────
// Main Component
// ──────────────────────

/**
 * Life Event Card Component
 * Material Design 3 Timeline Card following style2.html patterns
 * Observable Implementation: Clear component structure with structured event handlers
 */
export function LifeEventCard({
  event,
  variant = 'standard',
  onEdit,
  onDelete,
  onDismiss,
  className = ''
}: LifeEventCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  // ──────────────────────
  // Event Handlers - Observable Implementation
  // ──────────────────────

  const handleEdit = () => {
    console.log('[LifeEventCard] Edit action triggered', { eventId: event.id })
    setShowMenu(false)
    onEdit?.(event)
  }

  const handleDelete = () => {
    console.log('[LifeEventCard] Delete action triggered', { eventId: event.id })
    setShowMenu(false)
    if (window.confirm('Are you sure you want to delete this event?')) {
      onDelete?.(event.id!)
    }
  }

  const handleDismiss = () => {
    console.log('[LifeEventCard] Dismiss action triggered', { eventId: event.id })
    onDismiss?.(event.id!)
  }

  const handleMenuToggle = () => {
    setShowMenu(!showMenu)
  }

  // ──────────────────────
  // Render Helpers - Progressive Construction
  // ──────────────────────

  const renderSourceBadge = () => {
    // Determine source based on metadata or default
    const source = event.metadata?.source || 'MY LIFE EVENTS'
    
    return (
      <span className="card-source-badge">
        {source.toString().toUpperCase()}
      </span>
    )
  }

  const renderMedia = () => {
    if (!event.primary_media) return null

    const media = event.primary_media

    if (media.media_type === 'image') {
      return (
        <div className="card-media-region">
          <img 
            src={media.storage_path} 
            alt={media.alt_text || event.title}
            className="card-media-image"
            loading="lazy"
          />
        </div>
      )
    }

    if (media.media_type === 'video') {
      return (
        <div className="card-media-region">
          <div className="card-media-video-thumb">
            {media.thumbnail_path ? (
              <img 
                src={media.thumbnail_path} 
                alt={`Video thumbnail for ${event.title}`}
                className="card-media-image"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-md-sys-color-surface-container rounded-lg flex items-center justify-center">
                <div className="play-icon">
                  <PlayIcon />
                </div>
              </div>
            )}
          </div>
        </div>
      )
    }

    if (media.media_type === 'document') {
      return (
        <div className="card-media-doc">
          <DocumentIcon />
          <span>{media.file_name}</span>
        </div>
      )
    }

    return null
  }

  const renderTags = () => {
    if (!event.tags || event.tags.length === 0) return null

    return (
      <div className="card-tag-chips">
        {event.tags.map((tag: string, index: number) => (
          <span 
            key={index} 
            className="card-tag-chip"
            role="button"
            tabIndex={0}
            aria-label={`Tag: ${tag}`}
          >
            #{tag}
          </span>
        ))}
      </div>
    )
  }

  const renderOverflowMenu = () => {
    if (!onEdit && !onDelete) return null

    return (
      <div className="relative">
        <button 
          className="card-overflow-menu-button"
          onClick={handleMenuToggle}
          aria-label="More options"
          aria-expanded={showMenu}
          aria-haspopup="true"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        {showMenu && (
          <div className="card-overflow-menu-dropdown">
            {onEdit && (
              <button
                className="card-overflow-menu-item"
                onClick={handleEdit}
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                className="card-overflow-menu-item destructive"
                onClick={handleDelete}
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  // ──────────────────────
  // Main Render - Material Design 3
  // ──────────────────────

  const cardClasses = [
    'timeline-event-card',
    variant === 'featured' ? 'featured' : '',
    variant === 'featured-media' ? 'featured-media-card' : '',
    variant === 'standard' ? 'standard-text-card' : '',
    onDismiss ? 'dismissible-card' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={cardClasses}>
      {/* Source Badge */}
      {renderSourceBadge()}

      {/* Media Content */}
      {renderMedia()}

      {/* Card Header */}
      <div className="card-header">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="card-title-text">
              {event.title}
            </h3>
            
            {/* Date Range */}
            <div className="card-date-range">
              {event.start_date && (
                <span className="card-date-text">
                  {new Date(event.start_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                  {event.end_date && !event.is_ongoing && (
                    <span>
                      {' - '}
                      {new Date(event.end_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  )}
                  {event.is_ongoing && (
                    <span style={{ color: 'var(--tl-accent-primary)' }}> - Present</span>
                  )}
                </span>
              )}
            </div>
          </div>
          
          {/* Overflow Menu */}
          {renderOverflowMenu()}
        </div>
      </div>

      {/* Description */}
      {event.description && (
        <div className="card-description">
          <p className="card-description-text">
            {event.description}
          </p>
        </div>
      )}

      {/* Location */}
      {event.location && (
        <div className="card-location">
          <LocationIcon />
          <span className="card-location-text">
            {event.location}
          </span>
        </div>
      )}

      {/* Importance Indicator */}
      {event.importance && event.importance >= 8 && (
        <div className="card-importance">
          <StarIcon />
          <span className="card-importance-text">
            High Importance
          </span>
        </div>
      )}

      {/* Tags */}
      {renderTags()}

      {/* Dismiss Button (if applicable) */}
      {onDismiss && (
        <button
          className="card-dismiss-button"
          onClick={handleDismiss}
          aria-label="Dismiss event"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  )
}

// ──────────────────────
// Icon Components - Material Design 3 Style
// ──────────────────────

function CloseIcon() {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className="w-4 h-4" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className="w-5 h-5" 
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function DocumentIcon() {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className="w-5 h-5" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10,9 9,9 8,9" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className="w-3 h-3" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className="w-3 h-3" 
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
} 