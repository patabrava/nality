'use client'

import { useI18n } from '@/components/i18n/I18nProvider'

export default function HowItWorksSection() {
  const { t } = useI18n()

  const steps = [
    {
      number: 1,
      title: t('howItWorks.steps.0.title'),
      description: t('howItWorks.steps.0.description')
    },
    {
      number: 2,
      title: t('howItWorks.steps.1.title'),
      description: t('howItWorks.steps.1.description')
    },
    {
      number: 3,
      title: t('howItWorks.steps.2.title'),
      description: t('howItWorks.steps.2.description')
    },
    {
      number: 4,
      title: t('howItWorks.steps.3.title'),
      description: t('howItWorks.steps.3.description')
    }
  ]

  return (
    <section className="section">
      <div className="section-header">
        <span className="section-label">{t('howItWorks.label')}</span>
        <h2 className="section-title">{t('howItWorks.title')}</h2>
      </div>

      <div className="steps-container">
        {steps.map((step, index) => (
          <div key={index} className="step-item">
            <h3 className="text-xl font-serif mb-3 text-gray-900">{step.title}</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
