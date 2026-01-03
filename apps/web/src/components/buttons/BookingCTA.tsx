'use client'

import React, { useState, useEffect } from 'react'
import { useLocale } from '@/components/i18n/useLocale'

export interface BookingCTAProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'minimal' | 'hero' | 'floating'
  size?: 'small' | 'medium' | 'large' | 'xl'
  icon?: string | React.ReactNode
  source?: string // For analytics tracking
  className?: string
  disabled?: boolean
  loading?: boolean
  animated?: boolean
  urgency?: boolean
  showCounter?: boolean
  fullWidth?: boolean
  onClick: () => void
  children?: React.ReactNode
}

interface UrgencyCounterProps {
  targetDate: Date
  onExpired?: () => void
}

// Urgency Counter Component
const UrgencyCounter: React.FC<UrgencyCounterProps> = ({ targetDate, onExpired }) => {
  const { t } = useLocale()
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  } | null>(null)

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime()
      const target = targetDate.getTime()
      const difference = target - now

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        })
      } else {
        setTimeLeft(null)
        onExpired?.()
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [targetDate, onExpired])

  if (!timeLeft) return null

  return (
    <div className="urgency-counter">
      <span className="counter-label">{t('booking.cta.urgency.label')}</span>
      <div className="counter-time">
        {timeLeft.days > 0 && (
          <span className="time-unit">
            <span className="time-value">{timeLeft.days}</span>
            <span className="time-label">{t('booking.cta.urgency.days')}</span>
          </span>
        )}
        <span className="time-unit">
          <span className="time-value">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="time-label">{t('booking.cta.urgency.hours')}</span>
        </span>
        <span className="time-separator">:</span>
        <span className="time-unit">
          <span className="time-value">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="time-label">{t('booking.cta.urgency.minutes')}</span>
        </span>
      </div>
    </div>
  )
}

// Main Booking CTA Component
const BookingCTA: React.FC<BookingCTAProps> = ({
  variant = 'primary',
  size = 'medium',
  icon,
  source = 'unknown',
  className = '',
  disabled = false,
  loading = false,
  animated = true,
  urgency = false,
  showCounter = false,
  fullWidth = false,
  onClick,
  children
}) => {
  const { t, locale } = useLocale()
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const [isVisible, setIsVisible] = useState(!animated)

  // Animation entrance effect
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setIsVisible(true), 200)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [animated])

  const handleClick = () => {
    if (disabled || loading) return

    // Track CTA click with detailed context
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'cta_primary_click', {
        source: source,
        variant: variant,
        size: size,
        locale: locale,
        has_urgency: urgency,
        has_counter: showCounter
      })
    }

    onClick()
  }

  const getButtonText = () => {
    if (children) return children
    if (loading) return t('booking.cta.loading')
    
    // Different CTA text based on variant and locale
    switch (variant) {
      case 'hero':
        return t('booking.cta.hero')
      case 'minimal':
        return t('booking.cta.minimal')
      case 'floating':
        return t('booking.cta.floating')
      default:
        return t('booking.cta.default')
    }
  }

  const getButtonIcon = () => {
    if (loading) return <div className="loading-spinner-small" />
    if (icon) return typeof icon === 'string' ? <span className="cta-icon">{icon}</span> : icon
    
    // Default icons based on variant
    switch (variant) {
      case 'hero':
        return <span className="cta-icon">📅</span>
      case 'floating':
        return <span className="cta-icon">💬</span>
      case 'minimal':
        return <span className="cta-icon">→</span>
      default:
        return <span className="cta-icon">📞</span>
    }
  }

  // Generate urgency deadline (e.g., end of current week)
  const getUrgencyDeadline = () => {
    const now = new Date()
    const endOfWeek = new Date(now)
    endOfWeek.setDate(now.getDate() + (7 - now.getDay()))
    endOfWeek.setHours(23, 59, 59, 999)
    return endOfWeek
  }

  const buttonClasses = [
    'booking-cta',
    `variant-${variant}`,
    `size-${size}`,
    isVisible ? 'visible' : '',
    isHovered ? 'hovered' : '',
    isPressed ? 'pressed' : '',
    disabled ? 'disabled' : '',
    loading ? 'loading' : '',
    urgency ? 'urgency' : '',
    fullWidth ? 'full-width' : '',
    animated ? 'animated' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className="booking-cta-container">
      {urgency && t('booking.cta.urgency.banner') && (
        <div className="urgency-banner">
          <span className="urgency-icon">⚡</span>
          <span className="urgency-text">{t('booking.cta.urgency.banner')}</span>
        </div>
      )}
      
      <button
        type="button"
        className={buttonClasses}
        onClick={handleClick}
        disabled={disabled || loading}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onBlur={() => setIsPressed(false)}
        aria-label={`${getButtonText()} - ${t('booking.cta.ariaLabel')}`}
      >
        <span className="cta-content">
          {getButtonIcon()}
          <span className="cta-text">{getButtonText()}</span>
        </span>
        
        {variant === 'hero' && t('booking.cta.subtext') && (
          <span className="cta-subtext">{t('booking.cta.subtext')}</span>
        )}
        
        <div className="cta-glow" />
        <div className="cta-ripple" />
      </button>

      {showCounter && urgency && (
        <UrgencyCounter 
          targetDate={getUrgencyDeadline()}
          onExpired={() => {
            // Track urgency expiration
            if (typeof window !== 'undefined' && (window as any).gtag) {
              (window as any).gtag('event', 'urgency_expired', { source: source })
            }
          }}
        />
      )}

      {variant === 'floating' && (
        <div className="floating-indicator">
          <div className="indicator-dot"></div>
          <div className="indicator-pulse"></div>
        </div>
      )}
    </div>
  )
}

// Specialized CTA Components for different sections
export const HeroCTA: React.FC<Omit<BookingCTAProps, 'variant' | 'size'>> = (props) => (
  <BookingCTA {...props} variant="hero" size="xl" />
)

export const SectionCTA: React.FC<Omit<BookingCTAProps, 'variant'>> = (props) => (
  <BookingCTA {...props} variant="primary" />
)

export const FloatingCTA: React.FC<Omit<BookingCTAProps, 'variant' | 'size'>> = (props) => (
  <BookingCTA {...props} variant="floating" size="medium" />
)

export const MinimalCTA: React.FC<Omit<BookingCTAProps, 'variant' | 'size'>> = (props) => (
  <BookingCTA {...props} variant="minimal" size="small" />
)

export default BookingCTA