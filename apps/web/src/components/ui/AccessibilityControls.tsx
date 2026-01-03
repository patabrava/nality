'use client'

import React from 'react'
import useAccessibilityEnhancements from '@/hooks/useAccessibilityEnhancements'

/**
 * AccessibilityControls Component
 * 
 * Provides interactive controls for users to toggle accessibility features
 * including high contrast mode, reduced motion, large text, and keyboard navigation.
 * 
 * Features:
 * - High contrast mode toggle
 * - Reduced motion preferences
 * - Large text scaling
 * - Keyboard navigation enhancement
 * - Screen reader announcements
 * - ARIA compliance with pressed states
 */
const AccessibilityControls: React.FC = () => {
  const { features, toggleFeature } = useAccessibilityEnhancements()

  return (
    <div 
      className="accessibility-controls" 
      role="region" 
      aria-label="Accessibility Controls"
    >
      <h3 className="accessibility-controls__title">
        Accessibility Options
      </h3>
      
      <div className="accessibility-controls__buttons">
        <button
          onClick={() => toggleFeature('highContrast')}
          aria-pressed={features.highContrast}
          className="accessibility-toggle accessibility-toggle--contrast"
          type="button"
        >
          <span className="accessibility-toggle__label">
            High Contrast
          </span>
          <span className="accessibility-toggle__status">
            {features.highContrast ? 'On' : 'Off'}
          </span>
        </button>
        
        <button
          onClick={() => toggleFeature('reducedMotion')}
          aria-pressed={features.reducedMotion}
          className="accessibility-toggle accessibility-toggle--motion"
          type="button"
        >
          <span className="accessibility-toggle__label">
            Reduced Motion
          </span>
          <span className="accessibility-toggle__status">
            {features.reducedMotion ? 'On' : 'Off'}
          </span>
        </button>
        
        <button
          onClick={() => toggleFeature('largeText')}
          aria-pressed={features.largeText}
          className="accessibility-toggle accessibility-toggle--text"
          type="button"
        >
          <span className="accessibility-toggle__label">
            Large Text
          </span>
          <span className="accessibility-toggle__status">
            {features.largeText ? 'On' : 'Off'}
          </span>
        </button>
        
        <button
          onClick={() => toggleFeature('keyboardNavigation')}
          aria-pressed={features.keyboardNavigation}
          className="accessibility-toggle accessibility-toggle--keyboard"
          type="button"
        >
          <span className="accessibility-toggle__label">
            Keyboard Navigation
          </span>
          <span className="accessibility-toggle__status">
            {features.keyboardNavigation ? 'On' : 'Off'}
          </span>
        </button>
      </div>
    </div>
  )
}

export default AccessibilityControls