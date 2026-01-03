'use client'

import React, { useState, useEffect } from 'react'
import { useConsentContext } from '@/contexts/ConsentContext'
import { useLocale } from '@/components/i18n/useLocale'
import { ConsentCategory } from '@/lib/consent'

interface ConsentGateProps {
  /** Category of consent required for this content */
  category: ConsentCategory
  
  /** Content to show when consent is granted */
  children: React.ReactNode
  
  /** 
   * Fallback content when consent is not granted
   * If not provided, shows default consent request UI
   */
  fallback?: React.ReactNode
  
  /** 
   * Custom consent request message
   * Overrides default i18n message for this specific gate
   */
  customMessage?: string
  
  /** 
   * Service name for better UX messaging
   * e.g., "Calendly", "Google Maps", "YouTube"
   */
  serviceName?: string
  
  /** 
   * Additional className for styling the gate container
   */
  className?: string
  
  /** 
   * Whether to show a compact version (just button, no description)
   */
  compact?: boolean
  
  /** 
   * Callback when consent is granted through this gate
   */
  onConsentGranted?: () => void
  
  /** 
   * Callback when consent is denied through this gate
   */
  onConsentDenied?: () => void
}

interface DefaultConsentUIProps {
  category: ConsentCategory
  serviceName?: string
  customMessage?: string
  compact?: boolean
  onGrant: () => void
  onDeny: () => void
}

function DefaultConsentUI({ 
  category, 
  serviceName, 
  customMessage,
  compact,
  onGrant, 
  onDeny 
}: DefaultConsentUIProps) {
  const { t } = useLocale()
  
  // Get service-specific messaging
  const getServiceMessage = () => {
    if (customMessage) return customMessage
    
    if (serviceName) {
      const template = t('consent.serviceSpecific')
      return template.replace('{{service}}', serviceName)
    }
    
    // Category-specific default messages
    switch (category) {
      case 'external-services':
        return t('consent.externalServicesRequired')
      default:
        return t('consent.permissionRequired')
    }
  }
  
  const getServiceTitle = () => {
    if (serviceName) {
      const template = t('consent.loadService')
      return template.replace('{{service}}', serviceName)
    }
    
    switch (category) {
      case 'external-services':
        return t('consent.loadExternalContent')
      default:
        return t('consent.loadContent')
    }
  }

  return (
    <div className={`consent-gate ${compact ? 'compact' : ''}`}>
      <div className="consent-gate-content">
        {!compact && (
          <div className="consent-gate-icon">
            {category === 'external-services' ? '🔒' : '🍪'}
          </div>
        )}
        
        <div className="consent-gate-text">
          <h4 className="consent-gate-title">
            {getServiceTitle()}
          </h4>
          
          {!compact && (
            <p className="consent-gate-message">
              {getServiceMessage()}
            </p>
          )}
        </div>
        
        <div className="consent-gate-actions">
          <button 
            onClick={onDeny}
            className="consent-gate-button secondary"
            type="button"
            aria-label={t('consent.denyAccess')}
          >
            {compact ? t('common.no') : t('consent.deny')}
          </button>
          
          <button 
            onClick={onGrant}
            className="consent-gate-button primary"
            type="button"
            aria-label={t('consent.grantAccess')}
          >
            {compact ? t('common.yes') : t('consent.allow')}
          </button>
        </div>
      </div>
      
      {!compact && (
        <div className="consent-gate-footer">
          <a href="/privacy" className="consent-gate-link">
            {t('consent.learnMore')}
          </a>
        </div>
      )}
    </div>
  )
}

/**
 * ConsentGate component wraps content that requires user consent
 * Only shows the content when appropriate consent has been granted
 * Shows consent request UI when consent is not granted
 */
export function ConsentGate({
  category,
  children,
  fallback,
  customMessage,
  serviceName,
  className = '',
  compact = false,
  onConsentGranted,
  onConsentDenied
}: ConsentGateProps) {
  const { hasConsent, updateConsent } = useConsentContext()
  const [isMounted, setIsMounted] = useState(false)
  
  // Prevent hydration mismatch by only checking consent after mount
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Check if we have consent for this category
  const hasRequiredConsent = isMounted ? hasConsent(category) : false
  
  // Handle consent granted through this gate
  const handleConsentGrant = () => {
    updateConsent(category, true)
    onConsentGranted?.()
  }
  
  // Handle consent denied through this gate
  const handleConsentDeny = () => {
    updateConsent(category, false)
    onConsentDenied?.()
  }
  
  // If consent is granted, show the protected content
  if (hasRequiredConsent) {
    return <div className={`consent-gate-granted ${className}`}>{children}</div>
  }
  
  // If consent is not granted, show fallback or default UI
  const defaultProps: DefaultConsentUIProps = {
    category,
    onGrant: handleConsentGrant,
    onDeny: handleConsentDeny,
    ...(serviceName && { serviceName }),
    ...(customMessage && { customMessage }),
    ...(compact && { compact }),
  }
  
  return (
    <div className={`consent-gate-container ${className}`}>
      {fallback || <DefaultConsentUI {...defaultProps} />}
    </div>
  )
}

/**
 * Higher-order component version of ConsentGate
 * Useful for wrapping entire components
 */
export function withConsentGate<P extends object>(
  Component: React.ComponentType<P>,
  gateConfig: Omit<ConsentGateProps, 'children'>
) {
  return function ConsentGatedComponent(props: P) {
    return (
      <ConsentGate {...gateConfig}>
        <Component {...props} />
      </ConsentGate>
    )
  }
}

/**
 * Utility hook for checking consent status in components
 * Alternative to wrapping with ConsentGate
 */
export function useConsentGate(category: ConsentCategory) {
  const { hasConsent, updateConsent } = useConsentContext()
  
  return {
    hasConsent: hasConsent(category),
    requestConsent: () => updateConsent(category, true),
    denyConsent: () => updateConsent(category, false)
  }
}

export default ConsentGate