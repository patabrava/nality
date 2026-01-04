'use client'

import { useI18n } from '@/components/i18n/I18nProvider'
import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

export default function FAQSection() {
  const { t } = useI18n()
  const [openItems, setOpenItems] = useState<number[]>([0]) // First item open by default

  const faqData = t('faq.items')

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  return (
    <section id="faq" className="section faq-section-luxury">
      <div className="faq-luxury-container">
        {/* Section Header */}
        <div className="section-header" style={{ textAlign: 'center', marginLeft: 'auto', marginRight: 'auto' }}>
          <span className="section-label">FAQ</span>
          <h2 className="section-title">
            {t('faq.title')}
          </h2>
          <p className="faq-luxury-subtitle" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
            {t('faq.subtitle')}
          </p>
        </div>

        {/* FAQ Luxury Accordion */}
        <div className="faq-luxury-accordion">
          {Array.isArray(faqData) && faqData.map((item: any, index: number) => {
            const isOpen = openItems.includes(index)
            return (
              <div
                key={index}
                className="faq-luxury-item"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <button
                  onClick={() => toggleItem(index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  className="faq-luxury-question-button"
                >
                  <div className="faq-luxury-question-content">
                    <span className="faq-luxury-number">{String(index + 1).padStart(2, '0')}</span>
                    <span className="faq-luxury-question-text">{item.question}</span>
                  </div>
                  <span className={`faq-luxury-icon ${isOpen ? 'open' : ''}`}>
                    {isOpen ? (
                      <Minus size={20} strokeWidth={1.5} />
                    ) : (
                      <Plus size={20} strokeWidth={1.5} />
                    )}
                  </span>
                </button>

                <div
                  id={`faq-answer-${index}`}
                  className={`faq-luxury-answer-wrapper ${isOpen ? 'open' : ''}`}
                >
                  <div className="faq-luxury-answer-content">
                    <div className="faq-luxury-answer-text">
                      {item.answer}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Still have questions CTA - Luxury Design */}
        <div className="faq-luxury-cta-card">
          <div className="faq-luxury-cta-content">
            <div className="faq-luxury-cta-decorator">"</div>
            <h3 className="faq-luxury-cta-title">
              {t('faq.ctaTitle')}
            </h3>
            <p className="faq-luxury-cta-text">
              {t('faq.ctaText')}
            </p>
            <button
              className="faq-luxury-cta-button"
              onClick={() => {
                window.location.href = 'mailto:support@nality.app'
              }}
            >
              {t('faq.ctaButton')}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

