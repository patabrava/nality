'use client'

import { useState, useEffect } from 'react'
import { useLocale } from '@/components/i18n/useLocale'
import ConsentGate from '@/components/consent/ConsentGate'

interface BookingIntegrationProps {
  /** Calendly booking URL */
  calendlyUrl?: string
  /** Cal.com booking URL */
  calcomUrl?: string
  /** Preferred booking service */
  preferredService?: 'calendly' | 'calcom'
  /** Custom styling */
  className?: string
  /** Show as embed or popup */
  displayMode?: 'embed' | 'popup'
  /** Custom CTA text */
  ctaText?: string
  /** Show availability indicator */
  showAvailability?: boolean
}

export default function BookingIntegration({
  calendlyUrl = 'https://app.cal.eu/nality',
  calcomUrl = 'https://app.cal.eu/nality',
  preferredService = 'calcom',
  className = '',
  displayMode = 'popup',
  ctaText,
  showAvailability = true
}: BookingIntegrationProps) {
  const { t } = useLocale()
  const [isLoading, setIsLoading] = useState(false)
  const [availabilityStatus, setAvailabilityStatus] = useState<'available' | 'busy' | 'unknown'>('unknown')

  // Simulate availability check
  useEffect(() => {
    if (!showAvailability) return
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      const hour = new Date().getHours()
      // Simple availability logic (9 AM - 6 PM)
      if (hour >= 9 && hour <= 18) {
        setAvailabilityStatus('available')
      } else {
        setAvailabilityStatus('busy')
      }
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [showAvailability])

  const handleBookingClick = async (service: 'calendly' | 'calcom') => {
    setIsLoading(true)
    
    try {
      const url = service === 'calendly' ? calendlyUrl : calcomUrl
      
      if (displayMode === 'popup') {
        // Open in popup window
        const popup = window.open(
          url,
          'booking-popup',
          'width=800,height=600,scrollbars=yes,resizable=yes'
        )
        
        if (popup) {
          // Focus the popup
          popup.focus()
        }
      } else {
        // Direct navigation
        window.open(url, '_blank')
      }
    } catch (error) {
      console.error('Booking error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getAvailabilityIndicator = () => {
    if (!showAvailability || availabilityStatus === 'unknown') {
      return null
    }
    
    return (
      <div className={`availability-indicator ${availabilityStatus}`}>
        <span className="availability-dot"></span>
        <span className="availability-text">
          {availabilityStatus === 'available' 
            ? t('booking.availability.available')
            : t('booking.availability.busy')
          }
        </span>
      </div>
    )
  }

  return (
    <div className={`booking-integration ${className}`}>
      <div className="booking-header">
        <h3 className="booking-title">
          {t('booking.title')}
        </h3>
        <p className="booking-subtitle">
          {t('booking.subtitle')}
        </p>
        {getAvailabilityIndicator()}
      </div>

      <div className="booking-options">
        {/* Primary Booking CTA */}
        <ConsentGate 
          category="external-services"
          serviceName={preferredService === 'calendly' ? 'Calendly' : 'Cal.com'}
          customMessage={t('booking.consent.message')}
        >
          <button
            onClick={() => handleBookingClick(preferredService)}
            disabled={isLoading}
            className="booking-cta primary"
          >
            {isLoading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <span>{t('booking.loading')}</span>
              </div>
            ) : (
              <>
                <span className="cta-icon">📅</span>
                <span className="cta-text">
                  {ctaText || t('booking.cta.primary')}
                </span>
              </>
            )}
          </button>
        </ConsentGate>

        {/* Alternative Booking Service */}
        <div className="booking-alternative">
          <span className="alternative-text">
            {t('booking.alternative.text')}
          </span>
          
          <ConsentGate 
            category="external-services"
            serviceName={preferredService === 'calendly' ? 'Cal.com' : 'Calendly'}
            compact={true}
          >
            <button
              onClick={() => handleBookingClick(preferredService === 'calendly' ? 'calcom' : 'calendly')}
              className="booking-cta secondary"
            >
              {preferredService === 'calendly' ? t('booking.alternative.calcom') : t('booking.alternative.calendly')}
            </button>
          </ConsentGate>
        </div>
      </div>

      <div className="booking-info">
        <div className="info-item">
          <span className="info-icon">⏱️</span>
          <span className="info-text">{t('booking.info.duration')}</span>
        </div>
        <div className="info-item">
          <span className="info-icon">🌍</span>
          <span className="info-text">{t('booking.info.timezone')}</span>
        </div>
        <div className="info-item">
          <span className="info-icon">💼</span>
          <span className="info-text">{t('booking.info.type')}</span>
        </div>
      </div>

      <div className="booking-benefits">
        <h4 className="benefits-title">
          {t('booking.benefits.title')}
        </h4>
        <ul className="benefits-list">
          <li className="benefit-item">
            <span className="benefit-icon">✅</span>
            <span className="benefit-text">{t('booking.benefits.personal')}</span>
          </li>
          <li className="benefit-item">
            <span className="benefit-icon">✅</span>
            <span className="benefit-text">{t('booking.benefits.guidance')}</span>
          </li>
          <li className="benefit-item">
            <span className="benefit-icon">✅</span>
            <span className="benefit-text">{t('booking.benefits.questions')}</span>
          </li>
        </ul>
      </div>

      <div className="booking-footer">
        <p className="footer-text">
          {t('booking.footer.note')}
        </p>
      </div>
    </div>
  )
}