'use client'

const testimonials = [
  {
    text: "I recorded my mother's stories over a weekend. The book we printed is now the centerpiece of our family.",
    author: "Sofia R."
  },
  {
    text: "The AI prompts helped me remember things I hadn't thought about in years.",
    author: "David K."
  },
  {
    text: "As a journalist, I use Nality to structure interviews and deliver a finished keepsake.",
    author: "Leila M."
  }
]

const partnerLogos = [
  { name: "Partner 1", placeholder: "P1" },
  { name: "Partner 2", placeholder: "P2" },
  { name: "Partner 3", placeholder: "P3" },
  { name: "Partner 4", placeholder: "P4" },
  { name: "Partner 5", placeholder: "P5" }
]

export default function SocialProofSection() {
  return (
    <section 
      id="social-proof" 
      className="section"
      style={{
        padding: '64px 0',
        background: 'var(--md-sys-color-surface-container-low)',
        margin: '0 -24px',
        borderRadius: '0'
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <h2 
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: '700',
            color: 'var(--md-sys-color-on-surface)',
            textAlign: 'center',
            marginBottom: '48px'
          }}
        >
          Trusted for the moments that matter
        </h2>

        {/* Partner Logos */}
        <div 
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '32px',
            marginBottom: '48px',
            flexWrap: 'wrap',
            opacity: '0.6'
          }}
        >
          {partnerLogos.map((logo, index) => (
            <div
              key={index}
              style={{
                width: '80px',
                height: '40px',
                background: 'var(--md-sys-color-outline)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--md-sys-color-background)',
                fontSize: '12px',
                fontWeight: '600'
              }}
              aria-label={`${logo.name} logo`}
            >
              {logo.placeholder}
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px',
            maxWidth: '1000px',
            margin: '0 auto'
          }}
        >
          {testimonials.map((testimonial, index) => (
            <blockquote
              key={index}
              style={{
                background: 'var(--md-sys-color-surface-container)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid var(--md-sys-color-outline-variant)',
                position: 'relative'
              }}
            >
              <div 
                style={{
                  fontSize: '32px',
                  color: 'var(--md-sys-color-primary)',
                  position: 'absolute',
                  top: '16px',
                  left: '24px',
                  lineHeight: '1'
                }}
              >
                "
              </div>
              <p 
                style={{
                  fontSize: '16px',
                  color: 'var(--md-sys-color-on-surface)',
                  lineHeight: '1.6',
                  marginBottom: '16px',
                  paddingTop: '16px',
                  fontStyle: 'italic'
                }}
              >
                {testimonial.text}
              </p>
              <cite 
                style={{
                  fontSize: '14px',
                  color: 'var(--md-sys-color-on-surface-variant)',
                  fontWeight: '600',
                  fontStyle: 'normal'
                }}
              >
                — {testimonial.author}
              </cite>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
