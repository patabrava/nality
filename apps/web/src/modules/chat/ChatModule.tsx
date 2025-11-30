'use client'

import { ChatInterface } from '@/components/chat/ChatInterface'
import { useChat } from '@/hooks/useChat'
import { useAuth } from '@/hooks/useAuth'
import { useUserProfile } from '@/hooks/useUserProfile'
import OnboardingChatInterface from '@/components/onboarding/ChatInterface'

/**
 * Chat Module - Real implementation for dashboard
 * Shows onboarding chat if user hasn't completed onboarding,
 * otherwise shows general chat for adding memories to life chapters
 */
export function ChatModule() {
  console.log('[ChatModule] Component mounted')

  // Check authentication state
  const { isAuthenticated, loading: authLoading, user } = useAuth()
  
  // Check user profile and onboarding status
  const { 
    isOnboardingComplete, 
    isLoading: profileLoading 
  } = useUserProfile(user?.id)

  // Initialize chat with auto-session creation (only if authenticated AND onboarding complete)
  const { 
    currentSessionId, 
    isLoading: chatLoading, 
    error 
  } = useChat({ 
    autoCreateSession: isAuthenticated && isOnboardingComplete
  })

  // Defer rendering until auth/profile state resolves to avoid flicker
  if (authLoading || profileLoading) {
    return null
  }

  // Show authentication error
  if (!isAuthenticated) {
    return (
      <section 
        className="h-full p-8"
        style={{ 
          backgroundColor: 'var(--c-primary-invert)',
        }}
      >
        <div className="max-w-lg mx-auto h-full">
          <div 
            className="flex items-center justify-center h-full"
            style={{ color: 'var(--c-accent-100)' }}
          >
            <div className="text-center space-y-4">
              <div className="text-3xl">🔐</div>
              <p>Authentication required</p>
              <p className="text-sm">Please log in to access the chat</p>
              <button 
                onClick={() => window.location.href = '/login'}
                className="px-4 py-2 rounded"
                style={{ 
                  backgroundColor: 'var(--c-accent-100)',
                  color: 'var(--c-primary-invert)'
                }}
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Show onboarding chat if user hasn't completed onboarding
  if (!isOnboardingComplete) {
    console.log('[ChatModule] User needs onboarding, showing onboarding chat')
    return (
      <section 
        className="h-full overflow-auto"
        style={{ 
          backgroundColor: 'var(--c-primary-invert)',
        }}
      >
        <OnboardingChatInterface />
      </section>
    )
  }

  // Show general chat for users who completed onboarding
  return (
    <section 
      className="h-full"
      style={{ 
        backgroundColor: 'var(--md-sys-color-surface)',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{
        width: '100%',
        maxWidth: '600px',
        height: '80vh',
        maxHeight: '700px',
      }}>
        {/* Error state */}
        {error && !currentSessionId && (
          <div 
            style={{
              width: '100%',
              height: '100%',
              background: 'var(--md-sys-color-surface)',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>⚠️</span>
              <p style={{ 
                color: 'var(--md-sys-color-on-surface)', 
                fontSize: '1.125rem',
                marginBottom: '8px',
              }}>
                Chat konnte nicht gestartet werden
              </p>
              <p style={{ 
                color: 'var(--md-sys-color-on-surface-variant)', 
                fontSize: '0.875rem',
                marginBottom: '24px',
              }}>
                {error.message}
              </p>
              <button 
                onClick={() => window.location.reload()}
                style={{ 
                  padding: '12px 24px',
                  background: 'var(--md-sys-color-primary)',
                  color: 'var(--md-sys-color-on-primary)',
                  border: 'none',
                  borderRadius: '24px',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Erneut versuchen
              </button>
            </div>
          </div>
        )}

        {/* Chat interface - matches ChapterChatInterface sizing */}
        {currentSessionId && (
          <ChatInterface 
            sessionId={currentSessionId}
            title="Add Memory"
            subtitle="Teile deine Erinnerungen"
            icon="🧠"
            placeholder="Share your memory..."
            welcomeMessage="🧠 Was möchtest du heute festhalten? Erzähle mir von einem besonderen Moment."
          />
        )}
      </div>
    </section>
  )
}
