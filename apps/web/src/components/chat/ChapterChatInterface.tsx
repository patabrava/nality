'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useChat } from '@ai-sdk/react'
import { useAuth } from '@/hooks/useAuth'
import type { Chapter } from '@nality/schema'
import { BIOGRAPHY_INTERVIEW_START_TOKEN } from '@/lib/biography/interview'

type ChatAppend = ReturnType<typeof useChat>['append']

interface ChapterChatInterfaceProps {
  chapter?: Chapter | undefined;
  mode?: 'chapter' | 'biography';
  onClose: () => void;
  onEventCreated?: () => void;
  interviewSessionId?: string | null;
  preserveSessionOnUnmount?: boolean;
  onSwitchToVoice?: () => void;
}

type InterviewProgressSummary = {
  counts: {
    pending: number;
    answered: number;
    deferred: number;
    skipped: number;
    total: number;
    remainingRequired: number;
  };
  activeQuestionId: string | null;
  activeQuestionLabel: string | null;
  activeTopicLabel: string | null;
  catalogVersion: string | null;
};

// Check if AI message indicates event saving
function isSaveMessage(content: string): boolean {
  const patterns = [
    /\[SAVE_MEMORY\]/i,              // Primary structured format
    /would you like me to save this/i,
    /shall i save this/i,
    /i('ll| will) save this/i,
    /saving this memory/i,
    /i('ve| have) saved/i,
    /memory saved/i,
    /added to your timeline/i,
    /i'd title it/i,
    /Title:\s*.+/i,                  // Structured format detection
  ];
  return patterns.some(p => p.test(content));
}

function isRetryableRouteStatus(status: number): boolean {
  return status === 404 || status >= 500;
}

function stripSaveMemoryBlock(content: string): string {
  return content
    .replace(/\[SAVE_MEMORY\][\s\S]*$/i, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function ChapterChatInterface({ 
  chapter, 
  mode = 'chapter',
  onClose, 
  onEventCreated,
  interviewSessionId: providedInterviewSessionId = null,
  preserveSessionOnUnmount = false,
  onSwitchToVoice,
}: ChapterChatInterfaceProps) {
  const { user, session } = useAuth()
  const isBiographyMode = mode === 'biography'
  const accessToken = session?.access_token ?? null
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [extractionStatus, setExtractionStatus] = useState<'idle' | 'extracting' | 'success' | 'error'>('idle')
  const [savedEventId, setSavedEventId] = useState<string | null>(null)
  const processedMessageIds = useRef<Set<string>>(new Set())
  const [interviewSessionId, setInterviewSessionId] = useState<string | null>(providedInterviewSessionId)
  const [progressSummary, setProgressSummary] = useState<InterviewProgressSummary | null>(null)
  const hasBootstrappedRef = useRef(false)
  const hasCreatedInterviewSessionRef = useRef(false)
  const hasFinalizedInterviewSessionRef = useRef(false)
  const interviewSessionIdRef = useRef<string | null>(null)
  const appendRef = useRef<ChatAppend | null>(null)
  
  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: isBiographyMode ? '/api/chat/biography' : '/api/chat/chapter',
    ...(accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : {}),
    body: { 
      ...(chapter?.id ? { chapterId: chapter.id } : {}),
      ...(isBiographyMode && interviewSessionId ? { interviewSessionId, source: 'text' as const } : {}),
    },
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: isBiographyMode
          ? 'Ich bin dein Biografie-Assistent. Ich starte gleich mit einer Frage, die zu deinen Vorab-Angaben und bisherigen Erinnerungen passt.'
          : `Lass uns eine Erinnerung für dein Kapitel "${chapter?.title}" festhalten. ${chapter?.summary || 'Erzähl mir, woran du dich erinnerst.'} Welchen Moment möchtest du festhalten?`,
      }
    ],
  })

  useEffect(() => {
    interviewSessionIdRef.current = interviewSessionId
  }, [interviewSessionId])

  useEffect(() => {
    if (providedInterviewSessionId) {
      setInterviewSessionId(providedInterviewSessionId)
    }
  }, [providedInterviewSessionId])

  useEffect(() => {
    if (!isBiographyMode || !interviewSessionId || isLoading) {
      return
    }

    const abortController = new AbortController()

    const loadProgressSummary = async () => {
      try {
        const requestInit: RequestInit = {
          signal: abortController.signal,
        }

        if (accessToken) {
          requestInit.headers = {
            Authorization: `Bearer ${accessToken}`,
          }
        }

        const response = await fetch(`/api/interview-sessions?sessionId=${interviewSessionId}`, {
          ...requestInit,
        })

        if (!response.ok) {
          return
        }

        const data = await response.json()
        if (!abortController.signal.aborted) {
          setProgressSummary(data?.data?.progressSummary ?? null)
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error('Failed to load interview progress summary', error)
        }
      }
    }

    void loadProgressSummary()

    return () => {
      abortController.abort()
    }
  }, [accessToken, interviewSessionId, isBiographyMode, isLoading, messages.length])

  useEffect(() => {
    appendRef.current = append
  }, [append])

  const finalizeInterviewSession = useCallback(async () => {
    if (!isBiographyMode) {
      return
    }

    const activeSessionId = interviewSessionIdRef.current
    if (!activeSessionId || hasFinalizedInterviewSessionRef.current) {
      return
    }

    hasFinalizedInterviewSessionRef.current = true

    try {
      await fetch(`/api/interview-sessions?sessionId=${activeSessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken
            ? {
                Authorization: `Bearer ${accessToken}`,
              }
            : {}),
        },
        body: JSON.stringify({
          ended_at: new Date().toISOString(),
          processing_status: 'complete',
        }),
      })
    } catch {
      hasFinalizedInterviewSessionRef.current = false
    }
  }, [accessToken, isBiographyMode])

  useEffect(() => {
    if (!isBiographyMode || providedInterviewSessionId || interviewSessionId || hasCreatedInterviewSessionRef.current) {
      return
    }

    hasCreatedInterviewSessionRef.current = true
    const abortController = new AbortController()

    const createInterviewSession = async () => {
      try {
        let response: Response | null = null

        for (let attempt = 0; attempt < 3; attempt += 1) {
          response = await fetch('/api/interview-sessions', {
            method: 'POST',
            signal: abortController.signal,
            headers: {
              'Content-Type': 'application/json',
              ...(accessToken
                ? {
                    Authorization: `Bearer ${accessToken}`,
                  }
                : {}),
            },
            body: JSON.stringify({
              topics_covered: [],
              memory_count: 0,
              processing_status: 'processing',
            }),
          })

          if (response.ok || !isRetryableRouteStatus(response.status) || attempt === 2) {
            break
          }

          await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)))
        }

        if (!response?.ok) {
          hasCreatedInterviewSessionRef.current = false
          return
        }

        if (abortController.signal.aborted) {
          hasCreatedInterviewSessionRef.current = false
          return
        }

        const data = await response.json()
        const nextSessionId = data?.data?.id ?? null
        if (!nextSessionId) {
          hasCreatedInterviewSessionRef.current = false
          return
        }
        setInterviewSessionId(nextSessionId)
      } catch (error) {
        if (abortController.signal.aborted) {
          hasCreatedInterviewSessionRef.current = false
          return
        }
        console.error('Failed to create interview session', error)
        hasCreatedInterviewSessionRef.current = false
        // Session tracking is best-effort for the chat UI.
      }
    }

    void createInterviewSession()

    return () => {
      abortController.abort()
      if (!interviewSessionIdRef.current) {
        hasCreatedInterviewSessionRef.current = false
      }
    }
  }, [accessToken, interviewSessionId, isBiographyMode, providedInterviewSessionId])

  useEffect(() => {
    if (!isBiographyMode || !interviewSessionId || hasBootstrappedRef.current) {
      return
    }

    hasBootstrappedRef.current = true

    if (!appendRef.current) {
      return
    }

    void appendRef.current(
      {
        role: 'user',
        content: BIOGRAPHY_INTERVIEW_START_TOKEN,
      },
      {
        body: {
          ...(chapter?.id ? { chapterId: chapter.id } : {}),
          interviewSessionId,
          source: 'text',
        },
        ...(accessToken
          ? {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          : {}),
      },
    ).catch((error) => {
      hasBootstrappedRef.current = false
      console.error('Failed to bootstrap biography interview', error)
    })
  }, [accessToken, chapter?.id, interviewSessionId, isBiographyMode])

  useEffect(() => {
    return () => {
      if (!preserveSessionOnUnmount) {
        void finalizeInterviewSession()
      }
    }
  }, [finalizeInterviewSession, preserveSessionOnUnmount])

  // Extract event when AI confirms saving
  const extractEvent = useCallback(async (content: string) => {
    if (isBiographyMode || !user?.id || !chapter?.id) return;
    
    setExtractionStatus('extracting');
    
    try {
      const response = await fetch('/api/events/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken
            ? {
                Authorization: `Bearer ${accessToken}`,
              }
            : {}),
        },
        body: JSON.stringify({
          content,
          chapterId: chapter.id,
          source: 'chapter_chat',
        })
      });
      
      const data = await response.json();
      
      const savedEventId = data?.persisted?.ids?.[0] || null;

      if (savedEventId) {
        setExtractionStatus('success');
        setSavedEventId(savedEventId);
        console.log('✅ Event saved:', savedEventId);
        
        // Notify parent after short delay
        setTimeout(() => {
          onEventCreated?.();
        }, 2000);
      } else if (data.events?.length) {
        // Event was detected but not saved
        console.log('⚠️ Event extracted but not saved:', data);
        setExtractionStatus('idle');
      } else {
        setExtractionStatus('idle');
      }
    } catch (err) {
      console.error('❌ Extraction failed:', err);
      setExtractionStatus('error');
    }
  }, [accessToken, chapter?.id, isBiographyMode, onEventCreated, user?.id]);

  const handleClose = useCallback(() => {
    if (isBiographyMode) {
      onClose()
      return
    }

    void finalizeInterviewSession().finally(() => {
      onClose()
    })
  }, [finalizeInterviewSession, isBiographyMode, onClose])

  // Watch for AI messages that indicate saving
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (
      !isBiographyMode &&
      lastMessage?.role === 'assistant' && 
      !processedMessageIds.current.has(lastMessage.id) &&
      isSaveMessage(lastMessage.content)
    ) {
      processedMessageIds.current.add(lastMessage.id);
      extractEvent(lastMessage.content);
    }
  }, [extractEvent, isBiographyMode, messages]);

  const displayMessages = messages
    .filter((message) => !(message.role === 'user' && message.content === BIOGRAPHY_INTERVIEW_START_TOKEN))
    .map((message) => ({
      ...message,
      content:
        message.role === 'assistant' && !isBiographyMode
          ? stripSaveMemoryBlock(message.content)
          : message.content,
    }))
    .filter((message) => message.content.trim().length > 0)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [displayMessages])

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '600px',
          height: '80vh',
          maxHeight: '700px',
          background: 'var(--md-sys-color-surface)',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div 
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--md-sys-color-outline-variant)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--md-sys-color-surface-container)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--md-sys-color-on-surface)' }}>
                {isBiographyMode ? 'Biografie-Assistent' : 'Erinnerung hinzufügen'}
              </h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                {isBiographyMode ? 'Fast wie ein Gespräch unter Freunden.' : chapter?.title}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isBiographyMode && onSwitchToVoice && (
              <button
                type="button"
                style={{
                  padding: '10px 14px',
                  borderRadius: '999px',
                  border: '1px solid var(--md-sys-color-outline-variant)',
                  background: 'transparent',
                  color: 'var(--md-sys-color-on-surface)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                }}
                onClick={onSwitchToVoice}
              >
                Zu Sprache wechseln
              </button>
            )}
            <button
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '8px',
                color: 'var(--md-sys-color-on-surface)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'var(--md-sys-color-surface-container-high)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              aria-label="Schließen"
              onClick={handleClose}
            >
              ×
            </button>
          </div>
        </div>

        {isBiographyMode && progressSummary && (
          <div
            style={{
              padding: '12px 20px',
              borderBottom: '1px solid var(--md-sys-color-outline-variant)',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0))',
              display: 'grid',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                Aktives Thema: {progressSummary.activeTopicLabel || 'Abschluss'}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                Noch offen: {progressSummary.counts.remainingRequired}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                ['Offen', progressSummary.counts.pending, 'var(--md-sys-color-secondary-container)', 'var(--md-sys-color-on-secondary-container)'],
                ['Beantwortet', progressSummary.counts.answered, 'var(--md-sys-color-primary-container)', 'var(--md-sys-color-on-primary-container)'],
                ['Vertagt', progressSummary.counts.deferred, 'var(--md-sys-color-tertiary-container)', 'var(--md-sys-color-on-tertiary-container)'],
                ['Übersprungen', progressSummary.counts.skipped, 'var(--md-sys-color-surface-container-high)', 'var(--md-sys-color-on-surface)'],
              ].map(([label, value, background, color]) => (
                <span
                  key={String(label)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '999px',
                    background: String(background),
                    color: String(color),
                    fontSize: '0.78rem',
                    fontWeight: 600,
                  }}
                >
                  {label}: {value}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div 
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {displayMessages.map((message) => (
            <div
              key={message.id}
              style={{
                alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                padding: '12px 16px',
                borderRadius: message.role === 'user' 
                  ? '20px 20px 4px 20px' 
                  : '20px 20px 20px 4px',
                background: message.role === 'user'
                  ? 'var(--md-sys-color-primary)'
                  : 'var(--md-sys-color-surface-container-high)',
                color: message.role === 'user'
                  ? 'var(--md-sys-color-on-primary)'
                  : 'var(--md-sys-color-on-surface)',
                fontSize: '0.9375rem',
                lineHeight: 1.5,
              }}
            >
              {message.content}
            </div>
          ))}
          
          {isLoading && (
            <div 
              style={{
                alignSelf: 'flex-start',
                padding: '12px 16px',
                background: 'var(--md-sys-color-surface-container-high)',
                borderRadius: '20px 20px 20px 4px',
                color: 'var(--md-sys-color-on-surface-variant)',
              }}
            >
              <span style={{ opacity: 0.7 }}>Denkt nach...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Extraction Status Banner */}
        {!isBiographyMode && extractionStatus !== 'idle' && (
          <div 
            style={{
              padding: '12px 16px',
              background: extractionStatus === 'success' 
                ? 'var(--md-sys-color-primary-container)' 
                : extractionStatus === 'error'
                ? 'var(--md-sys-color-error-container)'
                : 'var(--md-sys-color-surface-container-high)',
              color: extractionStatus === 'success'
                ? 'var(--md-sys-color-on-primary-container)'
                : extractionStatus === 'error'
                ? 'var(--md-sys-color-on-error-container)'
                : 'var(--md-sys-color-on-surface)',
              textAlign: 'center',
              fontSize: '0.875rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {extractionStatus === 'extracting' && (
              <>
                <span style={{ animation: 'pulse 1.5s infinite' }}>⏳</span>
                Deine Erinnerung wird gespeichert...
              </>
            )}
            {extractionStatus === 'success' && (
              <>
                <span>✅</span>
                Erinnerung in deiner Zeitleiste gespeichert!
              </>
            )}
            {extractionStatus === 'error' && (
              <>
                <span>❌</span>
                Speichern fehlgeschlagen. Bitte versuche es erneut.
              </>
            )}
          </div>
        )}

        {/* Input */}
        <form 
          onSubmit={handleSubmit}
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--md-sys-color-outline-variant)',
            display: 'flex',
            gap: '12px',
            background: 'var(--md-sys-color-surface-container)',
          }}
        >
          <input
            value={input}
            onChange={handleInputChange}
            placeholder={isBiographyMode ? 'Erzähl mir von einer Szene, Person oder Entscheidung ...' : 'Teile deine Erinnerung ...'}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '24px',
              border: '1px solid var(--md-sys-color-outline-variant)',
              background: 'var(--md-sys-color-surface)',
              color: 'var(--md-sys-color-on-surface)',
              fontSize: '1rem',
              outline: 'none',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--md-sys-color-primary)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--md-sys-color-outline-variant)'}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            style={{
              padding: '12px 24px',
              borderRadius: '24px',
              border: 'none',
              background: 'var(--md-sys-color-primary)',
              color: 'var(--md-sys-color-on-primary)',
              fontWeight: 600,
              cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
              opacity: isLoading || !input.trim() ? 0.5 : 1,
              transition: 'all 0.2s',
            }}
          >
            Senden
          </button>
        </form>
      </div>
    </div>
  )
}
