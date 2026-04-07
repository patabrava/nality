'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useUserProfile } from '@/hooks/useUserProfile'
import { VoiceModeSelector, FreeTalkInterface, type VoiceMode } from '@/components/voice'
import { BiographyInterviewModal } from '@/components/interview/BiographyInterviewModal'

type InterviewShell = 'voice' | 'text'

/**
 * Chat Module - Real implementation for dashboard
 * Shows the memory-entry flows inside the dashboard using the existing chat surfaces.
 */
export function ChatModule() {
  const router = useRouter()

  // Check authentication state
  const { isAuthenticated, loading: authLoading, user } = useAuth()
  
  // Check user profile and onboarding status
  const { isLoading: profileLoading } = useUserProfile(user?.id)

  // Mode selection state (always shown once auth/profile is resolved)
  const [showVoiceSelector, setShowVoiceSelector] = useState(false)
  const [showInterview, setShowInterview] = useState(false)
  const [showFreeTalk, setShowFreeTalk] = useState(false)
  const [interviewShell, setInterviewShell] = useState<InterviewShell>('voice')

  const handleCloseSelector = () => {
    setShowVoiceSelector(false)
    setShowInterview(false)
    setShowFreeTalk(false)
    router.push('/dash')
  }

  // Open selector once auth/profile is resolved
  useEffect(() => {
    if (!authLoading && !profileLoading && isAuthenticated) {
      setShowVoiceSelector(true)
    }
  }, [authLoading, profileLoading, isAuthenticated])

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
              <p>Anmeldung erforderlich</p>
              <p className="text-sm">Bitte melde dich an, um das Gespräch zu öffnen.</p>
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 rounded"
                style={{ 
                  backgroundColor: 'var(--c-accent-100)',
                  color: 'var(--c-primary-invert)'
                }}
              >
                Zum Login
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Render shared container; selector drives which UI we show
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
        {/* Voice mode selector modal */}
        {showVoiceSelector && (
          <VoiceModeSelector
            availableModes={['interview','free-talk','text']}
            onSelect={(mode: VoiceMode) => {
              setShowVoiceSelector(false)
              switch (mode) {
                case 'interview':
                  setInterviewShell('voice')
                  setShowInterview(true)
                  setShowFreeTalk(false)
                  break
                case 'free-talk':
                  setShowFreeTalk(true)
                  setShowInterview(false)
                  break
                case 'text':
                  setInterviewShell('text')
                  setShowInterview(true)
                  setShowFreeTalk(false)
                  break
              }
            }}
            onClose={handleCloseSelector}
          />
        )}

        {/* Guided interview */}
        {showInterview && (
          <BiographyInterviewModal
            initialShell={interviewShell}
            onClose={() => {
              setShowInterview(false)
              setShowVoiceSelector(true)
            }}
          />
        )}

        {/* Free talk */}
        {showFreeTalk && (
          <FreeTalkInterface
            onClose={() => {
              setShowFreeTalk(false)
              setShowVoiceSelector(true)
            }}
            onComplete={() => {
              setShowFreeTalk(false)
              setShowVoiceSelector(true)
            }}
          />
        )}

      </div>
    </section>
  )
}
