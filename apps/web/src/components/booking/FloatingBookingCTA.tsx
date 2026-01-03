'use client'

import React, { useState, useEffect } from 'react'
import { FloatingCTA } from '@/components/buttons/BookingCTA'
import BookingModal from '@/components/booking/BookingModal'

interface FloatingBookingCTAProps {
  showAfterScroll?: number // pixels to scroll before showing
  hideOnPages?: string[] // pages where it should be hidden
}

const FloatingBookingCTA: React.FC<FloatingBookingCTAProps> = ({ 
  showAfterScroll = 800,
  hideOnPages = ['/dash', '/onboarding', '/login', '/auth']
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  useEffect(() => {
    // Check if we're on a page where the CTA should be hidden
    const currentPath = window.location.pathname
    const shouldHide = hideOnPages.some(page => currentPath.startsWith(page))
    
    if (shouldHide) {
      setIsVisible(false)
      return
    }

    const handleScroll = () => {
      const scrollY = window.scrollY
      setIsVisible(scrollY > showAfterScroll)
    }

    // Initial check
    handleScroll()

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [showAfterScroll, hideOnPages])

  const handleBookingClick = () => {
    setIsBookingModalOpen(true)
  }

  const handleBookingClose = () => {
    setIsBookingModalOpen(false)
  }

  if (!isVisible) return null

  return (
    <>
      <FloatingCTA 
        onClick={handleBookingClick}
        source="floating"
        animated
      />
      
      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={handleBookingClose}
        source="floating"
        animated
      />
    </>
  )
}

export default FloatingBookingCTA