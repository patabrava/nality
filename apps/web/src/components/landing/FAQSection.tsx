'use client'

import { useI18n } from '@/components/i18n/I18nProvider'
import { useState } from 'react'

export default function FAQSection() {
  const { t } = useI18n()
  const [openItems, setOpenItems] = useState<number[]>([])

  const faqData = t('faq.items')

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  return (
    <section id="faq" className="section" style={{ padding: '80px 0' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2
            style={{
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              fontWeight: '700',
              color: 'var(--md-sys-color-on-surface)',
              marginBottom: '16px'
            }}
          >
            {t('faq.title')}
          </h2>
          <p
            style={{
              fontSize: '1.125rem',
              color: 'var(--md-sys-color-on-surface-variant)',
              maxWidth: '600px',
              margin: '0 auto'
            }}
          >
            {t('faq.subtitle')}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {Array.isArray(faqData) && faqData.map((item: any, index: number) => (
            <div
              key={index}
              id={`faq-${index}`}
              style={{
                background: 'var(--md-sys-color-surface-container)',
                borderRadius: '16px',
                border: '1px solid var(--md-sys-color-outline-variant)',
                overflow: 'hidden',
                transition: 'all var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard)'
              }}
            >
              <button
                onClick={() => toggleItem(index)}
                aria-expanded={openItems.includes(index)}
                aria-controls={`faq-answer-${index}`}
                style={{
                  width: '100%',
                  padding: '24px',
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: 'var(--md-sys-color-on-surface)',
                  transition: 'color var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--md-sys-color-primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--md-sys-color-on-surface)'
                }}
              >
                <span>{item.question}</span>
                <span
                  style={{
                    fontSize: '20px',
                    transition: 'transform var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard)',
                    transform: openItems.includes(index) ? 'rotate(45deg)' : 'rotate(0deg)',
                    color: 'var(--md-sys-color-primary)'
                  }}
                >
                  +
                </span>
              </button>

              <div
                id={`faq-answer-${index}`}
                style={{
                  maxHeight: openItems.includes(index) ? '400px' : '0',
                  overflow: 'hidden',
                  transition: 'max-height var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard)'
                }}
              >
                <div
                  style={{
                    padding: '0 24px 24px',
                    fontSize: '1rem',
                    color: 'var(--md-sys-color-on-surface-variant)',
                    lineHeight: '1.6'
                  }}
                >
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions CTA */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '48px',
            padding: '32px',
            background: 'var(--md-sys-color-surface-container)',
            borderRadius: '16px',
            border: '1px solid var(--md-sys-color-outline-variant)'
          }}
        >
          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: 'var(--md-sys-color-on-surface)',
              marginBottom: '16px'
            }}
          >
            {t('faq.ctaTitle')}
          </h3>
          <p
            style={{
              fontSize: '1rem',
              color: 'var(--md-sys-color-on-surface-variant)',
              marginBottom: '24px'
            }}
          >
            {t('faq.ctaText')}
          </p>
          <button
            className="form-button secondary"
            onClick={() => {
              // Future: Open contact form or navigate to contact page
              window.location.href = 'mailto:support@nality.app'
            }}
            style={{
              fontSize: '16px',
              padding: '12px 24px',
              height: 'auto'
            }}
          >
            {t('faq.ctaButton')}
          </button>
        </div>
      </div>
    </section>
  )
}
