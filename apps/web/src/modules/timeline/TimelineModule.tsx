'use client'

import { useState, useMemo } from 'react'
import { useLifeEvents } from '@/hooks/useLifeEvents'
import { LifeEventCard } from '@/components/timeline/LifeEventCard'
import { LifeEventForm } from '@/components/timeline/LifeEventForm'
import type { TimelineEvent, LifeEventFormData } from '@nality/schema'

/**
 * Timeline Module Component
 * Extracted timeline functionality as loadable module for dashboard shell
 */
export function TimelineModule() {
  const {
    events,
    loading,
    error,
    creating,
    updating,
    deleting,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch
  } = useLifeEvents()

  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null)

  console.log('[TimelineModule] Component mounted, events:', events.length)

  // ──────────────────────
  // Timeline Data Processing
  // ──────────────────────

  const timelineData = useMemo(() => {
    console.log('[TimelineModule] Processing timeline data, events:', events.length)
    
    // Group events by decade for timeline structure
    const eventsByDecade = new Map<number, TimelineEvent[]>()
    const decades = new Set<number>()
    
    events.forEach(event => {
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
  }, [events])

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

  const handleRefresh = () => {
    console.log('[TimelineModule] Refreshing timeline data')
    refetch()
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

  const renderEmptyState = () => (
    <div className="timeline-empty-state">
      <div className="empty-icon">
        <span>📖</span>
      </div>
      <h4>Your story starts here</h4>
      <p className="max-w-sm mx-auto">
        Begin documenting your life's journey. Add your first memory, achievement, or milestone.
      </p>
    </div>
  )

  const renderLoadingState = () => (
    <div className="timeline-list">
      <div className="timeline-spine" />
      {[1, 2, 3].map(i => (
        <div key={i} className="timeline-item">
          <div className="timeline-node-container">
            <div className="timeline-event-node moment" />
          </div>
          <div className="timeline-card-container">
            <div className="skeleton-card">
              <div className="skeleton-line short" />
              <div className="skeleton-line medium" />
              <div className="skeleton-line" />
              <div className="skeleton-line medium" />
              <div className="skeleton-line short" />
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
      <div className="text-center py-12">
        <div className="text-4xl mb-4">
          {isDatabaseSetupError ? '🔧' : '⚠️'}
        </div>
        <h3 className="text-xl font-semibold mb-2">
          {isDatabaseSetupError ? 'Database Setup Required' : 'Something went wrong'}
        </h3>
        <p className="text-gray-400 mb-4">{error}</p>
        
        {isDatabaseSetupError ? (
          <div className="space-y-3">
            <p className="text-gray-500 max-w-md mx-auto">
              Your database needs to be initialized with the required tables. 
              This is a one-time setup process.
            </p>
            <div className="space-x-3">
              <a
                href="/setup"
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Go to Database Setup →
              </a>
              <button
                onClick={handleRefresh}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Check Again
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleRefresh}
            className="btn btn-primary"
          >
            Try Again
          </button>
        )}
      </div>
    )
  }

  // ──────────────────────
  // Main Render
  // ──────────────────────

  // Show form overlay
  if (showForm || editingEvent) {
    return (
      <div className="min-h-screen bg-tl-bg flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
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
    <div className="full-timeline-viewport">
      {/* Timeline Header */}
      <div className="timeline-header">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div>
            <h1>My Timeline</h1>
            <p>
              {events.length} {events.length === 1 ? 'event' : 'events'}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="timeline-refresh-button text-tl-ink-60 hover:text-tl-ink-100"
            aria-label="Refresh timeline"
          >
            <RefreshIcon className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="timeline-scroll-zone">
        {error ? (
          renderErrorState()
        ) : loading ? (
          renderLoadingState()
        ) : events.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="timeline-list">
            {/* Timeline spine */}
            <div className="timeline-spine" />

            {/* Timeline items */}
            {timelineData.map((item, index) => {
              if (item.type === 'decade') {
                return (
                  <div key={`decade-wrapper-${item.decade}`} className="timeline-item">
                    {renderTimelineNode(item, index)}
                  </div>
                )
              }

              if (!item.event) return null

              const showYearMarker = item.type === 'year' && item.year

              return (
                <div key={`timeline-item-${item.event.id}-${index}`} className="timeline-item">
                  {showYearMarker && renderYearMarker(item.year!)}
                  {renderTimelineNode(item, index)}
                  {renderTimelineCard(item.event, index)}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        className="timeline-fab-add"
        onClick={() => setShowForm(true)}
        disabled={creating || updating || deleting}
        aria-label="Add new timeline event"
      >
        <PlusIcon />
      </button>

      {/* Loading overlay */}
      {(creating || updating || deleting) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-tl-surface-100 rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tl-accent-primary mx-auto mb-4" />
            <p className="text-tl-ink-100">
              {creating && 'Creating event...'}
              {updating && 'Updating event...'}
              {deleting && 'Deleting event...'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ──────────────────────
// Icon Components
// ──────────────────────

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-tl-ink-100">
      <path d="M19 11h-6V5a1 1 0 00-2 0v6H5a1 1 0 000 2h6v6a1 1 0 002 0v-6h6a1 1 0 000-2z" />
    </svg>
  )
}

function RefreshIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 4v6h6" />
      <path d="M23 20v-6h-6" />
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
    </svg>
  )
}
