'use client'

import { useState, useEffect } from 'react'
import { useLocale } from '@/components/i18n/useLocale'

interface TrustSignalsProps {
  /** Show customer logos */
  showLogos?: boolean
  /** Show testimonial quotes */
  showTestimonials?: boolean
  /** Show security badges */
  showSecurityBadges?: boolean
  /** Show usage statistics */
  showStats?: boolean
  /** Show awards/certifications */
  showAwards?: boolean
  /** Layout variant */
  variant?: 'horizontal' | 'vertical' | 'grid' | 'carousel'
  /** Custom styling */
  className?: string
  /** Enable animations */
  animated?: boolean
}

interface CustomerLogo {
  id: string
  name: string
  logo: string
  industry: string
}

interface SecurityBadge {
  id: string
  name: string
  icon: string
  description: string
  certification: string
}

interface UsageStat {
  id: string
  value: string
  label: string
  icon: string
  trend?: 'up' | 'stable'
}

interface Award {
  id: string
  title: string
  organization: string
  year: string
  icon: string
}

interface Testimonial {
  id: string
  quote: string
  author: string
  role: string
  company?: string
  rating: number
  avatar?: string
}

export default function TrustSignals({
  showLogos = true,
  showTestimonials = true,
  showSecurityBadges = true,
  showStats = true,
  showAwards = false,
  variant = 'horizontal',
  className = '',
  animated = true
}: TrustSignalsProps) {
  const { t } = useLocale()
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setIsVisible(true), 300)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(true)
      return undefined
    }
  }, [animated])

  // Testimonial rotation
  useEffect(() => {
    if (!showTestimonials) return undefined
    
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [showTestimonials])

  // Customer logos data
  const customerLogos: CustomerLogo[] = [
    {
      id: 'family1',
      name: t('trustsignals.logos.family1.name'),
      logo: '👨‍👩‍👧‍👦',
      industry: t('trustsignals.logos.family1.industry')
    },
    {
      id: 'author',
      name: t('trustsignals.logos.author.name'),
      logo: '✍️',
      industry: t('trustsignals.logos.author.industry')
    },
    {
      id: 'elder',
      name: t('trustsignals.logos.elder.name'),
      logo: '👴',
      industry: t('trustsignals.logos.elder.industry')
    },
    {
      id: 'community',
      name: t('trustsignals.logos.community.name'),
      logo: '🏛️',
      industry: t('trustsignals.logos.community.industry')
    }
  ]

  // Security badges data
  const securityBadges: SecurityBadge[] = [
    {
      id: 'gdpr',
      name: t('trustsignals.security.gdpr.name'),
      icon: '🛡️',
      description: t('trustsignals.security.gdpr.description'),
      certification: t('trustsignals.security.gdpr.certification')
    },
    {
      id: 'iso27001',
      name: t('trustsignals.security.iso27001.name'),
      icon: '🔐',
      description: t('trustsignals.security.iso27001.description'),
      certification: t('trustsignals.security.iso27001.certification')
    },
    {
      id: 'encryption',
      name: t('trustsignals.security.encryption.name'),
      icon: '🔒',
      description: t('trustsignals.security.encryption.description'),
      certification: t('trustsignals.security.encryption.certification')
    },
    {
      id: 'backup',
      name: t('trustsignals.security.backup.name'),
      icon: '💾',
      description: t('trustsignals.security.backup.description'),
      certification: t('trustsignals.security.backup.certification')
    }
  ]

  // Usage statistics data
  const usageStats: UsageStat[] = [
    {
      id: 'stories_created',
      value: t('trustsignals.stats.stories.value'),
      label: t('trustsignals.stats.stories.label'),
      icon: '📚',
      trend: 'up'
    },
    {
      id: 'active_users',
      value: t('trustsignals.stats.users.value'),
      label: t('trustsignals.stats.users.label'),
      icon: '👥',
      trend: 'up'
    },
    {
      id: 'satisfaction',
      value: t('trustsignals.stats.satisfaction.value'),
      label: t('trustsignals.stats.satisfaction.label'),
      icon: '⭐',
      trend: 'stable'
    },
    {
      id: 'retention',
      value: t('trustsignals.stats.retention.value'),
      label: t('trustsignals.stats.retention.label'),
      icon: '💝',
      trend: 'up'
    }
  ]

  // Awards data
  const awards: Award[] = [
    {
      id: 'innovation2024',
      title: t('trustsignals.awards.innovation.title'),
      organization: t('trustsignals.awards.innovation.organization'),
      year: '2024',
      icon: '🏆'
    },
    {
      id: 'privacy2024',
      title: t('trustsignals.awards.privacy.title'),
      organization: t('trustsignals.awards.privacy.organization'),
      year: '2024',
      icon: '🥇'
    }
  ]

  // Testimonials data
  const testimonials: Testimonial[] = [
    {
      id: 'sarah',
      quote: t('trustsignals.testimonials.sarah.quote'),
      author: t('trustsignals.testimonials.sarah.author'),
      role: t('trustsignals.testimonials.sarah.role'),
      rating: 5,
      avatar: '👩'
    },
    {
      id: 'michael',
      quote: t('trustsignals.testimonials.michael.quote'),
      author: t('trustsignals.testimonials.michael.author'),
      role: t('trustsignals.testimonials.michael.role'),
      rating: 5,
      avatar: '👨'
    },
    {
      id: 'elena',
      quote: t('trustsignals.testimonials.elena.quote'),
      author: t('trustsignals.testimonials.elena.author'),
      role: t('trustsignals.testimonials.elena.role'),
      rating: 5,
      avatar: '👩‍💼'
    }
  ]

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < rating ? 'filled' : ''}`}>
        ⭐
      </span>
    ))
  }

  return (
    <section 
      className={`trust-signals ${variant} ${className} ${isVisible ? 'visible' : ''}`}
      aria-label={t('trustsignals.ariaLabel')}
    >
      <div className="trust-signals-container">
        
        {/* Customer Logos */}
        {showLogos && (
          <div className="trust-section logos-section">
            <h3 className="section-title">
              {t('trustsignals.logos.title')}
            </h3>
            
            <div className="customer-logos">
              {customerLogos.map((customer, index) => (
                <div
                  key={customer.id}
                  className="customer-logo"
                  style={{ animationDelay: animated ? `${index * 0.1}s` : '0s' }}
                >
                  <span className="logo-icon">{customer.logo}</span>
                  <div className="logo-info">
                    <span className="logo-name">{customer.name}</span>
                    <span className="logo-industry">{customer.industry}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Usage Statistics */}
        {showStats && (
          <div className="trust-section stats-section">
            <h3 className="section-title">
              {t('trustsignals.stats.title')}
            </h3>
            
            <div className="usage-stats">
              {usageStats.map((stat, index) => (
                <div
                  key={stat.id}
                  className="usage-stat"
                  style={{ animationDelay: animated ? `${index * 0.15}s` : '0s' }}
                >
                  <div className="stat-icon">{stat.icon}</div>
                  <div className="stat-content">
                    <span className="stat-value">{stat.value}</span>
                    <span className="stat-label">{stat.label}</span>
                    {stat.trend && (
                      <span className={`stat-trend ${stat.trend}`}>
                        {stat.trend === 'up' ? '📈' : '📊'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Testimonials */}
        {showTestimonials && (
          <div className="trust-section testimonials-section">
            <h3 className="section-title">
              {t('trustsignals.testimonials.title')}
            </h3>
            
            <div className="testimonial-carousel">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className={`testimonial-card ${index === currentTestimonial ? 'active' : ''}`}
                >
                  <div className="testimonial-content">
                    <div className="testimonial-quote">
                      "{testimonial.quote}"
                    </div>
                    
                    <div className="testimonial-rating">
                      {renderStars(testimonial.rating)}
                    </div>
                    
                    <div className="testimonial-author">
                      <span className="author-avatar">{testimonial.avatar}</span>
                      <div className="author-info">
                        <span className="author-name">{testimonial.author}</span>
                        <span className="author-role">{testimonial.role}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Testimonial Navigation */}
              <div className="testimonial-nav">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`nav-dot ${index === currentTestimonial ? 'active' : ''}`}
                    onClick={() => setCurrentTestimonial(index)}
                    aria-label={`${t('trustsignals.testimonials.navLabel')} ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Security Badges */}
        {showSecurityBadges && (
          <div className="trust-section security-section">
            <h3 className="section-title">
              {t('trustsignals.security.title')}
            </h3>
            
            <div className="security-badges">
              {securityBadges.map((badge, index) => (
                <div
                  key={badge.id}
                  className="security-badge"
                  title={badge.description}
                  style={{ animationDelay: animated ? `${index * 0.1}s` : '0s' }}
                >
                  <span className="badge-icon">{badge.icon}</span>
                  <div className="badge-content">
                    <span className="badge-name">{badge.name}</span>
                    <span className="badge-certification">{badge.certification}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Awards */}
        {showAwards && (
          <div className="trust-section awards-section">
            <h3 className="section-title">
              {t('trustsignals.awards.title')}
            </h3>
            
            <div className="awards-grid">
              {awards.map((award, index) => (
                <div
                  key={award.id}
                  className="award-card"
                  style={{ animationDelay: animated ? `${index * 0.2}s` : '0s' }}
                >
                  <span className="award-icon">{award.icon}</span>
                  <div className="award-content">
                    <span className="award-title">{award.title}</span>
                    <span className="award-organization">{award.organization}</span>
                    <span className="award-year">{award.year}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  )
}