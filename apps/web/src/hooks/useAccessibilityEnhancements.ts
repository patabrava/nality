'use client'

import { useEffect, useCallback, useState, useRef } from 'react'

interface AccessibilityFeatures {
  highContrast: boolean
  reducedMotion: boolean
  largeText: boolean
  screenReaderMode: boolean
  keyboardNavigation: boolean
}

interface UseAccessibilityReturn {
  features: AccessibilityFeatures
  toggleFeature: (feature: keyof AccessibilityFeatures) => void
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void
  focusElement: (selector: string) => void
  trapFocus: (containerRef: React.RefObject<HTMLElement>) => () => void
}

export function useAccessibilityEnhancements(): UseAccessibilityReturn {
  const [features, setFeatures] = useState<AccessibilityFeatures>({
    highContrast: false,
    reducedMotion: false,
    largeText: false,
    screenReaderMode: false,
    keyboardNavigation: false
  })

  const announcementRef = useRef<HTMLDivElement>(null)

  // Initialize accessibility features from localStorage and system preferences
  useEffect(() => {
    const savedFeatures = localStorage.getItem('accessibility_features')
    let initialFeatures = { ...features }

    if (savedFeatures) {
      try {
        const parsed = JSON.parse(savedFeatures)
        initialFeatures = { ...initialFeatures, ...parsed }
      } catch {
        // Keep defaults if parsing fails
      }
    }

    // Check system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches

    if (prefersReducedMotion) {
      initialFeatures.reducedMotion = true
    }

    if (prefersHighContrast) {
      initialFeatures.highContrast = true
    }

    // Detect screen reader usage
    const isScreenReader = window.navigator.userAgent.includes('NVDA') || 
                          window.navigator.userAgent.includes('JAWS') || 
                          window.speechSynthesis ||
                          window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (isScreenReader) {
      initialFeatures.screenReaderMode = true
    }

    setFeatures(initialFeatures)
    applyAccessibilityFeatures(initialFeatures)
  }, [])

  // Detect keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setFeatures(prev => ({ ...prev, keyboardNavigation: true }))
        document.body.classList.add('keyboard-navigation')
      }
    }

    const handleMouseDown = () => {
      setFeatures(prev => ({ ...prev, keyboardNavigation: false }))
      document.body.classList.remove('keyboard-navigation')
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  // Apply accessibility features to the document
  const applyAccessibilityFeatures = useCallback((featuresToApply: AccessibilityFeatures) => {
    const { highContrast, reducedMotion, largeText, screenReaderMode } = featuresToApply

    // High contrast mode
    if (highContrast) {
      document.body.classList.add('high-contrast')
      document.documentElement.style.setProperty('--accessibility-high-contrast', '1')
    } else {
      document.body.classList.remove('high-contrast')
      document.documentElement.style.setProperty('--accessibility-high-contrast', '0')
    }

    // Reduced motion
    if (reducedMotion) {
      document.body.classList.add('reduced-motion')
      document.documentElement.style.setProperty('--accessibility-reduced-motion', '1')
    } else {
      document.body.classList.remove('reduced-motion')
      document.documentElement.style.setProperty('--accessibility-reduced-motion', '0')
    }

    // Large text
    if (largeText) {
      document.body.classList.add('large-text')
      document.documentElement.style.setProperty('--accessibility-text-scale', '1.25')
    } else {
      document.body.classList.remove('large-text')
      document.documentElement.style.setProperty('--accessibility-text-scale', '1')
    }

    // Screen reader mode
    if (screenReaderMode) {
      document.body.classList.add('screen-reader-mode')
      document.documentElement.style.setProperty('--accessibility-screen-reader', '1')
    } else {
      document.body.classList.remove('screen-reader-mode')
      document.documentElement.style.setProperty('--accessibility-screen-reader', '0')
    }
  }, [])

  const toggleFeature = useCallback((feature: keyof AccessibilityFeatures) => {
    setFeatures(prev => {
      const newFeatures = { ...prev, [feature]: !prev[feature] }
      
      // Save to localStorage
      localStorage.setItem('accessibility_features', JSON.stringify(newFeatures))
      
      // Apply changes
      applyAccessibilityFeatures(newFeatures)
      
      return newFeatures
    })
  }, [applyAccessibilityFeatures])

  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcementRef.current) {
      // Create announcement element if it doesn't exist
      const element = document.createElement('div')
      element.id = 'accessibility-announcements'
      element.setAttribute('aria-live', priority)
      element.setAttribute('aria-atomic', 'true')
      element.style.position = 'absolute'
      element.style.left = '-9999px'
      element.style.width = '1px'
      element.style.height = '1px'
      element.style.overflow = 'hidden'
      document.body.appendChild(element)
      announcementRef.current = element as HTMLDivElement
    }

    const element = announcementRef.current
    element.setAttribute('aria-live', priority)
    
    // Clear and then set the message to ensure it's announced
    element.textContent = ''
    setTimeout(() => {
      element.textContent = message
    }, 100)
  }, [])

  const focusElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement
    if (element) {
      element.focus()
      
      // Announce focus change for screen readers
      const label = element.getAttribute('aria-label') || 
                   element.getAttribute('alt') || 
                   element.textContent?.trim() ||
                   'Element'
      
      announceToScreenReader(`Focused on ${label}`)
    }
  }, [announceToScreenReader])

  const trapFocus = useCallback((containerRef: React.RefObject<HTMLElement>) => {
    const container = containerRef.current
    if (!container) return () => {}

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }, [])

  // Create announcement element on mount
  useEffect(() => {
    if (!document.getElementById('accessibility-announcements')) {
      const element = document.createElement('div')
      element.id = 'accessibility-announcements'
      element.setAttribute('aria-live', 'polite')
      element.setAttribute('aria-atomic', 'true')
      element.style.position = 'absolute'
      element.style.left = '-9999px'
      element.style.width = '1px'
      element.style.height = '1px'
      element.style.overflow = 'hidden'
      document.body.appendChild(element)
      announcementRef.current = element as HTMLDivElement
    }
  }, [])

  return {
    features,
    toggleFeature,
    announceToScreenReader,
    focusElement,
    trapFocus
  }
}

export default useAccessibilityEnhancements