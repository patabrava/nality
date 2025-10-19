'use client'

const features = [
  {
    title: "Smart onboarding",
    description: "Start with a guided chat that turns your memories into structured events. Edit anytime.",
    icon: "🤖",
    screenshot: "onboarding-chat"
  },
  {
    title: "A timeline that feels alive",
    description: "Clean, alternating layout. Drag, categorize, and tag important moments. See photos and clips in context.",
    icon: "⏰",
    screenshot: "timeline"
  },
  {
    title: "Interview, when it matters",
    description: "Professional interviewers can help you go deeper—especially for elder stories. We'll handle scheduling.",
    icon: "🎯",
    screenshot: "media-grid"
  },
  {
    title: "Export a beautiful Life Book",
    description: "One click to a polished PDF designed for printing and sharing.",
    icon: "📚",
    screenshot: "pdf-preview"
  }
]

export default function ProductHighlightsSection() {
  return (
    <section id="features" className="section" style={{ padding: '80px 0' }}>
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
            Features designed for your story
          </h2>
          <p 
            style={{
              fontSize: '1.125rem',
              color: 'var(--md-sys-color-on-surface-variant)',
              maxWidth: '600px',
              margin: '0 auto'
            }}
          >
            Every tool thoughtfully crafted to help you capture, organize, and share your life's most important moments
          </p>
        </div>

        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px'
          }}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="card"
              style={{
                background: 'var(--md-sys-color-surface-container)',
                borderRadius: '20px',
                padding: '32px',
                border: '1px solid var(--md-sys-color-outline-variant)',
                transition: 'all var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Screenshot placeholder */}
              <div 
                style={{
                  width: '100%',
                  height: '200px',
                  background: 'linear-gradient(135deg, var(--md-sys-color-surface-container-low), var(--md-sys-color-surface-container-high))',
                  borderRadius: '12px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--md-sys-color-outline-variant)',
                  position: 'relative'
                }}
              >
                {/* Mock screenshot content based on feature */}
                {feature.screenshot === 'timeline' && (
                  <div style={{ width: '90%', height: '90%', display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px' }}>
                    <div style={{ height: '24px', background: 'var(--md-sys-color-primary-container)', borderRadius: '4px', display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: '10px', color: 'var(--md-sys-color-on-primary-container)' }}>
                      🎓 Graduated College - 2020
                    </div>
                    <div style={{ height: '24px', background: 'var(--md-sys-color-secondary-container)', borderRadius: '4px', display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: '10px', color: 'var(--md-sys-color-on-secondary-container)' }}>
                      💼 First Job - 2021
                    </div>
                    <div style={{ height: '24px', background: 'var(--md-sys-color-tertiary-container)', borderRadius: '4px', display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: '10px', color: 'var(--md-sys-color-on-tertiary-container)' }}>
                      ❤️ Got Married - 2023
                    </div>
                  </div>
                )}
                
                {feature.screenshot === 'onboarding-chat' && (
                  <div style={{ width: '90%', height: '90%', display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px' }}>
                    <div style={{ padding: '8px 12px', background: 'var(--md-sys-color-surface-container-high)', borderRadius: '12px 12px 12px 4px', fontSize: '12px', color: 'var(--md-sys-color-on-surface)', maxWidth: '80%' }}>
                      Tell me about a moment that shaped who you are today
                    </div>
                    <div style={{ padding: '8px 12px', background: 'var(--md-sys-color-primary-container)', borderRadius: '12px 12px 4px 12px', fontSize: '12px', color: 'var(--md-sys-color-on-primary-container)', maxWidth: '80%', marginLeft: 'auto' }}>
                      When I graduated college, I felt like...
                    </div>
                  </div>
                )}

                {feature.screenshot === 'media-grid' && (
                  <div style={{ width: '90%', height: '90%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '16px' }}>
                    <div style={{ background: 'var(--md-sys-color-primary-container)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📸</div>
                    <div style={{ background: 'var(--md-sys-color-secondary-container)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🎥</div>
                    <div style={{ background: 'var(--md-sys-color-tertiary-container)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🎵</div>
                    <div style={{ background: 'var(--md-sys-color-surface-container-highest)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: 'var(--md-sys-color-on-surface)' }}>+</div>
                  </div>
                )}

                {feature.screenshot === 'pdf-preview' && (
                  <div style={{ width: '90%', height: '90%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <div style={{ 
                      width: '60px', 
                      height: '80px', 
                      background: 'linear-gradient(145deg, #ffffff, #f0f0f0)', 
                      borderRadius: '4px', 
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#333',
                      fontSize: '10px',
                      fontWeight: '600'
                    }}>
                      PDF
                    </div>
                  </div>
                )}

                <div 
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    fontSize: '24px'
                  }}
                >
                  {feature.icon}
                </div>
              </div>

              <h3 
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: 'var(--md-sys-color-on-surface)',
                  marginBottom: '16px'
                }}
              >
                {feature.title}
              </h3>
              
              <p 
                style={{
                  fontSize: '1rem',
                  color: 'var(--md-sys-color-on-surface-variant)',
                  lineHeight: '1.6'
                }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
