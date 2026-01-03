'use client'

import { useLocale } from '@/components/i18n/useLocale'

const steps = [
  {
    number: 1,
    title: "Tell us your story",
    description: "Chat naturally by voice or text. Our assistant asks friendly, specific questions to capture events."
  },
  {
    number: 2,
    title: "See your timeline grow",
    description: "Moments become a living, editable timeline—with space for photos, videos, and audio notes."
  },
  {
    number: 3,
    title: "Add depth",
    description: "Prefer a guided conversation? Book a session with a real interviewer. We handle everything."
  },
  {
    number: 4,
    title: "Save and share",
    description: "Export a beautifully designed PDF that's ready to print or share with family."
  }
]

export default function HowItWorksSection() {
  const { t } = useLocale()
  const translatedSteps = t('howItWorks.steps') as Array<{ title: string; description: string; icon: string }>

  return (
    <section className="section">
      <div className="section-header">
        <span className="section-label">{t('howItWorks.sectionLabel')}</span>
        <h2 className="section-title">{t('howItWorks.title')}</h2>
      </div>

      <div className="steps-container">
        {translatedSteps.map((step, index) => (
          <div key={index} className="step-item">
            <div className="step-number-wrapper">
              <span className="step-number">0{index + 1}</span>
              <div className="step-line"></div>
            </div>
            <h3 className="text-xl font-serif mb-3 text-gray-900">{step.title}</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
