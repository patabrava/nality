'use client'

import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/components/i18n/I18nProvider'

export default function FinalCTASection() {
  const { isAuthenticated } = useAuth()
  const { t } = useI18n()

  const handleStartStory = () => {
    if (isAuthenticated) {
      window.location.href = '/dash'
    } else {
      window.location.href = '/meeting'
    }
  }

  const handleExploreTimeline = () => {
    window.location.href = '/meeting'
  }

  return (
    <section className="section final-cta-section">
      {/* Background Pattern */}
      <div className="final-cta-pattern" />

      <div className="final-cta-container">
        <h2 className="final-cta-title">
          {t('finalCta.title')}
        </h2>

        <p className="final-cta-subtitle">
          {t('finalCta.subtitle')}
        </p>

        <div className="final-cta-actions">
          <button
            onClick={handleStartStory}
            className="btn btn-primary final-cta-primary"
          >
            {t('finalCta.primaryCta')}
          </button>

          <button
            onClick={handleExploreTimeline}
            className="btn btn-secondary"
          >
            {t('finalCta.secondaryCta')}
          </button>
        </div>

        {/* Privacy Note */}
        <div className="final-cta-privacy">
          <div className="final-cta-privacy-icon">🔒</div>
          <p className="final-cta-privacy-text">
            <strong>{t('finalCta.privacyTitle')}</strong> {t('finalCta.privacyBody')}
          </p>
        </div>

        {/* Social proof stats */}
        <div className="final-cta-stats">
          <div className="final-cta-stat">
            <div className="final-cta-stat-value">{t('finalCta.stats.stories.value')}</div>
            <div className="final-cta-stat-label">{t('finalCta.stats.stories.label')}</div>
          </div>

          <div className="final-cta-stat">
            <div className="final-cta-stat-value">{t('finalCta.stats.books.value')}</div>
            <div className="final-cta-stat-label">{t('finalCta.stats.books.label')}</div>
          </div>

          <div className="final-cta-stat">
            <div className="final-cta-stat-value">{t('finalCta.stats.rating.value')}</div>
            <div className="final-cta-stat-label">{t('finalCta.stats.rating.label')}</div>
          </div>
        </div>
      </div>
    </section>
  )
}
