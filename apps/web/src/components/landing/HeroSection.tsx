'use client'

import { useAuth } from '@/hooks/useAuth'

interface HeroSectionProps {
  onSecondaryAction?: () => void
}

export default function HeroSection({ onSecondaryAction }: HeroSectionProps) {
  const { isAuthenticated } = useAuth()

  const handleStartStory = () => {
    if (isAuthenticated) {
      window.location.href = '/dash'
    } else {
      window.location.href = '/login'
    }
  }

  const handleSampleBook = () => {
    // Future: Open sample book modal or navigate to sample page
    onSecondaryAction?.()
    console.log('Sample book clicked')
  }

  return (
    <section className="hero" style={{ marginTop: '48px' }}>
      <div className="hero-content" style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        padding: '80px 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '48px',
        alignItems: 'center'
      }}>
        {/* Left column - Content */}
        <div className="hero-text" style={{ order: 1 }}>
          <h1 
            className="hero-title"
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
              fontWeight: '700',
              color: 'var(--md-sys-color-on-surface)',
              marginBottom: '24px',
              lineHeight: '1.1',
              letterSpacing: '-0.02em'
            }}
          >
            Your life, beautifully told.
          </h1>
          
          <p 
            className="hero-subtitle"
            style={{
              fontSize: 'clamp(1.125rem, 3vw, 1.375rem)',
              color: 'var(--md-sys-color-on-surface-variant)',
              marginBottom: '32px',
              lineHeight: '1.5',
              maxWidth: '600px'
            }}
          >
            Nality helps you turn memories into a living timeline and a gorgeous Life Book—guided by an intelligent companion and, if you like, a real interviewer.
          </p>

          <div 
            className="hero-actions"
            style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '24px',
              flexWrap: 'wrap'
            }}
          >
            <button 
              onClick={handleStartStory}
              className="form-button primary"
              style={{
                fontSize: '16px',
                padding: '16px 32px',
                height: 'auto',
                minWidth: '180px'
              }}
            >
              Start My Story
            </button>
            
            <button 
              onClick={handleSampleBook}
              className="form-button secondary"
              style={{
                fontSize: '16px',
                padding: '16px 32px',
                height: 'auto',
                minWidth: '180px'
              }}
            >
              See a sample Life Book
            </button>
          </div>

          <p 
            className="hero-trust"
            style={{
              fontSize: '14px',
              color: 'var(--md-sys-color-on-surface-variant)',
              opacity: '0.8',
              fontStyle: 'italic'
            }}
          >
            Private by design. You control who sees your story.
          </p>
        </div>

        {/* Right column - Visual */}
        <div className="hero-visual" style={{ order: 2, textAlign: 'center' }}>
          {/* Placeholder for hero visual - will be replaced with actual assets */}
          <div 
            style={{
              width: '100%',
              height: '400px',
              background: 'linear-gradient(135deg, var(--md-sys-color-surface-container-low), var(--md-sys-color-surface-container))',
              borderRadius: '20px',
              border: '1px solid var(--md-sys-color-outline-variant)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Timeline preview placeholder */}
            <div style={{
              position: 'absolute',
              left: '20px',
              top: '20px',
              bottom: '20px',
              width: '60%',
              background: 'var(--md-sys-color-surface-container-high)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{
                height: '40px',
                background: 'var(--md-sys-color-primary-container)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px',
                fontSize: '12px',
                color: 'var(--md-sys-color-on-primary-container)'
              }}>
                🎓 College Graduation - 2020
              </div>
              <div style={{
                height: '40px',
                background: 'var(--md-sys-color-secondary-container)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px',
                fontSize: '12px',
                color: 'var(--md-sys-color-on-secondary-container)'
              }}>
                💼 First Job - 2021
              </div>
              <div style={{
                height: '40px',
                background: 'var(--md-sys-color-tertiary-container)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px',
                fontSize: '12px',
                color: 'var(--md-sys-color-on-tertiary-container)'
              }}>
                ❤️ Marriage - 2023
              </div>
            </div>

            {/* Book preview placeholder */}
            <div style={{
              position: 'absolute',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%) rotateY(-10deg)',
              width: '120px',
              height: '160px',
              background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: '#333',
              fontWeight: '600',
              textAlign: 'center',
              padding: '16px'
            }}>
              Life Book<br/>Preview
            </div>

            {/* Decorative elements */}
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              fontSize: '20px',
              opacity: '0.6'
            }}>
              ✨
            </div>
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              fontSize: '16px',
              opacity: '0.4'
            }}>
              📚
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
