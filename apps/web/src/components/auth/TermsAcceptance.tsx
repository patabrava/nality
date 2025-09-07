'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { recordTermsAcceptance } from '@/lib/supabase/terms'

export interface TermsAcceptanceProps {
  onAccept: () => void
  onDecline?: () => void
}

export function TermsAcceptance({ onAccept, onDecline }: TermsAcceptanceProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)

  const handleAccept = async () => {
    setIsLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user?.id) {
        throw new Error('User not authenticated')
      }

      // Use the utility function with fallback logic
      const userAgent = typeof window !== 'undefined' ? navigator.userAgent : null
      const success = await recordTermsAcceptance(
        session.user.id,
        '1.0',
        userAgent ? { userAgent } : undefined
      )

      if (!success) {
        throw new Error('Failed to record terms acceptance')
      }

      console.log('✅ Terms acceptance recorded successfully')
      onAccept()
    } catch (error) {
      console.error('Error accepting terms:', error)
      // More informative error message for development
      const isDevelopment = process.env.NODE_ENV === 'development'
      const errorMessage = isDevelopment 
        ? 'Entwicklungsmodus: Nutzungsbedingungen werden lokal gespeichert. Bei wiederholten Fehlern bitte Konsole prüfen.'
        : 'Es gab einen Fehler beim Speichern Ihrer Zustimmung. Bitte versuchen Sie es erneut.'
      
      alert(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget
    const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 10
    setHasScrolledToBottom(isAtBottom)
  }

  const handleDecline = () => {
    if (onDecline) {
      onDecline()
    } else {
      // Default behavior: redirect to login
      window.location.href = '/login'
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'var(--md-sys-color-surface)',
      color: 'var(--md-sys-color-on-surface)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Roboto, system-ui, sans-serif',
      zIndex: 9999
    }}>
      {/* Header */}
      <div style={{
        padding: 'clamp(16px, 4vw, 24px)',
        borderBottom: '1px solid var(--md-sys-color-outline-variant)',
        background: 'var(--md-sys-color-surface-container)'
      }}>
        <h1 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          fontWeight: 600,
          margin: 0,
          color: 'var(--md-sys-color-primary)',
          textAlign: 'center'
        }}>
          Nutzungsbedingungen & Datenschutz
        </h1>
        <p style={{
          fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
          color: 'var(--md-sys-color-on-surface-variant)',
          margin: '8px 0 0 0',
          textAlign: 'center'
        }}>
          Bitte lesen Sie unsere Bedingungen vor der Nutzung
        </p>
      </div>

      {/* Terms Content */}
      <div 
        style={{
          flex: 1,
          overflow: 'auto',
          padding: 'clamp(16px, 4vw, 24px)',
          lineHeight: 1.6
        }}
        onScroll={handleScroll}
      >
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          fontSize: 'clamp(0.875rem, 2.5vw, 1rem)'
        }}>
          <h2 style={{ color: 'var(--md-sys-color-primary)', marginTop: 0 }}>
            1. Einverständniserklärung und Nutzungsbedingungen
          </h2>
          
          <h3 style={{ color: 'var(--md-sys-color-secondary)' }}>
            Willkommen bei Nality
          </h3>
          <p>
            Nality ist Ihre persönliche digitale Biografie-Plattform. Mit der Nutzung unseres Dienstes 
            stimmen Sie den folgenden Bedingungen zu.
          </p>

          <h3 style={{ color: 'var(--md-sys-color-secondary)' }}>
            Datenschutz und DSGVO-Konformität
          </h3>
          <p>
            <strong>Ihre Daten gehören Ihnen.</strong> Wir verarbeiten Ihre persönlichen Informationen 
            ausschließlich zur Bereitstellung unseres Dienstes und gemäß der EU-Datenschutz-Grundverordnung (DSGVO).
          </p>
          
          <ul style={{ paddingLeft: '20px' }}>
            <li>Wir speichern nur die Daten, die Sie uns freiwillig zur Verfügung stellen</li>
            <li>Ihre Lebensereignisse und persönlichen Inhalte bleiben privat</li>
            <li>Sie können Ihre Daten jederzeit einsehen, bearbeiten oder löschen</li>
            <li>Wir verkaufen oder vermieten Ihre Daten niemals an Dritte</li>
          </ul>

          <h3 style={{ color: 'var(--md-sys-color-secondary)' }}>
            Nutzung des Dienstes
          </h3>
          <p>
            Sie verpflichten sich, Nality nur für legale Zwecke zu nutzen und keine Inhalte zu veröffentlichen, 
            die rechtswidrig, beleidigend oder die Rechte Dritter verletzen.
          </p>

          <h3 style={{ color: 'var(--md-sys-color-secondary)' }}>
            Technische Sicherheit
          </h3>
          <p>
            Wir verwenden branchenübliche Sicherheitsmaßnahmen zum Schutz Ihrer Daten, einschließlich 
            Verschlüsselung bei der Übertragung und Speicherung.
          </p>

          <h2 style={{ color: 'var(--md-sys-color-primary)' }}>
            2. Ihre Rechte nach DSGVO
          </h2>
          <p>Als EU-Bürger haben Sie folgende Rechte:</p>
          <ul style={{ paddingLeft: '20px' }}>
            <li><strong>Auskunftsrecht:</strong> Einsicht in Ihre gespeicherten Daten</li>
            <li><strong>Berichtigungsrecht:</strong> Korrektur unrichtiger Daten</li>
            <li><strong>Löschungsrecht:</strong> Vollständige Löschung Ihrer Daten</li>
            <li><strong>Widerspruchsrecht:</strong> Widerspruch gegen Datenverarbeitung</li>
            <li><strong>Datenübertragbarkeit:</strong> Export Ihrer Daten in gängigen Formaten</li>
          </ul>

          <h2 style={{ color: 'var(--md-sys-color-primary)' }}>
            3. Kontakt und Widerruf
          </h2>
          <p>
            Bei Fragen zu diesen Bedingungen oder zur Ausübung Ihrer Rechte kontaktieren Sie uns unter: 
            <strong> privacy@nality.app</strong>
          </p>
          <p>
            Sie können Ihre Einwilligung jederzeit widerrufen, indem Sie Ihr Konto in den Einstellungen löschen 
            oder uns kontaktieren.
          </p>

          <div style={{
            padding: '16px',
            background: 'var(--md-sys-color-primary-container)',
            borderRadius: '8px',
            marginTop: '24px',
            border: '1px solid var(--md-sys-color-primary)'
          }}>
            <p style={{
              color: 'var(--md-sys-color-on-primary-container)',
              margin: 0,
              fontWeight: 500
            }}>
              <strong>Stand:</strong> Januar 2025 | <strong>Version:</strong> 1.0
            </p>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div style={{
        padding: 'clamp(16px, 4vw, 24px)',
        borderTop: '1px solid var(--md-sys-color-outline-variant)',
        background: 'var(--md-sys-color-surface-container)',
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={handleDecline}
          disabled={isLoading}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            color: 'var(--md-sys-color-on-surface)',
            border: '1px solid var(--md-sys-color-outline)',
            borderRadius: '20px',
            fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
            fontWeight: 500,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
            transition: 'all 0.2s var(--md-sys-motion-easing-standard)',
            fontFamily: 'inherit'
          }}
        >
          Ablehnen
        </button>
        
        <button
          onClick={handleAccept}
          disabled={isLoading || !hasScrolledToBottom}
          style={{
            padding: '12px 32px',
            background: hasScrolledToBottom && !isLoading 
              ? 'var(--md-sys-color-primary)' 
              : 'var(--md-sys-color-surface-variant)',
            color: hasScrolledToBottom && !isLoading
              ? 'var(--md-sys-color-on-primary)'
              : 'var(--md-sys-color-on-surface-variant)',
            border: 'none',
            borderRadius: '20px',
            fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
            fontWeight: 600,
            cursor: hasScrolledToBottom && !isLoading ? 'pointer' : 'not-allowed',
            opacity: hasScrolledToBottom && !isLoading ? 1 : 0.6,
            transition: 'all 0.2s var(--md-sys-motion-easing-standard)',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {isLoading && (
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid currentColor',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          )}
          {hasScrolledToBottom ? 'Akzeptieren & Fortfahren' : 'Bitte scrollen Sie bis zum Ende'}
        </button>
      </div>
    </div>
  )
}
