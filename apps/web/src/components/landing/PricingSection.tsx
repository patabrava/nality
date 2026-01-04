'use client'

import { useI18n } from '@/components/i18n/I18nProvider'

export default function PricingSection() {
  const { t } = useI18n()

  const pricingTiers = t('pricing.tiers')

  const handleSelectPlan = (planName: string) => {
    // Future: Navigate to signup with selected plan
    console.log(`Selected plan: ${planName}`)
    window.location.href = `/login?plan=${planName.toLowerCase()}`
  }

  return (
    <section id="pricing" className="section">
      <div className="section-header">
        <span className="section-label">{t('pricing.label')}</span>
        <h2 className="section-title">
          {t('pricing.titlePrefix')}{' '}
          <span className="serif-text italic text-gold">{t('pricing.titleHighlight')}</span>
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
          {t('pricing.subtitle')}
        </p>
      </div>

      <div className="pricing-grid">
          {Array.isArray(pricingTiers) && pricingTiers.map((tier: any, index: number) => (
            <div
              key={tier.name}
              className={`pricing-card ${tier.popular ? 'popular' : ''}`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div className="pricing-badge">
                  {t('pricing.badgePopular')}
                </div>
              )}

              {/* Plan Header */}
              <div className="pricing-header">
                <h3 className="pricing-name">{tier.name}</h3>

                <div className="pricing-price-wrapper">
                  <span className="pricing-price">{tier.price}</span>
                  {tier.period && <span className="pricing-period">{tier.period}</span>}
                  {tier.periodSuffix && <span className="pricing-period-suffix">{tier.periodSuffix}</span>}
                </div>

                {tier.yearlyPrice && (
                  <p className="pricing-yearly">
                    {t('pricing.yearlyPrefix')} {tier.yearlyPrice}
                  </p>
                )}

                <p className="pricing-description">{tier.description}</p>
              </div>

              {/* Features List */}
              <ul className="pricing-features">
                {Array.isArray(tier.features) && tier.features.map((feature: string, featureIndex: number) => (
                  <li key={featureIndex} className="pricing-feature">
                    <span className="pricing-feature-icon">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handleSelectPlan(tier.name)}
                className={`pricing-cta ${tier.buttonStyle}`}
              >
                {tier.buttonText}
              </button>

              {/* Savings hint */}
              {tier.savings && (
                <div className="pricing-savings">
                  {tier.savings}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Legal Note */}
        <div className="pricing-legal">
          <p className="pricing-legal-text">
            {t('pricing.legalNote')}
          </p>
        </div>
    </section>
  )
}
