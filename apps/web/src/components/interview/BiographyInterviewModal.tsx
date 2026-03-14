'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { InterviewInterface } from '@/components/voice/InterviewInterface'
import { ChapterChatInterface } from '@/components/chat/ChapterChatInterface'

type InterviewShell = 'voice' | 'text'

interface BiographyInterviewModalProps {
  onClose: () => void
  initialShell?: InterviewShell
}

export function BiographyInterviewModal({
  onClose,
  initialShell = 'voice',
}: BiographyInterviewModalProps) {
  const { session } = useAuth()
  const accessToken = session?.access_token ?? null
  const [activeShell, setActiveShell] = useState<InterviewShell>(initialShell)
  const [interviewSessionId, setInterviewSessionId] = useState<string | null>(null)
  const [isCreatingSession, setIsCreatingSession] = useState(true)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const hasRequestedSessionRef = useRef(false)
  const committedSessionIdRef = useRef<string | null>(null)

  const authHeaders = useMemo(
    () =>
      accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
    [accessToken],
  )

  useEffect(() => {
    committedSessionIdRef.current = interviewSessionId
  }, [interviewSessionId])

  const createInterviewSession = useCallback(async (signal?: AbortSignal) => {
    if (hasRequestedSessionRef.current || committedSessionIdRef.current) {
      return
    }

    hasRequestedSessionRef.current = true
    setIsCreatingSession(true)
    setSessionError(null)

    try {
      const response = await fetch('/api/interview-sessions', {
        method: 'POST',
        ...(signal ? { signal } : {}),
        headers: {
          'Content-Type': 'application/json',
          ...(authHeaders || {}),
        },
        body: JSON.stringify({
          topics_covered: [],
          memory_count: 0,
          processing_status: 'processing',
        }),
      })

      if (!response.ok) {
        throw new Error('Die Interview-Sitzung konnte nicht gestartet werden.')
      }

      const data = await response.json()
      const nextSessionId = data?.data?.id ?? null

      if (!nextSessionId) {
        throw new Error('Die Interview-Sitzung wurde ohne ID angelegt.')
      }

      committedSessionIdRef.current = nextSessionId
      setInterviewSessionId(nextSessionId)
    } catch (error) {
      if (signal?.aborted) {
        return
      }
      hasRequestedSessionRef.current = false
      setSessionError(error instanceof Error ? error.message : 'Interview konnte nicht gestartet werden.')
    } finally {
      if (!signal?.aborted) {
        setIsCreatingSession(false)
      }
    }
  }, [authHeaders])

  useEffect(() => {
    const abortController = new AbortController()
    void createInterviewSession(abortController.signal)

    return () => {
      abortController.abort()
      if (!committedSessionIdRef.current) {
        hasRequestedSessionRef.current = false
      }
    }
  }, [createInterviewSession])

  if (isCreatingSession) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.72)',
          backdropFilter: 'blur(10px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '520px',
            borderRadius: '24px',
            background: 'rgba(13, 13, 13, 0.98)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '32px',
            color: '#fff',
            textAlign: 'center',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              margin: '0 auto 16px',
              borderRadius: '50%',
              border: '3px solid rgba(212, 175, 55, 0.25)',
              borderTopColor: '#D4AF37',
              animation: 'spin 1s linear infinite',
            }}
          />
          <h2 style={{ margin: '0 0 8px', fontSize: '1.25rem' }}>Interview wird vorbereitet</h2>
          <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.64)', lineHeight: 1.5 }}>
            Der Biografie-Assistent lädt deine bisherigen Erinnerungen und Vorab-Angaben.
          </p>
        </div>
      </div>
    )
  }

  if (sessionError || !interviewSessionId) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.72)',
          backdropFilter: 'blur(10px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '520px',
            borderRadius: '24px',
            background: 'rgba(13, 13, 13, 0.98)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '32px',
            color: '#fff',
            textAlign: 'center',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.4)',
          }}
        >
          <h2 style={{ margin: '0 0 8px', fontSize: '1.25rem' }}>Interview konnte nicht gestartet werden</h2>
          <p style={{ margin: '0 0 20px', color: 'rgba(255, 255, 255, 0.64)', lineHeight: 1.5 }}>
            {sessionError || 'Bitte versuche es erneut.'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button
              onClick={() => {
                hasRequestedSessionRef.current = false
                committedSessionIdRef.current = null
                void createInterviewSession()
              }}
              style={{
                padding: '12px 20px',
                borderRadius: '999px',
                border: 'none',
                background: '#D4AF37',
                color: '#050505',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Erneut versuchen
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '12px 20px',
                borderRadius: '999px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                background: 'transparent',
                color: '#fff',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Schließen
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (activeShell === 'voice') {
    return (
      <InterviewInterface
        mode="biography"
        interviewSessionId={interviewSessionId}
        onClose={onClose}
        onSwitchToText={() => setActiveShell('text')}
      />
    )
  }

  return (
    <ChapterChatInterface
      mode="biography"
      interviewSessionId={interviewSessionId}
      preserveSessionOnUnmount
      onClose={onClose}
      onSwitchToVoice={() => setActiveShell('voice')}
    />
  )
}
