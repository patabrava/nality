'use client'

import Link from 'next/link'

const footerLinks = {
  product: [
    { name: 'Features', href: '#features' },
    { name: 'How it works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Blog', href: '/blog' } // placeholder
  ],
  company: [
    { name: 'About', href: '/about' }, // placeholder
    { name: 'Contact', href: '/contact' }, // placeholder
    { name: 'Careers', href: '/careers' } // placeholder
  ],
  legal: [
    { name: 'Terms', href: '/terms' },
    { name: 'Privacy', href: '/privacy' }, // placeholder
    { name: 'Cookie Settings', href: '#', onClick: () => console.log('Cookie settings clicked') }
  ],
  social: [
    { name: 'LinkedIn', href: 'https://linkedin.com/company/nality', icon: '💼' },
    { name: 'Instagram', href: 'https://instagram.com/nality', icon: '📷' }
  ]
}

export default function Footer() {
  const scrollToSection = (sectionId: string) => {
    if (sectionId.startsWith('#')) {
      const element = document.getElementById(sectionId.substring(1))
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  return (
    <footer 
      style={{
        background: 'var(--md-sys-color-surface-container-low)',
        borderTop: '1px solid var(--md-sys-color-outline-variant)',
        marginTop: '80px'
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 24px 32px' }}>
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '48px',
            marginBottom: '48px'
          }}
        >
          {/* Brand Column */}
          <div>
            <Link 
              href="/" 
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: 'var(--md-sys-color-primary)',
                textDecoration: 'none',
                display: 'block',
                marginBottom: '16px'
              }}
            >
              Nality
            </Link>
            <p 
              style={{
                fontSize: '1rem',
                color: 'var(--md-sys-color-on-surface-variant)',
                lineHeight: '1.6',
                marginBottom: '24px',
                maxWidth: '280px'
              }}
            >
              Nality is a modern way to preserve your life stories.
            </p>
            
            {/* Language Switcher */}
            <div>
              <span 
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--md-sys-color-on-surface-variant)',
                  marginRight: '8px'
                }}
              >
                Language:
              </span>
              <button 
                style={{
                  background: 'transparent',
                  border: '1px solid var(--md-sys-color-outline)',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  color: 'var(--md-sys-color-on-surface)',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                EN
              </button>
              <button 
                style={{
                  background: 'transparent',
                  border: '1px solid var(--md-sys-color-outline)',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  color: 'var(--md-sys-color-on-surface-variant)',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  marginLeft: '4px'
                }}
                disabled
              >
                DE
              </button>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 
              style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: 'var(--md-sys-color-on-surface)',
                marginBottom: '20px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Product
            </h3>
            <ul style={{ listStyle: 'none', padding: '0' }}>
              {footerLinks.product.map((link, index) => (
                <li key={index} style={{ marginBottom: '12px' }}>
                  {link.href.startsWith('#') ? (
                    <button
                      onClick={() => scrollToSection(link.href)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: '0',
                        color: 'var(--md-sys-color-on-surface-variant)',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        textDecoration: 'none',
                        transition: 'color var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--md-sys-color-on-surface)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--md-sys-color-on-surface-variant)'
                      }}
                    >
                      {link.name}
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      style={{
                        color: 'var(--md-sys-color-on-surface-variant)',
                        fontSize: '0.875rem',
                        textDecoration: 'none',
                        transition: 'color var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--md-sys-color-on-surface)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--md-sys-color-on-surface-variant)'
                      }}
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 
              style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: 'var(--md-sys-color-on-surface)',
                marginBottom: '20px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Company
            </h3>
            <ul style={{ listStyle: 'none', padding: '0' }}>
              {footerLinks.company.map((link, index) => (
                <li key={index} style={{ marginBottom: '12px' }}>
                  <Link
                    href={link.href}
                    style={{
                      color: 'var(--md-sys-color-on-surface-variant)',
                      fontSize: '0.875rem',
                      textDecoration: 'none',
                      transition: 'color var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--md-sys-color-on-surface)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--md-sys-color-on-surface-variant)'
                    }}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Social */}
          <div>
            <h3 
              style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: 'var(--md-sys-color-on-surface)',
                marginBottom: '20px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Legal
            </h3>
            <ul style={{ listStyle: 'none', padding: '0', marginBottom: '32px' }}>
              {footerLinks.legal.map((link, index) => (
                <li key={index} style={{ marginBottom: '12px' }}>
                  {link.onClick ? (
                    <button
                      onClick={link.onClick}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: '0',
                        color: 'var(--md-sys-color-on-surface-variant)',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        textDecoration: 'none',
                        transition: 'color var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--md-sys-color-on-surface)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--md-sys-color-on-surface-variant)'
                      }}
                    >
                      {link.name}
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      style={{
                        color: 'var(--md-sys-color-on-surface-variant)',
                        fontSize: '0.875rem',
                        textDecoration: 'none',
                        transition: 'color var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--md-sys-color-on-surface)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--md-sys-color-on-surface-variant)'
                      }}
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            {/* Social Links */}
            <div>
              <h4 
                style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--md-sys-color-on-surface)',
                  marginBottom: '16px'
                }}
              >
                Follow us
              </h4>
              <div style={{ display: 'flex', gap: '12px' }}>
                {footerLinks.social.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      height: '40px',
                      background: 'var(--md-sys-color-surface-container)',
                      borderRadius: '50%',
                      color: 'var(--md-sys-color-on-surface-variant)',
                      textDecoration: 'none',
                      fontSize: '18px',
                      transition: 'all var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--md-sys-color-surface-container-high)'
                      e.currentTarget.style.color = 'var(--md-sys-color-on-surface)'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--md-sys-color-surface-container)'
                      e.currentTarget.style.color = 'var(--md-sys-color-on-surface-variant)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div 
          style={{
            paddingTop: '32px',
            borderTop: '1px solid var(--md-sys-color-outline-variant)',
            textAlign: 'center'
          }}
        >
          <p 
            style={{
              fontSize: '0.875rem',
              color: 'var(--md-sys-color-on-surface-variant)',
              margin: '0'
            }}
          >
            © {new Date().getFullYear()} Nality. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
