'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { useChat } from '@/hooks/useChat';

interface ChatInterfaceProps {
  sessionId?: string | undefined;
  autoCreateSession?: boolean;
  className?: string;
  /** Title shown in header */
  title?: string;
  /** Subtitle shown below title */
  subtitle?: string;
  /** Icon/emoji for header */
  icon?: string;
  /** Placeholder text for input */
  placeholder?: string;
  /** Initial welcome message */
  welcomeMessage?: string;
  /** Optional close handler - shows X button if provided */
  onClose?: () => void;
}

/**
 * Unified Chat Interface Component
 * Matches the styling of ChapterChatInterface for consistency
 */
export function ChatInterface({
  sessionId,
  autoCreateSession = false,
  className,
  title = 'Chat',
  subtitle = 'Erzähle mir von deinem Leben',
  icon = '💬',
  placeholder = 'Schreibe eine Nachricht...',
  welcomeMessage,
  onClose,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    currentSessionId,
    messages,
    sendMessage,
    isLoading,
    isSending,
    error
  } = useChat({
    initialSessionId: sessionId,
    autoCreateSession
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    sendMessage(input.trim());
    setInput('');
  };

  const isDisabled = !currentSessionId && !autoCreateSession;

  // Build display messages including welcome message
  const displayMessages = welcomeMessage && messages.length === 0 
    ? [{ id: 'welcome', role: 'assistant' as const, content: welcomeMessage }]
    : messages;

  return (
    <div 
      className={className}
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--md-sys-color-surface)',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      {/* Header - matches ChapterChatInterface exactly */}
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
          <span style={{ fontSize: '1.5rem' }}>{icon}</span>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--md-sys-color-on-surface)' }}>
              {title}
            </h2>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
              {subtitle}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
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
          >
            ×
          </button>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
            background: 'var(--md-sys-color-error-container)',
            color: 'var(--md-sys-color-on-error-container)',
            textAlign: 'center',
            fontSize: '0.875rem',
          }}
          role="alert"
        >
          {error.message}
        </div>
      )}

      {/* Messages - matches ChapterChatInterface exactly */}
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
        {displayMessages.length === 0 && !isLoading && (
          <div
            style={{
              alignSelf: 'flex-start',
              maxWidth: '85%',
              padding: '12px 16px',
              borderRadius: '20px 20px 20px 4px',
              background: 'var(--md-sys-color-surface-container-high)',
              color: 'var(--md-sys-color-on-surface)',
              fontSize: '0.9375rem',
              lineHeight: 1.5,
            }}
          >
            {icon} Starte eine Unterhaltung...
          </div>
        )}

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
            <span style={{ opacity: 0.7 }}>Thinking...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input - matches ChapterChatInterface exactly */}
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
          onChange={(e) => setInput(e.target.value)}
          placeholder={isDisabled ? "Keine aktive Sitzung" : placeholder}
          disabled={isSending || isDisabled}
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
          disabled={isLoading || isSending || isDisabled || !input.trim()}
          style={{
            padding: '12px 24px',
            borderRadius: '24px',
            border: 'none',
            background: 'var(--md-sys-color-primary)',
            color: 'var(--md-sys-color-on-primary)',
            fontWeight: 600,
            cursor: isLoading || isSending || isDisabled || !input.trim() ? 'not-allowed' : 'pointer',
            opacity: isLoading || isSending || isDisabled || !input.trim() ? 0.5 : 1,
            transition: 'all 0.2s',
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
