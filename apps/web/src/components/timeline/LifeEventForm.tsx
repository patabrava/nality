'use client'

import { useState, useEffect } from 'react'
import type { TimelineEvent, LifeEventFormData, LifeEventCategoryType } from '@nality/schema'
import { EnhancedTopicDropdown } from './EnhancedTopicDropdown'
import { TopicService } from '@/services/topicService'

// ──────────────────────
// Component Props
// ──────────────────────

interface LifeEventFormProps {
  event?: TimelineEvent | null // For editing existing events
  onSubmit: (data: LifeEventFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  className?: string
}

// ──────────────────────
// Form Data Type
// ──────────────────────

interface FormState {
  title: string
  description: string
  start_date: string
  end_date: string
  is_ongoing: boolean
  category: string
  location: string
  importance: number
  tags: string[]
  tagInput: string
}

interface FormErrors {
  title?: string
  start_date?: string
  end_date?: string
  general?: string
}

// ──────────────────────
// Category Options
// ──────────────────────

const CATEGORY_OPTIONS = [
  { value: 'personal', label: 'Personal' },
  { value: 'education', label: 'Education' },
  { value: 'career', label: 'Career' },
  { value: 'family', label: 'Family' },
  { value: 'travel', label: 'Travel' },
  { value: 'achievement', label: 'Achievement' },
  { value: 'health', label: 'Health' },
  { value: 'relationship', label: 'Relationship' },
  { value: 'other', label: 'Other' },
]

// ──────────────────────
// Main Component
// ──────────────────────

/**
 * Life Event Form Component
 * Material Design 3 Form following progressive construction principles
 * Observable Implementation: Comprehensive validation and state tracking
 */
export function LifeEventForm({
  event,
  onSubmit,
  onCancel,
  isLoading = false,
  className = ''
}: LifeEventFormProps) {
  const [formState, setFormState] = useState<FormState>({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    is_ongoing: false,
    category: 'personal',
    location: '',
    importance: 5,
    tags: [],
    tagInput: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isDirty, setIsDirty] = useState(false)

  const isEditing = !!event

  console.log('[LifeEventForm] Component rendered', { isEditing, eventId: event?.id })

  // ──────────────────────
  // Initialize Form Data - Deterministic State
  // ──────────────────────

  useEffect(() => {
    if (event) {
      console.log('[LifeEventForm] Initializing form with event data', event)
      setFormState({
        title: event.title || '',
        description: event.description || '',
        start_date: event.start_date || '',
        end_date: event.end_date || '',
        is_ongoing: event.is_ongoing || false,
        category: event.category || 'personal',
        location: event.location || '',
        importance: event.importance || 5,
        tags: event.tags || [],
        tagInput: ''
      })
    }
  }, [event])

  // ──────────────────────
  // Form Validation - Explicit Error Handling
  // ──────────────────────

  const validateForm = (): boolean => {
    console.log('[LifeEventForm] Validating form', formState)
    const newErrors: FormErrors = {}

    // Title validation
    if (!formState.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formState.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters'
    }

    // Start date validation
    if (!formState.start_date) {
      newErrors.start_date = 'Start date is required'
    }

    // End date validation
    if (formState.end_date && !formState.is_ongoing) {
      const startDate = new Date(formState.start_date)
      const endDate = new Date(formState.end_date)
      
      if (endDate < startDate) {
        newErrors.end_date = 'End date cannot be before start date'
      }
    }

    setErrors(newErrors)
    const isValid = Object.keys(newErrors).length === 0
    console.log('[LifeEventForm] Validation result', { isValid, errors: newErrors })
    return isValid
  }

  // ──────────────────────
  // Event Handlers - Observable Implementation
  // ──────────────────────

  const handleInputChange = (field: keyof FormState, value: any) => {
    console.log('[LifeEventForm] Input changed', { field, value })
    setFormState(prev => ({ ...prev, [field]: value }))
    setIsDirty(true)
    
    // Clear related errors
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }

    // Handle ongoing toggle
    if (field === 'is_ongoing' && value) {
      setFormState(prev => ({ ...prev, end_date: '' }))
    }
  }

  const handleTagAdd = () => {
    const tagToAdd = formState.tagInput.trim().toLowerCase()
    if (tagToAdd && !formState.tags.includes(tagToAdd)) {
      console.log('[LifeEventForm] Adding tag', tagToAdd)
      setFormState(prev => ({
        ...prev,
        tags: [...prev.tags, tagToAdd],
        tagInput: ''
      }))
      setIsDirty(true)
    }
  }

  const handleTagRemove = (tagToRemove: string) => {
    console.log('[LifeEventForm] Removing tag', tagToRemove)
    setFormState(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
    setIsDirty(true)
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleTagAdd()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('[LifeEventForm] Form submission started')
    
    if (!validateForm()) {
      console.log('[LifeEventForm] Form validation failed')
      return
    }

    try {
      const formData: LifeEventFormData = {
        title: formState.title.trim(),
        description: formState.description.trim() || '',
        start_date: formState.start_date,
        end_date: formState.is_ongoing ? '' : formState.end_date || '',
        is_ongoing: formState.is_ongoing,
        // CODE_EXPANSION: Map topic back to category for database compatibility
        category: (TopicService.mapTopicToCategory(formState.category) || formState.category) as LifeEventCategoryType,
        location: formState.location.trim() || '',
        importance: formState.importance,
        tags: formState.tags
      }

      console.log('[LifeEventForm] Submitting form data', formData)
      await onSubmit(formData)
    } catch (error) {
      console.error('[LifeEventForm] Form submission error:', error)
      setErrors({ general: 'Failed to save event. Please try again.' })
    }
  }

  const handleCancel = () => {
    console.log('[LifeEventForm] Cancel requested', { isDirty })
    if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
      return
    }
    onCancel()
  }

  // ──────────────────────
  // Render Helpers - Progressive Construction
  // ──────────────────────

  const renderFormField = (
    label: string,
    children: React.ReactNode,
    error?: string,
    required = false
  ) => (
    <div className="form-group">
      <label className={`form-label ${required ? 'required' : ''}`}>
        {label}
      </label>
      {children}
      {error && (
        <span className="form-error" role="alert">
          {error}
        </span>
      )}
    </div>
  )

  const renderTagInput = () => (
    <div className="form-group">
      <label className="form-label">
        Tags
      </label>
      <div className="flex flex-wrap gap-2 mb-4">
        {formState.tags.map((tag: string, index: number) => (
          <span
            key={index}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full"
            style={{
              backgroundColor: 'var(--md-sys-color-surface-container-high)',
              color: 'var(--md-sys-color-on-surface-variant)',
              fontSize: '0.875rem'
            }}
          >
            #{tag}
            <button
              type="button"
              onClick={() => handleTagRemove(tag)}
              className="ml-1 hover:opacity-70"
              style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
              aria-label={`Remove tag ${tag}`}
            >
              <CloseIcon />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={formState.tagInput}
          onChange={(e) => handleInputChange('tagInput', e.target.value)}
          onKeyDown={handleTagInputKeyDown}
          className="form-input flex-1"
          placeholder="Enter a tag"
          maxLength={20}
        />
        <button
          type="button"
          onClick={handleTagAdd}
          disabled={!formState.tagInput.trim()}
          className="form-button secondary"
        >
          Add
        </button>
      </div>
    </div>
  )

  // ──────────────────────
  // Main Render - Material Design 3
  // ──────────────────────

  return (
    <div className={`p-6 rounded-lg max-w-2xl mx-auto ${className}`} 
         style={{ 
           backgroundColor: 'var(--md-sys-color-surface-container)',
           color: 'var(--md-sys-color-on-surface)'
         }}>
      <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--md-sys-color-on-surface)' }}>
        {isEditing ? 'Edit Life Event' : 'Create Life Event'}
      </h2>

      {errors.general && (
        <div className="p-4 mb-6 rounded-lg" 
             style={{ 
               backgroundColor: 'var(--md-sys-color-error-container)',
               color: 'var(--md-sys-color-on-error-container)',
               border: '1px solid var(--md-sys-color-error)'
             }}>
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Title */}
        {renderFormField('Title',
          <input
            type="text"
            value={formState.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="form-input"
            placeholder="What happened?"
            maxLength={200}
            required
          />,
          errors.title,
          true
        )}

        {/* Description */}
        {renderFormField('Description',
          <textarea
            value={formState.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="form-textarea"
            placeholder="Tell the story..."
            rows={3}
          />
        )}

        {/* Date fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {renderFormField('Start Date',
            <input
              type="date"
              value={formState.start_date}
              onChange={(e) => handleInputChange('start_date', e.target.value)}
              className="form-input"
              required
            />,
            errors.start_date,
            true
          )}

          {renderFormField('End Date',
            <input
              type="date"
              value={formState.end_date}
              onChange={(e) => handleInputChange('end_date', e.target.value)}
              className="form-input"
              disabled={formState.is_ongoing}
            />,
            errors.end_date
          )}
        </div>

        {/* Ongoing checkbox */}
        <div className="form-group">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={formState.is_ongoing}
              onChange={(e) => handleInputChange('is_ongoing', e.target.checked)}
              className="w-4 h-4 rounded"
              style={{ accentColor: 'var(--md-sys-color-primary)' }}
            />
            This is ongoing
          </label>
        </div>

        {/* Category and Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {renderFormField('Category',
            <EnhancedTopicDropdown
              value={formState.category}
              onChange={(value) => handleInputChange('category', value)}
              className="form-select"
            />
          )}

          {renderFormField('Location',
            <input
              type="text"
              value={formState.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="form-input"
              placeholder="Where did this happen?"
            />
          )}
        </div>

        {/* Importance */}
        {renderFormField('Importance',
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="10"
              value={formState.importance}
              onChange={(e) => handleInputChange('importance', parseInt(e.target.value))}
              className="flex-1"
              style={{ accentColor: 'var(--md-sys-color-primary)' }}
            />
            <span className="text-sm font-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
              {formState.importance}/10
            </span>
          </div>
        )}

        {/* Tags */}
        {renderTagInput()}

        {/* Actions */}
        <div className="form-buttons">
          <button
            type="button"
            onClick={handleCancel}
            className="form-button secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="form-button primary"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : (isEditing ? 'Update Event' : 'Create Event')}
          </button>
        </div>
      </form>
    </div>
  )
}

// ──────────────────────
// Icon Components
// ──────────────────────

function CloseIcon() {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className="w-3 h-3" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}
