'use client';

import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useChat } from '@/hooks/useChat';

interface ChatInterfaceProps {
  className?: string;
  sessionId?: string | undefined;
  autoCreateSession?: boolean;
}

/**
 * Main chat interface component
 * Manages chat state and orchestrates message flow
 */
export function ChatInterface({ 
  className = '',
  sessionId,
  autoCreateSession = false
}: ChatInterfaceProps) {
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

  return (
    <div 
      className={`flex flex-col h-full chat-interface ${className}`}
      style={{
        background: 'var(--c-primary-invert)',
        color: 'var(--c-primary-100)',
        fontFamily: 'var(--font-primary)',
      }}
      data-testid="chat-interface"
    >
      {/* Header */}
      <div
        style={{
          padding: 'calc(var(--base-unit, 4px) * 4)',
          borderBottom: '1px solid var(--c-neutral-medium)',
          background: 'var(--c-primary-invert)',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'var(--c-primary-100)',
          }}
        >
          Chat Assistant
        </h2>
        {currentSessionId && (
          <p
            style={{
              margin: '4px 0 0 0',
              fontSize: '0.875rem',
              color: 'var(--c-neutral-dark)',
            }}
          >
            Session: {currentSessionId.slice(0, 8)}...
          </p>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div
          style={{
            padding: 'calc(var(--base-unit, 4px) * 3)',
            background: 'rgba(211, 47, 47, 0.1)',
            borderLeft: '4px solid var(--c-accent-100)',
            color: 'var(--c-accent-100)',
            fontSize: '0.875rem',
          }}
          role="alert"
        >
          {error.message}
        </div>
      )}

      {/* Messages */}
      <MessageList 
        messages={messages} 
        isLoading={isLoading}
        className="flex-1"
      />

      {/* Input */}
      <MessageInput 
        onSendMessage={sendMessage}
        isLoading={isSending}
        disabled={!currentSessionId && !autoCreateSession}
        placeholder={
          currentSessionId || autoCreateSession 
            ? "Type your message..." 
            : "No active session"
        }
      />
    </div>
  );
}
