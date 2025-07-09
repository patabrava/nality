'use client'

import { useState, useEffect } from 'react'
import type { LifeEventFormData, LifeEventCategoryType, TimelineEvent } from '@nality/schema'

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
 * Handles creating and editing life events with comprehensive validation
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

  // ──────────────────────
  // Initialize Form Data
  // ──────────────────────

  useEffect(() => {
    if (event) {
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
  // Form Validation
  // ──────────────────────

  const validateForm = (): boolean => {
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
    return Object.keys(newErrors).length === 0
  }

  // ──────────────────────
  // Event Handlers
  // ──────────────────────

  const handleInputChange = (field: keyof FormState, value: any) => {
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
      setFormState(prev => ({
        ...prev,
        tags: [...prev.tags, tagToAdd],
        tagInput: ''
      }))
      setIsDirty(true)
    }
  }

  const handleTagRemove = (tagToRemove: string) => {
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
    
    if (!validateForm()) {
      return
    }

    try {
      const formData: LifeEventFormData = {
        title: formState.title.trim(),
        description: formState.description.trim() || undefined,
        start_date: formState.start_date,
        end_date: formState.is_ongoing ? undefined : formState.end_date || undefined,
        is_ongoing: formState.is_ongoing,
        category: formState.category as LifeEventCategoryType,
        location: formState.location.trim() || undefined,
        importance: formState.importance,
        tags: formState.tags.length > 0 ? formState.tags : undefined
      }

      await onSubmit(formData)
    } catch (error) {
      console.error('Form submission error:', error)
      setErrors({ general: 'Failed to save event. Please try again.' })
    }
  }

  const handleCancel = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
      return
    }
    onCancel()
  }

  // ──────────────────────
  // Render Helpers
  // ──────────────────────

  const renderFormField = (
    label: string,
    error?: string,
    required = false,
    children: React.ReactNode
  ) => (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-white mb-2">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-red-400 text-sm mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  )

  const renderTagInput = () => (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-white mb-2">
        Tags
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {formState.tags.map((tag: string, index: number) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-dark text-white text-sm rounded-md"
          >
            #{tag}
            <button
              type="button"
              onClick={() => handleTagRemove(tag)}
              className="text-neutral-medium hover:text-white ml-1"
              aria-label={`Remove tag ${tag}`}
            >
              ×
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
          className="form-element flex-1"
          placeholder="Enter a tag"
          maxLength={20}
        />
        <button
          type="button"
          onClick={handleTagAdd}
          disabled={!formState.tagInput.trim()}
          className="btn btn-secondary px-4"
        >
          Add
        </button>
      </div>
    </div>
  )

  // ──────────────────────
  // Main Render
  // ──────────────────────

  return (
    <div className={`bg-black text-white p-6 rounded-lg max-w-2xl mx-auto ${className}`}>
      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? 'Edit Life Event' : 'Create Life Event'}
      </h2>

      {errors.general && (
        <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-md mb-6">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Title */}
        {renderFormField('Title', errors.title, true, 
          <input
            type="text"
            value={formState.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="form-element w-full"
            placeholder="What happened?"
            maxLength={200}
            required
          />
        )}

        {/* Description */}
        {renderFormField('Description', undefined, false,
          <textarea
            value={formState.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="form-element w-full h-24 resize-none"
            placeholder="Tell the story..."
            rows={3}
          />
        )}

        {/* Date fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Start Date */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Start Date <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={formState.start_date}
              onChange={(e) => handleInputChange('start_date', e.target.value)}
              className="form-element w-full"
              required
            />
            {errors.start_date && (
              <p className="text-red-400 text-sm mt-1" role="alert">
                {errors.start_date}
              </p>
            )}
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              End Date
            </label>
            <input
              type="date"
              value={formState.end_date}
              onChange={(e) => handleInputChange('end_date', e.target.value)}
              className="form-element w-full"
              disabled={formState.is_ongoing}
            />
            {errors.end_date && (
              <p className="text-red-400 text-sm mt-1" role="alert">
                {errors.end_date}
              </p>
            )}
          </div>
        </div>

        {/* Ongoing checkbox */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formState.is_ongoing}
              onChange={(e) => handleInputChange('is_ongoing', e.target.checked)}
              className="w-4 h-4 text-accent-100 rounded"
            />
            <span>This is an ongoing event</span>
          </label>
        </div>

        {/* Category and Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Category
            </label>
            <select
              value={formState.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="form-element w-full"
            >
              {CATEGORY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Location
            </label>
            <input
              type="text"
              value={formState.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="form-element w-full"
              placeholder="Where did this happen?"
            />
          </div>
        </div>

        {/* Importance */}
        {renderFormField('Importance', undefined, false,
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="10"
              value={formState.importance}
              onChange={(e) => handleInputChange('importance', parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm font-medium w-16">
              {formState.importance}/10
            </span>
          </div>
        )}

        {/* Tags */}
        {renderTagInput()}

        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t border-neutral-dark">
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary flex-1"
          >
            {isLoading ? 'Saving...' : (isEditing ? 'Update Event' : 'Create Event')}
          </button>
          
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="btn btn-secondary px-6"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
} 