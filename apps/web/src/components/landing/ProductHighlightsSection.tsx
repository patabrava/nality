'use client'

import { useI18n } from '@/components/i18n/I18nProvider'

export default function ProductHighlightsSection() {
  const { t } = useI18n()

  const features = [
    {
      title: t('productHighlights.features.0.title'),
      description: t('productHighlights.features.0.description'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )
    },
    {
      title: t('productHighlights.features.1.title'),
      description: t('productHighlights.features.1.description'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )
    },
    {
      title: t('productHighlights.features.2.title'),
      description: t('productHighlights.features.2.description'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      )
    },
    {
      title: t('productHighlights.features.3.title'),
      description: t('productHighlights.features.3.description'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      )
    }
  ]

  return (
    <section className="section">
      <div className="section-header">
        <span className="section-label">{t('productHighlights.label')}</span>
        <h2 className="section-title">
          {t('productHighlights.titlePrefix')}{' '}
          <span className="serif-text italic text-gold">{t('productHighlights.titleHighlight')}</span>
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
          {t('productHighlights.description')}
        </p>
      </div>

      <div className="feature-grid">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <div className="feature-icon">
              {feature.icon}
            </div>
            <h3 className="text-2xl font-serif mb-4">{feature.title}</h3>
            <p className="text-gray-400 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
