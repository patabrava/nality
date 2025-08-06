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
              <div 
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'var(--md-sys-color-surface-container)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div 
                  style={{
                    width: '48px',
                    height: '48px',
                    background: 'var(--tl-accent-primary)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--md-sys-color-on-primary)'
                  }}
                >
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
      <div className="card-tags-container">
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
      </div>
    )
  }

  const renderOverflowMenu = () => {
    if (!onEdit && !onDelete) return null

    return (
      <div className="card-menu-container">
        <button 
          className="card-menu-button"
          onClick={handleMenuToggle}
          aria-label="More options"
          aria-expanded={showMenu}
          aria-haspopup="true"
        >
          <MenuDotsIcon />
        </button>
        
        {showMenu && (
          <div className="card-menu-dropdown">
            {onEdit && (
              <button
                className="card-menu-item"
                onClick={handleEdit}
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                className="card-menu-item card-menu-item-destructive"
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
  // Main Render - Material Design 3 with Proper Information Hierarchy
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
      {/* Card Container with proper responsive spacing and structure */}
      <div className="card-content-container">
        
        {/* Top Section: Source Badge and Menu - Observable Implementation */}
        <div className="card-top-section">
          {renderSourceBadge()}
          {renderOverflowMenu()}
        </div>

        {/* Media Content (if available) - Progressive Construction */}
        {renderMedia()}

        {/* Main Content Section - Mobile-First Design */}
        <div className="card-main-content">
          
          {/* Primary Information: Title and Date - Explicit Error Handling */}
          <div className="card-primary-info">
            <h3 className="card-title">
              {event.title}
            </h3>
            
            {/* Date Information with Clear Responsive Hierarchy */}
            {event.start_date && (
              <div className="card-date-section">
                <time className="card-date" dateTime={event.start_date}>
                  {new Date(event.start_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short', 
                    day: 'numeric'
                  })}
                </time>
                {event.end_date && !event.is_ongoing && (
                  <>
                    <span className="card-date-separator">—</span>
                    <time className="card-date" dateTime={event.end_date}>
                      {new Date(event.end_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </time>
                  </>
                )}
                {event.is_ongoing && (
                  <>
                    <span className="card-date-separator">—</span>
                    <span className="card-ongoing-indicator">Present</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Secondary Information: Description - Dependency Transparency */}
          {event.description && (
            <div className="card-description-section">
              <p className="card-description">
                {event.description}
              </p>
            </div>
          )}

          {/* Metadata Section: Location, Importance, Tags - Progressive Construction */}
          <div className="card-metadata-section">
            
            {/* Location with proper responsive spacing */}
            {event.location && (
              <div className="card-metadata-item">
                <span className="card-metadata-label">Location:</span>
                <span className="card-metadata-value">{event.location}</span>
              </div>
            )}

            {/* Importance Indicator with responsive design */}
            {event.importance && event.importance >= 8 && (
              <div className="card-metadata-item card-importance-item">
                <StarIcon />
                <span className="card-metadata-value">High Importance</span>
              </div>
            )}

            {/* Tags Section - Mobile-First Responsive */}
            {renderTags()}
          </div>
        </div>

        {/* Dismiss Button (positioned responsively) */}
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

function StarIcon() {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className="w-4 h-4" 
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function MenuDotsIcon() {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className="w-5 h-5" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  )
} 