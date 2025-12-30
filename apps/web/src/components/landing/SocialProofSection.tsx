'use client'

import { useI18n } from '@/components/i18n/I18nProvider'

export default function SocialProofSection() {
  const { t } = useI18n()

  const testimonials = t('socialProof.testimonials')
  const partnerLogos = t('socialProof.partnerLogos')
  const stats = t('socialProof.stats')

  return (
    <section
      id="social-proof"
      className="section"
      style={{
        padding: '64px 0',
        margin: '0 -24px',
        borderRadius: '0'
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <h2
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: '700',
            color: 'var(--md-sys-color-on-surface)',
            textAlign: 'center',
            marginBottom: '48px'
          }}
        >
          {t('socialProof.title')}
        </h2>

        {/* Partner Logos */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '32px',
            marginBottom: '48px',
            flexWrap: 'wrap',
            opacity: '0.6'
          }}
        >
          {Array.isArray(partnerLogos) && partnerLogos.map((logo: any, index: number) => (
            <div
              key={index}
              style={{
                width: '80px',
                height: '40px',
                background: 'var(--md-sys-color-outline)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--md-sys-color-background)',
                fontSize: '12px',
                fontWeight: '600'
              }}
              aria-label={`${logo.name} ${t('socialProof.partnerAriaSuffix')}`}
            >
              {logo.placeholder}
            </div>
          ))}
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '32px',
            marginBottom: '64px',
            textAlign: 'center'
          }}
        >
          {Array.isArray(stats) && stats.map((stat: any, index: number) => (
            <div key={index}>
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: 'var(--md-sys-color-primary)',
                  marginBottom: '8px'
                }}
              >
                {stat.number}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--md-sys-color-on-surface-variant)' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px',
            maxWidth: '1000px',
            margin: '0 auto'
          }}
        >
          {Array.isArray(testimonials) && testimonials.map((testimonial: any, index: number) => (
            <blockquote
              key={index}
              style={{
                background: 'var(--md-sys-color-surface-container)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid var(--md-sys-color-outline-variant)',
                position: 'relative'
              }}
            >
              <div
                style={{
                  fontSize: '32px',
                  color: 'var(--md-sys-color-primary)',
                  position: 'absolute',
                  top: '16px',
                  left: '24px',
                  lineHeight: '1'
                }}
              >
                "
              </div>
              <p
                style={{
                  fontSize: '16px',
                  color: 'var(--md-sys-color-on-surface)',
                  lineHeight: '1.6',
                  marginBottom: '16px',
                  paddingTop: '16px',
                  fontStyle: 'italic'
                }}
              >
                {testimonial.text}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <cite
                  style={{
                    fontSize: '14px',
                    color: 'var(--md-sys-color-on-surface)',
                    fontWeight: '600',
                    fontStyle: 'normal'
                  }}
                >
                  — {testimonial.author}
                </cite>
                {testimonial.role && (
                  <span style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>
                    {testimonial.role}, {testimonial.location}
                  </span>
                )}
              </div>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
