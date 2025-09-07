'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { TermsAcceptance } from '@/components/auth/TermsAcceptance'
import { useEffect, useState } from 'react'
import { checkTermsAcceptance } from '@/lib/supabase/terms'

export default function TermsPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading } = useAuth()
  const [checkingTerms, setCheckingTerms] = useState(true)

  useEffect(() => {
    if (!loading && isAuthenticated && user?.id) {
      checkTermsAcceptance(user.id).then(status => {
        if (status.hasAccepted) {
          // User has already accepted terms, redirect to dashboard
          router.replace('/dash')
        }
        setCheckingTerms(false)
      })
    } else if (!loading && !isAuthenticated) {
      // Not authenticated, redirect to login
      router.replace('/login')
    }
  }, [loading, isAuthenticated, user, router])

  const handleAccept = () => {
    // Redirect to dashboard after acceptance
    router.push('/dash')
  }

  const handleDecline = () => {
    // Log out user and redirect to login
    router.push('/login?message=terms_declined')
  }

  if (loading || checkingTerms) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'var(--md-sys-color-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Roboto, system-ui, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid var(--md-sys-color-primary)',
            borderTop: '3px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ 
            color: 'var(--md-sys-color-on-surface)',
            fontSize: '1rem'
          }}>
            Lade Nutzungsbedingungen...
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  return (
    <TermsAcceptance 
      onAccept={handleAccept}
      onDecline={handleDecline}
    />
  )
}
