'use client';

import { ChatMessage } from '@nality/schema/chat';

interface MessageBubbleProps {
  message: ChatMessage;
  className?: string;
}

/**
 * Individual Message Bubble Component
 * Displays single message with user/assistant distinction
 * Following style.html design tokens for consistent theming
 */
export function MessageBubble({ message, className = '' }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      style={{ 
        display: 'flex', 
        justifyContent: isUser ? 'flex-end' : 'flex-start' 
      }}
      className={className}
    >
      <div
        tabIndex={0}
        aria-label={isUser ? 'Your message' : 'AI assistant message'}
        style={{
          position: 'relative',
          maxWidth: '75%',
          padding: '16px 20px',
          borderRadius: 'var(--radius-base, 12px)',
          borderBottomRightRadius: isUser ? '8px' : undefined,
          borderBottomLeftRadius: !isUser ? '8px' : undefined,
          background: isUser
            ? 'var(--c-primary-100)'
            : 'var(--c-neutral-light)',
          color: isUser
            ? 'var(--c-primary-invert)'
            : 'var(--c-primary-100)',
          fontFamily: 'var(--font-primary)',
          fontSize: '0.9375rem',
          lineHeight: '1.6',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          marginBottom: 0,
          outline: 'none',
          transition: 'box-shadow 0.2s',
        }}
        onFocus={(e) => {
          e.currentTarget.style.boxShadow = '0 0 0 2px var(--c-accent-100)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
        }}
      >
        {/* Speech bubble arrow */}
        {isUser ? (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              right: '-10px',
              bottom: '8px',
              width: 0,
              height: 0,
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
              borderLeft: '10px solid var(--c-primary-100)'
            }}
          />
        ) : (
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
        )}
        
        {/* Message content */}
        <p style={{ margin: 0 }}>{message.content}</p>
        
        {/* Timestamp */}
        <div
          style={{
            fontSize: '0.75rem',
            marginTop: 'calc(var(--base-unit, 4px) * 2)',
            opacity: 0.7,
            color: isUser
              ? 'rgba(255,255,255,0.7)'
              : 'var(--c-neutral-dark)',
            fontFamily: 'var(--font-primary)'
          }}
        >
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  );
}
