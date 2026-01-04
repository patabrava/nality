'use client'

import { useI18n } from '@/components/i18n/I18nProvider'

export default function OutcomesGallerySection() {
  const { t } = useI18n()

  const galleryImages = t('outcomes.gallery')

  return (
    <section id="outcomes" className="section outcomes-gallery-section">
      <div className="outcomes-gallery-container">
        <div className="section-header" style={{ textAlign: 'center', marginLeft: 'auto', marginRight: 'auto' }}>
          <span className="section-label">{t('outcomes.label')}</span>
          <h2 className="section-title">
            {t('outcomes.title')}{' '}
            <span className="serif-text italic text-gold">{t('outcomes.titleHighlight')}</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl leading-relaxed" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
            {t('outcomes.subtitle')}
          </p>
        </div>

        <div className="outcomes-gallery-grid">
          {Array.isArray(galleryImages) && galleryImages.map((image: any, index: number) => (
            <div
              key={index}
              className="outcomes-gallery-item"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Mock book preview with enhanced styling */}
              <div className="outcomes-book-preview">
                <div className={`outcomes-book-content ${index === 0 ? 'outcomes-book-cover' : 'outcomes-book-spread'}`}>
                  {/* Book spine for cover */}
                  {index === 0 && (
                    <div className="outcomes-book-spine" />
                  )}

                  {/* Content */}
                  <div className="outcomes-book-text">
                    {image.mockContent}
                  </div>

                  {/* Page binding for spreads */}
                  {index > 0 && (
                    <div className="outcomes-book-binding" />
                  )}

                  {/* Page number */}
                  <div className="outcomes-page-number">
                    {index === 0 ? t('outcomes.coverLabel') : `${t('outcomes.pageLabel')} ${index * 2 - 1}-${index * 2}`}
                  </div>
                </div>
              </div>

              {/* Caption */}
              <div className="outcomes-gallery-caption">
                <h3 className="outcomes-caption-title">{image.title}</h3>
                <p className="outcomes-caption-description">{image.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="outcomes-cta">
          <p className="outcomes-cta-text">
            {t('outcomes.ctaText')}
          </p>
          <button
            className="btn btn-secondary"
            onClick={() => {
              console.log('View sample book clicked')
            }}
          >
            {t('outcomes.ctaButton')}
          </button>
        </div>
      </div>
    </section>
  )
}
