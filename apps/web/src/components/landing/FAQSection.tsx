'use client'

import { useState } from 'react'

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
            Frequently asked questions
          </h2>
          <p 
            style={{
              fontSize: '1.125rem',
              color: 'var(--md-sys-color-on-surface-variant)',
              maxWidth: '600px',
              margin: '0 auto'
            }}
          >
            Everything you need to know about preserving your life story
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {faqData.map((item, index) => (
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
                  maxHeight: openItems.includes(index) ? '200px' : '0',
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
