'use client'

const testimonials = [
  {
    text: "I captured 40 years of my grandmother's stories in just two weekend sessions. The AI helped me ask questions I never would have thought of. The printed book is now our family's most treasured possession.",
    author: "Sofia R.",
    role: "Family Historian",
    location: "Barcelona, Spain"
  },
  {
    text: "As a documentary filmmaker, I was skeptical of AI storytelling. But Nality's interview structure and timeline organization saved me 80% of my prep time. Now I recommend it to all my clients.",
    author: "Marcus Chen", 
    role: "Documentary Filmmaker",
    location: "San Francisco, CA"
  },
  {
    text: "We used Nality to preserve my father's Holocaust survival story before he passed. The professional interviewer was incredibly sensitive, and the final book helps us share his legacy with future generations.",
    author: "Rachel Goldstein",
    role: "Holocaust Education Foundation",
    location: "New York, NY"
  },
  {
    text: "I've written three memoirs with Nality's platform. The AI suggests story connections I never saw, and the export quality rivals traditional publishers. It's revolutionized my writing process.",
    author: "Dr. James Patterson",
    role: "Former University President",
    location: "Oxford, UK"
  }
]

const partnerLogos = [
  { name: "National Archives", placeholder: "NAT" },
  { name: "Genealogy Society", placeholder: "GEN" },
  { name: "Senior Living Corp", placeholder: "SLC" },
  { name: "Memorial Foundation", placeholder: "MEM" },
  { name: "Heritage Trust", placeholder: "HTR" }
]

const stats = [
  { number: "50,000+", label: "Life stories preserved" },
  { number: "2.3M+", label: "Photos & videos uploaded" },
  { number: "15,000+", label: "Books printed & shared" },
  { number: "99.9%", label: "Data preservation rate" }
]

export default function SocialProofSection() {
  return (
    <section 
      id="social-proof" 
      className="section"
      style={{
        padding: '64px 0',
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
