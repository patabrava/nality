'use client'

import React, { createContext, useContext, useCallback, useEffect, useState, useMemo } from 'react'
import { ConsentCategory, ConsentState, getConsentState, saveConsentState, clearConsentState } from '@/lib/consent'

interface ConsentContextValue {
  /** Current consent state for all categories */
  consentState: ConsentState
  
  /** Whether the consent banner should be shown */
  shouldShowBanner: boolean
  
  /** Update consent for a specific category */
  updateConsent: (category: ConsentCategory, granted: boolean) => void
  
  /** Accept all consent categories */
  acceptAll: () => void
  
  /** Reject all non-necessary consent categories */
  rejectAll: () => void
  
  /** Withdraw all consent and clear storage */
  withdrawConsent: () => void
  
  /** Check if a specific category has consent */
  hasConsent: (category: ConsentCategory) => boolean
  
  /** Force hide the banner (for testing/development) */
  hideBanner: () => void
  
  /** Force show the banner (for settings page) */
  showBanner: () => void
}

const ConsentContext = createContext<ConsentContextValue | undefined>(undefined)

interface ConsentProviderProps {
  children: React.ReactNode
  /** Override for testing - force banner visibility */
  forceBannerVisible?: boolean
  /** Override for testing - initial consent state */
  initialConsentState?: ConsentState
}

export function ConsentProvider({ 
  children, 
  forceBannerVisible, 
  initialConsentState 
}: ConsentProviderProps) {
  // Initialize consent state from localStorage or defaults
  const [consentState, setConsentState] = useState<ConsentState>(() => {
    if (initialConsentState) return initialConsentState
    
    // Only access localStorage on client side
    if (typeof window === 'undefined') {
      return {
        necessary: true,
        'external-services': false
      }
    }
    
    return getConsentState()
  })
  
  // Banner visibility state
  const [bannerVisible, setBannerVisible] = useState<boolean>(() => {
    if (forceBannerVisible !== undefined) return forceBannerVisible
    
    // Only access localStorage on client side
    if (typeof window === 'undefined') return true
    
    try {
      const hasStoredConsent = localStorage.getItem('nality-consent') !== null
      return !hasStoredConsent
    } catch {
      return true
    }
  })
  
  // Hydration effect for client-side state
  useEffect(() => {
    if (initialConsentState || forceBannerVisible !== undefined) return
    
    const storedState = getConsentState()
    setConsentState(storedState)
    
    const hasStoredConsent = localStorage.getItem('nality-consent') !== null
    setBannerVisible(!hasStoredConsent)
  }, [initialConsentState, forceBannerVisible])
  
  const updateConsent = useCallback((category: ConsentCategory, granted: boolean) => {
    setConsentState(prevState => {
      const newState = {
        ...prevState,
        [category]: granted
      }
      
      // Save to localStorage
      saveConsentState(newState)
      
      // Hide banner after any explicit consent action
      setBannerVisible(false)
      
      return newState
    })
  }, [])
  
  const acceptAll = useCallback(() => {
    console.log('[ConsentContext] acceptAll called')
    const newState: ConsentState = {
      necessary: true,
      'external-services': true
    }
    
    setConsentState(newState)
    saveConsentState(newState)
    setBannerVisible(false)
    console.log('[ConsentContext] Banner visibility set to false')
  }, [])
  
  const rejectAll = useCallback(() => {
    console.log('[ConsentContext] rejectAll called')
    const newState: ConsentState = {
      necessary: true, // Always required
      'external-services': false
    }
    
    setConsentState(newState)
    saveConsentState(newState)
    setBannerVisible(false)
    console.log('[ConsentContext] Banner visibility set to false')
  }, [])
  
  const withdrawConsent = useCallback(() => {
    const newState: ConsentState = {
      necessary: true, // Always required
      'external-services': false
    }
    
    clearConsentState()
    setConsentState(newState)
    setBannerVisible(true)
  }, [])
  
  const hasConsent = useCallback((category: ConsentCategory): boolean => {
    return consentState[category] === true
  }, [consentState])
  
  const hideBanner = useCallback(() => {
    setBannerVisible(false)
  }, [])
  
  const showBanner = useCallback(() => {
    setBannerVisible(true)
  }, [])
  
  const contextValue: ConsentContextValue = useMemo(() => ({
    consentState,
    shouldShowBanner: bannerVisible,
    updateConsent,
    acceptAll,
    rejectAll,
    withdrawConsent,
    hasConsent,
    hideBanner,
    showBanner
  }), [consentState, bannerVisible, updateConsent, acceptAll, rejectAll, withdrawConsent, hasConsent, hideBanner, showBanner])
  
  return (
    <ConsentContext.Provider value={contextValue}>
      {children}
    </ConsentContext.Provider>
  )
}

/**
 * Hook to access consent context
 * Must be used within ConsentProvider
 */
export function useConsentContext(): ConsentContextValue {
  const context = useContext(ConsentContext)
  
  if (context === undefined) {
    throw new Error('useConsentContext must be used within a ConsentProvider')
  }
  
  return context
}

/**
 * Higher-order component to provide consent context
 */
export function withConsentProvider<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P & Partial<ConsentProviderProps>> {
  return function ConsentWrappedComponent(props) {
    const { forceBannerVisible, initialConsentState, ...componentProps } = props as P & Partial<ConsentProviderProps>
    
    const providerProps: ConsentProviderProps = {
      children: <Component {...(componentProps as P)} />,
      ...(forceBannerVisible !== undefined && { forceBannerVisible }),
      ...(initialConsentState && { initialConsentState }),
    }
    
    return <ConsentProvider {...providerProps} />
  }
}

export default ConsentContext