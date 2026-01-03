'use client'

import { useState, useEffect } from 'react'
import { useLocale } from '@/components/i18n/useLocale'

interface EnhancedCTAProps {
  /** Primary CTA text */
  primaryText?: string
  /** Secondary CTA text */
  secondaryText?: string
  /** Main heading */
  title?: string
  /** Supporting subtitle */
  subtitle?: string
  /** Show urgency indicators */
  showUrgency?: boolean
  /** Show social proof numbers */
  showSocialProof?: boolean
  /** Show trust badges */
  showTrustBadges?: boolean
  /** CTA button size */
  ctaSize?: 'small' | 'medium' | 'large'
  /** Layout variant */
  variant?: 'default' | 'centered' | 'split' | 'hero'
  /** Custom styling */
  className?: string
  /** Show animated elements */
  animated?: boolean
  /** Primary CTA handler */
  onPrimaryAction?: () => void
  /** Secondary CTA handler */
  onSecondaryAction?: () => void
}

interface SocialProofMetric {
  id: string
  value: string
  label: string
  icon: string
  growth?: string
}

interface TrustBadge {
  id: string
  name: string
  icon: string
  description: string
}

export default function EnhancedCTA({
  primaryText,
  secondaryText,
  title,
  subtitle,
  showUrgency = false,
  showSocialProof = true,
  showTrustBadges = true,
  ctaSize = 'large',
  variant = 'default',
  className = '',
  animated = true,
  onPrimaryAction,
  onSecondaryAction
}: EnhancedCTAProps) {
  const { t } = useLocale()
  const [isVisible, setIsVisible] = useState(false)
  const [activeMetric, setActiveMetric] = useState(0)

  // Animation trigger
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setIsVisible(true), 200)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(true)
      return undefined
    }
  }, [animated])

  // Rotating social proof metrics
  useEffect(() => {
    if (!showSocialProof) return undefined
    
    const interval = setInterval(() => {
      setActiveMetric(prev => (prev + 1) % socialProofMetrics.length)
    }, 3000)
    
    return () => clearInterval(interval)
  }, [showSocialProof])

  // Social proof data
  const socialProofMetrics: SocialProofMetric[] = [
    {
      id: 'users',
      value: t('enhancedcta.socialproof.users.value'),
      label: t('enhancedcta.socialproof.users.label'),
      icon: '👥',
      growth: t('enhancedcta.socialproof.users.growth')
    },
    {
      id: 'stories',
      value: t('enhancedcta.socialproof.stories.value'),
      label: t('enhancedcta.socialproof.stories.label'),
      icon: '📖',
      growth: t('enhancedcta.socialproof.stories.growth')
    },
    {
      id: 'satisfaction',
      value: t('enhancedcta.socialproof.satisfaction.value'),
      label: t('enhancedcta.socialproof.satisfaction.label'),
      icon: '⭐',
      growth: t('enhancedcta.socialproof.satisfaction.growth')
    },
    {
      id: 'countries',
      value: t('enhancedcta.socialproof.countries.value'),
      label: t('enhancedcta.socialproof.countries.label'),
      icon: '🌍'
    }
  ]

  // Trust badges data
  const trustBadges: TrustBadge[] = [
    {
      id: 'gdpr',
      name: t('enhancedcta.trust.gdpr.name'),
      icon: '🛡️',
      description: t('enhancedcta.trust.gdpr.description')
    },
    {
      id: 'security',
      name: t('enhancedcta.trust.security.name'),
      icon: '🔒',
      description: t('enhancedcta.trust.security.description')
    },
    {
      id: 'privacy',
      name: t('enhancedcta.trust.privacy.name'),
      icon: '👤',
      description: t('enhancedcta.trust.privacy.description')
    },
    {
      id: 'support',
      name: t('enhancedcta.trust.support.name'),
      icon: '💬',
      description: t('enhancedcta.trust.support.description')
    }
  ]

  const handlePrimaryClick = () => {
    if (onPrimaryAction) {
      onPrimaryAction()
    } else {
      // Default action - navigate to sign up
      window.location.href = '/onboarding'
    }
  }

  const handleSecondaryClick = () => {
    if (onSecondaryAction) {
      onSecondaryAction()
    } else {
      // Default action - navigate to demo
      window.location.href = '#prototype'
    }
  }

  const ctaContent = {
    title: title || t('enhancedcta.title'),
    subtitle: subtitle || t('enhancedcta.subtitle'),
    primaryText: primaryText || t('enhancedcta.primary'),
    secondaryText: secondaryText || t('enhancedcta.secondary')
  }

  return (
    <section 
      className={`enhanced-cta ${variant} ${className} ${isVisible ? 'visible' : ''}`}
      aria-labelledby="enhanced-cta-title"
    >
      <div className="enhanced-cta-container">
        {/* Urgency Banner */}
        {showUrgency && (
          <div className="urgency-banner" role="alert">
            <span className="urgency-icon">⚡</span>
            <span className="urgency-text">
              {t('enhancedcta.urgency.text')}
            </span>
            <span className="urgency-timer">
              {t('enhancedcta.urgency.timer')}
            </span>
          </div>
        )}

        {/* Main Content */}
        <div className="cta-main-content">
          <div className="cta-text-section">
            <h2 id="enhanced-cta-title" className="cta-title">
              {ctaContent.title}
            </h2>
            
            <p className="cta-subtitle">
              {ctaContent.subtitle}
            </p>

            {/* Social Proof Metrics */}
            {showSocialProof && (
              <div className="social-proof-section">
                <div className="social-proof-container">
                  {socialProofMetrics.map((metric, index) => (
                    <div
                      key={metric.id}
                      className={`social-proof-metric ${index === activeMetric ? 'active' : ''}`}
                    >
                      <span className="metric-icon">{metric.icon}</span>
                      <div className="metric-content">
                        <span className="metric-value">{metric.value}</span>
                        <span className="metric-label">{metric.label}</span>
                        {metric.growth && (
                          <span className="metric-growth">{metric.growth}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="cta-buttons-section">
              <button
                className={`cta-primary ${ctaSize}`}
                onClick={handlePrimaryClick}
                aria-describedby="cta-primary-description"
              >
                <span className="btn-content">
                  <span className="btn-icon">🚀</span>
                  <span className="btn-text">{ctaContent.primaryText}</span>
                </span>
                <span className="btn-glow"></span>
              </button>

              <button
                className={`cta-secondary ${ctaSize}`}
                onClick={handleSecondaryClick}
                aria-describedby="cta-secondary-description"
              >
                <span className="btn-content">
                  <span className="btn-icon">👀</span>
                  <span className="btn-text">{ctaContent.secondaryText}</span>
                </span>
              </button>

              {/* Hidden descriptions for screen readers */}
              <div id="cta-primary-description" className="sr-only">
                {t('enhancedcta.accessibility.primary')}
              </div>
              <div id="cta-secondary-description" className="sr-only">
                {t('enhancedcta.accessibility.secondary')}
              </div>
            </div>

            {/* Risk Reversal */}
            <div className="risk-reversal">
              <span className="risk-icon">✅</span>
              <span className="risk-text">
                {t('enhancedcta.riskfree')}
              </span>
            </div>
          </div>

          {/* Trust Badges */}
          {showTrustBadges && (
            <div className="trust-badges-section">
              <h3 className="trust-badges-title">
                {t('enhancedcta.trust.title')}
              </h3>
              
              <div className="trust-badges-grid">
                {trustBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="trust-badge"
                    title={badge.description}
                  >
                    <span className="badge-icon">{badge.icon}</span>
                    <span className="badge-name">{badge.name}</span>
                  </div>
                ))}
              </div>
              
              <p className="trust-subtext">
                {t('enhancedcta.trust.subtitle')}
              </p>
            </div>
          )}
        </div>

        {/* Background Effects */}
        <div className="cta-background-effects" aria-hidden="true">
          <div className="effect-gradient"></div>
          <div className="effect-dots"></div>
          <div className="effect-glow"></div>
        </div>
      </div>
    </section>
  )
}