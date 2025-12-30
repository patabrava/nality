'use client';

import { useState, useEffect } from 'react'
import ChatInterface from '@/components/onboarding/ChatInterface';
import ProgressIndicator from '@/components/onboarding/ProgressIndicator';
import { fetchUserProfile } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/components/i18n/I18nProvider'
import { VoiceModeSelector, InterviewInterface, FreeTalkInterface, type VoiceMode } from '@/components/voice'

export default function OnboardingPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const { t } = useI18n()
  const [progress, setProgress] = useState(0)
  const [questionsAnswered, setQuestionsAnswered] = useState(0)
  const [showVoiceSelector, setShowVoiceSelector] = useState(false)
  const [activeMode, setActiveMode] = useState<VoiceMode>('text')
  const [showInterview, setShowInterview] = useState(false)
  const [showFreeTalk, setShowFreeTalk] = useState(false)

  useEffect(() => {
    if (!loading && isAuthenticated && user?.id) {
      fetchUserProfile(user.id).then(profile => {
        if (profile && profile.onboarding_complete) {
          console.log('✅ User already onboarded, redirecting to /dash')
          router.replace('/dash')
        }
      })
      // Always prompt for mode selection when entering onboarding
      setShowVoiceSelector(true)
    }
  }, [loading, isAuthenticated, user, router])

  // Handle progress updates from ChatInterface
  const handleProgressChange = (newProgress: number) => {
    setProgress(newProgress)
    // Estimate questions answered based on progress
    setQuestionsAnswered(Math.floor((newProgress / 100) * 16))
  }

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
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '24px'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '24px',
            minHeight: 'calc(100vh - 100px)'
          }}
          className="lg:grid-cols-[2fr_1fr]"
        >

          {/* Chat Interface - Main Area */}
          <div>
            <div
              style={{
                background: 'var(--md-sys-color-surface)',
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                overflow: 'hidden',
                border: '1px solid var(--md-sys-color-outline-variant)'
              }}
            >
              {/* Voice mode selector overlay */}
              {showVoiceSelector && (
                <VoiceModeSelector
                  availableModes={['text', 'interview']}
                  onSelect={(mode: VoiceMode) => {
                    setShowVoiceSelector(false)
                    setActiveMode(mode)
                    switch (mode) {
                      case 'interview':
                        setShowInterview(true)
                        setShowFreeTalk(false)
                        break
                      case 'free-talk':
                        setShowFreeTalk(true)
                        setShowInterview(false)
                        break
                      case 'text':
                        setShowInterview(false)
                        setShowFreeTalk(false)
                        break
                    }
                  }}
                  onClose={() => {
                    // Default to text mode if user closes
                    setActiveMode('text')
                    setShowVoiceSelector(false)
                    setShowInterview(false)
                    setShowFreeTalk(false)
                  }}
                />
              )}

              {/* Guided interview path */}
              {showInterview && (
                <InterviewInterface
                  onClose={() => {
                    setShowInterview(false)
                    setActiveMode('text')
                    setShowVoiceSelector(true)
                  }}
                  onMemorySaved={() => {
                    setShowInterview(false)
                    setActiveMode('text')
                    setShowVoiceSelector(true)
                  }}
                  onComplete={() => {
                    setShowInterview(false)
                    setActiveMode('text')
                    setShowVoiceSelector(false)
                  }}
                />
              )}

              {/* Free talk path */}
              {showFreeTalk && (
                <FreeTalkInterface
                  onClose={() => {
                    setShowFreeTalk(false)
                    setActiveMode('text')
                    setShowVoiceSelector(true)
                  }}
                  onComplete={() => {
                    setShowFreeTalk(false)
                    setActiveMode('text')
                    setShowVoiceSelector(true)
                  }}
                />
              )}

              {/* Text onboarding chat (default mode) */}
              {!showInterview && !showFreeTalk && (
                <ChatInterface onProgressChange={handleProgressChange} />
              )}
            </div>
          </div>

          {/* Sidebar - Progress Indicator */}
          <div
            style={{
              display: 'none'
            }}
            className="lg:block"
          >
            <div style={{ position: 'sticky', top: '24px' }}>
              <ProgressIndicator
                progress={progress}
                questionsAnswered={questionsAnswered}
                totalQuestions={16}
              />

              {/* Tips Card */}
              <div style={{
                marginTop: '16px',
                background: 'var(--md-sys-color-surface-container)',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid var(--md-sys-color-outline-variant)',
              }}>
                <h4 style={{
                  margin: '0 0 12px 0',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--md-sys-color-on-surface)',
                }}>
                  💡 {t('onboarding.tips')}
                </h4>
                <ul style={{
                  margin: 0,
                  padding: '0 0 0 16px',
                  fontSize: '0.8rem',
                  color: 'var(--md-sys-color-on-surface-variant)',
                  lineHeight: 1.6
                }}>
                  <li>{t('onboarding.tipTime')}</li>
                  <li>{t('onboarding.tipPause')}</li>
                  <li>{t('onboarding.tipPrivacy')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 