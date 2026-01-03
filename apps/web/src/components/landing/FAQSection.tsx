'use client'

import { useState } from 'react'
import { useLocale } from '@/components/i18n/useLocale'

const faqData = [
  {
    question: "Who can see my story?",
    answer: "Only you by default. You choose what to share and with whom. Access is protected by secure logins."
  },
  {
    question: "What happens to my data?",
    answer: "Your data lives in a secure database with per-user access controls. You can export or delete it anytime."
  },
  {
    question: "Do I need to know exact dates?",
    answer: "No—approximate dates are fine. You can edit details later."
  },
  {
    question: "Can I add videos and audio?",
    answer: "Yes. Short videos (up to ~2 minutes each) and audio notes are supported."
  },
  {
    question: "Is there a way to involve a professional interviewer?",
    answer: "Yes. You can book an interviewer at any time. They will help you capture richer stories."
  },
  {
    question: "Can I print a physical book?",
    answer: "Yes. Export a high-resolution PDF and take it to any print service. Print partnerships are coming soon."
  },
  {
    question: "Do you support families?",
    answer: "Yes. You can collaborate on timelines, and we'll soon support shared family spaces."
  },
  {
    question: "What if I change my mind?",
    answer: "You can pause or cancel anytime. Your timeline remains available on the Free plan."
  },
  {
    question: "What languages are supported?",
    answer: "Start with English; more languages are on the roadmap."
  },
  {
    question: "Is this suitable for elders?",
    answer: "Absolutely. The guided prompts and optional interviewer help make it easy and enjoyable."
  }
]

export default function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([])
  const { t } = useLocale()

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  return (
    <section id="faq" className="section faq-section">
      <div className="faq-container">
        <div className="faq-header">
          <h2 className="faq-title">
            {t('faq.title')}
          </h2>
          <p className="faq-subtitle">
            {t('faq.subtitle')}
          </p>
        </div>

        <div className="faq-list">
          {faqData.map((item, index) => (
            <div
              key={index}
              id={`faq-${index}`}
              className="faq-item"
            >
              <button
                onClick={() => toggleItem(index)}
                aria-expanded={openItems.includes(index)}
                aria-controls={`faq-answer-${index}`}
                className="faq-question"
              >
                <span>{item.question}</span>
                <span 
                  className="faq-icon"
                  style={{
                    transform: openItems.includes(index) ? 'rotate(45deg)' : 'rotate(0deg)'
                  }}
                >
                  +
                </span>
              </button>

              <div
                id={`faq-answer-${index}`}
                className="faq-answer"
                style={{
                  maxHeight: openItems.includes(index) ? '200px' : '0'
                }}
              >
                <div className="faq-answer-content">
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
            Still have questions?
          </h3>
          <p 
            style={{
              fontSize: '1rem',
              color: 'var(--md-sys-color-on-surface-variant)',
              marginBottom: '24px'
            }}
          >
            Our team is here to help you get started with your life story.
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
            Contact Support
          </button>
        </div>
      </div>
    </section>
  )
}
