'use client'

import { useAuth } from '@/hooks/useAuth'
import { useTimelineFilters } from '@/hooks/useTimelineFilters'
import { TopicService } from '@/services/topicService'
import { hasActiveFilters } from '@/utils/timelineFilters'
import { useState, useEffect } from 'react'
import type { Topic } from '@/services/topicService'

// ──────────────────────
// Filter Chips Component
// ──────────────────────

interface FilterChipsProps {
  className?: string
}

/**
 * Active Filter Chips Display
 * Shows currently active filters with ability to remove them individually
 */
export function FilterChips({ className = '' }: FilterChipsProps) {
  const { user } = useAuth()
  const filters = useTimelineFilters()
  const [topics, setTopics] = useState<Topic[]>([])

  // Load topics for name resolution
  useEffect(() => {
    const loadTopics = async () => {
      if (!user?.id) {
        setTopics(TopicService.getDefaultTopics())
        return
      }

      try {
        const allTopics = await TopicService.getAllTopics(user.id)
        setTopics(allTopics)
      } catch (error) {
        console.error('Failed to load topics for chips:', error)
        setTopics(TopicService.getDefaultTopics())
      }
    }

    loadTopics()
  }, [user?.id])

  // Helper to get topic name from ID
  const getTopicName = (topicId: string): string => {
    const topic = topics.find(t => t.id === topicId)
    return topic?.name || topicId
  }

  // Helper to remove specific filter
  const removeTopicFilter = (topicId: string) => {
    const newTopics = filters.topics.filter(id => id !== topicId)
    filters.setTopics(newTopics)
  }

  const clearKeywords = () => {
    filters.setKeywords('')
  }

  const clearDateRange = () => {
    filters.setDateRange({})
  }

  const resetSort = () => {
    filters.setSortBy('date-desc')
  }

  // Don't render if no active filters
  if (!hasActiveFilters(filters)) {
    return null
  }

  return (
    <div className={`filter-chips-container ${className}`}>
      <div className="filter-chips-header">
        <span className="filter-chips-label">Active filters:</span>
        <button
          onClick={filters.clearFilters}
          className="clear-all-filters-button"
          title="Clear all filters"
        >
          Clear all
        </button>
      </div>
      
      <div className="filter-chips-list">
        {/* Topic filters */}
        {filters.topics.map(topicId => (
          <div key={topicId} className="filter-chip topic-chip">
            <span className="filter-chip-label">
              Topic: {getTopicName(topicId)}
            </span>
            <button
              onClick={() => removeTopicFilter(topicId)}
              className="filter-chip-remove"
              aria-label={`Remove ${getTopicName(topicId)} filter`}
            >
              ×
            </button>
          </div>
        ))}

        {/* Keywords filter */}
        {filters.keywords && (
          <div className="filter-chip keywords-chip">
            <span className="filter-chip-label">
              Search: "{filters.keywords}"
            </span>
            <button
              onClick={clearKeywords}
              className="filter-chip-remove"
              aria-label="Clear search"
            >
              ×
            </button>
          </div>
        )}

        {/* Date range filter */}
        {(filters.dateRange.start || filters.dateRange.end) && (
          <div className="filter-chip date-chip">
            <span className="filter-chip-label">
              Date: {filters.dateRange.start || '...'} to {filters.dateRange.end || '...'}
            </span>
            <button
              onClick={clearDateRange}
              className="filter-chip-remove"
              aria-label="Clear date filter"
            >
              ×
            </button>
          </div>
        )}

        {/* Sort filter */}
        {filters.sortBy !== 'date-desc' && (
          <div className="filter-chip sort-chip">
            <span className="filter-chip-label">
              Sort: {getSortLabel(filters.sortBy)}
            </span>
            <button
              onClick={resetSort}
              className="filter-chip-remove"
              aria-label="Reset to default sort"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function for sort labels
function getSortLabel(sortBy: string): string {
  switch (sortBy) {
    case 'date-desc': return 'Date (Newest First)'
    case 'date-asc': return 'Date (Oldest First)'
    case 'title-asc': return 'Title (A-Z)'
    case 'title-desc': return 'Title (Z-A)'
    default: return sortBy
  }
}

// ──────────────────────
// Styles for Filter Chips
// ──────────────────────

const styles = `
.filter-chips-container {
  margin-bottom: 16px;
}

.filter-chips-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.filter-chips-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--md-sys-color-on-surface-variant);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.clear-all-filters-button {
  background: none;
  border: none;
  color: var(--md-sys-color-primary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.clear-all-filters-button:hover {
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}

.filter-chips-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--md-sys-color-surface-container-high);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  color: var(--md-sys-color-on-surface);
  max-width: 250px;
}

.filter-chip-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.filter-chip-remove {
  background: none;
  border: none;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 16px;
  font-weight: 400;
  cursor: pointer;
  padding: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  line-height: 1;
}

.filter-chip-remove:hover {
  background: var(--md-sys-color-error-container);
  color: var(--md-sys-color-on-error-container);
}

.topic-chip {
  border-color: var(--md-sys-color-primary-outline);
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}

.keywords-chip {
  border-color: var(--md-sys-color-secondary-outline);
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}

.date-chip {
  border-color: var(--md-sys-color-tertiary-outline);
  background: var(--md-sys-color-tertiary-container);
  color: var(--md-sys-color-on-tertiary-container);
}

.sort-chip {
  border-color: var(--md-sys-color-outline);
  background: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface-variant);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .filter-chips-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .filter-chip {
    font-size: 11px;
    padding: 5px 10px;
    max-width: 200px;
  }
}
`

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('filter-chips-styles')) {
  const styleSheet = document.createElement('style')
  styleSheet.id = 'filter-chips-styles'
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}
