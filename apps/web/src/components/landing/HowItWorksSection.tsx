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
    <section className="section" style={{ background: 'rgba(15, 15, 15, 0.3)' }}>
      <div className="section-header">
        <span className="section-label">{t('howItWorks.label')}</span>
        <h2 className="section-title">
          {t('howItWorks.title')}<span className="serif-text italic text-gold">{t('howItWorks.titleHighlight')}</span>
        </h2>
      </div>

      <div className="steps-container">
        {steps.map((step, index) => (
          <div key={index} className="step-item">
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
