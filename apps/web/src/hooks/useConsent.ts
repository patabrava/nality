'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ConsentState, ConsentCategory } from '@/lib/consent'
import { 
  getConsentState, 
  saveConsentState, 
  hasConsent, 
  hasConsentChoice,
  DEFAULT_CONSENT_STATE,
  clearConsentState
} from '@/lib/consent'

export function useConsent() {
  const [consentState, setConsentState] = useState<ConsentState>(DEFAULT_CONSENT_STATE)
  const [hasChoice, setHasChoice] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Load consent state from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const stored = getConsentState()
    const choice = hasConsentChoice()
    
    setConsentState(stored)
    setHasChoice(choice)
  }, [])

  // Update consent for a specific category
  const updateConsent = useCallback((category: ConsentCategory, granted: boolean) => {
    setConsentState(prevState => {
      const newState = {
        ...prevState,
        [category]: category === 'necessary' ? true : granted // Necessary always true
      }
      
      saveConsentState(newState)
      setHasChoice(true)
      
      return newState
    })
  }, [])

  // Accept all categories
  const acceptAll = useCallback(() => {
    const newState: ConsentState = {
      necessary: true,
      'external-services': true
    }
    
    setConsentState(newState)
    saveConsentState(newState)
    setHasChoice(true)
  }, [])

  // Reject all optional categories (keep necessary)
  const rejectAll = useCallback(() => {
    const newState: ConsentState = {
      necessary: true,
      'external-services': false
    }
    
    setConsentState(newState)
    saveConsentState(newState)
    setHasChoice(true)
  }, [])

  // Withdraw consent (reset to default)
  const withdrawConsent = useCallback(() => {
    clearConsentState()
    setConsentState(DEFAULT_CONSENT_STATE)
    setHasChoice(false)
  }, [])

  // Check if user has consent for specific category
  const hasConsentFor = useCallback((category: ConsentCategory) => {
    return mounted ? consentState[category] : false
  }, [consentState, mounted])

  // Check if banner should be shown (no choice made yet)
  const shouldShowBanner = mounted && !hasChoice

  return {
    consentState,
    hasChoice,
    shouldShowBanner,
    mounted,
    updateConsent,
    acceptAll,
    rejectAll,
    withdrawConsent,
    hasConsentFor
  }
}