'use client'

import { useAuth } from '@/hooks/useAuth'

export default function FinalCTASection() {
  const { isAuthenticated } = useAuth()

  const handleStartStory = () => {
    if (isAuthenticated) {
      window.location.href = '/dash'
    } else {
      window.location.href = '/login'
    }
  }

  const handleExploreTimeline = () => {
    // Future: Navigate to timeline demo or sample
    window.location.href = '/demo/timeline-alternating'
  }

  return (
    <section 
      className="section"
      style={{
        padding: '80px 0',
        margin: '0 -24px',
        borderRadius: '0',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Pattern */}
      <div 
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          animation: 'float 6s ease-in-out infinite alternate',
          pointerEvents: 'none'
        }}
      />

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center' }}>
          <h2 
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
              fontWeight: '700',
              color: 'var(--md-sys-color-on-surface)',
              marginBottom: '24px',
              lineHeight: '1.1',
              letterSpacing: '-0.02em'
            }}
          >
            Start your story today
          </h2>
          
          <p 
            style={{
              fontSize: 'clamp(1.125rem, 3vw, 1.375rem)',
              color: 'var(--md-sys-color-on-surface-variant)',
              marginBottom: '40px',
              maxWidth: '600px',
              margin: '0 auto 40px',
              lineHeight: '1.5'
            }}
          >
            It takes just a few minutes to begin. You can always come back to add more.
          </p>

          <div 
            style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}
          >
            <button 
              onClick={handleStartStory}
              className="form-button primary"
              style={{
                fontSize: '18px',
                padding: '18px 36px',
                height: 'auto',
                minWidth: '200px',
                boxShadow: '0 8px 24px rgba(255, 255, 255, 0.15)'
              }}
            >
              Start My Story
            </button>
            
            <button 
              onClick={handleExploreTimeline}
              className="form-button secondary"
              style={{
                fontSize: '18px',
                padding: '18px 36px',
                height: 'auto',
                minWidth: '200px'
              }}
            >
              Explore the Timeline
            </button>
          </div>

          {/* Trust message */}
          <div 
            style={{
              marginTop: '40px',
              padding: '24px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              border: '1px solid var(--md-sys-color-outline-variant)',
              maxWidth: '500px',
              margin: '40px auto 0'
            }}
          >
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '8px'
              }}
            >
              <span style={{ fontSize: '20px' }}>🔒</span>
              <span 
                style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: 'var(--md-sys-color-on-surface)'
                }}
              >
                Privacy guaranteed
              </span>
            </div>
            <p 
              style={{
                fontSize: '0.875rem',
                color: 'var(--md-sys-color-on-surface-variant)',
                lineHeight: '1.5',
                margin: '0'
              }}
            >
              Your stories are private by default. Share only what you choose, with whom you choose.
            </p>
          </div>

          {/* Social proof numbers */}
          <div 
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '48px',
              marginTop: '48px',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div 
                style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: 'var(--md-sys-color-primary)',
                  marginBottom: '4px'
                }}
              >
                10K+
              </div>
              <div 
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--md-sys-color-on-surface-variant)'
                }}
              >
                Stories preserved
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div 
                style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: 'var(--md-sys-color-primary)',
                  marginBottom: '4px'
                }}
              >
                500+
              </div>
              <div 
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--md-sys-color-on-surface-variant)'
                }}
              >
                Books created
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div 
                style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: 'var(--md-sys-color-primary)',
                  marginBottom: '4px'
                }}
              >
                4.9
              </div>
              <div 
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--md-sys-color-on-surface-variant)'
                }}
              >
                Average rating
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          from {
            transform: translateY(0px);
          }
          to {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </section>
  )
}
