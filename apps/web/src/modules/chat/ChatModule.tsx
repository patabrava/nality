'use client'

import { ChatInterface } from '@/components/chat/ChatInterface'
import { useChat } from '@/hooks/useChat'
import { useAuth } from '@/hooks/useAuth'

/**
 * Chat Module - Real implementation for dashboard
 * Replaces ChatPlaceholder with functional chat interface
 * Follows dashboard module container pattern for consistency
 */
export function ChatModule() {
  console.log('[ChatModule] Component mounted')

  // Check authentication state
  const { isAuthenticated, loading: authLoading, user } = useAuth()

  // Initialize chat with auto-session creation (only if authenticated)
  const { 
    currentSessionId, 
    isLoading, 
    error 
  } = useChat({ 
    autoCreateSession: isAuthenticated // Only auto-create when authenticated
  })

  // Show authentication loading state
  if (authLoading) {
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

  return (
    <section 
      className="h-full p-8"
      style={{ 
        backgroundColor: 'var(--c-primary-invert)',
      }}
    >
      <div className="max-w-lg mx-auto h-full">
        {/* Loading state */}
        {isLoading && !currentSessionId && (
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
