'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ChatInterfaceProps {
  className?: string;
  placeholder?: string;
  initialMessage?: string;
}

// Onboarding guidance prompts for seniors
const GUIDANCE_PROMPTS = [
  "💡 Try starting with: 'I was born in...' or 'I grew up in...'",
  "🏠 Tell me about your childhood home or neighborhood",
  "👥 Share a memory about your family or friends",
  "💼 What was your first job or career like?",
  "💕 Tell me about meeting someone special in your life",
  "🎓 Do you have any achievements you're proud of?",
  "🌍 Have you traveled anywhere memorable?",
  "📸 Do you have any photos or documents to add?",
];

export default function ChatInterface({
  className = '',
  placeholder = "Tell me about your life story...",
  initialMessage = "Hello! I'm your personal timeline assistant. I'm here to help you create a beautiful timeline of your life story. What would you like to share with me today?"
}: ChatInterfaceProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentGuidance, setCurrentGuidance] = useState(0);
  const [showGuidance, setShowGuidance] = useState(true);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    initialMessages: [],
    onFinish: () => {
      console.log('🎉 Message exchange completed');
      // Cycle through guidance prompts after each exchange
      setCurrentGuidance(prev => (prev + 1) % GUIDANCE_PROMPTS.length);
    },
    onError: (error) => {
      console.error('💔 Chat error:', error);
    }
  });

  const router = useRouter();

  // Auto-cycle guidance prompts for engagement
  useEffect(() => {
    if (showGuidance && messages.length > 0) {
      const interval = setInterval(() => {
        setCurrentGuidance(prev => (prev + 1) % GUIDANCE_PROMPTS.length);
      }, 8000); // Change prompt every 8 seconds
      
      return () => clearInterval(interval);
    }
  }, [showGuidance, messages.length]);

  // Initialize with welcome message if no messages exist
  const displayMessages = messages.length === 0 && !isInitialized 
    ? [{ id: 'welcome', role: 'assistant' as const, content: initialMessage }]
    : messages;

  // Handle form submission
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isInitialized) {
      setIsInitialized(true);
    }
    handleSubmit(e);
  };

  return (
    <div 
      className={`flex flex-col h-full onboarding-chat ${className}`}
      style={{ background: 'var(--tl-bg)', color: 'var(--tl-ink-100)' }}
      data-testid="chat-interface"
    >
      {/* Onboarding Header with Guidance */}
      {showGuidance && (
        <div
          className="timeline-event-card standard-text-card mb-4"
          style={{
            background: 'var(--tl-surface-80)',
            color: 'var(--tl-ink-100)',
            border: '1px solid var(--tl-stroke-hairline)',
            borderRadius: 'var(--tl-card-radius, 14px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            padding: 'var(--tl-card-padding-internal, 18px)',
            marginBottom: 'var(--base-unit, 16px)'
          }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: 'calc(var(--base-unit, 4px) * 2)' }}>
            <h1
              tabIndex={0}
              className="type-h2 text-tl-accent-primary font-bold mb-0"
              style={{ outline: 'none', transition: 'box-shadow 0.2s' }}
              onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 2px var(--tl-accent-primary)'}
              onBlur={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <span className="mr-2">📖</span> Creating Your Life Story
            </h1>
            <button
              onClick={() => setShowGuidance(false)}
              className="text-tl-accent-primary font-normal text-base rounded-lg outline-none border-none bg-none cursor-pointer transition-shadow"
              tabIndex={0}
              aria-label="Hide guidance"
              onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 2px var(--tl-accent-primary)'}
              onBlur={e => e.currentTarget.style.boxShadow = 'none'}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(0,122,255,0.08)'}
              onMouseOut={e => e.currentTarget.style.background = 'none'}
            >
              ✕ Hide tips
            </button>
          </div>
          <div
            style={{
              color: 'var(--tl-ink-60)',
              fontFamily: 'var(--font-timeline, Inter, sans-serif)',
              fontSize: '0.875rem',
              transition: 'all 0.5s cubic-bezier(.4,0,.2,1)'
            }}
            data-testid="guidance"
            key={currentGuidance}
          >
            {GUIDANCE_PROMPTS[currentGuidance]}
          </div>
          <div className="flex" style={{ gap: 'var(--base-unit, 4px)', marginTop: 'calc(var(--base-unit, 4px) * 2)' }}>
            {GUIDANCE_PROMPTS.map((_, index) => (
              <div
                key={index}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  transition: 'background 0.3s',
                  background: index === currentGuidance
                    ? 'var(--tl-accent-primary)'
                    : 'var(--tl-surface-80)'
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div
        className="flex-1 overflow-y-auto"
        style={{
          padding: 'calc(var(--base-unit, 4px) * 4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'calc(var(--base-unit, 4px) * 4)'
        }}
        data-testid="messages"
        role="log"
        aria-label="Conversation messages"
        aria-live="polite"
      >
        {displayMessages.map((message) => (
          <div
            key={message.id}
            style={{ display: 'flex', justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start' }}
          >
            <div
              tabIndex={0}
              aria-label={message.role === 'user' ? 'Your message' : 'AI message'}
              style={{
                position: 'relative',
                maxWidth: '75%',
                padding: 'var(--tl-card-padding-internal, 18px)',
                borderRadius: 'var(--tl-card-radius, 14px)',
                borderBottomRightRadius: message.role === 'user' ? '8px' : undefined,
                borderBottomLeftRadius: message.role !== 'user' ? '8px' : undefined,
                background: message.role === 'user'
                  ? 'var(--tl-accent-primary)'
                  : 'var(--tl-surface-100)',
                color: message.role === 'user'
                  ? '#fff'
                  : 'var(--tl-ink-100)',
                fontFamily: 'var(--font-timeline, Inter, sans-serif)',
                fontSize: '0.9375rem',
                lineHeight: '1.6',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                marginBottom: 0,
                outline: 'none',
                transition: 'box-shadow 0.2s',
              }}
              onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 2px var(--tl-accent-primary)'}
              onBlur={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'}
            >
              {/* Speech bubble arrow */}
              {message.role === 'user' ? (
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
                    borderLeft: '10px solid var(--tl-accent-primary)'
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
                    borderRight: '10px solid var(--tl-surface-100)'
                  }}
                />
              )}
              <p style={{ margin: 0 }}>{message.content}</p>
              {'createdAt' in message && message.createdAt && (
                <div
                  style={{
                    fontSize: '0.75rem',
                    marginTop: 'calc(var(--base-unit, 4px) * 2)',
                    opacity: 0.7,
                    color: message.role === 'user'
                      ? 'rgba(255,255,255,0.7)'
                      : 'var(--tl-ink-60)',
                    fontFamily: 'var(--font-timeline, Inter, sans-serif)'
                  }}
                >
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }} data-testid="loading" aria-live="polite">
            <div
              style={{
                borderRadius: 'var(--tl-card-radius, 14px)',
                borderBottomLeftRadius: '8px',
                padding: 'var(--tl-card-padding-internal, 18px)',
                maxWidth: '75%',
                background: 'var(--tl-surface-100)',
                color: 'var(--tl-ink-100)',
                fontFamily: 'var(--font-timeline, Inter, sans-serif)',
                fontSize: '0.9375rem',
                lineHeight: '1.6',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                position: 'relative',
                outline: 'none',
                transition: 'box-shadow 0.2s',
              }}
              tabIndex={0}
              aria-label="AI is typing"
              onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 2px var(--tl-accent-primary)'}
              onBlur={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'}
            >
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
                  borderRight: '10px solid var(--tl-surface-100)'
                }}
              />
              <div style={{ display: 'flex', gap: 'var(--base-unit, 4px)' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--tl-ink-60)',
                    animation: 'bounce 1.5s infinite',
                    animationDelay: '0ms'
                  }}
                  className="animate-bounce"
                ></div>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--tl-ink-60)',
                    animation: 'bounce 1.5s infinite',
                    animationDelay: '150ms'
                  }}
                  className="animate-bounce"
                ></div>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--tl-ink-60)',
                    animation: 'bounce 1.5s infinite',
                    animationDelay: '300ms'
                  }}
                  className="animate-bounce"
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                background: 'rgba(211,47,47,0.12)',
                borderColor: 'var(--tl-accent-primary)',
                color: 'var(--tl-accent-primary)',
                borderRadius: 'var(--tl-card-radius, 14px)',
                padding: 'var(--tl-card-padding-internal, 18px)',
                maxWidth: '28rem',
                textAlign: 'center',
                fontFamily: 'var(--font-timeline, Inter, sans-serif)',
                fontSize: '0.9375rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                outline: 'none',
                transition: 'box-shadow 0.2s',
              }}
              role="alert"
              aria-live="assertive"
              tabIndex={0}
              onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 2px var(--tl-accent-primary)'}
              onBlur={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'}
            >
              <p style={{ margin: 0 }}>
                I&apos;m having trouble connecting right now. Please try again in a moment.
              </p>
              <button
                onClick={() => window.location.reload()}
                style={{
                  marginTop: 'calc(var(--base-unit, 4px) * 2)',
                  fontSize: '0.75rem',
                  textDecoration: 'underline',
                  fontFamily: 'var(--font-timeline, Inter, sans-serif)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--tl-accent-primary)'
                }}
              >
                Refresh page
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={onSubmit}
        style={{
          borderTop: '1px solid var(--tl-stroke-hairline)',
          background: 'var(--tl-surface-80)',
          padding: 'var(--tl-card-padding-internal, 18px)'
        }}
      >
        {/* Quick Reply Suggestions */}
        {messages.length === 0 && !isInitialized && (
          <div style={{ marginBottom: 'calc(var(--base-unit, 4px) * 4)' }}>
            <p
              style={{
                color: 'var(--tl-ink-60)',
                fontFamily: 'var(--font-timeline, Inter, sans-serif)',
                fontSize: '0.875rem',
                marginBottom: 'calc(var(--base-unit, 4px) * 2)'
              }}
            >
              💬 Quick starts:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'calc(var(--base-unit, 4px) * 2)' }}>
              {[
                "I was born in...",
                "I grew up in...",
                "My first job was...",
                "I met my spouse..."
              ].map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleInputChange({ target: { value: suggestion } } as React.ChangeEvent<HTMLInputElement>)}
                  style={{
                    background: 'var(--tl-surface-80)',
                    color: 'var(--tl-ink-100)',
                    borderRadius: '9999px',
                    fontFamily: 'var(--font-timeline, Inter, sans-serif)',
                    fontSize: '0.875rem',
                    padding: '4px 12px',
                    marginBottom: '4px',
                    transition: 'background 0.2s, box-shadow 0.2s',
                    border: 'none',
                    cursor: 'pointer',
                    outline: 'none',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                  }}
                  tabIndex={0}
                  aria-label={`Quick start: ${suggestion}`}
                  onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 2px var(--tl-accent-primary)'}
                  onBlur={e => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)'}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--tl-surface-100)'}
                  onMouseOut={e => e.currentTarget.style.background = 'var(--tl-surface-80)'}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div style={{ display: 'flex', gap: 'calc(var(--base-unit, 4px) * 3)', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="chat-input" className="sr-only">
              Type your life story message
            </label>
            <input
              id="chat-input"
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder={placeholder}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '16px',
                border: '2px solid var(--tl-stroke-hairline)',
                borderRadius: 'var(--tl-card-radius, 14px)',
                color: 'var(--tl-ink-100)',
                fontFamily: 'var(--font-timeline, Inter, sans-serif)',
                fontSize: '1.125rem',
                transition: 'all 0.2s',
                outline: 'none',
                boxShadow: '0 0 0 3px var(--tl-accent-primary, transparent)',
                background: 'var(--tl-surface-80)',
                marginBottom: 0
              }}
              autoComplete="off"
              aria-describedby="input-help"
              aria-label="Type your life story message"
              tabIndex={0}
              onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 2px var(--tl-accent-primary)'}
              onBlur={e => e.currentTarget.style.boxShadow = '0 0 0 3px var(--tl-accent-primary, transparent)'}
            />
            <div id="input-help" className="sr-only">
              Type your message and press Enter or click Send to share your story
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            style={{
              padding: '16px 32px',
              background: isLoading || !input.trim()
                ? 'var(--tl-surface-80)'
                : 'var(--tl-accent-primary)',
              color: '#fff',
              borderRadius: 'var(--tl-card-radius, 14px)',
              fontFamily: 'var(--font-timeline, Inter, sans-serif)',
              fontWeight: 600,
              fontSize: '1.125rem',
              minWidth: '100px',
              transition: 'all 0.2s, box-shadow 0.2s',
              outline: 'none',
              cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
              border: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}
            aria-label={isLoading ? 'Sending message' : 'Send message'}
            tabIndex={0}
            onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 2px var(--tl-accent-primary)'}
            onBlur={e => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)'}
            onMouseOver={e => e.currentTarget.style.background = isLoading || !input.trim() ? 'var(--tl-surface-80)' : 'var(--tl-accent-primary)'}
            onMouseOut={e => e.currentTarget.style.background = isLoading || !input.trim() ? 'var(--tl-surface-80)' : 'var(--tl-accent-primary)'}
          >
            {isLoading ? '⏳' : '📤 Send'}
          </button>
        </div>
        
        {/* Progress indicator */}
        {messages.length > 0 && (
          <div style={{ marginTop: 'calc(var(--base-unit, 4px) * 3)', textAlign: 'center' }}>
            <div
              style={{
                color: 'var(--tl-ink-60)',
                fontFamily: 'var(--font-timeline, Inter, sans-serif)',
                fontSize: '0.75rem'
              }}
            >
              💫 {messages.filter(m => m.role === 'user').length} memories shared so far
            </div>
          </div>
        )}
      </form>
      {/* Continue Later Button */}
      <button
        type="button"
        className="btn btn-secondary mt-6 w-full"
        style={{ marginTop: '24px', height: '44px', fontSize: '1.125rem', borderRadius: 'var(--radius-base)' }}
        onClick={() => router.push('/timeline')}
      >
        Continue Later
      </button>
    </div>
  );
} 

// Add prefers-reduced-motion support for animated elements
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @media (prefers-reduced-motion: reduce) {
      .animate-bounce {
        animation: none !important;
      }
    }
  `;
  document.head.appendChild(style);
} 