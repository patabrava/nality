'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { TopicService, type Topic } from '@/services/topicService'
import { 
  useTimelineFilters, 
  type SortOption, 
  type UseTimelineFiltersReturn 
} from '@/hooks/useTimelineFilters'
import { hasActiveFilters } from '@/utils/timelineFilters'

// ──────────────────────
// Timeline Filters Component
// ──────────────────────

interface TimelineFiltersProps {
  className?: string
}

/**
 * Timeline Filters Panel
 * Provides filtering and sorting controls for the timeline
 * CODE_EXPANSION: Adds filtering without affecting existing timeline functionality
 */
export function TimelineFilters({ className = '' }: TimelineFiltersProps) {
  const { user } = useAuth()
  const filters = useTimelineFilters()
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)

  // ──────────────────────
  // Load Topics
  // ──────────────────────

  useEffect(() => {
    const loadTopics = async () => {
      if (!user?.id) {
        setTopics(TopicService.getDefaultTopics())
        setLoading(false)
        return
      }

      try {
        const allTopics = await TopicService.getAllTopics(user.id)
        setTopics(allTopics)
      } catch (error) {
        console.error('Failed to load topics for filter:', error)
        setTopics(TopicService.getDefaultTopics())
      } finally {
        setLoading(false)
      }
    }

    loadTopics()
  }, [user?.id])

  // ──────────────────────
  // Event Handlers
  // ──────────────────────

  const handleTopicToggle = (topicId: string) => {
    const newTopics = filters.topics.includes(topicId)
      ? filters.topics.filter(id => id !== topicId)
      : [...filters.topics, topicId]
    
    filters.setTopics(newTopics)
  }

  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    filters.setKeywords(e.target.value)
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    filters.setSortBy(e.target.value as SortOption)
  }

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    filters.setDateRange({
      ...filters.dateRange,
      [field]: value || undefined
    })
  }

  // ──────────────────────
  // Render Filter Panel
  // ──────────────────────

  if (!filters.isVisible) {
    return (
      <div className={`timeline-filters-toggle ${className}`}>
        <button
          onClick={filters.toggleVisibility}
          className="filter-toggle-button"
          aria-label="Show filters"
        >
          <FilterIcon />
          <span>Filters & Sort</span>
          {hasActiveFilters(filters) && (
            <span className="active-filters-indicator">
              {filters.topics.length + (filters.keywords ? 1 : 0) + 
               (filters.dateRange.start || filters.dateRange.end ? 1 : 0)}
            </span>
          )}
        </button>
      </div>
    )
  }

  return (
    <div className={`timeline-filters-panel ${className}`}>
      {/* Header */}
      <div className="filters-header">
        <div className="filters-title">
          <FilterIcon />
          <h3>Filters & Sort</h3>
        </div>
        <button
          onClick={filters.toggleVisibility}
          className="filter-close-button"
          aria-label="Hide filters"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Filter Content */}
      <div className="filters-content">
        
        {/* Topics Filter */}
        <div className="filter-section">
          <label className="filter-label">Topics</label>
          {loading ? (
            <div className="filter-loading">Loading topics...</div>
          ) : (
            <div className="topic-filter-grid">
              {topics.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => handleTopicToggle(topic.id)}
                  className={`topic-chip ${
                    filters.topics.includes(topic.id) ? 'selected' : ''
                  } ${topic.is_default ? 'default-topic' : 'custom-topic'}`}
                  aria-pressed={filters.topics.includes(topic.id)}
                >
                  {topic.name}
                  {filters.topics.includes(topic.id) && <CheckIcon />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Keywords Search */}
        <div className="filter-section">
          <label className="filter-label" htmlFor="keywords-search">
            Search Keywords
          </label>
          <div className="search-input-container">
            <SearchIcon />
            <input
              id="keywords-search"
              type="text"
              value={filters.keywords}
              onChange={handleKeywordsChange}
              placeholder="Search in titles, descriptions, locations..."
              className="filter-search-input"
            />
            {filters.keywords && (
              <button
                onClick={() => filters.setKeywords('')}
                className="clear-search-button"
                aria-label="Clear search"
              >
                <CloseIcon />
              </button>
            )}
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="filter-section">
          <label className="filter-label">Date Range</label>
          <div className="date-range-inputs">
            <div className="date-input-group">
              <label className="date-input-label">From</label>
              <input
                type="date"
                value={filters.dateRange.start || ''}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                className="filter-date-input"
              />
            </div>
            <div className="date-input-group">
              <label className="date-input-label">To</label>
              <input
                type="date"
                value={filters.dateRange.end || ''}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                className="filter-date-input"
              />
            </div>
          </div>
        </div>

        {/* Sort Options */}
        <div className="filter-section">
          <label className="filter-label" htmlFor="sort-select">
            Sort By
          </label>
          <select
            id="sort-select"
            value={filters.sortBy}
            onChange={handleSortChange}
            className="filter-sort-select"
          >
            <option value="date-desc">Date (Newest First)</option>
            <option value="date-asc">Date (Oldest First)</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
          </select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters(filters) && (
          <div className="filter-actions">
            <button
              onClick={filters.clearFilters}
              className="clear-filters-button"
            >
              <CloseIcon />
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ──────────────────────
// Icon Components
// ──────────────────────

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" className="filter-icon">
      <path fill="currentColor" d="M14,12V19.88C14.04,20.18 13.94,20.5 13.71,20.71C13.32,21.1 12.69,21.1 12.3,20.71L10.29,18.7C10.06,18.47 9.96,18.16 10,17.87V12H9.97L4.21,4.62C3.87,4.19 3.95,3.56 4.38,3.22C4.57,3.08 4.78,3 5,3V3H19V3C19.22,3 19.43,3.08 19.62,3.22C20.05,3.56 20.13,4.19 19.79,4.62L14.03,12H14Z" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="search-icon">
      <path fill="currentColor" d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="close-icon">
      <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="check-icon">
      <path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
    </svg>
  )
}

// ──────────────────────
// Styles for Timeline Filters
// ──────────────────────

const styles = `
.timeline-filters-toggle {
  margin-bottom: 16px;
}

.filter-toggle-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 12px;
  color: var(--md-sys-color-on-surface);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
}

.filter-toggle-button:hover {
  background: var(--md-sys-color-surface-container-high);
  border-color: var(--md-sys-color-outline);
}

.active-filters-indicator {
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}

.timeline-filters-panel {
  background: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 16px;
  margin-bottom: 24px;
  overflow: hidden;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
  background: var(--md-sys-color-surface-container-high);
}

.filters-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filters-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.filter-close-button {
  background: none;
  border: none;
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.filter-close-button:hover {
  background: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface);
}

.filters-content {
  padding: 20px;
}

.filter-section {
  margin-bottom: 24px;
}

.filter-section:last-child {
  margin-bottom: 0;
}

.filter-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
  margin-bottom: 8px;
}

.filter-loading {
  color: var(--md-sys-color-on-surface-variant);
  font-style: italic;
  padding: 8px 0;
}

.topic-filter-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.topic-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: var(--md-sys-color-surface-variant);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 20px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.topic-chip:hover {
  background: var(--md-sys-color-surface-container-high);
  border-color: var(--md-sys-color-outline);
}

.topic-chip.selected {
  background: var(--md-sys-color-primary-container);
  border-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary-container);
}

.topic-chip.custom-topic {
  border-style: dashed;
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input-container .search-icon {
  position: absolute;
  left: 12px;
  width: 16px;
  height: 16px;
  color: var(--md-sys-color-on-surface-variant);
  pointer-events: none;
  z-index: 1;
}

.filter-search-input {
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 12px;
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  font-size: 14px;
  transition: all 0.2s ease;
}

.filter-search-input:focus {
  outline: none;
  border-color: var(--md-sys-color-primary);
  box-shadow: 0 0 0 2px var(--md-sys-color-primary-container);
}

.clear-search-button {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.clear-search-button:hover {
  background: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface);
}

.date-range-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.date-input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-input-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--md-sys-color-on-surface-variant);
}

.filter-date-input {
  padding: 10px 12px;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 8px;
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  font-size: 14px;
  transition: all 0.2s ease;
}

.filter-date-input:focus {
  outline: none;
  border-color: var(--md-sys-color-primary);
  box-shadow: 0 0 0 2px var(--md-sys-color-primary-container);
}

.filter-sort-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 12px;
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  font-size: 14px;
  transition: all 0.2s ease;
}

.filter-sort-select:focus {
  outline: none;
  border-color: var(--md-sys-color-primary);
  box-shadow: 0 0 0 2px var(--md-sys-color-primary-container);
}

.filter-actions {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--md-sys-color-outline-variant);
}

.clear-filters-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: none;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 10px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  justify-content: center;
}

.clear-filters-button:hover {
  background: var(--md-sys-color-error-container);
  border-color: var(--md-sys-color-error);
  color: var(--md-sys-color-on-error-container);
}

.filter-icon,
.search-icon,
.close-icon,
.check-icon {
  width: 16px;
  height: 16px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .date-range-inputs {
    grid-template-columns: 1fr;
  }
  
  .topic-filter-grid {
    gap: 6px;
  }
  
  .topic-chip {
    font-size: 12px;
    padding: 6px 10px;
  }
  
  .filters-content {
    padding: 16px;
  }
}
`

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('timeline-filters-styles')) {
  const styleSheet = document.createElement('style')
  styleSheet.id = 'timeline-filters-styles'
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}
