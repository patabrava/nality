'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { ThemeToggleCompact } from '@/components/theme/ThemeToggle'
import { useI18n } from '@/components/i18n/I18nProvider'

interface HeaderProps {
  onNavigate?: (section: string) => void
}

export default function Header({ onNavigate }: HeaderProps) {
  const { isAuthenticated } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { t } = useI18n()

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setMobileMenuOpen(false)
    onNavigate?.(sectionId)
  }

  const handleStartStory = () => {
    if (isAuthenticated) {
      window.location.href = '/dash'
    } else {
      window.location.href = '/login'
    }
  }

  return (
    <>
      <header className="header">
        <div className="header-content">
          {/* Logo */}
          <Link href="/" className="logo">
            <span className="brand-full">Nality</span>
            <span className="brand-short">N</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav-tabs">
            <button 
              className="nav-tab" 
              onClick={() => scrollToSection('features')}
            >
              <span className="tab-label">{t('header.nav.features')}</span>
            </button>
            <button 
              className="nav-tab" 
              onClick={() => scrollToSection('how-it-works')}
            >
              <span className="tab-label">{t('header.nav.howItWorks')}</span>
            </button>
            <button 
              className="nav-tab" 
              onClick={() => scrollToSection('pricing')}
            >
              <span className="tab-label">{t('header.nav.pricing')}</span>
            </button>
            <button 
              className="nav-tab" 
              onClick={() => scrollToSection('faq')}
            >
              <span className="tab-label">{t('header.nav.faq')}</span>
            </button>
          </nav>

          {/* Desktop User Section */}
          <div className="header-user">
            {/* Theme Toggle */}
            <ThemeToggleCompact />
            
            {isAuthenticated ? (
              <button className="user-avatar-btn" onClick={handleStartStory}>
                <div className="user-avatar">
                  <span>👤</span>
                </div>
              </button>
            ) : (
              <div className="flex gap-2">
                <Link 
                  href="/login" 
                  className="form-button secondary"
                  style={{ 
                    height: '32px', 
                    padding: '0 16px', 
                    fontSize: '14px',
                    minWidth: 'auto'
                  }}
                >
                  {t('header.login')}
                </Link>
                <button 
                  onClick={handleStartStory}
                  className="form-button primary"
                  style={{ 
                    height: '32px', 
                    padding: '0 16px', 
                    fontSize: '14px',
                    minWidth: 'auto'
                  }}
                >
                  {t('header.start')}
                </button>
              </div>
            )}
          </div>

          {/* Mobile Burger Menu */}
          <button 
            className="burger-menu-btn"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={t('header.mobileMenuAria')}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="burger-line"></span>
            <span className="burger-line"></span>
            <span className="burger-line"></span>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div 
            className="mobile-menu-backdrop" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <nav 
            id="mobile-menu"
            className={`mobile-menu ${mobileMenuOpen ? 'mobile-menu--open' : ''}`}
          >
            {isAuthenticated && (
              <button className="mobile-profile" onClick={handleStartStory}>
                <div className="mobile-profile-avatar">
                  <span>👤</span>
                </div>
                <span className="mobile-profile-label">{t('header.myTimeline')}</span>
              </button>
            )}
            
            <button 
              className="mobile-tab" 
              onClick={() => scrollToSection('features')}
            >
              {t('header.nav.features')}
            </button>
            <button 
              className="mobile-tab" 
              onClick={() => scrollToSection('how-it-works')}
            >
              {t('header.nav.howItWorks')}
            </button>
            <button 
              className="mobile-tab" 
              onClick={() => scrollToSection('pricing')}
            >
              {t('header.nav.pricing')}
            </button>
            <button 
              className="mobile-tab" 
              onClick={() => scrollToSection('faq')}
            >
              {t('header.nav.faq')}
            </button>
            
            {!isAuthenticated && (
              <>
                <Link href="/login" className="mobile-tab">
                  {t('header.login')}
                </Link>
                <button 
                  className="mobile-tab active" 
                  onClick={handleStartStory}
                >
                  {t('header.start')}
                </button>
              </>
            )}
            
            {/* Theme Toggle in Mobile Menu */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <ThemeToggleCompact />
            </div>
          </nav>
        </>
      )}

      {/* Skip to content link for accessibility */}
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
        {t('common.skipToContent')}
      </a>
    </>
  )
}
