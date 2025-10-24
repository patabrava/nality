'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// ──────────────────────
// Filter State Types
// ──────────────────────

export type SortOption = 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc'

export interface FilterState {
  topics: string[]
  keywords: string
  dateRange: {
    start?: string
    end?: string
  }
  sortBy: SortOption
  isVisible: boolean
}

export interface FilterActions {
  setTopics: (topics: string[]) => void
  setKeywords: (keywords: string) => void
  setDateRange: (range: { start?: string; end?: string }) => void
  setSortBy: (sort: SortOption) => void
  toggleVisibility: () => void
  clearFilters: () => void
  resetToDefault: () => void
}

export type UseTimelineFiltersReturn = FilterState & FilterActions

// ──────────────────────
// Default Filter State
// ──────────────────────

const DEFAULT_FILTER_STATE: FilterState = {
  topics: [],
  keywords: '',
  dateRange: {},
  sortBy: 'date-desc',
  isVisible: false
}

// ──────────────────────
// Hook Implementation
// ──────────────────────

/**
 * Timeline Filters Hook
 * Manages filter state with URL persistence
 * CODE_EXPANSION: Preserves existing timeline functionality while adding filtering
 */
export function useTimelineFilters(): UseTimelineFiltersReturn {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [filterState, setFilterState] = useState<FilterState>(DEFAULT_FILTER_STATE)
  const [pendingURLUpdate, setPendingURLUpdate] = useState<FilterState | null>(null) // Track pending URL updates
  const [isInitialized, setIsInitialized] = useState(false) // Track if we've initialized from URL

  // ──────────────────────
  // URL State Management
  // ──────────────────────

  /**
   * Parse filters from URL parameters
   */
  const parseFiltersFromURL = useCallback((): FilterState => {
    const topics = searchParams.get('topics')
    const keywords = searchParams.get('keywords')
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')
    const sortBy = searchParams.get('sort')
    const isVisible = searchParams.get('filters') === 'open'

    const dateRange: { start?: string; end?: string } = {}
    if (startDate) dateRange.start = startDate
    if (endDate) dateRange.end = endDate

    return {
      topics: topics ? topics.split(',').filter(Boolean) : [],
      keywords: keywords || '',
      dateRange,
      sortBy: (sortBy as SortOption) || 'date-desc',
      isVisible
    }
  }, [searchParams])

  /**
   * Update URL with current filter state
   * CODE_EXPANSION: Modified to schedule URL updates instead of immediate execution
   */
  const scheduleURLUpdate = useCallback((newState: FilterState) => {
    setPendingURLUpdate(newState)
  }, [])

  // ──────────────────────
  // Filter Actions
  // ──────────────────────

  const setTopics = useCallback((topics: string[]) => {
    setFilterState(prev => {
      const newState = { ...prev, topics }
      scheduleURLUpdate(newState)
      return newState
    })
  }, [scheduleURLUpdate])

  const setKeywords = useCallback((keywords: string) => {
    setFilterState(prev => {
      const newState = { ...prev, keywords }
      scheduleURLUpdate(newState)
      return newState
    })
  }, [scheduleURLUpdate])

  const setDateRange = useCallback((dateRange: { start?: string; end?: string }) => {
    setFilterState(prev => {
      const newState = { ...prev, dateRange }
      scheduleURLUpdate(newState)
      return newState
    })
  }, [scheduleURLUpdate])

  const setSortBy = useCallback((sortBy: SortOption) => {
    setFilterState(prev => {
      const newState = { ...prev, sortBy }
      scheduleURLUpdate(newState)
      return newState
    })
  }, [scheduleURLUpdate])

  const toggleVisibility = useCallback(() => {
    setFilterState(prev => {
      const newState = { ...prev, isVisible: !prev.isVisible }
      scheduleURLUpdate(newState)
      return newState
    })
  }, [scheduleURLUpdate])

  const clearFilters = useCallback(() => {
    const clearedState = {
      ...DEFAULT_FILTER_STATE,
      isVisible: filterState.isVisible // Preserve visibility state
    }
    setFilterState(clearedState)
    scheduleURLUpdate(clearedState)
  }, [filterState.isVisible, scheduleURLUpdate])

  const resetToDefault = useCallback(() => {
    setFilterState(DEFAULT_FILTER_STATE)
    scheduleURLUpdate(DEFAULT_FILTER_STATE)
  }, [scheduleURLUpdate])

  // ──────────────────────
  // Effects
  // ──────────────────────

  // Initialize from URL on mount - CODE_EXPANSION: Only run once to prevent state override
  useEffect(() => {
    if (!isInitialized) {
      const urlFilters = parseFiltersFromURL()
      setFilterState(urlFilters)
      setIsInitialized(true)
    }
  }, [parseFiltersFromURL, isInitialized])

  // Handle pending URL updates - CODE_EXPANSION: Defer URL updates to avoid render-time side effects
  useEffect(() => {
    if (pendingURLUpdate) {
      const params = new URLSearchParams()
      
      // Only add non-empty values to URL
      if (pendingURLUpdate.topics.length > 0) {
        params.set('topics', pendingURLUpdate.topics.join(','))
      }
      
      if (pendingURLUpdate.keywords.trim()) {
        params.set('keywords', pendingURLUpdate.keywords.trim())
      }
      
      if (pendingURLUpdate.dateRange.start) {
        params.set('start', pendingURLUpdate.dateRange.start)
      }
      
      if (pendingURLUpdate.dateRange.end) {
        params.set('end', pendingURLUpdate.dateRange.end)
      }
      
      if (pendingURLUpdate.sortBy !== 'date-desc') {
        params.set('sort', pendingURLUpdate.sortBy)
      }
      
      if (pendingURLUpdate.isVisible) {
        params.set('filters', 'open')
      }

      const newURL = params.toString() ? `?${params.toString()}` : ''
      router.replace(newURL, { scroll: false })
      setPendingURLUpdate(null) // Clear pending update
    }
  }, [pendingURLUpdate, router])

  // ──────────────────────
  // Return Hook Interface
  // ──────────────────────

  return {
    // State
    topics: filterState.topics,
    keywords: filterState.keywords,
    dateRange: filterState.dateRange,
    sortBy: filterState.sortBy,
    isVisible: filterState.isVisible,
    
    // Actions
    setTopics,
    setKeywords,
    setDateRange,
    setSortBy,
    toggleVisibility,
    clearFilters,
    resetToDefault
  }
}
