'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// Disable static generation for this page
export const dynamic = 'force-dynamic'

export default function Home() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleStartStory = () => {
    if (isAuthenticated) {
      router.push('/dash')
    } else {
      router.push('/login')
    }
  }

  const handleLearnMore = () => {
    const featuresSection = document.getElementById('features')
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (!mounted) {
    return null // Prevent hydration mismatch
  }

  return (
    <>
      <style jsx global>{`
        :root {
          /* OpenAI-Inspired Monochromatic Dark Theme */
          --md-sys-color-primary: #ffffff;
          --md-sys-color-on-primary: #000000;
          --md-sys-color-primary-container: #1a1a1a;
          --md-sys-color-on-primary-container: #ffffff;
          
          --md-sys-color-secondary: #e5e5e5;
          --md-sys-color-on-secondary: #000000;
          --md-sys-color-secondary-container: #2a2a2a;
          --md-sys-color-on-secondary-container: #e5e5e5;
          
          --md-sys-color-tertiary: #cccccc;
          --md-sys-color-on-tertiary: #000000;
          --md-sys-color-tertiary-container: #333333;
          --md-sys-color-on-tertiary-container: #cccccc;
          
          --md-sys-color-surface: #0a0a0a;
          --md-sys-color-surface-dim: #000000;
          --md-sys-color-surface-bright: #1a1a1a;
          --md-sys-color-surface-container-lowest: #000000;
          --md-sys-color-surface-container-low: #0f0f0f;
          --md-sys-color-surface-container: #1a1a1a;
          --md-sys-color-surface-container-high: #2a2a2a;
          --md-sys-color-surface-container-highest: #333333;
          
          --md-sys-color-on-surface: #ffffff;
          --md-sys-color-on-surface-variant: #cccccc;
          --md-sys-color-surface-variant: #1a1a1a;
          
          --md-sys-color-outline: #666666;
          --md-sys-color-outline-variant: #333333;
          
          --md-sys-color-background: #000000;
          --md-sys-color-on-background: #ffffff;
          
          --md-sys-color-error: #ffffff;
          --md-sys-color-on-error: #000000;
          --md-sys-color-error-container: #1a1a1a;
          --md-sys-color-on-error-container: #ffffff;
          
          /* Nality Monochromatic Tokens */
          --nality-accent: #ffffff;
          --nality-accent-light: #e5e5e5;
          --nality-accent-dark: #cccccc;
          
          /* Animation Tokens */
          --md-sys-motion-duration-short1: 100ms;
          --md-sys-motion-duration-short2: 200ms;
          --md-sys-motion-duration-medium1: 250ms;
          --md-sys-motion-duration-medium2: 300ms;
          --md-sys-motion-duration-long1: 400ms;
          --md-sys-motion-duration-long2: 500ms;
          
          --md-sys-motion-easing-standard: cubic-bezier(0.2, 0, 0, 1);
          --md-sys-motion-easing-emphasized: cubic-bezier(0.2, 0, 0, 1);
          --md-sys-motion-easing-decelerated: cubic-bezier(0, 0, 0, 1);
          --md-sys-motion-easing-accelerated: cubic-bezier(0.3, 0, 1, 1);
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Roboto', system-ui, -apple-system, sans-serif;
          background-color: var(--md-sys-color-background);
          color: var(--md-sys-color-on-background);
          line-height: 1.6;
          overflow-x: hidden;
        }

        /* Header */
        .nality-header {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: var(--md-sys-color-surface-container);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--md-sys-color-outline-variant);
          animation: slideDown var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard);
          height: 48px;
        }

        .nality-header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nality-logo {
          font-size: 24px;
          font-weight: 700;
          color: var(--md-sys-color-primary);
          animation: fadeInScale var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized);
        }

        .nality-logo img {
          display: block;
          height: 48px;
        }

        .nality-nav {
          display: flex;
          gap: 8px;
        }

        .nality-nav-button {
          padding: 8px 16px;
          border-radius: 20px;
          background: transparent;
          border: none;
          color: var(--md-sys-color-on-surface-variant);
          cursor: pointer;
          transition: all var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
          font-size: 14px;
          font-weight: 500;
        }

        .nality-nav-button:hover {
          background: var(--md-sys-color-surface-container-high);
          color: var(--md-sys-color-on-surface);
          transform: translateY(-1px);
        }

        /* Main Container */
        .nality-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 24px;
          animation: fadeInUp var(--md-sys-motion-duration-long1) var(--md-sys-motion-easing-decelerated);
        }

        /* Hero Section */
        .nality-hero {
          text-align: center;
          padding: 80px 0;
          background: linear-gradient(135deg, var(--md-sys-color-surface-container), var(--md-sys-color-surface-container-high));
          border-radius: 28px;
          margin-bottom: 48px;
          position: relative;
          overflow: hidden;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .nality-hero::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: float var(--md-sys-motion-duration-long2) ease-in-out infinite alternate;
        }

        .nality-hero-title {
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: 700;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 24px;
          position: relative;
          z-index: 1;
          letter-spacing: -0.02em;
        }

        .nality-hero-subtitle {
          font-size: clamp(1.125rem, 3.5vw, 1.5rem);
          color: var(--md-sys-color-on-surface-variant);
          margin-bottom: 40px;
          position: relative;
          z-index: 1;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.5;
        }

        .nality-hero-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          position: relative;
          z-index: 1;
        }

        /* Buttons */
        .nality-button-primary {
          padding: 16px 32px;
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
          border: none;
          border-radius: 24px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard);
          position: relative;
          overflow: hidden;
          min-width: 160px;
        }

        .nality-button-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(255, 255, 255, 0.2);
        }

        .nality-button-primary:active {
          transform: scale(0.98);
        }

        .nality-button-primary:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
        }

        .nality-button-secondary {
          padding: 16px 32px;
          background: transparent;
          color: var(--md-sys-color-on-surface);
          border: 2px solid var(--md-sys-color-outline);
          border-radius: 24px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard);
          min-width: 160px;
        }

        .nality-button-secondary:hover {
          background: var(--md-sys-color-surface-container-high);
          border-color: var(--md-sys-color-on-surface);
          transform: translateY(-2px);
        }

        .nality-button-secondary:active {
          transform: scale(0.98);
        }

        /* Features Section */
        .nality-features {
          margin-bottom: 48px;
        }

        .nality-section-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 24px;
          text-align: center;
          position: relative;
          padding-bottom: 16px;
        }

        .nality-section-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 4px;
          background: var(--md-sys-color-primary);
          border-radius: 2px;
        }

        .nality-section-subtitle {
          font-size: 1.25rem;
          color: var(--md-sys-color-on-surface-variant);
          text-align: center;
          margin-bottom: 48px;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }

        .nality-card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 32px;
          margin-bottom: 32px;
        }

        .nality-card {
          background: var(--md-sys-color-surface-container);
          border-radius: 20px;
          padding: 32px;
          border: 1px solid var(--md-sys-color-outline-variant);
          transition: all var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard);
          position: relative;
          overflow: hidden;
        }

        .nality-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--md-sys-color-on-surface), var(--md-sys-color-on-surface-variant));
          transform: scaleX(0);
          transition: transform var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard);
        }

        .nality-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6);
          border-color: var(--md-sys-color-on-surface);
        }

        .nality-card:hover::before {
          transform: scaleX(1);
        }

        .nality-card-icon {
          width: 64px;
          height: 64px;
          background: var(--md-sys-color-primary-container);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          font-size: 24px;
          color: var(--md-sys-color-on-primary-container);
        }

        .nality-card-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 16px;
        }

        .nality-card-description {
          color: var(--md-sys-color-on-surface-variant);
          line-height: 1.6;
          font-size: 1rem;
        }

        /* CTA Section */
        .nality-cta {
          background: var(--md-sys-color-surface-container);
          border-radius: 24px;
          padding: 48px 32px;
          text-align: center;
          border: 1px solid var(--md-sys-color-outline-variant);
          position: relative;
          overflow: hidden;
        }

        .nality-cta::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, 
            transparent 0%, 
            rgba(255, 255, 255, 0.02) 50%, 
            transparent 100%);
        }

        .nality-cta-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 16px;
          position: relative;
          z-index: 1;
        }

        .nality-cta-description {
          font-size: 1.125rem;
          color: var(--md-sys-color-on-surface-variant);
          margin-bottom: 32px;
          position: relative;
          z-index: 1;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }

        /* Animations */
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes fadeInScale {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes float {
          from {
            transform: translateY(0px);
          }
          to {
            transform: translateY(-10px);
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .nality-header-content {
            padding: 0 16px;
          }

          .nality-container {
            padding: 24px 16px;
          }

          .nality-hero {
            padding: 60px 16px;
            margin-bottom: 32px;
          }

          .nality-hero-actions {
            flex-direction: column;
            gap: 12px;
          }

          .nality-card-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .nality-card {
            padding: 24px;
          }

          .nality-cta {
            padding: 32px 20px;
          }
        }

        /* Focus states for accessibility */
        *:focus-visible {
          outline: 2px solid var(--md-sys-color-on-surface);
          outline-offset: 2px;
          border-radius: 4px;
        }

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
      `}</style>

      <main className="min-h-screen">
        {/* Header */}
        <header className="nality-header">
          <div className="nality-header-content">
            <div className="nality-logo">
              <img src="/ChatGPT%20Image%2023.%20Aug.%202025%2C%2014_54_47.png" alt="Nality logo" />
            </div>
            <nav className="nality-nav">
              <button className="nality-nav-button" onClick={handleLearnMore}>
                Features
              </button>
              <button className="nality-nav-button" onClick={() => router.push('/login')}>
                Sign In
              </button>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <div className="nality-container">
          {/* Hero Section */}
          <section className="nality-hero">
            <h1 className="nality-hero-title">
              Your Life Story,<br />Beautifully Preserved
            </h1>
            <p className="nality-hero-subtitle">
              Capture, organize, and share your most precious memories with an elegant timeline that grows with your life's journey.
            </p>
            <div className="nality-hero-actions">
              <button 
                onClick={handleStartStory}
                disabled={loading}
                className="nality-button-primary"
              >
                {loading ? 'Loading...' : isAuthenticated ? 'Continue My Story' : 'Start My Story'}
              </button>
              <button 
                onClick={handleLearnMore}
                className="nality-button-secondary"
              >
                Explore Features
              </button>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="nality-features">
            <h2 className="nality-section-title">Designed for Life's Moments</h2>
            <p className="nality-section-subtitle">
              Every feature thoughtfully crafted to help you preserve and share your personal history with elegance and simplicity.
            </p>
            
            <div className="nality-card-grid">
              <div className="nality-card">
                <div className="nality-card-icon">📅</div>
                <h3 className="nality-card-title">Timeline Chronicles</h3>
                <p className="nality-card-description">
                  Organize your life events in a beautiful, chronological timeline. Watch your story unfold through decades of memories, milestones, and meaningful moments.
                </p>
              </div>

              <div className="nality-card">
                <div className="nality-card-icon">🎨</div>
                <h3 className="nality-card-title">Rich Media Stories</h3>
                <p className="nality-card-description">
                  Bring your memories to life with photos, videos, documents, and audio recordings. Create immersive stories that capture not just what happened, but how it felt.
                </p>
              </div>

              <div className="nality-card">
                <div className="nality-card-icon">🤖</div>
                <h3 className="nality-card-title">AI-Powered Insights</h3>
                <p className="nality-card-description">
                  Chat with intelligent assistance to help you remember details, organize events, and discover patterns in your life's journey. Your memories, enhanced by AI.
                </p>
              </div>

              <div className="nality-card">
                <div className="nality-card-icon">🔒</div>
                <h3 className="nality-card-title">Private & Secure</h3>
                <p className="nality-card-description">
                  Your stories are yours alone. Control who sees what with granular privacy settings, secure cloud storage, and complete ownership of your data.
                </p>
              </div>

              <div className="nality-card">
                <div className="nality-card-icon">👨‍👩‍👧‍👦</div>
                <h3 className="nality-card-title">Family Connections</h3>
                <p className="nality-card-description">
                  Share select memories with family members, collaborate on family histories, and create a legacy that spans generations.
                </p>
              </div>

              <div className="nality-card">
                <div className="nality-card-icon">♿</div>
                <h3 className="nality-card-title">Accessible Design</h3>
                <p className="nality-card-description">
                  Designed with care for users of all ages and abilities. Large touch targets, high contrast, and intuitive navigation ensure everyone can share their story.
                </p>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="nality-cta">
            <h2 className="nality-cta-title">Ready to Begin?</h2>
            <p className="nality-cta-description">
              Join thousands who are already preserving their life stories with Nality. Start your journey today.
            </p>
            <button 
              onClick={handleStartStory}
              disabled={loading}
              className="nality-button-primary"
            >
              {loading ? 'Loading...' : isAuthenticated ? 'Open My Timeline' : 'Create My Account'}
            </button>
          </section>
        </div>
      </main>
    </>
  );
}
