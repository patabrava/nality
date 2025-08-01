'use client'

import { useState, useMemo, useEffect } from 'react'
import { useLifeEvents } from '@/hooks/useLifeEvents'
import { LifeEventCard } from '@/components/timeline/LifeEventCard'
import { LifeEventForm } from '@/components/timeline/LifeEventForm'
import type { TimelineEvent, LifeEventFormData } from '@nality/schema'
import { fetchUserProfile } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

// Force dynamic rendering to avoid build-time Supabase errors
export const dynamic = 'force-dynamic'

// ──────────────────────
// Timeline Page Component
// ──────────────────────

/**
 * Timeline Page - Core timeline functionality with Full Timeline Component design
 * Displays user's life events in chronological order with CRUD operations
 */
export default function TimelinePage() {
  const {
    events,
    loading: eventsLoading,
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

  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated && user?.id) {
      fetchUserProfile(user.id).then(profile => {
        if (profile && profile.onboarding_complete === false) {
          console.log('🔒 User not onboarded, redirecting to /onboarding')
          router.replace('/onboarding')
        }
      })
    }
  }, [loading, isAuthenticated, user, router])

  // ──────────────────────
  // Timeline Data Processing
  // ──────────────────────

  const timelineData = useMemo(() => {
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
    setEditingEvent(event)
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
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

  const renderErrorState = () => (
    <div className="text-center py-12">
      <div className="text-4xl mb-4">⚠️</div>
      <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
      <p className="text-gray-400 mb-4">{error}</p>
      <button
        onClick={handleRefresh}
        className="btn btn-primary"
      >
        Try Again
      </button>
    </div>
  )

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
      {/* Chat Launcher Button */}
      <button
        className="chat-launcher"
        aria-label="Open onboarding chat"
        style={{ position: 'absolute', top: 24, right: 24, zIndex: 100 }}
        onClick={() => router.push('/onboarding')}
      >
        <span className="chat-launcher-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16.83 13.97A6.002 6.002 0 0 1 12 17a6 6 0 0 1-6-6V5h12v2.5M9 17h6"></path>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            <polygon points="12 5.5 13.18 8.06 15.5 8.5 13.75 10.04 14.25 12.5 12 11.12 9.75 12.5 10.25 10.04 8.5 8.5 10.82 8.06 12 5.5" strokeWidth="1"/>
          </svg>
        </span>
      </button>
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
            disabled={eventsLoading}
            className="timeline-refresh-button text-tl-ink-60 hover:text-tl-ink-100"
            aria-label="Refresh timeline"
          >
            <RefreshIcon className={eventsLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="timeline-scroll-zone">
        {error ? (
          renderErrorState()
        ) : eventsLoading ? (
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