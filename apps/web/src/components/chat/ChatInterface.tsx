'use client';

import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useChat } from '@/hooks/useChat';

interface ChatInterfaceProps {
  sessionId?: string | undefined;
  autoCreateSession?: boolean;
}

/**
 * Main chat interface component
 * Manages chat state and orchestrates message flow
 */
export function ChatInterface({ 
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
    <>
      {/* Error display */}
      {error && (
        <div
          style={{
            padding: '16px 20px',
            background: 'var(--md-sys-color-error-container)',
            border: '1px solid var(--md-sys-color-outline)',
            borderRadius: '12px',
            marginBottom: '16px',
            color: 'var(--md-sys-color-on-error-container)',
            fontSize: '14px',
            lineHeight: 1.4,
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
    </>
  );
}
