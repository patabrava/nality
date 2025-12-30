'use client'

import { useI18n } from '@/components/i18n/I18nProvider'

export default function OutcomesGallerySection() {
  const { t } = useI18n()

  const galleryImages = t('outcomes.gallery')

  return (
    <section
      id="gallery"
      className="section"
      style={{
        padding: '80px 0',
        margin: '0 -24px'
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2
            style={{
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              fontWeight: '700',
              color: 'var(--md-sys-color-on-surface)',
              marginBottom: '16px'
            }}
          >
            {t('outcomes.title')}
          </h2>
          <p
            style={{
              fontSize: '1.125rem',
              color: 'var(--md-sys-color-on-surface-variant)',
              maxWidth: '600px',
              margin: '0 auto'
            }}
          >
            {t('outcomes.subtitle')}
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px',
            maxWidth: '1000px',
            margin: '0 auto'
          }}
        >
          {Array.isArray(galleryImages) && galleryImages.map((image: any, index: number) => (
            <div
              key={index}
              style={{
                position: 'relative',
                background: 'var(--md-sys-color-surface-container)',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid var(--md-sys-color-outline-variant)',
                transition: 'transform var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              {/* Mock book preview */}
              <div
                style={{
                  width: '100%',
                  height: '250px',
                  background: 'linear-gradient(145deg, #ffffff, #f8f8f8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: '12px',
                  color: '#333',
                  fontSize: '16px',
                  fontWeight: '600',
                  textAlign: 'center',
                  position: 'relative'
                }}
              >
                {/* Book-like styling */}
                <div
                  style={{
                    width: '80%',
                    height: '80%',
                    background: index === 0 ?
                      'linear-gradient(145deg, #f0f0f0, #e0e0e0)' :
                      'linear-gradient(145deg, #ffffff, #f5f5f5)',
                    borderRadius: index === 0 ? '8px' : '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '8px',
                    boxShadow: index === 0 ?
                      '0 8px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.5)' :
                      '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: index === 0 ? 'none' : '1px solid #e0e0e0',
                    position: 'relative'
                  }}
                >
                  {/* Book spine effect for cover */}
                  {index === 0 && (
                    <div style={{
                      position: 'absolute',
                      left: '0',
                      top: '10%',
                      bottom: '10%',
                      width: '8px',
                      background: 'linear-gradient(90deg, #d0d0d0, #c0c0c0)',
                      borderRadius: '0 4px 4px 0'
                    }} />
                  )}

                  {/* Content */}
                  <div style={{ whiteSpace: 'pre-line', textAlign: 'center' }}>
                    {image.mockContent}
                  </div>

                  {/* Page binding for spreads */}
                  {index > 0 && (
                    <div style={{
                      position: 'absolute',
                      left: '50%',
                      top: '0',
                      bottom: '0',
                      width: '2px',
                      background: 'linear-gradient(to bottom, #e0e0e0, #d0d0d0)',
                      transform: 'translateX(-50%)'
                    }} />
                  )}
                </div>

                {/* Decorative elements */}
                <div style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '16px',
                  fontSize: '12px',
                  color: '#666',
                  opacity: '0.6'
                }}>
                  {index === 0 ? t('outcomes.coverLabel') : `${t('outcomes.pageLabel')} ${index * 2 - 1}-${index * 2}`}
                </div>
              </div>

              {/* Caption */}
              <div style={{ padding: '20px' }}>
                <h3
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: 'var(--md-sys-color-on-surface)',
                    marginBottom: '8px'
                  }}
                >
                  {image.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--md-sys-color-on-surface-variant)',
                    lineHeight: '1.5'
                  }}
                >
                  {image.description}
                </p>
              </div>

              {/* Zoom hint */}
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  opacity: '0',
                  transition: 'opacity var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard)'
                }}
                className="zoom-hint"
              >
                {t('outcomes.zoomHint')}
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <p
            style={{
              fontSize: '1rem',
              color: 'var(--md-sys-color-on-surface-variant)',
              marginBottom: '24px'
            }}
          >
            {t('outcomes.ctaText')}
          </p>
          <button
            className="form-button secondary"
            style={{
              fontSize: '16px',
              padding: '12px 24px',
              height: 'auto'
            }}
            onClick={() => {
              // Future: Open gallery modal or sample book
              console.log('View sample book clicked')
            }}
          >
            {t('outcomes.ctaButton')}
          </button>
        </div>
      </div>

      <style jsx>{`
        .gallery-item:hover .zoom-hint {
          opacity: 1 !important;
        }
      `}</style>
    </section>
  )
}
