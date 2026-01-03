'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useLocale } from '@/components/i18n/useLocale'
import ConsentGate from '@/components/consent/ConsentGate'
import HeroCanvas from './HeroCanvas'

interface EnhancedHeroSectionProps {
  onSecondaryAction?: () => void
  onBookingClick?: () => void
  showBookingCTA?: boolean
  showPrototypeLink?: boolean
}

export default function EnhancedHeroSection({ 
  onSecondaryAction,
  onBookingClick,
  showBookingCTA = true,
  showPrototypeLink = true
}: EnhancedHeroSectionProps) {
  const { isAuthenticated } = useAuth()
  const { t } = useLocale()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleStartStory = () => {
    if (isAuthenticated) {
      window.location.href = '/dash'
    } else {
      window.location.href = '/login'
    }
  }

  const handleSampleBook = () => {
    onSecondaryAction?.()
    console.log('Sample book clicked')
  }

  const handleBookingClick = () => {
    onBookingClick?.()
    console.log('Booking clicked')
  }

  const handlePrototypeClick = () => {
    window.open('/prototype-demo', '_blank')
    console.log('Prototype demo clicked')
  }

  if (!mounted) {
    return null // Prevent hydration issues
  }

  return (
    <section className="enhanced-hero-section">
      <HeroCanvas />

      <div className="enhanced-hero-content">
        <div className="hero-text-content">
          <div className="hero-announcement">
            <span className="announcement-badge">
              {t('hero.announcement.badge')}
            </span>
            <span className="announcement-text">
              {t('hero.announcement.text')}
            </span>
          </div>

          <h1 className="enhanced-hero-title">
            {t('hero.title.main')}
            <br/>
            <span className="title-highlight">
              {t('hero.title.highlight')}
            </span>
          </h1>

          <p className="enhanced-hero-subtitle">
            {t('hero.subtitle')}
          </p>

          <div className="hero-value-props">
            <div className="value-prop">
              <span className="value-icon">🎙️</span>
              <span className="value-text">{t('hero.values.interview')}</span>
            </div>
            <div className="value-prop">
              <span className="value-icon">🤖</span>
              <span className="value-text">{t('hero.values.ai')}</span>
            </div>
            <div className="value-prop">
              <span className="value-icon">📖</span>
              <span className="value-text">{t('hero.values.book')}</span>
            </div>
          </div>

          <div className="enhanced-hero-actions">
            <button 
              onClick={handleStartStory} 
              className="hero-cta-primary"
            >
              {t('hero.cta.primary')}
            </button>

            {showBookingCTA && (
              <ConsentGate 
                category="external-services"
                serviceName="Calendly"
                compact={true}
              >
                <button 
                  onClick={handleBookingClick}
                  className="hero-cta-booking"
                >
                  {t('hero.cta.booking')}
                </button>
              </ConsentGate>
            )}

            <button 
              onClick={handleSampleBook} 
              className="hero-cta-secondary"
            >
              {t('hero.cta.sample')}
            </button>
          </div>

          <div className="hero-secondary-actions">
            {showPrototypeLink && (
              <button 
                onClick={handlePrototypeClick}
                className="hero-prototype-link"
              >
                {t('hero.prototype.link')} 
                <span className="prototype-arrow">→</span>
              </button>
            )}
          </div>

          <div className="hero-trust-signals">
            <p className="trust-message">
              {t('hero.trust.privacy')}
            </p>
            <div className="trust-indicators">
              <span className="trust-indicator">
                <span className="indicator-icon">🔒</span>
                {t('hero.trust.secure')}
              </span>
              <span className="trust-indicator">
                <span className="indicator-icon">🇪🇺</span>
                {t('hero.trust.gdpr')}
              </span>
              <span className="trust-indicator">
                <span className="indicator-icon">⚡</span>
                {t('hero.trust.instant')}
              </span>
            </div>
          </div>
        </div>

        <div className="enhanced-hero-visual">
          {/* Enhanced Visual Elements */}
          <div className="hero-visual-container">
            {/* Background Glow */}
            <div className="visual-glow"></div>

            {/* Floating UI Cards - Enhanced */}
            <div className="floating-card timeline-card">
              <div className="card-header">
                <span className="card-date">1985 • {t('hero.visual.beginning')}</span>
              </div>
              <div className="card-content">
                <div className="content-line primary"></div>
                <div className="content-line secondary"></div>
              </div>
            </div>

            <div className="floating-card story-card">
              <div className="card-header">
                <span className="card-date">2023 • {t('hero.visual.legacy')}</span>
              </div>
              <div className="card-content">
                <p className="story-quote">{t('hero.visual.quote')}</p>
                <div className="content-line full"></div>
              </div>
            </div>

            <div className="floating-card interview-card">
              <div className="interview-indicator">
                <div className="recording-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                </div>
                <span className="recording-text">{t('hero.visual.recording')}</span>
              </div>
            </div>

            {/* New: Book Preview Card */}
            <div className="floating-card book-card">
              <div className="book-preview">
                <div className="book-cover">
                  <div className="cover-title">{t('hero.visual.bookTitle')}</div>
                  <div className="cover-author">{t('hero.visual.yourName')}</div>
                </div>
                <div className="book-shadow"></div>
              </div>
            </div>

            {/* New: AI Assistant Card */}
            <div className="floating-card ai-card">
              <div className="ai-indicator">
                <div className="ai-avatar">🤖</div>
                <div className="ai-message">
                  <div className="message-bubble">
                    {t('hero.visual.aiMessage')}
                  </div>
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}