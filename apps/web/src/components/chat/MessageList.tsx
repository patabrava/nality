'use client';

import { ChatMessage } from '@nality/schema/chat';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  className?: string;
}

/**
 * Message List Component
 * Displays chat messages with proper scrolling and accessibility
 * Following style.html design tokens and WCAG 2.1 AA compliance
 */
export function MessageList({ 
  messages, 
  isLoading = false, 
  className = '' 
}: MessageListProps) {
  return (
    <div
      className={`flex-1 overflow-y-auto ${className}`}
      style={{
        padding: 'calc(var(--base-unit, 4px) * 4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'calc(var(--base-unit, 4px) * 4)',
        scrollBehavior: 'smooth'
      }}
      role="log"
      aria-label="Chat conversation"
      aria-live="polite"
      data-testid="message-list"
    >
      {messages.length === 0 && !isLoading && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: 'var(--c-neutral-dark)',
            fontFamily: 'var(--font-primary)',
            fontSize: '1rem',
            textAlign: 'center'
          }}
        >
          Start a conversation...
        </div>
      )}

      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
        />
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div 
          style={{ display: 'flex', justifyContent: 'flex-start' }} 
          data-testid="loading-indicator"
          aria-live="polite"
        >
          <div
            style={{
              borderRadius: 'var(--radius-base, 12px)',
              borderBottomLeftRadius: '8px',
              padding: '16px 20px',
              maxWidth: '75%',
              background: 'var(--c-neutral-light)',
              color: 'var(--c-primary-100)',
              fontFamily: 'var(--font-primary)',
              fontSize: '0.9375rem',
              lineHeight: '1.6',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              position: 'relative',
              outline: 'none',
              transition: 'box-shadow 0.2s',
            }}
            tabIndex={0}
            aria-label="AI is typing"
          >
            {/* Speech bubble arrow */}
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: '-10px',
                bottom: '8px',
                width: 0,
                height: 0,
                borderTop: '8px solid transparent',
                borderBottom: '8px solid transparent',
                borderRight: '10px solid var(--c-neutral-light)'
              }}
            />
            
            <div style={{ display: 'flex', gap: 'var(--base-unit, 4px)' }}>
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--c-neutral-dark)',
                    animation: 'bounce 1.5s infinite',
                    animationDelay: `${index * 150}ms`
                  }}
                  className="animate-bounce"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
