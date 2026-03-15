'use client';

import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated && user?.id) {
      router.replace('/dash')
    }
  }, [loading, isAuthenticated, user, router])

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--md-sys-color-background)',
        fontFamily: 'var(--font-sans)'
      }}
    >
      <main
        style={{
          maxWidth: '760px',
          margin: '0 auto',
          padding: '24px',
          paddingTop: '32px',
          paddingBottom: '40px'
        }}
      >
        <section
          aria-labelledby="onboarding-heading"
          style={{
            marginBottom: '28px',
            borderBottom: '1px solid var(--md-sys-color-outline-variant)',
            paddingBottom: '24px'
          }}
        >
          <span className="section-label" style={{ marginBottom: '12px' }}>
            Weiterleitung
          </span>
          <h1
            id="onboarding-heading"
            style={{
              margin: '0 0 10px 0',
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2rem, 4.3vw, 3.2rem)',
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: 'var(--md-sys-color-on-surface)'
            }}
          >
            Dashboard wird geöffnet
          </h1>
          <p
            style={{
              margin: 0,
              maxWidth: '760px',
              fontSize: '1rem',
              lineHeight: 1.6,
              color: 'var(--md-sys-color-on-surface-variant)'
            }}
          >
            Das alte Onboarding-Interview ist deaktiviert. Erinnerungen werden jetzt direkt im Dashboard mit dem Biografie-Assistenten gesammelt.
          </p>
        </section>
        <div
          style={{
            minHeight: '280px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--md-sys-color-surface)',
            borderRadius: '18px',
            boxShadow: '0 14px 36px rgba(0, 0, 0, 0.22)',
            border: '1px solid var(--md-sys-color-outline-variant)',
            color: 'var(--md-sys-color-on-surface-variant)',
            fontSize: '1rem',
          }}
        >
          {loading ? 'Bitte einen Moment warten ...' : 'Weiterleitung zum Dashboard ...'}
        </div>
      </main>
    </div>
  );
}
