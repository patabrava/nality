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
    <section id="pricing" className="section" style={{ padding: '80px 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2
            style={{
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              fontWeight: '700',
              color: 'var(--md-sys-color-on-surface)',
              marginBottom: '16px'
            }}
          >
            {t('pricing.titlePrefix')} <span className="serif-text italic text-gold">{t('pricing.titleHighlight')}</span>
          </h2>
          <p
            style={{
              fontSize: '1.125rem',
              color: 'var(--md-sys-color-on-surface-variant)',
              maxWidth: '600px',
              margin: '0 auto'
            }}
          >
            {t('pricing.subtitle')}
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px',
            maxWidth: '1000px',
            margin: '0 auto'
          }}
        >
          {Array.isArray(pricingTiers) && pricingTiers.map((tier: any, index: number) => (
            <div
              key={tier.name}
              style={{
                background: 'var(--md-sys-color-surface-container)',
                borderRadius: '20px',
                padding: '32px',
                border: tier.popular ?
                  '2px solid var(--md-sys-color-primary)' :
                  '1px solid var(--md-sys-color-outline-variant)',
                position: 'relative',
                transition: 'all var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard)',
                transform: tier.popular ? 'scale(1.05)' : 'scale(1)'
              }}
              onMouseEnter={(e) => {
                if (!tier.popular) {
                  e.currentTarget.style.transform = 'scale(1.02)'
                }
              }}
              onMouseLeave={(e) => {
                if (!tier.popular) {
                  e.currentTarget.style.transform = 'scale(1)'
                }
              }}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--md-sys-color-primary)',
                    color: 'var(--md-sys-color-on-primary)',
                    padding: '6px 20px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  {t('pricing.badgePopular')}
                </div>
              )}

              {/* Plan Header */}
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h3
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: 'var(--md-sys-color-on-surface)',
                    marginBottom: '8px'
                  }}
                >
                  {tier.name}
                </h3>

                <div style={{ marginBottom: '8px' }}>
                  <span
                    style={{
                      fontSize: '3rem',
                      fontWeight: '700',
                      color: 'var(--md-sys-color-on-surface)'
                    }}
                  >
                    {tier.price}
                  </span>
                  <span
                    style={{
                      fontSize: '1rem',
                      color: 'var(--md-sys-color-on-surface-variant)',
                      marginLeft: '4px'
                    }}
                  >
                    {tier.period}
                  </span>
                </div>

                {tier.yearlyPrice && (
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--md-sys-color-on-surface-variant)',
                      marginBottom: '8px'
                    }}
                  >
                    {t('pricing.yearlyPrefix')} {tier.yearlyPrice}
                  </p>
                )}

                <p
                  style={{
                    fontSize: '1rem',
                    color: 'var(--md-sys-color-on-surface-variant)'
                  }}
                >
                  {tier.description}
                </p>
              </div>

              {/* Features List */}
              <ul
                style={{
                  listStyle: 'none',
                  padding: '0',
                  marginBottom: '32px'
                }}
              >
                {Array.isArray(tier.features) && tier.features.map((feature: string, featureIndex: number) => (
                  <li
                    key={featureIndex}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '16px',
                      fontSize: '1rem',
                      color: 'var(--md-sys-color-on-surface)'
                    }}
                  >
                    <span
                      style={{
                        color: 'var(--md-sys-color-primary)',
                        marginRight: '12px',
                        fontSize: '16px'
                      }}
                    >
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handleSelectPlan(tier.name)}
                className={`form-button ${tier.buttonStyle}`}
                style={{
                  width: '100%',
                  fontSize: '16px',
                  padding: '16px',
                  height: 'auto'
                }}
              >
                {tier.buttonText}
              </button>

              {/* Savings hint */}
              {tier.savings && (
                <div
                  style={{
                    textAlign: 'center',
                    marginTop: '16px',
                    fontSize: '12px',
                    color: 'var(--md-sys-color-primary)',
                    fontWeight: '600'
                  }}
                >
                  {tier.savings}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Legal Note */}
        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--md-sys-color-on-surface-variant)',
              maxWidth: '600px',
              margin: '0 auto'
            }}
          >
            {t('pricing.legalNote')}
          </p>
        </div>
      </div>
    </section>
  )
}
