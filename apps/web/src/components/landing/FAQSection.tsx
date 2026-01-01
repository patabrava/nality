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
    <section id="faq" className="section">
      <div className="section-header mx-auto text-center" style={{ maxWidth: 800 }}>
        <span className="section-label">{t('faq.label')}</span>
        <h2 className="section-title">
          {t('faq.title')}
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
          {t('faq.subtitle')}
        </p>
      </div>

      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        {Array.isArray(faqData) && faqData.map((item: any, index: number) => (
          <div
            key={index}
            className={`glass-card overflow-hidden transition-all duration-300 ${openItems.includes(index) ? 'border-opacity-20 border-white' : ''}`}
          >
            <button
              onClick={() => toggleItem(index)}
              aria-expanded={openItems.includes(index)}
              aria-controls={`faq-answer-${index}`}
              className="w-full p-6 bg-transparent border-none text-left cursor-pointer flex justify-between items-center text-lg font-medium text-white transition-colors hover:text-gold"
            >
              <span>{item.question}</span>
              <span
                className={`text-2xl text-gold transition-transform duration-300 ${openItems.includes(index) ? 'rotate-45' : ''}`}
              >
                +
              </span>
            </button>

            <div
              id={`faq-answer-${index}`}
              className={`transition-all duration-300 ease-in-out ${openItems.includes(index) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="px-6 pb-6 text-gray-400 leading-relaxed">
                {item.answer}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Still have questions CTA */}
      <div className="mt-16 text-center">
        <div className="glass-card inline-block p-8 max-w-2xl mx-auto">
          <h3 className="text-xl font-serif mb-4 text-white">
            {t('faq.ctaTitle')}
          </h3>
          <p className="text-gray-400 mb-6">
            {t('faq.ctaText')}
          </p>
          <button
            className="btn btn-secondary"
            onClick={() => {
              window.location.href = 'mailto:support@nality.app'
            }}
          >
            {t('faq.ctaButton')}
          </button>
        </div>
      </div>
    </section>
  )
}

