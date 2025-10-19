'use client'

import { useEffect, useState } from 'react'

// Import landing page components
import Header from '@/components/landing/Header'
import HeroSection from '@/components/landing/HeroSection'
import SocialProofSection from '@/components/landing/SocialProofSection'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import ProductHighlightsSection from '@/components/landing/ProductHighlightsSection'
import OutcomesGallerySection from '@/components/landing/OutcomesGallerySection'
import PricingSection from '@/components/landing/PricingSection'
import FAQSection from '@/components/landing/FAQSection'
import FinalCTASection from '@/components/landing/FinalCTASection'
import Footer from '@/components/landing/Footer'

// Disable static generation for this page
export const dynamic = 'force-dynamic'

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleNavigation = (section: string) => {
    // Track navigation analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'nav_section_clicked', {
        section_name: section
      })
    }
  }

  const handleSampleBook = () => {
    // Track sample book clicks
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'hero_sample_book_clicked')
    }
    // Future: Open sample book modal or navigate to sample page
    console.log('Sample book clicked')
  }

  if (!mounted) {
    return null // Prevent hydration mismatch
  }

  return (
    <>
      {/* Skip to content for screen readers */}
      <a 
        href="#main-content" 
        className="sr-only"
        style={{
          position: 'absolute',
          left: '-9999px',
          zIndex: 999999,
          padding: '8px 16px',
          background: 'var(--md-sys-color-primary)',
          color: 'var(--md-sys-color-on-primary)',
          textDecoration: 'none',
          borderRadius: '4px'
        }}
        onFocus={(e) => {
          e.target.style.left = '8px'
          e.target.style.top = '8px'
        }}
        onBlur={(e) => {
          e.target.style.left = '-9999px'
        }}
      >
        Skip to content
      </a>

      {/* Header */}
      <Header onNavigate={handleNavigation} />

      {/* Main Content */}
      <main id="main-content" className="min-h-screen">
        {/* Hero Section */}
        <HeroSection onSecondaryAction={handleSampleBook} />
        
        {/* Social Proof */}
        <SocialProofSection />
        
        {/* How It Works */}
        <HowItWorksSection />
        
        {/* Product Highlights/Features */}
        <ProductHighlightsSection />
        
        {/* Outcomes Gallery */}
        <OutcomesGallerySection />
        
        {/* Pricing */}
        <PricingSection />
        
        {/* FAQ */}
        <FAQSection />
        
        {/* Final CTA */}
        <FinalCTASection />
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
