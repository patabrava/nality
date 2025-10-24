'use client'

import type { TimelineEvent } from '@nality/schema'
import type { SortOption, FilterState } from '@/hooks/useTimelineFilters'

// ──────────────────────
// Timeline Filtering Utilities
// ──────────────────────

/**
 * Filter events by selected topics
 * CODE_EXPANSION: Maintains backward compatibility with existing categories
 */
export function filterByTopics(events: TimelineEvent[], selectedTopics: string[]): TimelineEvent[] {
  if (selectedTopics.length === 0) return events

  return events.filter(event => {
    // Map event category to topic ID for filtering
    const eventTopicId = event.category || 'other'
    return selectedTopics.includes(eventTopicId)
  })
}

/**
 * Filter events by keyword search in title and description
 */
export function searchEvents(events: TimelineEvent[], query: string): TimelineEvent[] {
  if (!query.trim()) return events

  const searchTerms = query.toLowerCase().trim().split(/\s+/)
  
  return events.filter(event => {
    const searchableText = [
      event.title,
      event.description,
      event.location,
      ...(event.tags || [])
    ].filter(Boolean).join(' ').toLowerCase()

    return searchTerms.every(term => searchableText.includes(term))
  })
}

/**
 * Filter events by date range
 */
export function filterByDateRange(
  events: TimelineEvent[], 
  dateRange: { start?: string; end?: string }
): TimelineEvent[] {
  if (!dateRange.start && !dateRange.end) return events

  return events.filter(event => {
    const eventDate = new Date(event.start_date)
    
    if (dateRange.start) {
      const startDate = new Date(dateRange.start)
      if (eventDate < startDate) return false
    }
    
    if (dateRange.end) {
      const endDate = new Date(dateRange.end)
      // For end date comparison, use event's end_date if available, otherwise start_date
      const comparisonDate = event.end_date ? new Date(event.end_date) : eventDate
      if (comparisonDate > endDate) return false
    }
    
    return true
  })
}

/**
 * Sort events by specified criteria
 */
export function sortEvents(events: TimelineEvent[], sortBy: SortOption): TimelineEvent[] {
  const sorted = [...events]

  switch (sortBy) {
    case 'date-desc':
      return sorted.sort((a, b) => 
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      )
    
    case 'date-asc':
      return sorted.sort((a, b) => 
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      )
    
    case 'title-asc':
      return sorted.sort((a, b) => 
        a.title.toLowerCase().localeCompare(b.title.toLowerCase())
      )
    
    case 'title-desc':
      return sorted.sort((a, b) => 
        b.title.toLowerCase().localeCompare(a.title.toLowerCase())
      )
    
    default:
      return sorted
  }
}

/**
 * Apply all filters to events array
 * Main filtering function that combines all filter criteria
 */
export function filterEvents(events: TimelineEvent[], filters: FilterState): TimelineEvent[] {
  let filteredEvents = events

  // Apply topic filter
  filteredEvents = filterByTopics(filteredEvents, filters.topics)

  // Apply keyword search
  filteredEvents = searchEvents(filteredEvents, filters.keywords)

  // Apply date range filter
  filteredEvents = filterByDateRange(filteredEvents, filters.dateRange)

  // Apply sorting
  filteredEvents = sortEvents(filteredEvents, filters.sortBy)

  return filteredEvents
}

/**
 * Get filter result statistics
 */
export function getFilterStats(
  originalEvents: TimelineEvent[], 
  filteredEvents: TimelineEvent[]
): {
  total: number
  filtered: number
  hasFilters: boolean
} {
  return {
    total: originalEvents.length,
    filtered: filteredEvents.length,
    hasFilters: originalEvents.length !== filteredEvents.length
  }
}

/**
 * Check if any filters are active
 */
export function hasActiveFilters(filters: FilterState): boolean {
  return (
    filters.topics.length > 0 ||
    filters.keywords.trim().length > 0 ||
    !!filters.dateRange.start ||
    !!filters.dateRange.end ||
    filters.sortBy !== 'date-desc'
  )
}

/**
 * Get debounced search function for performance
 */
export function createDebouncedSearch<T extends any[]>(
  fn: (...args: T) => any,
  delay: number = 300
) {
  let timeoutId: NodeJS.Timeout

  return (...args: T) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}
