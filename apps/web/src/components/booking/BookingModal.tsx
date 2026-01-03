'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import { useLocale } from '@/components/i18n/useLocale'
import { useAuth } from '@/hooks/useAuth'

// Cal.com type declarations
declare global {
  interface Window {
    Cal?: any
    CalEmbed?: any
  }
}

// Initialize Cal namespace queue if not present
if (typeof window !== 'undefined' && !window.Cal) {
  (window as any).Cal = function (...args: any[]) {
    const cal = (window as any).Cal as any
    if (!cal.q) cal.q = []
    cal.q.push(args)
    return cal
  }
  (window as any).Cal.q = []
}

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  source?: string // Track where the booking was initiated from
  animated?: boolean
}

// Main Booking Modal Component
const BookingModal: React.FC<BookingModalProps> = ({ 
  isOpen, 
  onClose, 
  source = 'unknown',
  animated = true 
}) => {
  const { t } = useLocale()
  const { user } = useAuth()
  const calContainerRef = useRef<HTMLDivElement>(null)
  const scriptLoadedRef = useRef(false)

  const initializeCalEmbed = useCallback(() => {
    if (!calContainerRef.current) {
      console.log('[BookingModal] Container ref not ready')
      return
    }

    try {
      console.log('[BookingModal] Initializing Cal.com embed')

      // Get user data for prefilling
      const userName = user?.user_metadata?.full_name || 
                       user?.user_metadata?.name || 
                       ''
      const userEmail = user?.email || ''

      // Cal.com uses a queue pattern - calls are queued until the namespace is ready
      // Initialize Cal.com namespace
      if (window.Cal) {
        window.Cal('init', { origin: 'https://cal.com' })

        // Embed inline calendar with correct Cal.com link
        window.Cal('inline', {
          elementOrSelector: calContainerRef.current,
          calLink: 'nality',
          layout: 'month_view',
          config: {
            theme: 'dark',
            // Prefill user information
            name: userName,
            email: userEmail,
            // Custom metadata
            metadata: {
              source: source || 'contact-page',
              userId: user?.id || 'anonymous'
            }
          }
        })

        console.log('[BookingModal] Cal.com embed initialized successfully')

        // Track booking initiated
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'booking_embed_opened', {
            source: source
          })
        }
      }
    } catch (error) {
      console.error('[BookingModal] Error initializing Cal.com:', error)
    }
  }, [user, source])

  useEffect(() => {
    if (!isOpen) return

    console.log('[BookingModal] Modal opened, loading Cal.com script')

    // Check if script already exists to avoid duplicates
    const existingScript = document.querySelector('script[src="https://app.cal.com/embed/embed.js"]')
    
    if (!existingScript && typeof window !== 'undefined') {
      const script = document.createElement('script')
      script.src = 'https://app.cal.com/embed/embed.js'
      script.async = true
      script.defer = true
      
      script.onload = () => {
        console.log('[BookingModal] Cal.com script loaded')
        scriptLoadedRef.current = true
        // Give Cal.com time to set up its namespace after script execution
        setTimeout(() => {
          initializeCalEmbed()
        }, 150)
      }

      script.onerror = () => {
        console.error('[BookingModal] Failed to load Cal.com script')
      }
      
      document.head.appendChild(script)
    } else {
      // Script already exists, initialize with small delay
      scriptLoadedRef.current = true
      setTimeout(() => {
        initializeCalEmbed()
      }, 150)
    }

    return () => {
      // Cleanup Cal instance when modal closes
      if (window.Cal && typeof window.Cal === 'function') {
        try {
          window.Cal('ui', { hideEventTypeDetails: false })
        } catch (error) {
          console.log('[BookingModal] Cleanup error (non-critical):', error)
        }
      }
    }
  }, [isOpen, initializeCalEmbed])

  if (!isOpen) return null

  return (
    <div 
      className="booking-modal-overlay visible"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div 
        className="booking-modal-content visible"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '1000px',
          width: '90vw',
          maxHeight: '90vh',
          height: '800px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <h2 id="booking-modal-title" className="modal-title">
            {t('booking.modal.title')}
          </h2>
          <p className="modal-description">
            {t('booking.modal.description')}
          </p>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label={t('booking.modal.closeLabel')}
            type="button"
          >
            <span className="close-icon">✕</span>
          </button>
        </div>

        {/* Cal.com Embed Container */}
        <div 
          ref={calContainerRef}
          className="modal-body"
          style={{ 
            flex: 1,
            overflow: 'auto',
            padding: 0,
            minHeight: '600px'
          }}
        />
      </div>
    </div>
  )
}

export default BookingModal