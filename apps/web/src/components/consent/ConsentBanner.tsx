'use client'

import { useState } from 'react'
import { useConsentContext } from '@/contexts/ConsentContext'
import { useLocale } from '@/components/i18n/useLocale'

export function ConsentBanner() {
  const { shouldShowBanner, acceptAll, rejectAll, updateConsent, consentState } = useConsentContext()
  const { t } = useLocale()
  const [showDetails, setShowDetails] = useState(false)

  console.log('[ConsentBanner] Render - shouldShowBanner:', shouldShowBanner, 'consentState:', consentState)

  // Don't render if banner shouldn't be shown
  if (!shouldShowBanner) {
    console.log('[ConsentBanner] Not rendering - shouldShowBanner is false')
    return null
  }

  const handleManageSettings = () => {
    setShowDetails(!showDetails)
  }

  const handleSaveSettings = () => {
    setShowDetails(false)
    // Settings are automatically saved via updateConsent calls
  }

  const handleCategoryChange = (category: 'external-services', granted: boolean) => {
    updateConsent(category, granted)
  }

  return (
    <div className="consent-banner" role="dialog" aria-labelledby="consent-title" aria-describedby="consent-description">
      <div className="consent-content">
        <div className="consent-main">
          <h3 id="consent-title" className="consent-title">
            {t('consent.title')}
          </h3>
          <p id="consent-description" className="consent-description">
            {t('consent.description')}
          </p>

          {/* Detailed Settings */}
          {showDetails && (
            <div className="consent-details" aria-expanded={showDetails}>
              <div className="consent-categories">
                {/* Necessary Category */}
                <div className="consent-category">
                  <div className="consent-category-header">
                    <label className="consent-category-label">
                      <input
                        type="checkbox"
                        checked={true}
                        disabled={true}
                        aria-describedby="necessary-description"
                        className="consent-checkbox"
                      />
                      <span className="consent-category-title">
                        {t('consent.categories.necessary.title')}
                      </span>
                      <span className="consent-required">({t('common.required')})</span>
                    </label>
                  </div>
                  <p id="necessary-description" className="consent-category-description">
                    {t('consent.categories.necessary.description')}
                  </p>
                </div>

                {/* External Services Category */}
                <div className="consent-category">
                  <div className="consent-category-header">
                    <label className="consent-category-label">
                      <input
                        type="checkbox"
                        checked={consentState['external-services']}
                        onChange={(e) => handleCategoryChange('external-services', e.target.checked)}
                        aria-describedby="external-description"
                        className="consent-checkbox"
                      />
                      <span className="consent-category-title">
                        {t('consent.categories.external.title')}
                      </span>
                    </label>
                  </div>
                  <p id="external-description" className="consent-category-description">
                    {t('consent.categories.external.description')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* More Info Link */}
          <p className="consent-more-info">
            {t('consent.moreInfo')}{' '}
            <a href="/privacy" className="consent-link">
              {t('legal.privacy.title')}
            </a>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="consent-actions">
          {!showDetails ? (
            <>
              <button 
                onClick={rejectAll}
                className="consent-button secondary"
                type="button"
              >
                {t('consent.rejectAll')}
              </button>
              <button 
                onClick={handleManageSettings}
                className="consent-button secondary"
                type="button"
              >
                {t('consent.manageSettings')}
              </button>
              <button 
                onClick={acceptAll}
                className="consent-button primary"
                type="button"
              >
                {t('consent.acceptAll')}
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setShowDetails(false)}
                className="consent-button secondary"
                type="button"
              >
                {t('common.cancel')}
              </button>
              <button 
                onClick={handleSaveSettings}
                className="consent-button primary"
                type="button"
              >
                {t('consent.saveSettings')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConsentBanner