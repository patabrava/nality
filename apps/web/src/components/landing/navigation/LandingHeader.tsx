'use client'

import { useAuth } from '@/hooks/useAuth'
import { LanguageSwitch } from '@/components/i18n/LanguageSwitch'
import { useLocale } from '@/components/i18n/useLocale'

export function LandingHeader() {
  const { isAuthenticated } = useAuth()
  const { t } = useLocale()

  return (
    <header className="landing-header">
      <div className="landing-header-content">
        {/* Logo */}
        <div className="landing-logo">
          <span className="brand-text">NALITY</span>
        </div>

        {/* Navigation (for future use) */}
        <nav className="landing-nav" aria-label="Main navigation">
          {/* Navigation items can be added here later */}
        </nav>

        {/* Right side controls */}
        <div className="landing-header-actions">
          {/* Language Switcher */}
          <LanguageSwitch />

          {/* Auth Actions */}
          <div className="auth-actions">
            {isAuthenticated ? (
              <a 
                href="/dash" 
                className="header-cta primary"
                aria-label={t('header.myTimeline')}
              >
                {t('header.myTimeline')}
              </a>
            ) : (
              <>
                <a 
                  href="/login" 
                  className="header-cta secondary"
                  aria-label={t('header.login')}
                >
                  {t('header.login')}
                </a>
                <a 
                  href="/login" 
                  className="header-cta primary"
                  aria-label={t('header.start')}
                >
                  {t('header.start')}
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default LandingHeader