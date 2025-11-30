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

  // Show authentication loading state
  if (authLoading || profileLoading) {
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
            style={{ color: 'var(--c-neutral-dark)' }}
          >
            <div className="text-center space-y-4">
              <div className="text-3xl">🔐</div>
              <p>Checking authentication...</p>
            </div>
          </div>
        </div>
      </section>
    )
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
      className="h-full p-8"
      style={{ 
        backgroundColor: 'var(--c-primary-invert)',
      }}
    >
      <div className="max-w-lg mx-auto h-full">
        {/* Loading state */}
        {chatLoading && !currentSessionId && (
          <div 
            className="flex items-center justify-center h-full"
            style={{ color: 'var(--c-neutral-dark)' }}
          >
            <div className="text-center space-y-4">
              <div className="text-3xl">🤖</div>
              <p>Initializing chat...</p>
              <p className="text-sm">Welcome, {user?.email}!</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !currentSessionId && (
          <div 
            className="flex items-center justify-center h-full"
            style={{ color: 'var(--c-accent-100)' }}
          >
            <div className="text-center space-y-4">
              <div className="text-3xl">⚠️</div>
              <p>Unable to start chat</p>
              <p className="text-sm">Failed to create session: {error.message}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded"
                style={{ 
                  backgroundColor: 'var(--c-accent-100)',
                  color: 'var(--c-primary-invert)'
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Chat interface */}
        {currentSessionId && (
          <ChatInterface 
            sessionId={currentSessionId}
            className="h-full"
          />
        )}
      </div>
    </section>
  )
}
