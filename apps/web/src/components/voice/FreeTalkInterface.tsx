'use client';

import { useState, useCallback } from 'react';
import { Mic, MicOff, X, Check, Loader2 } from 'lucide-react';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/components/i18n/I18nProvider';
import type { Chapter } from '@nality/schema';

type FreeTalkState = 'idle' | 'recording' | 'processing' | 'preview' | 'success' | 'error';

interface ExtractedEvent {
  title: string;
  description: string;
  date?: string;
  category?: string;
}

interface FreeTalkInterfaceProps {
  chapter?: Chapter | undefined;
  onClose: () => void;
  onComplete?: () => void;
}

/**
 * Free Talk Interface Component
 * Record voice monologue, transcribe, and extract memories
 * Simpler flow than Interview - just record, process, confirm
 */
export function FreeTalkInterface({
  chapter,
  onClose,
  onComplete
}: FreeTalkInterfaceProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [state, setState] = useState<FreeTalkState>('idle');
  const [extractedEvents, setExtractedEvents] = useState<ExtractedEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const voiceInput = useVoiceInput({
    onError: (err) => {
      setError(err.message);
      setState('error');
    },
  });

  // Timer for recording duration
  const startRecording = useCallback(async () => {
    setError(null);
    setState('recording');
    voiceInput.resetTranscript();

    try {
      await voiceInput.startListening();

      // Start duration timer
      const startTime = Date.now();
      const timer = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      // Store timer ID for cleanup
      (window as any).__freeTalkTimer = timer;
    } catch (err) {
      setError(t('voice.freeTalk.failedProcess'));
      setState('error');
    }
  }, [voiceInput, t]);

  const stopRecording = useCallback(async () => {
    // Clear timer
    const timer = (window as any).__freeTalkTimer;
    if (timer) {
      clearInterval(timer);
    }

    voiceInput.stopListening();

    const transcript = voiceInput.transcript.trim();

    if (!transcript || transcript.length < 10) {
      setError(t('voice.freeTalk.recordingShort'));
      setState('idle');
      setRecordingDuration(0);
      return;
    }

    setState('processing');

    try {
      // Send transcript to extraction API
      const response = await fetch('/api/events/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: transcript,
          chapterId: chapter?.id,
          userId: user?.id,
          source: 'voice_monologue',
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.events && data.events.length > 0) {
        setExtractedEvents(data.events);
        setState('preview');
      } else if (data.saved) {
        // Single event was saved directly
        setState('success');
        setTimeout(() => {
          onComplete?.();
        }, 2000);
      } else {
        setError(t('voice.freeTalk.failedProcess'));
        setState('idle');
      }
    } catch (err) {
      console.error('Extraction failed:', err);
      setError(t('voice.freeTalk.failedProcess'));
      setState('error');
    }
  }, [voiceInput, chapter?.id, user?.id, onComplete, t]);

  const confirmEvents = useCallback(async () => {
    setState('processing');

    try {
      // Save extracted events
      for (const event of extractedEvents) {
        await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: event.title,
            description: event.description,
            start_date: event.date || new Date().toISOString(),
            category: event.category || chapter?.id || 'personal',
            user_id: user?.id,
          }),
        });
      }

      setState('success');
      setTimeout(() => {
        onComplete?.();
      }, 2000);
    } catch (err) {
      console.error('Failed to save events:', err);
      setError(t('voice.freeTalk.failedSave'));
      setState('error');
    }
  }, [extractedEvents, chapter?.id, user?.id, onComplete, t]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    voiceInput.stopListening();
    const timer = (window as any).__freeTalkTimer;
    if (timer) {
      clearInterval(timer);
    }
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(5, 5, 5, 0.98) 0%, rgba(13, 13, 13, 0.99) 100%)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Grain overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          opacity: 0.03,
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          flexShrink: 0,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '1.125rem',
                fontWeight: 600,
                color: 'var(--md-sys-color-on-surface)',
              }}
            >
              {t('voice.freeTalk.title')}
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: '0.75rem',
                color: 'var(--md-sys-color-on-surface-variant)',
              }}
            >
              {chapter?.title || t('voice.freeTalk.subtitle')}
            </p>
          </div>
        </div>

        <button
          onClick={handleClose}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--md-sys-color-on-surface)',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          }}
          aria-label={t('voice.interview.close')}
        >
          <X size={20} />
        </button>
      </header>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          gap: '24px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Idle State */}
        {state === 'idle' && (
          <>
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--md-sys-color-tertiary) 0%, rgba(125, 82, 96, 0.8) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 40px rgba(125, 82, 96, 0.3)',
              }}
            >
              <Mic size={48} color="white" />
            </div>
            <div style={{ textAlign: 'center', maxWidth: '400px' }}>
              <h2
                style={{
                  margin: '0 0 8px 0',
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: 'var(--md-sys-color-on-surface)',
                }}
              >
                {t('voice.freeTalk.readyTitle')}
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.875rem',
                  color: 'var(--md-sys-color-on-surface-variant)',
                  lineHeight: 1.6,
                }}
              >
                {t('voice.freeTalk.readyBody')}
              </p>
            </div>
            <button
              onClick={startRecording}
              style={{
                padding: '16px 48px',
                background: 'linear-gradient(135deg, var(--md-sys-color-tertiary) 0%, rgba(125, 82, 96, 0.9) 100%)',
                border: 'none',
                borderRadius: '32px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Mic size={20} />
              {t('voice.freeTalk.startRecording')}
            </button>
          </>
        )}

        {/* Recording State */}
        {state === 'recording' && (
          <>
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(186, 26, 26, 0.8) 0%, rgba(140, 20, 20, 0.9) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 40px rgba(186, 26, 26, 0.4)',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            >
              <MicOff size={48} color="white" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: 'var(--md-sys-color-error)',
                  fontFamily: 'monospace',
                }}
              >
                {formatDuration(recordingDuration)}
              </div>
              <p
                style={{
                  margin: '8px 0 0 0',
                  fontSize: '0.875rem',
                  color: 'var(--md-sys-color-on-surface-variant)',
                }}
              >
                {t('voice.freeTalk.recording')}
              </p>
            </div>

            {/* Live transcript preview */}
            {voiceInput.transcript && (
              <div
                style={{
                  maxWidth: '500px',
                  maxHeight: '150px',
                  overflow: 'auto',
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.875rem',
                    color: 'var(--md-sys-color-on-surface-variant)',
                    lineHeight: 1.6,
                  }}
                >
                  {voiceInput.transcript}
                  {voiceInput.interimTranscript && (
                    <span style={{ opacity: 0.5 }}> {voiceInput.interimTranscript}</span>
                  )}
                </p>
              </div>
            )}

            <button
              onClick={stopRecording}
              style={{
                padding: '16px 48px',
                background: 'rgba(186, 26, 26, 0.2)',
                border: '2px solid var(--md-sys-color-error)',
                borderRadius: '32px',
                color: 'var(--md-sys-color-error)',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(186, 26, 26, 0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(186, 26, 26, 0.2)';
              }}
            >
              {t('voice.freeTalk.stopRecording')}
            </button>
          </>
        )}

        {/* Processing State */}
        {state === 'processing' && (
          <>
            <Loader2
              size={64}
              style={{
                color: 'var(--md-sys-color-primary)',
                animation: 'spin 1s linear infinite',
              }}
            />
            <p
              style={{
                margin: 0,
                fontSize: '1rem',
                color: 'var(--md-sys-color-on-surface-variant)',
              }}
            >
              {t('voice.freeTalk.processing')}
            </p>
          </>
        )}

        {/* Preview State */}
        {state === 'preview' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <h2
                style={{
                  margin: '0 0 8px 0',
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: 'var(--md-sys-color-on-surface)',
                }}
              >
                {t('voice.freeTalk.foundPrefix')} {extractedEvents.length} {extractedEvents.length === 1 ? t('voice.freeTalk.memory') : t('voice.freeTalk.memories')}!
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.875rem',
                  color: 'var(--md-sys-color-on-surface-variant)',
                }}
              >
                {t('voice.freeTalk.previewTitle')}
              </p>
            </div>

            <div
              style={{
                width: '100%',
                maxWidth: '500px',
                maxHeight: '300px',
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {extractedEvents.map((event, index) => (
                <div
                  key={index}
                  style={{
                    padding: '16px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <h3
                    style={{
                      margin: '0 0 4px 0',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'var(--md-sys-color-on-surface)',
                    }}
                  >
                    {event.title}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.8125rem',
                      color: 'var(--md-sys-color-on-surface-variant)',
                      lineHeight: 1.5,
                    }}
                  >
                    {event.description}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setState('idle');
                  setExtractedEvents([]);
                  setRecordingDuration(0);
                }}
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '24px',
                  color: 'var(--md-sys-color-on-surface-variant)',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {t('voice.freeTalk.tryAgain')}
              </button>
              <button
                onClick={confirmEvents}
                style={{
                  padding: '12px 24px',
                  background: 'var(--md-sys-color-primary)',
                  border: 'none',
                  borderRadius: '24px',
                  color: 'var(--md-sys-color-on-primary)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Check size={18} />
                {t('voice.freeTalk.saveMemories')}
              </button>
            </div>
          </>
        )}

        {/* Success State */}
        {state === 'success' && (
          <>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(76, 175, 80, 0.1) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--md-sys-color-primary)',
              }}
            >
              <Check size={40} style={{ color: 'var(--md-sys-color-primary)' }} />
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--md-sys-color-on-surface)',
              }}
            >
              {t('voice.freeTalk.success')}
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: '0.875rem',
                color: 'var(--md-sys-color-on-surface-variant)',
              }}
            >
              {t('voice.freeTalk.successBody')}
            </p>
          </>
        )}

        {/* Error State */}
        {error && state === 'error' && (
          <>
            <div
              style={{
                padding: '16px 24px',
                background: 'rgba(186, 26, 26, 0.1)',
                border: '1px solid rgba(186, 26, 26, 0.3)',
                borderRadius: '12px',
                color: 'var(--md-sys-color-error)',
                textAlign: 'center',
              }}
            >
              {error}
            </div>
            <button
              onClick={() => {
                setError(null);
                setState('idle');
              }}
              style={{
                padding: '12px 24px',
                background: 'var(--md-sys-color-primary)',
                border: 'none',
                borderRadius: '24px',
                color: 'var(--md-sys-color-on-primary)',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {t('voice.freeTalk.tryAgain')}
            </button>
          </>
        )}
      </main>

      {/* Pulse animation keyframes */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
