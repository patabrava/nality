// Consent categories
export type ConsentCategory = 'necessary' | 'external-services'

// Consent state
export interface ConsentState {
  necessary: boolean
  'external-services': boolean
  timestamp?: number
}

// Default consent state (only necessary enabled)
export const DEFAULT_CONSENT_STATE: ConsentState = {
  necessary: true,
  'external-services': false
}

// Storage key for consent preferences
const CONSENT_STORAGE_KEY = 'nality-consent'

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined'

/**
 * Get current consent state from localStorage
 */
export function getConsentState(): ConsentState {
  if (!isBrowser) {
    return DEFAULT_CONSENT_STATE
  }

  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!stored) {
      return DEFAULT_CONSENT_STATE
    }

    const parsed = JSON.parse(stored) as ConsentState
    
    // Validate the stored data
    if (typeof parsed === 'object' && parsed !== null) {
      const result: ConsentState = {
        necessary: true, // Always true
        'external-services': Boolean(parsed['external-services']),
        timestamp: typeof parsed.timestamp === 'number' ? parsed.timestamp : Date.now()
      }
      
      return result
    }
  } catch (error) {
    console.warn('Failed to parse stored consent preferences:', error)
  }

  return DEFAULT_CONSENT_STATE
}

/**
 * Save consent state to localStorage
 */
export function saveConsentState(state: ConsentState): void {
  if (!isBrowser) {
    return
  }

  try {
    const stateWithTimestamp = {
      ...state,
      necessary: true, // Always ensure necessary is true
      timestamp: Date.now()
    }
    
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(stateWithTimestamp))
  } catch (error) {
    console.warn('Failed to save consent preferences:', error)
  }
}

/**
 * Check if user has given consent for a specific category
 */
export function hasConsent(category: ConsentCategory): boolean {
  const state = getConsentState()
  return Boolean(state[category])
}

/**
 * Check if user has made any consent choice
 */
export function hasConsentChoice(): boolean {
  if (!isBrowser) {
    return false
  }
  
  return localStorage.getItem(CONSENT_STORAGE_KEY) !== null
}

/**
 * Clear all consent data (for withdrawal)
 */
export function clearConsentState(): void {
  if (!isBrowser) {
    return
  }

  try {
    localStorage.removeItem(CONSENT_STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to clear consent preferences:', error)
  }
}