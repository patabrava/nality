'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useUserProfile } from '@/hooks/useUserProfile'

// Import landing page components
import LandingHeader from '@/components/landing/navigation/LandingHeader'
import HeroSection from '@/components/landing/HeroSection'
import SocialProofSection from '@/components/landing/SocialProofSection'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import ProductHighlightsSection from '@/components/landing/ProductHighlightsSection'
import CustomerValueSection from '@/components/landing/CustomerValueSection'
import OutcomesGallerySection from '@/components/landing/OutcomesGallerySection'
import PricingSection from '@/components/landing/PricingSection'
import FAQSection from '@/components/landing/FAQSection'
import FinalCTASection from '@/components/landing/FinalCTASection'
import Footer from '@/components/landing/Footer'
import ProblemSolutionFramework from '@/components/landing/ProblemSolutionFramework'
import EnhancedCTA from '@/components/landing/EnhancedCTA'
import TrustSignals from '@/components/landing/TrustSignals'

// Disable static generation for this page
export const dynamic = 'force-dynamic'

interface LocalePageProps {
  params: Promise<{ locale: string }>
}

export default function LocalePage({ params }: LocalePageProps) {
  const router = useRouter()
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const { isLoading: profileLoading, isOnboardingComplete } = useUserProfile(user?.id)
  const [mounted, setMounted] = useState(false)
  const shouldRedirect = useMemo(() => isAuthenticated && mounted, [isAuthenticated, mounted])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Client-side guard to avoid landing page for returning users
  useEffect(() => {
    if (!shouldRedirect) return

    if (authLoading || profileLoading) return

    if (isOnboardingComplete) {
      router.replace('/dash')
    } else {
      router.replace('/onboarding')
    }
  }, [shouldRedirect, authLoading, profileLoading, isOnboardingComplete, router])

  const handleSampleBook = () => {
    // Track sample book clicks
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'hero_sample_book_clicked')
    }
    // Future: Open sample book modal or navigate to sample page
    console.log('Sample book clicked')
  }

  // Avoid flicker while deciding redirect
  if (!mounted || (shouldRedirect && (authLoading || profileLoading))) {
    return null // Prevent hydration mismatch
  }

  return (
    <div className="landing-page-with-header">
      {/* Landing Header */}
      <LandingHeader />

      {/* Grain Overlay */}
      <div className="grain-overlay"></div>

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


      {/* Main Content */}
      <main id="main-content" className="min-h-screen">
        {/* Hero Section */}
        <HeroSection onSecondaryAction={handleSampleBook} />
        
        {/* Features Section */}
        <ProductHighlightsSection />
        
        {/* Problem-Solution Framework */}
        <ProblemSolutionFramework />
        
        {/* Customer Value Propositions */}
        <CustomerValueSection />
        
        {/* How It Works */}
        <HowItWorksSection />
        
        {/* Enhanced CTA with Social Proof */}
        <EnhancedCTA />
        
        {/* Social Proof & Testimonials */}
        <SocialProofSection />
        
        {/* Trust Signals */}
        <TrustSignals />
        
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
    </div>
  );
}