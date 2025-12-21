'use client'

const pricingTiers = [
  {
    name: "Explorer",
    price: "Free",
    period: "Forever",
    description: "Start your life story journey today",
    features: [
      "AI-guided memory capture",
      "Interactive timeline builder", 
      "Up to 100 photos & documents",
      "Basic privacy controls",
      "Export to digital formats"
    ],
    limitations: ["Watermarked exports", "Community support only"],
    buttonText: "Start Free Today",
    buttonStyle: "secondary" as const,
    popular: false,
    savings: null
  },
  {
    name: "Storyteller",
    price: "€12",
    period: "/ month",
    yearlyPrice: "€99 / year",
    description: "Everything you need for a complete memoir",
    features: [
      "Everything in Explorer",
      "Unlimited photos & videos",
      "AI gap detection & suggestions",
      "Advanced timeline organization",
      "Premium export templates",
      "Professional book printing",
      "Family sharing & collaboration",
      "Priority email support"
    ],
    limitations: [],
    buttonText: "Start 14-Day Free Trial",
    buttonStyle: "primary" as const,
    popular: true,
    savings: "Save €45/year"
  },
  {
    name: "Legacy",
    price: "€39",
    period: "/ month", 
    yearlyPrice: "€399 / year",
    description: "Professional storytelling with expert interviews",
    features: [
      "Everything in Storyteller",
      "Expert interviewer sessions",
      "Professional transcription",
      "Custom book design service",
      "Multi-format publishing",
      "100-year preservation guarantee",
      "Dedicated account manager",
      "Phone & video support",
      "Custom branding options"
    ],
    limitations: [],
    buttonText: "Book Consultation",
    buttonStyle: "primary" as const,
    popular: false,
    savings: "Save €69/year"
  }
]

export default function PricingSection() {
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
            Preserve your legacy, <span className="serif-text italic text-gold">affordably</span>
          </h2>
          <p 
            style={{
              fontSize: '1.125rem',
              color: 'var(--md-sys-color-on-surface-variant)',
              maxWidth: '600px',
              margin: '0 auto'
            }}
          >
            Start free and create unlimited memories. Upgrade for professional features, expert interviews, and heirloom-quality books.
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
          {pricingTiers.map((tier, index) => (
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
                  Most Popular
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
                    or {tier.yearlyPrice}
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
                {tier.features.map((feature, featureIndex) => (
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
            Prices include VAT where applicable. Interview sessions are billed separately if outside Pro plan.
          </p>
        </div>
      </div>
    </section>
  )
}
