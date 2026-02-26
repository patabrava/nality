'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useI18n } from '@/components/i18n/I18nProvider'
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'
import { Menu, X } from 'lucide-react'

export function LandingHeader() {
  const { t } = useI18n()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const startHref = '/meeting'

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false)
    const element = document.getElementById(sectionId)
    if (element) {
      const headerOffset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <>
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'rgba(5, 5, 5, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        transition: 'background 0.3s ease',
      }}>
        <nav style={{
          padding: '1rem 5vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Left Section: Logo + Navigation Links */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3rem',
            flex: '0 0 auto',
          }}
          className="landing-header-left-section"
          >
            {/* Logo */}
            <Link 
              href="/"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.5rem',
                fontWeight: '400',
                color: '#fff',
                textDecoration: 'none',
                letterSpacing: '0.05em',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#D4AF37'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#fff'
              }}
            >
              NALITY<sup style={{ fontSize: '0.6em', fontWeight: '400' }}>®</sup>
            </Link>

            {/* Navigation Links */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2rem',
            }}
            className="landing-header-nav-links"
            >
              <button
                onClick={() => scrollToSection('features')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.875rem',
                  fontWeight: '400',
                  color: 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer',
                  transition: 'color 0.2s ease',
                  padding: '0.5rem 0',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#D4AF37'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
                }}
              >
                {t('header.nav.features')}
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.875rem',
                  fontWeight: '400',
                  color: 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer',
                  transition: 'color 0.2s ease',
                  padding: '0.5rem 0',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#D4AF37'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
                }}
              >
                {t('header.nav.howItWorks')}
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.875rem',
                  fontWeight: '400',
                  color: 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer',
                  transition: 'color 0.2s ease',
                  padding: '0.5rem 0',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#D4AF37'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
                }}
              >
                {t('header.nav.pricing')}
              </button>
            </div>
          </div>

          {/* Right Section: Language + Login + CTA */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            flex: '0 0 auto',
          }}
          className="landing-header-right-section"
          >
            <LanguageSwitcher />
            <Link
              href="/login"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.875rem',
                fontWeight: '400',
                color: 'rgba(255, 255, 255, 0.7)',
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#D4AF37'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
              }}
            >
              {t('header.login')}
            </Link>
            <Link
              href={startHref}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.75rem',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#050505',
                background: 'linear-gradient(135deg, #D4AF37, rgba(180, 140, 20, 1))',
                textDecoration: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '2px',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                display: 'inline-block',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {t('header.start')}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: '0.5rem',
            }}
            className="landing-header-mobile-toggle"
            aria-label={t('header.mobileMenuAria')}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </header>

      {/* Mobile Menu */}
      <div
        style={{
          position: 'fixed',
          top: '73px',
          left: 0,
          right: 0,
          background: 'rgba(5, 5, 5, 0.98)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '2rem 5vw',
          zIndex: 999,
          transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(-100%)',
          opacity: mobileMenuOpen ? 1 : 0,
          transition: 'transform 0.3s ease, opacity 0.3s ease',
          pointerEvents: mobileMenuOpen ? 'auto' : 'none',
        }}
        className="landing-header-mobile-menu"
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}>
          <button
            onClick={() => scrollToSection('features')}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'var(--font-sans)',
              fontSize: '1rem',
              fontWeight: '400',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              textAlign: 'left',
              padding: '0.5rem 0',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#D4AF37'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
            }}
          >
            {t('header.nav.features')}
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'var(--font-sans)',
              fontSize: '1rem',
              fontWeight: '400',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              textAlign: 'left',
              padding: '0.5rem 0',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#D4AF37'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
            }}
          >
            {t('header.nav.howItWorks')}
          </button>
          <button
            onClick={() => scrollToSection('pricing')}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'var(--font-sans)',
              fontSize: '1rem',
              fontWeight: '400',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              textAlign: 'left',
              padding: '0.5rem 0',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#D4AF37'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
            }}
          >
            {t('header.nav.pricing')}
          </button>

          <div style={{
            marginTop: '1rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '0.5rem',
            }}>
              <LanguageSwitcher />
            </div>
            <Link
              href="/login"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.875rem',
                fontWeight: '400',
                color: 'rgba(255, 255, 255, 0.7)',
                textDecoration: 'none',
                padding: '0.75rem 0',
                textAlign: 'center',
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('header.login')}
            </Link>
            <Link
              href={startHref}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.75rem',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#050505',
                background: 'linear-gradient(135deg, #D4AF37, rgba(180, 140, 20, 1))',
                textDecoration: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '2px',
                textAlign: 'center',
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('header.start')}
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1024px) {
          .landing-header-left-section {
            flex: 1;
          }
          .landing-header-nav-links {
            display: none !important;
          }
          .landing-header-right-section {
            display: none !important;
          }
          .landing-header-mobile-toggle {
            display: block !important;
          }
        }
      `}</style>
    </>
  )
}
