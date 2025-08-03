'use client';

import { useState, FormEvent } from 'react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Message Input Component
 * Text input with send button for chat messages
 * Following style.html design tokens and accessibility guidelines
 */
export function MessageInput({
  onSendMessage,
  isLoading = false,
  placeholder = "Type your message...",
  className = '',
  disabled = false
}: MessageInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading || disabled) {
      return;
    }

    onSendMessage(input.trim());
    setInput('');
  };

  const isSubmitDisabled = isLoading || disabled || !input.trim();

  return (
    <form
      onSubmit={handleSubmit}
      className={className}
      style={{
        borderTop: '1px solid var(--c-neutral-medium)',
        background: 'var(--c-primary-invert)',
        padding: '16px 20px'
      }}
    >
      <div style={{ 
        display: 'flex', 
        gap: 'calc(var(--base-unit, 4px) * 3)', 
        alignItems: 'flex-end' 
      }}>
        <div style={{ flex: 1 }}>
          <label htmlFor="chat-input" className="sr-only">
            Type your message
          </label>
          <input
            id="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading || disabled}
            style={{
              width: '100%',
              padding: '16px',
              border: '2px solid var(--c-neutral-medium)',
              borderRadius: 'var(--radius-base, 12px)',
              color: 'var(--c-primary-100)',
              fontFamily: 'var(--font-primary)',
              fontSize: '1.125rem',
              transition: 'all 0.2s',
              outline: 'none',
              boxShadow: '0 0 0 3px transparent',
              background: 'var(--c-primary-invert)',
              marginBottom: 0
            }}
            autoComplete="off"
            aria-describedby="input-help"
            aria-label="Type your message"
            tabIndex={0}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = '0 0 0 2px var(--c-accent-100)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = '0 0 0 3px transparent';
            }}
          />
          <div id="input-help" className="sr-only">
            Type your message and press Enter or click Send
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitDisabled}
          style={{
            padding: '16px 32px',
            background: isSubmitDisabled
              ? 'var(--c-neutral-medium)'
              : 'var(--c-accent-100)',
            color: 'var(--c-primary-invert)',
            borderRadius: 'var(--radius-base, 12px)',
            fontFamily: 'var(--font-primary)',
            fontWeight: 600,
            fontSize: '1.125rem',
            minWidth: '100px',
            transition: 'all 0.2s, box-shadow 0.2s',
            outline: 'none',
            cursor: isSubmitDisabled ? 'not-allowed' : 'pointer',
            border: 'none',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
          }}
          aria-label={isLoading ? 'Sending message' : 'Send message'}
          tabIndex={0}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = '0 0 0 2px var(--c-accent-100)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
          }}
          onMouseOver={(e) => {
            if (!isSubmitDisabled) {
              e.currentTarget.style.background = 'var(--c-accent-100)';
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = isSubmitDisabled 
              ? 'var(--c-neutral-medium)' 
              : 'var(--c-accent-100)';
          }}
        >
          {isLoading ? '⏳ Sending...' : '📤 Send'}
        </button>
      </div>
    </form>
  );
}
