'use client'

import { useI18n } from '@/components/i18n/I18nProvider'
import { Languages } from 'lucide-react'
import { SUPPORTED_LOCALES } from '@/lib/i18n'
import { useState } from 'react'
import InfoModal from './InfoModal'

export default function Footer() {
  const { t, locale, setLocale } = useI18n()
  const [modalOpen, setModalOpen] = useState<string | null>(null)

  const sections = [
    { key: 'product', data: t('footer.product') },
    { key: 'company', data: t('footer.company') },
    { key: 'legal', data: t('footer.legal') },
    { key: 'social', data: t('footer.social') }
  ]

  const modalContent: Record<string, { title: string; content: string }> = {
    '/terms': {
      title: t('footer.legalContent.terms.title'),
      content: t('footer.legalContent.terms.content')
    },
    '/privacy': {
      title: t('footer.legalContent.privacy.title'),
      content: t('footer.legalContent.privacy.content')
    },
    '#cookie-settings': {
      title: t('footer.legalContent.cookies.title'),
      content: t('footer.legalContent.cookies.content')
    },
    '/about': {
      title: t('footer.companyContent.about.title'),
      content: t('footer.companyContent.about.content')
    },
    '/contact': {
      title: t('footer.companyContent.contact.title'),
      content: t('footer.companyContent.contact.content')
    },
    '/careers': {
      title: t('footer.companyContent.careers.title'),
      content: t('footer.companyContent.careers.content')
    }
  }

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (modalContent[href]) {
      e.preventDefault()
      setModalOpen(href)
    }
  }

  return (
    <footer style={{
      padding: '5rem 5vw',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      background: 'var(--md-sys-color-surface-dim)',
    }}>
      {/* Footer Links Grid with Brand */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 3rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '3rem',
        textAlign: 'left',
      }}>
        {/* Brand Section */}
        <div>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.75rem',
            fontWeight: '400',
            color: '#fff',
            marginBottom: '1rem',
            letterSpacing: '0.02em',
          }}>
            NALITY
          </h2>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: 'rgba(255, 255, 255, 0.5)',
            fontWeight: '300',
            lineHeight: '1.6',
          }}>
            {t('footer.taglineElite')}
          </p>
        </div>

        {/* Footer Links */}
        {sections.map((section) => (
          <div key={section.key}>
            <h3 style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: '#D4AF37',
              marginBottom: '1.5rem',
              fontWeight: '500',
            }}>
              {section.data?.title}
            </h3>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}>
              {Array.isArray(section.data?.links) && section.data.links.map((link: any, index: number) => (
                <li key={index}>
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.875rem',
                      fontWeight: '300',
                      color: 'rgba(255, 255, 255, 0.6)',
                      textDecoration: 'none',
                      transition: 'color 0.2s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#D4AF37'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'
                    }}
                  >
                    {link.icon && <span style={{ marginRight: '0.5rem' }}>{link.icon}</span>}
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Language Toggle */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '3rem',
        paddingTop: '2rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        <Languages size={14} style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
        <div style={{ display: 'flex', gap: '1rem' }}>
          {SUPPORTED_LOCALES.map((l) => (
            <button
              key={l}
              onClick={() => setLocale(l)}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.25rem 0.5rem',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                cursor: 'pointer',
                transition: 'color 0.2s ease',
                color: locale === l ? '#D4AF37' : 'rgba(255, 255, 255, 0.4)',
                fontWeight: locale === l ? '600' : '400',
              }}
              onMouseEnter={(e) => {
                if (locale !== l) {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
                }
              }}
              onMouseLeave={(e) => {
                if (locale !== l) {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)'
                }
              }}
            >
              {t(`common.languageOptions.${l}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Copyright */}
      <div style={{
        textAlign: 'center',
        paddingTop: '2rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.75rem',
          fontWeight: '300',
          color: 'rgba(255, 255, 255, 0.4)',
          letterSpacing: '0.05em',
        }}>
          {t('footer.copyright').replace('{year}', String(new Date().getFullYear()))}
        </p>
      </div>

      {/* Info Modals */}
      {modalOpen && modalContent[modalOpen] && (
        <InfoModal
          isOpen={true}
          onClose={() => setModalOpen(null)}
          title={modalContent[modalOpen].title}
          content={modalContent[modalOpen].content}
        />
      )}
    </footer>
  )
}
