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
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      )
    },
    {
      title: t('productHighlights.features.1.title'),
      description: t('productHighlights.features.1.description'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
          <path d="M12 7v5l4 2" />
        </svg>
      )
    },
    {
      title: t('productHighlights.features.2.title'),
      description: t('productHighlights.features.2.description'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <circle cx="19" cy="7" r="2" />
          <path d="M19 14v7" />
          <path d="M22 17l-3-3 3-3" />
        </svg>
      )
    },
    {
      title: t('productHighlights.features.3.title'),
      description: t('productHighlights.features.3.description'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          <path d="M9 10h6" />
          <path d="M9 14h6" />
        </svg>
      )
    },
    {
      title: t('productHighlights.features.4.title'),
      description: t('productHighlights.features.4.description'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      )
    },
    {
      title: t('productHighlights.features.5.title'),
      description: t('productHighlights.features.5.description'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          <circle cx="12" cy="16" r="1" />
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
