'use client'

import React from 'react'
import { ConsentGate, useConsentGate } from '@/components/consent/ConsentGate'
import { useConsentContext } from '@/contexts/ConsentContext'
import { useLocale } from '@/components/i18n/useLocale'

/**
 * Comprehensive test component for the consent management system
 * This component demonstrates all consent features and provides debugging tools
 */
function ConsentTestDashboard() {
  const { t } = useLocale()
  const { 
    consentState, 
    shouldShowBanner, 
    acceptAll, 
    rejectAll, 
    withdrawConsent, 
    hideBanner, 
    showBanner 
  } = useConsentContext()
  
  const externalServicesGate = useConsentGate('external-services')

  return (
    <div className="consent-test-dashboard">
      <div className="consent-test-header">
        <h2>🔬 Consent Management Test Dashboard</h2>
        <p>Test all consent functionality and debug consent states</p>
      </div>

      {/* Current State Display */}
      <section className="consent-test-section">
        <h3>📊 Current Consent State</h3>
        <div className="consent-state-grid">
          <div className="consent-state-card">
            <h4>Necessary Cookies</h4>
            <span className={`status ${consentState.necessary ? 'granted' : 'denied'}`}>
              {consentState.necessary ? '✅ Granted' : '❌ Denied'}
            </span>
          </div>
          
          <div className="consent-state-card">
            <h4>External Services</h4>
            <span className={`status ${consentState['external-services'] ? 'granted' : 'denied'}`}>
              {consentState['external-services'] ? '✅ Granted' : '❌ Denied'}
            </span>
          </div>
          
          <div className="consent-state-card">
            <h4>Banner Visible</h4>
            <span className={`status ${shouldShowBanner ? 'visible' : 'hidden'}`}>
              {shouldShowBanner ? '👁️ Visible' : '🙈 Hidden'}
            </span>
          </div>
        </div>
      </section>

      {/* Control Actions */}
      <section className="consent-test-section">
        <h3>🎛️ Control Actions</h3>
        <div className="consent-test-actions">
          <button 
            onClick={acceptAll}
            className="test-button primary"
          >
            Accept All Consent
          </button>
          
          <button 
            onClick={rejectAll}
            className="test-button secondary"
          >
            Reject Optional Consent
          </button>
          
          <button 
            onClick={withdrawConsent}
            className="test-button danger"
          >
            Withdraw All Consent
          </button>
          
          <button 
            onClick={showBanner}
            className="test-button secondary"
          >
            Force Show Banner
          </button>
          
          <button 
            onClick={hideBanner}
            className="test-button secondary"
          >
            Force Hide Banner
          </button>
        </div>
      </section>

      {/* ConsentGate Examples */}
      <section className="consent-test-section">
        <h3>🚪 ConsentGate Examples</h3>
        
        <div className="consent-gate-examples">
          <div className="gate-example">
            <h4>Standard ConsentGate (External Services)</h4>
            <ConsentGate 
              category="external-services"
              serviceName="Calendly"
            >
              <div className="protected-content">
                <h5>🗓️ Calendly Booking Widget</h5>
                <p>This is a simulated Calendly booking widget that would load here.</p>
                <div className="mock-calendly">
                  📅 Book a meeting with us!
                </div>
              </div>
            </ConsentGate>
          </div>

          <div className="gate-example">
            <h4>Compact ConsentGate</h4>
            <ConsentGate 
              category="external-services"
              serviceName="Google Maps"
              compact={true}
            >
              <div className="protected-content">
                <h5>🗺️ Google Maps Embed</h5>
                <p>Interactive map would be displayed here.</p>
                <div className="mock-map">
                  🌍 Interactive Map View
                </div>
              </div>
            </ConsentGate>
          </div>

          <div className="gate-example">
            <h4>Custom Message ConsentGate</h4>
            <ConsentGate 
              category="external-services"
              customMessage="This YouTube video requires external service consent to protect your privacy."
              serviceName="YouTube"
            >
              <div className="protected-content">
                <h5>📹 YouTube Video Embed</h5>
                <p>Video content would be embedded here.</p>
                <div className="mock-video">
                  ▶️ Play Video
                </div>
              </div>
            </ConsentGate>
          </div>
        </div>
      </section>

      {/* Hook Usage Example */}
      <section className="consent-test-section">
        <h3>🪝 Hook Usage Example</h3>
        <div className="hook-example">
          <p>
            External Services Hook Status: 
            <strong>{externalServicesGate.hasConsent ? ' ✅ Granted' : ' ❌ Not Granted'}</strong>
          </p>
          
          <div className="hook-actions">
            <button 
              onClick={externalServicesGate.requestConsent}
              disabled={externalServicesGate.hasConsent}
              className="test-button small primary"
            >
              Grant via Hook
            </button>
            
            <button 
              onClick={externalServicesGate.denyConsent}
              disabled={!externalServicesGate.hasConsent}
              className="test-button small secondary"
            >
              Deny via Hook
            </button>
          </div>
        </div>
      </section>

      {/* LocalStorage Debug */}
      <section className="consent-test-section">
        <h3>💾 LocalStorage Debug</h3>
        <div className="storage-debug">
          <pre>
            {JSON.stringify(
              typeof window !== 'undefined' 
                ? localStorage.getItem('nality-consent') 
                : 'Server-side (no localStorage)', 
              null, 
              2
            )}
          </pre>
        </div>
      </section>
    </div>
  )
}

export default ConsentTestDashboard