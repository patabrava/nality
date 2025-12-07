'use client'

import { useState, useMemo } from 'react'
import { useLifeEvents } from '@/hooks/useLifeEvents'
import { LifeEventCard } from '@/components/timeline/LifeEventCard'
import { LifeEventForm } from '@/components/timeline/LifeEventForm'
import { TimelineFilters } from '@/components/timeline/TimelineFilters'
import { FilterChips } from '@/components/timeline/FilterChips'
import { useTimelineFilters } from '@/hooks/useTimelineFilters'
import { filterEvents, getFilterStats } from '@/utils/timelineFilters'
import type { TimelineEvent, LifeEventFormData, LifeEventCategoryType, ChapterId } from '@nality/schema'
import { ChapterChatInterface } from '@/components/chat/ChapterChatInterface'
import { getChapterById } from '@/lib/chapters'
import { AddMemoryButton } from '@/components/buttons/AddMemoryButton'

/**
 * Timeline Module Props
 */
interface TimelineModuleProps {
  chapterId?: string;
  categoryFilter?: LifeEventCategoryType[];
}

/**
 * Timeline Module Component
 * Full-screen Material Design 3 implementation following MONOCODE principles
 * Observable Implementation with comprehensive state tracking
 */
export function TimelineModule({ chapterId, categoryFilter }: TimelineModuleProps = {}) {
  const {
    events,
    loading,
    error,
    creating,
    updating,
    deleting,
    createEvent,
    updateEvent,
    deleteEvent
  } = useLifeEvents({ categoryFilter })

  // CODE_EXPANSION: Add filtering system while preserving existing functionality
  const filters = useTimelineFilters()

  const [showForm, setShowForm] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null)
  
  // Get chapter info if we're in a chapter context
  const chapter = chapterId ? getChapterById(chapterId as ChapterId) : null

  // Header navigation detection - CODE_EXPANSION: Preserve working functionality
  const hasHeaderNavigation = process.env.NEXT_PUBLIC_USE_HEADER_NAV === 'true'
  
  console.log('[TimelineModule] Component mounted', { 
    eventsCount: events.length, 
    loading, 
    showForm,
    showChat,
    chapterId,
    chapter: chapter?.name,
    editingEvent: editingEvent?.id,
    hasHeaderNavigation // Debug output for header detection
  })

  // ──────────────────────
  // Timeline Data Processing - Enhanced with Filtering
  // ──────────────────────

  // Apply filters to events
  const filteredEvents = useMemo(() => {
    const filterState = {
      topics: filters.topics,
      keywords: filters.keywords,
      dateRange: filters.dateRange,
      sortBy: filters.sortBy,
      isVisible: filters.isVisible
    }
    return filterEvents(events, filterState)
  }, [events, filters.topics, filters.keywords, filters.dateRange, filters.sortBy, filters.isVisible])

  // Get filter statistics
  const filterStats = useMemo(() => {
    return getFilterStats(events, filteredEvents)
  }, [events, filteredEvents])

  const timelineData = useMemo(() => {
    console.log('[TimelineModule] Processing timeline data, events:', filteredEvents.length)
    
    // Group events by decade for timeline structure
    const eventsByDecade = new Map<number, TimelineEvent[]>()
    const decades = new Set<number>()
    
    filteredEvents.forEach(event => {
      const year = new Date(event.start_date).getFullYear()
      const decade = Math.floor(year / 10) * 10
      
      decades.add(decade)
      if (!eventsByDecade.has(decade)) {
        eventsByDecade.set(decade, [])
      }
      eventsByDecade.get(decade)!.push(event)
    })

    // Create timeline items with decade markers and year labels
    const timelineItems: Array<{
      type: 'decade' | 'year' | 'event'
      year?: number
      decade?: number
      event?: TimelineEvent
      isDecadeStart?: boolean
    }> = []

    // Sort decades
    const sortedDecades = Array.from(decades).sort((a, b) => b - a)
    
    sortedDecades.forEach(decade => {
      const decadeEvents = eventsByDecade.get(decade) || []
      
      // Add decade marker
      timelineItems.push({
        type: 'decade',
        decade,
        isDecadeStart: true
      })

      // Group events by year within decade
      const eventsByYear = new Map<number, TimelineEvent[]>()
      decadeEvents.forEach(event => {
        const year = new Date(event.start_date).getFullYear()
        if (!eventsByYear.has(year)) {
          eventsByYear.set(year, [])
        }
        eventsByYear.get(year)!.push(event)
      })

      // Sort years in descending order (most recent first)
      const sortedYears = Array.from(eventsByYear.keys()).sort((a, b) => b - a)
      
      sortedYears.forEach(year => {
        const yearEvents = eventsByYear.get(year) || []
        
        // Add year label for first event of the year
        yearEvents.forEach((event, index) => {
          if (index === 0) {
            timelineItems.push({
              type: 'year',
              year,
              event
            })
          } else {
            timelineItems.push({
              type: 'event',
              event
            })
          }
        })
      })
    })

    return timelineItems
  }, [filteredEvents])

  // ──────────────────────
  // Event Handlers
  // ──────────────────────

  const handleCreateEvent = async (formData: LifeEventFormData) => {
    try {
      console.log('[TimelineModule] Creating event:', formData.title)
      const result = await createEvent({
        title: formData.title,
        description: formData.description || undefined,
        start_date: formData.start_date,
        end_date: formData.end_date || undefined,
        is_ongoing: formData.is_ongoing || false,
        category: formData.category || 'personal',
        location: formData.location || undefined,
        importance: formData.importance || 5,
        tags: formData.tags || undefined,
        user_id: '', // This will be set by the hook
        metadata: {}
      })

      if (result) {
        setShowForm(false)
        console.log('✅ Successfully created event:', result.title)
      }
    } catch (error) {
      console.error('❌ Failed to create event:', error)
      throw error
    }
  }

  const handleUpdateEvent = async (formData: LifeEventFormData) => {
    if (!editingEvent?.id) return

    try {
      console.log('[TimelineModule] Updating event:', formData.title)
      const result = await updateEvent(editingEvent.id, {
        title: formData.title,
        description: formData.description || undefined,
        start_date: formData.start_date,
        end_date: formData.end_date || undefined,
        is_ongoing: formData.is_ongoing || false,
        category: formData.category || 'personal',
        location: formData.location || undefined,
        importance: formData.importance || 5,
        tags: formData.tags || undefined
      })

      if (result) {
        setEditingEvent(null)
        console.log('✅ Successfully updated event:', result.title)
      }
    } catch (error) {
      console.error('❌ Failed to update event:', error)
      throw error
    }
  }

  const handleEditEvent = (event: TimelineEvent) => {
    console.log('[TimelineModule] Editing event:', event.id)
    setEditingEvent(event)
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      console.log('[TimelineModule] Deleting event:', eventId)
      const success = await deleteEvent(eventId)
      if (success) {
        console.log('✅ Successfully deleted event:', eventId)
      }
    } catch (error) {
      console.error('❌ Failed to delete event:', error)
    }
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingEvent(null)
  }

  // ──────────────────────
  // Render Helpers
  // ──────────────────────

  const renderTimelineNode = (item: typeof timelineData[0], index: number) => {
    if (item.type === 'decade') {
      return (
        <div key={`decade-${item.decade}`} className="timeline-decade-chip">
          {item.decade}s
        </div>
      )
    }

    if (!item.event) return null

    const event = item.event
    const nodeType = event.is_duration ? 'duration-start' : 'moment'

    return (
      <div key={`node-${event.id}-${index}`} className="timeline-node-container">
        <div className={`timeline-event-node ${nodeType}`} />
      </div>
    )
  }

  const renderTimelineCard = (event: TimelineEvent, index: number) => {
    // Determine card variant based on event properties
    let variant: 'standard' | 'featured' | 'featured-media' = 'standard'
    
    if (event.primary_media && event.media_count && event.media_count > 0) {
      variant = 'featured-media'
    } else if (event.importance && event.importance >= 8) {
      variant = 'featured'
    }

    return (
      <div className="timeline-card-container">
        <LifeEventCard
          key={`card-${event.id}-${index}`}
          event={event}
          variant={variant}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
        />
      </div>
    )
  }

  const renderYearMarker = (year: number) => {
    return (
      <div className="timeline-year-marker">
        {year}
      </div>
    )
  }

  const renderEmptyState = () => {
    // Show different empty states based on whether filters are active
    const hasFilters = filterStats.hasFilters
    
    return (
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: 'clamp(24px, 6vw, 48px) clamp(12px, 3vw, 24px)',
          textAlign: 'center',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div 
          style={{
            fontSize: 'clamp(2.5rem, 8vw, 4rem)',
            marginBottom: 'clamp(12px, 3vw, 24px)',
            opacity: 0.6
          }}
        >
          {hasFilters ? '🔍' : '📖'}
        </div>
        <h2 
          style={{
            fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
            fontWeight: 600,
            color: 'var(--md-sys-color-on-surface)',
            marginBottom: 'clamp(8px, 2vw, 16px)',
            fontFamily: 'Roboto, system-ui, sans-serif',
            margin: '0 0 clamp(8px, 2vw, 16px) 0'
          }}
        >
          {hasFilters ? 'No matching events' : 'Your story starts here'}
        </h2>
        <p 
          style={{
            fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
            color: 'var(--md-sys-color-on-surface-variant)',
            maxWidth: 'clamp(280px, 80vw, 400px)',
            lineHeight: 1.5,
            marginBottom: 'clamp(16px, 4vw, 32px)',
            margin: '0 0 clamp(16px, 4vw, 32px) 0'
          }}
        >
          {hasFilters 
            ? 'Try adjusting your filters or create a new event that matches your criteria.'
            : 'Begin documenting your life\'s journey. Share your first memory, achievement, or milestone.'
          }
        </p>
        {hasFilters ? (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={filters.clearFilters}
              style={{
                padding: 'clamp(10px, 2.5vw, 12px) clamp(16px, 4vw, 20px)',
                background: 'var(--md-sys-color-secondary-container)',
                color: 'var(--md-sys-color-on-secondary-container)',
                border: '1px solid var(--md-sys-color-outline-variant)',
                borderRadius: 'clamp(14px, 3.5vw, 16px)',
                fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-emphasized)',
                fontFamily: 'Roboto, system-ui, sans-serif'
              }}
            >
              Clear Filters
            </button>
            <button
              onClick={() => chapter ? setShowChat(true) : setShowForm(true)}
              style={{
                padding: 'clamp(10px, 2.5vw, 12px) clamp(16px, 4vw, 20px)',
                background: 'var(--md-sys-color-primary)',
                color: 'var(--md-sys-color-on-primary)',
                border: 'none',
                borderRadius: 'clamp(14px, 3.5vw, 16px)',
                fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-emphasized)',
                fontFamily: 'Roboto, system-ui, sans-serif'
              }}
            >
              Add New Event
            </button>
          </div>
        ) : (
          <button
            onClick={() => chapter ? setShowChat(true) : setShowForm(true)}
            style={{
              padding: 'clamp(12px, 3vw, 16px) clamp(20px, 5vw, 32px)',
              background: 'var(--md-sys-color-primary)',
              color: 'var(--md-sys-color-on-primary)',
              border: 'none',
              borderRadius: 'clamp(16px, 4vw, 20px)',
              fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-emphasized)',
              fontFamily: 'Roboto, system-ui, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(6px, 1.5vw, 8px)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              minHeight: 'clamp(40px, 10vw, 48px)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(255, 255, 255, 0.2)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)'
            }}
          >
            <ChatbotIcon />
            Add Your First Memory
          </button>
        )}
      </div>
    )
  }

  const renderLoadingState = () => (
    <div className="timeline-list">
      <div className="timeline-spine" />
      {[1, 2, 3].map(i => (
        <div key={i} className="timeline-item">
          <div className="timeline-node-container">
            <div className="timeline-event-node moment" />
          </div>
          <div className="timeline-card-container">
            <div 
              style={{
                background: 'var(--md-sys-color-surface-container)',
                borderRadius: 'clamp(12px, 3vw, 16px)',
                padding: 'clamp(12px, 3vw, 20px)',
                maxWidth: 'clamp(280px, 80vw, 300px)',
                width: '100%',
                border: '1px solid var(--md-sys-color-outline-variant)',
                animation: 'pulse 2s ease-in-out infinite',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ 
                height: 'clamp(12px, 3vw, 16px)', 
                background: 'var(--md-sys-color-surface-container-high)', 
                borderRadius: 'clamp(6px, 1.5vw, 8px)', 
                marginBottom: 'clamp(8px, 2vw, 12px)',
                width: '60%'
              }} />
              <div style={{ 
                height: 'clamp(10px, 2.5vw, 14px)', 
                background: 'var(--md-sys-color-surface-container-high)', 
                borderRadius: 'clamp(5px, 1.25vw, 7px)', 
                marginBottom: 'clamp(6px, 1.5vw, 8px)',
                width: '40%'
              }} />
              <div style={{ 
                height: 'clamp(8px, 2vw, 12px)', 
                background: 'var(--md-sys-color-surface-container-high)', 
                borderRadius: 'clamp(4px, 1vw, 6px)', 
                marginBottom: 'clamp(6px, 1.5vw, 8px)',
                width: '80%'
              }} />
              <div style={{ 
                height: 'clamp(8px, 2vw, 12px)', 
                background: 'var(--md-sys-color-surface-container-high)', 
                borderRadius: 'clamp(4px, 1vw, 6px)', 
                marginBottom: 'clamp(6px, 1.5vw, 8px)',
                width: '70%'
              }} />
              <div style={{ 
                height: 'clamp(6px, 1.5vw, 10px)', 
                background: 'var(--md-sys-color-surface-container-high)', 
                borderRadius: 'clamp(3px, 0.75vw, 5px)',
                width: '30%'
              }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderErrorState = () => {
    const isDatabaseSetupError = error?.includes('table does not exist') || 
                                error?.includes('Database not set up')
    
    return (
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: '48px 24px',
          textAlign: 'center'
        }}
      >
        <div style={{ fontSize: '4rem', marginBottom: '24px' }}>
          {isDatabaseSetupError ? '🔧' : '⚠️'}
        </div>
        <h2 
          style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: 'var(--md-sys-color-on-surface)',
            marginBottom: '16px',
            fontFamily: 'Roboto, system-ui, sans-serif'
          }}
        >
          {isDatabaseSetupError ? 'Database Setup Required' : 'Something went wrong'}
        </h2>
        <p 
          style={{
            fontSize: '1rem',
            color: 'var(--md-sys-color-on-surface-variant)',
            marginBottom: '32px',
            maxWidth: '400px'
          }}
        >
          {error}
        </p>
        
        {isDatabaseSetupError ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p 
              style={{
                fontSize: '0.875rem',
                color: 'var(--md-sys-color-on-surface-variant)',
                maxWidth: '400px'
              }}
            >
              Your database needs to be initialized with the required tables. 
              This is a one-time setup process.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <a
                href="/setup"
                style={{
                  padding: '12px 24px',
                  background: 'var(--md-sys-color-primary)',
                  color: 'var(--md-sys-color-on-primary)',
                  textDecoration: 'none',
                  borderRadius: '20px',
                  fontWeight: 600,
                  transition: 'all var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard)'
                }}
              >
                Go to Database Setup →
              </a>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '12px 24px',
                  background: 'var(--md-sys-color-secondary-container)',
                  color: 'var(--md-sys-color-on-secondary-container)',
                  border: 'none',
                  borderRadius: '20px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard)'
                }}
              >
                Check Again
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '16px 32px',
              background: 'var(--md-sys-color-primary)',
              color: 'var(--md-sys-color-on-primary)',
              border: 'none',
              borderRadius: '20px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard)'
            }}
          >
            Try Again
          </button>
        )}
      </div>
    )
  }

  // ──────────────────────
  // Main Render - Full Screen Material Design 3
  // ──────────────────────

  // Show form overlay - Mobile-First Responsive Design
  if (showForm || editingEvent) {
    return (
      <div 
        style={{
          position: 'fixed',
          // Header-aware positioning for form overlay
          top: hasHeaderNavigation ? '48px' : '0',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'var(--md-sys-color-surface)',
          zIndex: 1000,
          overflow: 'auto',
          padding: 'clamp(8px, 2vw, 24px)',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ 
          width: '100%', 
          maxWidth: 'clamp(320px, 90vw, 800px)', 
          margin: '0 auto', 
          minHeight: 'calc(100vh - clamp(16px, 4vw, 48px))',
          boxSizing: 'border-box'
        }}>
          <LifeEventForm
            event={editingEvent}
            onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
            onCancel={handleCancelForm}
            isLoading={creating || updating}
          />
        </div>
      </div>
    )
  }

  return (
    <div 
      style={{
        position: 'fixed',
        // Header-aware positioning - CODE_EXPANSION: Conditional fix preserves working functionality
        top: hasHeaderNavigation ? '48px' : '0',
        left: 0,
        right: 0,
        bottom: 0,
        background: 'var(--md-sys-color-surface)',
        color: 'var(--md-sys-color-on-surface)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Responsive Timeline Title - Observable Implementation */}
      <div 
        style={{
          padding: 'clamp(16px, 4vw, 32px) clamp(12px, 4vw, 32px) clamp(8px, 2vw, 16px) clamp(12px, 4vw, 32px)',
          flexShrink: 0
        }}
      >
        <h1 
          style={{
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: 700,
            color: 'var(--md-sys-color-on-surface)',
            margin: 0,
            fontFamily: 'Roboto, system-ui, sans-serif',
            letterSpacing: '-0.02em'
          }}
        >
          
        </h1>
        
        {/* Filter results summary - CODE_EXPANSION: Add filter feedback */}
        {filterStats.hasFilters && (
          <div 
            style={{
              fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
              color: 'var(--md-sys-color-on-surface-variant)',
              marginTop: 'clamp(4px, 1vw, 8px)',
              fontFamily: 'Roboto, system-ui, sans-serif'
            }}
          >
            Showing {filterStats.filtered} of {filterStats.total} events
          </div>
        )}
      </div>

      {/* Timeline Filters - CODE_EXPANSION: Add filtering without affecting existing layout */}
      <div 
        style={{
          padding: '0 clamp(12px, 4vw, 32px)',
          flexShrink: 0
        }}
      >
        <TimelineFilters key={`filters-${filters.topics.join(',')}-${filters.keywords}-${filters.dateRange.start || ''}-${filters.dateRange.end || ''}-${filters.sortBy}-${filters.isVisible}`} />
        <FilterChips key={`${filters.topics.join(',')}-${filters.keywords}-${filters.dateRange.start || ''}-${filters.dateRange.end || ''}-${filters.sortBy}`} />
      </div>

      {/* Responsive Timeline Content - Progressive Construction */}
      <div 
        style={{
          flex: 1,
          overflow: 'auto',
          padding: 'clamp(8px, 2vw, 24px) clamp(4px, 2vw, 24px) clamp(8px, 2vw, 24px) clamp(4px, 2vw, 24px)',
          background: 'linear-gradient(to bottom, var(--md-sys-color-surface) 0%, var(--md-sys-color-surface-container-low) 50%, var(--md-sys-color-surface) 100%)',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {error ? (
          renderErrorState()
        ) : loading ? (
          renderLoadingState()
        ) : events.length === 0 ? (
          renderEmptyState()
        ) : filteredEvents.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="timeline-list" key={`timeline-${filteredEvents.length}-${filters.topics.join(',')}-${filters.keywords}-${filters.sortBy}`}>
            {/* Timeline spine - Dependency Transparency */}
            <div className="timeline-spine" />

            {/* Timeline items - Mobile-First Responsive */}
            {(() => {
              let eventCounter = 0;
              return timelineData.map((item, index) => {
                if (item.type === 'decade') {
                  return (
                    <div key={`decade-wrapper-${item.decade}`} className="timeline-item timeline-decade-item">
                      {renderTimelineNode(item, index)}
                    </div>
                  )
                }

                if (!item.event) return null

                // Increment counter for events only
                eventCounter++;
                const isEven = eventCounter % 2 === 0;
                const showYearMarker = item.type === 'year' && item.year

                return (
                  <div 
                    key={`timeline-item-${item.event.id}-${index}`} 
                    className={`timeline-item timeline-event-item ${isEven ? 'timeline-event-even' : 'timeline-event-odd'}`}
                    style={{ '--item-index': index } as React.CSSProperties}
                  >
                    {showYearMarker && renderYearMarker(item.year!)}
                    {renderTimelineNode(item, index)}
                    {renderTimelineCard(item.event, index)}
                  </div>
                )
              });
            })()}
          </div>
        )}
      </div>

      {/* Responsive Floating Action Button - Add New Memory - Explicit Error Handling */}
      <AddMemoryButton
        onClick={() => chapter ? setShowChat(true) : setShowForm(true)}
        disabled={creating || updating || deleting}
        aria-label="Add new memory"
        label="Add memory"
        icon={<ChatbotIcon />}
        styleOverrides={{
          position: 'fixed',
          bottom: 'clamp(16px, 4vw, 24px)',
          right: 'clamp(16px, 4vw, 24px)',
          zIndex: 100
        }}
      />

      {/* Loading overlay - Graceful Fallbacks */}
      {(creating || updating || deleting) && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            backdropFilter: 'blur(4px)'
          }}
        >
          <div 
            style={{
              background: 'var(--md-sys-color-surface-container)',
              borderRadius: '16px',
              padding: 'clamp(16px, 4vw, 24px)',
              textAlign: 'center',
              border: '1px solid var(--md-sys-color-outline-variant)',
              minWidth: 'clamp(160px, 40vw, 200px)',
              maxWidth: '90vw'
            }}
          >
            <div 
              style={{
                width: 'clamp(24px, 6vw, 32px)',
                height: 'clamp(24px, 6vw, 32px)',
                border: '3px solid var(--md-sys-color-primary)',
                borderTop: '3px solid transparent',
                borderRadius: '50%',
                margin: '0 auto 16px',
                animation: 'spin 1s linear infinite'
              }}
            />
            <p 
              style={{
                color: 'var(--md-sys-color-on-surface)',
                fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                margin: 0
              }}
            >
              {creating && 'Creating event...'}
              {updating && 'Updating event...'}
              {deleting && 'Deleting event...'}
            </p>
          </div>
        </div>
      )}

      {/* Chapter Chat Modal */}
      {showChat && chapter && (
        <ChapterChatInterface
          chapter={chapter}
          onClose={() => setShowChat(false)}
          onEventCreated={() => {
            setShowChat(false)
            // Trigger refetch by refreshing the page (or could use refetch from useLifeEvents)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}

// ──────────────────────
// Icon Components - Material Design 3
// ──────────────────────

function ChatbotIcon() {
  return (
    <svg 
      viewBox="0 0 24 24" 
      style={{ 
        width: 'clamp(16px, 4vw, 20px)', 
        height: 'clamp(16px, 4vw, 20px)' 
      }}
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      aria-hidden="true"
    >
      {/* Robot head/chatbot icon */}
      <rect x="3" y="8" width="18" height="10" rx="2" />
      <circle cx="8" cy="12" r="1.5" />
      <circle cx="16" cy="12" r="1.5" />
      <path d="M9 16h6" />
      <path d="M12 2v6" />
      <path d="M7 8V6a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2" />
    </svg>
  )
}
