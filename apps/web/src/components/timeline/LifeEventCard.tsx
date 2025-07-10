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
 * Displays a life event in timeline format following section 21 Full Timeline Component styles
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
  // Event Handlers
  // ──────────────────────

  const handleEdit = () => {
    setShowMenu(false)
    onEdit?.(event)
  }

  const handleDelete = () => {
    setShowMenu(false)
    if (window.confirm('Are you sure you want to delete this event?')) {
      onDelete?.(event.id!)
    }
  }

  const handleDismiss = () => {
    onDismiss?.(event.id!)
  }

  const handleMenuToggle = () => {
    setShowMenu(!showMenu)
  }

  // ──────────────────────
  // Render Helpers
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
              <div className="w-full h-full bg-tl-surface-80 rounded-lg flex items-center justify-center">
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
          <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-120">
            {onEdit && (
              <button
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-lg"
                onClick={handleEdit}
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 last:rounded-b-lg"
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
  // Main Render
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
                    <span className="text-tl-accent-primary"> - Present</span>
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
// Icon Components
// ──────────────────────

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3 h-3">
      <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2.5" />
      <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7 fill-tl-accent-primary stroke-tl-ink-100 stroke-1">
      <path d="M5 3l14 9-14 9V3z" />
    </svg>
  )
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" stroke="currentColor" strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
} 