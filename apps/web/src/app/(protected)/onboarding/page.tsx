'use client';

import ChatInterface from '@/components/onboarding/ChatInterface';
import { fetchUserProfile } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function OnboardingPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated && user?.id) {
      fetchUserProfile(user.id).then(profile => {
        if (profile && profile.onboarding_complete) {
          console.log('✅ User already onboarded, redirecting to /timeline')
          router.replace('/timeline')
        }
      })
    }
  }, [loading, isAuthenticated, user, router])

  return (
    <div 
      style={{
        minHeight: '100vh',
        background: 'var(--md-sys-color-background)',
        fontFamily: 'Roboto, system-ui, sans-serif'
      }}
    >
      {/* Main Content */}
      <main 
        style={{
          maxWidth: '1024px',
          margin: '0 auto',
          padding: '16px'
        }}
      >
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(1, 1fr)',
            gap: '24px',
            height: 'calc(100vh - 200px)'
          }}
          className="lg:grid-cols-3"
        >
          
          {/* Chat Interface - Main Area */}
          <div 
            style={{
              gridColumn: 'span 2'
            }}
            className="lg:col-span-2"
          >
            <div 
              style={{
                background: 'var(--md-sys-color-surface)',
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                height: '100%',
                overflow: 'hidden',
                border: '1px solid var(--md-sys-color-outline-variant)'
              }}
            >
              <ChatInterface />
            </div>
          </div>

          {/* Sidebar - Progress & Tips */}
          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}
          >
            {/* Progress Card removed as requested */}
          </div>
        </div>
      </main>

      {/* Footer removed as requested */}
    </div>
  );
} 