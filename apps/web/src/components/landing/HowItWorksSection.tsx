'use client'

const steps = [
  {
    number: 1,
    title: "Tell us your story",
    description: "Chat naturally by voice or text. Our assistant asks friendly, specific questions to capture events, dates, and details.",
    icon: "🗣️"
  },
  {
    number: 2,
    title: "See your timeline grow",
    description: "Moments become a living, editable timeline—with space for photos, videos, and audio notes.",
    icon: "📅"
  },
  {
    number: 3,
    title: "Add depth (optional interview)",
    description: "Prefer a guided conversation? Book a session with a real interviewer. We handle scheduling and transcripts.",
    icon: "🎤"
  },
  {
    number: 4,
    title: "Save and share your Life Book",
    description: "Export a beautifully designed PDF that's ready to print or share with family.",
    icon: "📖"
  }
]

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="section" style={{ padding: '80px 0' }}>
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
            How it works
          </h2>
          <p 
            style={{
              fontSize: '1.125rem',
              color: 'var(--md-sys-color-on-surface-variant)',
              maxWidth: '600px',
              margin: '0 auto'
            }}
          >
            Four simple steps to transform your memories into a beautiful, lasting story
          </p>
        </div>

        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '40px',
            position: 'relative'
          }}
        >
          {steps.map((step, index) => (
            <div
              key={step.number}
              style={{
                textAlign: 'center',
                position: 'relative'
              }}
            >
              {/* Step Number Badge */}
              <div 
                style={{
                  width: '64px',
                  height: '64px',
                  background: 'var(--md-sys-color-primary)',
                  color: 'var(--md-sys-color-on-primary)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: '700',
                  margin: '0 auto 24px',
                  position: 'relative',
                  zIndex: 2
                }}
              >
                {step.number}
              </div>

              {/* Icon */}
              <div 
                style={{
                  fontSize: '48px',
                  marginBottom: '24px',
                  opacity: '0.8'
                }}
              >
                {step.icon}
              </div>

              {/* Content */}
              <h3 
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: 'var(--md-sys-color-on-surface)',
                  marginBottom: '16px'
                }}
              >
                {step.title}
              </h3>
              
              <p 
                style={{
                  fontSize: '1rem',
                  color: 'var(--md-sys-color-on-surface-variant)',
                  lineHeight: '1.6',
                  maxWidth: '280px',
                  margin: '0 auto'
                }}
              >
                {step.description}
              </p>

              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '32px',
                    left: 'calc(50% + 32px)',
                    width: 'calc(100% - 64px)',
                    height: '2px',
                    background: 'linear-gradient(90deg, var(--md-sys-color-primary), var(--md-sys-color-outline-variant))',
                    zIndex: 1,
                    opacity: '0.5'
                  }}
                  className="step-connector"
                />
              )}
            </div>
          ))}
        </div>

        {/* Mobile-specific styling */}
        <style jsx>{`
          @media (max-width: 768px) {
            .step-connector {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </section>
  )
}
