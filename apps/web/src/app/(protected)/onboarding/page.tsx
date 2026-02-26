'use client';

import { useState, useEffect, useCallback } from 'react'
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
  const [showInterview, setShowInterview] = useState(false)
  const [showFreeTalk, setShowFreeTalk] = useState(false)

  const handleVoiceCompletion = useCallback(() => {
    setShowInterview(false)
    setShowFreeTalk(false)
    setShowVoiceSelector(false)
    router.push('/dash')
  }, [router])

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
        fontFamily: 'var(--font-sans)'
      }}
    >
      <main
        style={{
          maxWidth: '1220px',
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
            {t('onboarding.chat.progress')}
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
            {t('onboarding.chat.assistantTitle')}
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
            {t('onboarding.chat.tagline')}
          </p>
        </section>

        <div className="onboarding-layout" style={{ minHeight: 'calc(100vh - 220px)' }}>

          {/* Chat Interface - Main Area */}
          <div>
            <div
              style={{
                background: 'var(--md-sys-color-surface)',
                borderRadius: '18px',
                boxShadow: '0 14px 36px rgba(0, 0, 0, 0.22)',
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
                    setShowVoiceSelector(true)
                  }}
                  onMemorySaved={() => {
                    setShowInterview(false)
                    setShowVoiceSelector(true)
                  }}
                  onComplete={handleVoiceCompletion}
                />
              )}

              {/* Free talk path */}
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

              {/* Text onboarding chat (default mode) */}
              {!showInterview && !showFreeTalk && (
                <ChatInterface onProgressChange={handleProgressChange} />
              )}
            </div>
          </div>

          {/* Sidebar - Progress Indicator */}
          <div
            className="onboarding-sidebar"
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
                padding: '24px',
                border: '1px solid var(--md-sys-color-outline-variant)',
              }}>
                <h4 style={{
                  margin: '0 0 12px 0',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--md-sys-color-on-surface)',
                }}>
                  💡 {t('onboarding.tips')}
                </h4>
                <ul style={{
                  margin: 0,
                  padding: '0 0 0 16px',
                  fontSize: '0.84rem',
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

      <style jsx>{`
        .onboarding-layout {
          display: grid;
          grid-template-columns: minmax(0, 2fr) minmax(260px, 1fr);
          gap: 24px;
        }

        .onboarding-sidebar {
          display: block;
        }

        @media (max-width: 1024px) {
          .onboarding-layout {
            grid-template-columns: 1fr;
          }

          .onboarding-sidebar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
