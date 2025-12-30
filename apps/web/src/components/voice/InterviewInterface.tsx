'use client';

import { useEffect, useRef } from 'react';
import { Mic, MicOff, X, Volume2, VolumeX } from 'lucide-react';
import { useVoiceAgent } from '@/hooks/useVoiceAgent';
import { AgentVisualizer } from './AgentVisualizer';
import { useI18n } from '@/components/i18n/I18nProvider';
import type { Chapter } from '@nality/schema';

interface InterviewInterfaceProps {
  chapter?: Chapter | undefined;
  onClose: () => void;
  onMemorySaved?: () => void;
  onComplete?: () => void;
}

/**
 * Interview Interface Component
 * Full-screen voice conversation interface for guided memory collection
 * Features: Voice visualization, live transcript, conversation history
 */
export function InterviewInterface({
  chapter,
  onClose,
  onMemorySaved,
  onComplete,
}: InterviewInterfaceProps) {
  const { t } = useI18n();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    agentState,
    isActive,
    liveTranscript,
    conversationHistory,
    error,
    startSession,
    endSession,
    toggleMute,
    isMuted,
    onComplete: onVoiceComplete,
  } = useVoiceAgent({
    chapterId: chapter?.id,
    onMemorySaved: () => {
      onMemorySaved?.();
    },
    autoStart: true,
    onComplete: onComplete ?? (() => {}),
  });

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  const handleClose = () => {
    endSession();
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
      {/* Grain overlay for luxury aesthetic */}
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
          {chapter && (
            <>
              <span style={{ fontSize: '1.5rem' }}>{chapter.icon}</span>
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: 'var(--md-sys-color-on-surface)',
                  }}
                >
                  {t('voice.interview.title')}
                </h1>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.75rem',
                    color: 'var(--md-sys-color-on-surface-variant)',
                  }}
                >
                  {chapter.name}
                </p>
              </div>
            </>
          )}
          {!chapter && (
            <h1
              style={{
                margin: 0,
                fontSize: '1.125rem',
                fontWeight: 600,
                color: 'var(--md-sys-color-on-surface)',
              }}
            >
              {t('voice.interview.title')}
            </h1>
          )}
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
          gap: '32px',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Agent Visualizer */}
        <AgentVisualizer state={agentState} />

        {/* Live Transcript */}
        {liveTranscript && agentState === 'listening' && (
          <div
            style={{
              maxWidth: '500px',
              padding: '16px 24px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '1rem',
                color: 'var(--md-sys-color-on-surface)',
                fontStyle: 'italic',
                opacity: 0.9,
              }}
            >
              &quot;{liveTranscript}&quot;
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            style={{
              padding: '12px 20px',
              background: 'rgba(186, 26, 26, 0.1)',
              border: '1px solid rgba(186, 26, 26, 0.3)',
              borderRadius: '12px',
              color: 'var(--md-sys-color-error)',
              fontSize: '0.875rem',
            }}
          >
            {error.message}
          </div>
        )}

        {/* Conversation History (scrollable) */}
        {conversationHistory.length > 1 && (
          <div
            style={{
              width: '100%',
              maxWidth: '600px',
              maxHeight: '200px',
              overflow: 'auto',
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {conversationHistory.slice(-6).map((msg, index) => (
                <div
                  key={index}
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user'
                      ? '16px 16px 4px 16px'
                      : '16px 16px 16px 4px',
                    background: msg.role === 'user'
                      ? 'var(--md-sys-color-primary)'
                      : 'rgba(255, 255, 255, 0.05)',
                    color: msg.role === 'user'
                      ? 'var(--md-sys-color-on-primary)'
                      : 'var(--md-sys-color-on-surface)',
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                  }}
                >
                  {msg.content}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </main>

      {/* Footer Controls */}
      <footer
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          padding: '24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          flexShrink: 0,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Mute/Unmute TTS */}
        <button
          onClick={toggleMute}
          style={{
            background: isMuted ? 'rgba(186, 26, 26, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: isMuted ? 'var(--md-sys-color-error)' : 'var(--md-sys-color-on-surface)',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = isMuted
              ? 'rgba(186, 26, 26, 0.3)'
              : 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = isMuted
              ? 'rgba(186, 26, 26, 0.2)'
              : 'rgba(255, 255, 255, 0.05)';
          }}
          aria-label={isMuted ? t('voice.interview.unmute') : t('voice.interview.mute')}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>

        {/* Main Mic Button */}
        <button
          onClick={isActive ? endSession : startSession}
          style={{
            background: isActive
              ? 'linear-gradient(135deg, rgba(186, 26, 26, 0.8) 0%, rgba(140, 20, 20, 0.9) 100%)'
              : 'linear-gradient(135deg, var(--md-sys-color-primary) 0%, rgba(75, 58, 120, 1) 100%)',
            border: 'none',
            borderRadius: '50%',
            width: '72px',
            height: '72px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white',
            transition: 'all 0.2s',
            boxShadow: isActive
              ? '0 0 24px rgba(186, 26, 26, 0.4)'
              : '0 0 24px rgba(103, 80, 164, 0.3)',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          aria-label={isActive ? t('voice.interview.end') : t('voice.interview.start')}
        >
          {isActive ? <MicOff size={28} /> : <Mic size={28} />}
        </button>

        {/* End Session Button */}
        <button
          onClick={handleClose}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            color: 'var(--md-sys-color-on-surface)',
            fontSize: '0.875rem',
            fontWeight: 500,
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          }}
        >
          {t('voice.interview.end')}
        </button>
      </footer>

      {/* Accessibility */}
      <div className="sr-only" aria-live="polite">
        {agentState === 'listening' && t('voice.interview.listening')}
        {agentState === 'thinking' && t('voice.interview.thinking')}
        {agentState === 'speaking' && t('voice.interview.speaking')}
      </div>
    </div>
  );
}
