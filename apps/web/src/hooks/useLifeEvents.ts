'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from './useAuth'
import type { 
  LifeEvent, 
  LifeEventInput, 
  LifeEventUpdate,
  MediaObject,
  TimelineEvent 
} from '@nality/schema'

// ──────────────────────
// Hook State Types
// ──────────────────────

interface UseLifeEventsState {
  events: TimelineEvent[]
  loading: boolean
  error: string | null
  creating: boolean
  updating: boolean
  deleting: boolean
}

interface UseLifeEventsActions {
  refetch: () => Promise<void>
  createEvent: (input: LifeEventInput) => Promise<LifeEvent | null>
  updateEvent: (id: string, updates: LifeEventUpdate) => Promise<LifeEvent | null>
  deleteEvent: (id: string) => Promise<boolean>
  getEvent: (id: string) => TimelineEvent | null
}

type UseLifeEventsReturn = UseLifeEventsState & UseLifeEventsActions

// ──────────────────────
// Main Hook
// ──────────────────────

/**
 * Hook for managing life events CRUD operations
 * Provides real-time updates and optimistic UI updates
 */
export function useLifeEvents(): UseLifeEventsReturn {
  const { user, isAuthenticated } = useAuth()
  
  const [state, setState] = useState<UseLifeEventsState>({
    events: [],
    loading: true,
    error: null,
    creating: false,
    updating: false,
    deleting: false
  })

  // ──────────────────────
  // Utility Functions
  // ──────────────────────

  const transformToTimelineEvent = (event: LifeEvent): TimelineEvent => {
    const startDate = new Date(event.start_date)
    const endDate = event.end_date ? new Date(event.end_date) : null
    const isOngoing = event.is_ongoing || false
    
    // Format date range
    const formatted_date_range = formatDateRange(event.start_date, event.end_date, isOngoing)
    
    // Determine event type
    const is_moment = !event.end_date || event.end_date === event.start_date
    const is_duration = !is_moment
    
    // Calculate duration in days
    let days_duration: number | null = null
    if (endDate && !isOngoing) {
      days_duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    }

    return {
      ...event,
      formatted_date_range,
      is_moment,
      is_duration,
      days_duration,
      media_objects: [],
      media_count: 0,
      primary_media: null
    }
  }

  const formatDateRange = (startDate: string, endDate?: string | null, isOngoing?: boolean): string => {
    const start = new Date(startDate)
    const startFormatted = start.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
    
    if (isOngoing) {
      return `${startFormatted} - Present`
    }
    
    if (!endDate || endDate === startDate) {
      return startFormatted
    }
    
    const end = new Date(endDate)
    const endFormatted = end.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
    
    return `${startFormatted} - ${endFormatted}`
  }

  // ──────────────────────
  // Data Fetching
  // ──────────────────────

  const fetchEvents = useCallback(async () => {
    if (!user?.id) {
      setState(prev => ({ ...prev, events: [], loading: false, error: null }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      console.log('🔍 Fetching life events for user:', user.id)
      
      // Direct query to life_event table - table existence check not needed since this will fail gracefully
      const { data, error } = await supabase
        .from('life_event')
        .select(`
          *,
          media_objects:media_object(*)
        `)
        .eq('user_id', user.id)
        .order('start_date', { ascending: false })

      if (error) {
        console.error('❌ Error fetching life events:', error)
        console.error('❌ Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: `Failed to load events: ${error.message}${error.hint ? ` (${error.hint})` : ''}` 
        }))
        return
      }

      console.log('✅ Fetched life events:', data?.length || 0, 'events')

      // Transform events with media information
      const timelineEvents: TimelineEvent[] = (data || []).map((event: LifeEvent & { media_objects?: MediaObject[] }) => {
        const timelineEvent = transformToTimelineEvent(event)
        
        // Add media information
        const mediaObjects: MediaObject[] = (event.media_objects || []) as MediaObject[]
        timelineEvent.media_objects = mediaObjects
        timelineEvent.media_count = mediaObjects.length
        timelineEvent.primary_media = mediaObjects.find((m: MediaObject) => m.media_type === 'image') || mediaObjects[0] || null
        
        return timelineEvent
      })

      setState(prev => ({ 
        ...prev, 
        events: timelineEvents, 
        loading: false, 
        error: null 
      }))

    } catch (error) {
      console.error('❌ Unexpected error fetching life events:', error)
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'An unexpected error occurred while loading events' 
      }))
    }
  }, [user?.id])

  // ──────────────────────
  // CRUD Operations
  // ──────────────────────

  const createEvent = async (input: LifeEventInput): Promise<LifeEvent | null> => {
    if (!user?.id) {
      console.error('❌ Cannot create event: User not authenticated')
      return null
    }

    setState(prev => ({ ...prev, creating: true, error: null }))

    try {
      console.log('📝 Creating life event:', input.title)

      const eventData = {
        ...input,
        user_id: user.id
      }

      const { data, error } = await supabase
        .from('life_event')
        .insert([eventData])
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating life event:', error)
        setState(prev => ({ 
          ...prev, 
          creating: false, 
          error: `Failed to create event: ${error.message}` 
        }))
        return null
      }

      console.log('✅ Created life event:', data.id)

      // Optimistically add to local state
      const newTimelineEvent = transformToTimelineEvent(data)
      setState(prev => ({ 
        ...prev, 
        events: [newTimelineEvent, ...prev.events].sort((a: TimelineEvent, b: TimelineEvent) => 
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
        ),
        creating: false 
      }))

      return data

    } catch (error) {
      console.error('❌ Unexpected error creating life event:', error)
      setState(prev => ({ 
        ...prev, 
        creating: false, 
        error: 'An unexpected error occurred while creating the event' 
      }))
      return null
    }
  }

  const updateEvent = async (id: string, updates: LifeEventUpdate): Promise<LifeEvent | null> => {
    if (!user?.id) {
      console.error('❌ Cannot update event: User not authenticated')
      return null
    }

    setState(prev => ({ ...prev, updating: true, error: null }))

    try {
      console.log('📝 Updating life event:', id, updates)

      const { data, error } = await supabase
        .from('life_event')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id) // Ensure user owns the event
        .select()
        .single()

      if (error || !data) {
        console.error('❌ Error updating life event:', error)
        setState(prev => ({ 
          ...prev,
          updating: false,
          error: `Failed to update event: ${error?.message || 'Unknown error'}`
        }))
        return null
      }

      console.log('✅ Updated life event:', data.id)

      // Update local state
      const updatedTimelineEvent = transformToTimelineEvent(data)
      setState(prev => ({ 
        ...prev, 
        events: prev.events
          .map((event: TimelineEvent) => 
            event.id === id 
              ? { 
                  ...updatedTimelineEvent, 
                  ...(event.media_objects ? { media_objects: event.media_objects } : {})
                } 
              : event
          )
          .sort((a: TimelineEvent, b: TimelineEvent) => 
            new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
          ),
        updating: false 
      }))

      return data

    } catch (error) {
      console.error('❌ Unexpected error updating life event:', error)
      setState(prev => ({ 
        ...prev, 
        updating: false, 
        error: 'An unexpected error occurred while updating the event' 
      }))
      return null
    }
  }

const deleteEvent = async (id: string): Promise<boolean> => {
  if (!user?.id) {
    console.error('❌ Cannot delete event: User not authenticated')
    return false
  }

  setState(prev => ({ ...prev, deleting: true, error: null }))

  try {
    console.log('🗑️ Deleting life event:', id)

    const { error } = await supabase
      .from('life_event')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns the event

    if (error) {
      console.error('❌ Error deleting life event:', error)
      setState(prev => ({ 
        ...prev, 
        deleting: false, 
        error: `Failed to delete event: ${error.message}` 
      }))
      return false
    }

    console.log('✅ Deleted life event:', id)

    // Remove from local state
    setState(prev => ({ 
      ...prev, 
      events: prev.events.filter((event: TimelineEvent) => event.id !== id),
      deleting: false 
    }))

    return true

  } catch (error) {
    console.error('❌ Unexpected error deleting life event:', error)
    setState(prev => ({ 
      ...prev, 
      deleting: false, 
      error: 'An unexpected error occurred while deleting the event' 
    }))
    return false
  }
}

const getEvent = (id: string): TimelineEvent | null => {
  return state.events.find((event: TimelineEvent) => event.id === id) || null
}

const refetch = async (): Promise<void> => {
  await fetchEvents()
}

// ──────────────────────
// Effects
// ──────────────────────

// Initial load and auth state changes
useEffect(() => {
  if (isAuthenticated && user) {
    fetchEvents()
  } else {
    setState(prev => ({ ...prev, events: [], loading: false, error: null }))
  }
}, [isAuthenticated, user, fetchEvents])

// Real-time subscriptions
useEffect(() => {
  if (!user?.id) return

  console.log('🔄 Setting up real-time subscription for user:', user.id)

  const subscription = supabase
    .channel(`life_events:${user.id}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'life_event',
        filter: `user_id=eq.${user.id}`
      },
      (payload: any) => {
        console.log('🔄 Real-time update:', payload)
        
        if (payload.eventType === 'INSERT') {
          const newEvent = transformToTimelineEvent(payload.new as LifeEvent)
          setState(prev => ({
            ...prev,
            events: [newEvent, ...prev.events].sort((a: TimelineEvent, b: TimelineEvent) => 
              new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
            )
          }))
        } else if (payload.eventType === 'UPDATE') {
          const updatedEvent = transformToTimelineEvent(payload.new as LifeEvent)
          setState(prev => ({
            ...prev,
            events: prev.events.map((event: TimelineEvent) => 
              event.id === payload.new.id 
                ? { 
                    ...updatedEvent, 
                    ...(event.media_objects ? { media_objects: event.media_objects } : {})
                  } 
                : event
            ).sort((a: TimelineEvent, b: TimelineEvent) => 
              new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
            )
          }))
        } else if (payload.eventType === 'DELETE') {
          setState(prev => ({
            ...prev,
            events: prev.events.filter((event: TimelineEvent) => event.id !== payload.old.id)
          }))
        }
      }
    )
      .subscribe()

    return () => {
      console.log('🔄 Cleaning up real-time subscription')
      subscription.unsubscribe()
    }
  }, [user?.id])

  // ──────────────────────
  // Return Hook Interface
  // ──────────────────────

  return {
    // State
    events: state.events,
    loading: state.loading,
    error: state.error,
    creating: state.creating,
    updating: state.updating,
    deleting: state.deleting,
    
    // Actions
    refetch,
    createEvent,
    updateEvent,
    deleteEvent,
    getEvent
  }
} 