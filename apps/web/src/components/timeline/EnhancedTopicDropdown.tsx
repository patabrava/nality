'use client'

import { useState, useEffect } from 'react'
import { TopicService, type Topic } from '@/services/topicService'
import { useAuth } from '@/hooks/useAuth'

// ──────────────────────
// Enhanced Topic Dropdown Component
// ──────────────────────

interface EnhancedTopicDropdownProps {
  value: string
  onChange: (value: string) => void
  className?: string
  disabled?: boolean
}

/**
 * Enhanced Topic Dropdown
 * CODE_EXPANSION: Extends existing category dropdown with custom topics
 * Maintains backward compatibility with existing category system
 */
export function EnhancedTopicDropdown({
  value,
  onChange,
  className = '',
  disabled = false
}: EnhancedTopicDropdownProps) {
  const { user } = useAuth()
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddTopic, setShowAddTopic] = useState(false)
  const [newTopicName, setNewTopicName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customTopicsAvailable, setCustomTopicsAvailable] = useState(true) // Track if custom topics are available

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
        // Check if any custom topics exist or if the table is available
        const hasCustomTopics = allTopics.some(topic => !topic.is_default)
        setCustomTopicsAvailable(hasCustomTopics || allTopics.length > TopicService.getDefaultTopics().length)
      } catch (error) {
        console.error('Failed to load topics:', error)
        // Fallback to default topics if loading fails
        setTopics(TopicService.getDefaultTopics())
        setCustomTopicsAvailable(false) // Disable custom topics on error
      } finally {
        setLoading(false)
      }
    }

    loadTopics()
  }, [user?.id])

  // ──────────────────────
  // Event Handlers
  // ──────────────────────

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value
    
    if (selectedValue === 'add-custom') {
      setShowAddTopic(true)
      return
    }
    
    onChange(selectedValue)
  }

  const handleCreateTopic = async () => {
    if (!user?.id) return

    setCreating(true)
    setError(null)

    try {
      const newTopic = await TopicService.createCustomTopic(user.id, newTopicName)
      if (newTopic) {
        // Add to local state
        setTopics(prev => [...prev, newTopic])
        // Select the new topic
        onChange(newTopic.id)
        // Reset form
        setNewTopicName('')
        setShowAddTopic(false)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create topic')
    } finally {
      setCreating(false)
    }
  }

  const handleCancelAddTopic = () => {
    setShowAddTopic(false)
    setNewTopicName('')
    setError(null)
  }

  // ──────────────────────
  // Render Add Topic Form
  // ──────────────────────

  if (showAddTopic) {
    return (
      <div className="enhanced-topic-dropdown">
        <div className="add-topic-form">
          <div className="form-group">
            <label className="form-label">Create Custom Topic</label>
            <input
              type="text"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              className="form-input"
              placeholder="Enter topic name..."
              maxLength={50}
              disabled={creating}
              autoFocus
            />
            {error && (
              <span className="form-error" role="alert">
                {error}
              </span>
            )}
          </div>
          
          <div className="add-topic-actions">
            <button
              type="button"
              onClick={handleCancelAddTopic}
              className="form-button secondary"
              disabled={creating}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateTopic}
              className="form-button primary"
              disabled={creating || !newTopicName.trim()}
            >
              {creating ? 'Creating...' : 'Create Topic'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ──────────────────────
  // Render Main Dropdown
  // ──────────────────────

  return (
    <div className="enhanced-topic-dropdown">
      <select
        value={value}
        onChange={handleSelectChange}
        className={`form-select ${className}`}
        disabled={disabled || loading}
      >
        {loading ? (
          <option value="">Loading topics...</option>
        ) : (
          <>
            {/* Default Topics - CODE_EXPANSION: Preserves existing categories */}
            <optgroup label="Categories">
              {topics
                .filter(topic => topic.is_default)
                .map(topic => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
            </optgroup>

            {/* Custom Topics */}
            {topics.some(topic => !topic.is_default) && (
              <optgroup label="My Topics">
                {topics
                  .filter(topic => !topic.is_default)
                  .map(topic => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
              </optgroup>
            )}

            {/* Add Custom Topic Option */}
            {user && customTopicsAvailable && (
              <option value="add-custom" style={{ fontStyle: 'italic' }}>
                + Add Custom Topic
              </option>
            )}
          </>
        )}
      </select>
    </div>
  )
}

// ──────────────────────
// Styles for Enhanced Topic Dropdown
// ──────────────────────

const styles = `
.enhanced-topic-dropdown {
  width: 100%;
}

.add-topic-form {
  padding: 16px;
  background: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 12px;
}

.add-topic-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  justify-content: flex-end;
}

.enhanced-topic-dropdown optgroup {
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.enhanced-topic-dropdown option {
  padding: 8px;
  color: var(--md-sys-color-on-surface);
}

.enhanced-topic-dropdown option[value="add-custom"] {
  color: var(--md-sys-color-primary);
  font-style: italic;
}
`

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('enhanced-topic-dropdown-styles')) {
  const styleSheet = document.createElement('style')
  styleSheet.id = 'enhanced-topic-dropdown-styles'
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}
