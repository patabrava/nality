'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useChat } from '@ai-sdk/react'
import { useAuth } from '@/hooks/useAuth'
import type { Chapter } from '@nality/schema'

interface ChapterChatInterfaceProps {
  chapter: Chapter;
  onClose: () => void;
  onEventCreated?: () => void;
}

// Check if AI message indicates event saving
function isSaveMessage(content: string): boolean {
  const patterns = [
    /would you like me to save this/i,
    /shall i save this/i,
    /i('ll| will) save this/i,
    /saving this memory/i,
    /i('ve| have) saved/i,
    /memory saved/i,
    /added to your timeline/i,
    /i'd title it/i,
  ];
  return patterns.some(p => p.test(content));
}

export function ChapterChatInterface({ 
  chapter, 
  onClose, 
  onEventCreated 
}: ChapterChatInterfaceProps) {
  const { user, session } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [extractionStatus, setExtractionStatus] = useState<'idle' | 'extracting' | 'success' | 'error'>('idle')
  const [savedEventId, setSavedEventId] = useState<string | null>(null)
  const processedMessageIds = useRef<Set<string>>(new Set())
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat/chapter',
    body: { 
      chapterId: chapter.id,
      userId: user?.id, 
      accessToken: session?.access_token 
    },
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: `${chapter.icon} Let's add a memory to your "${chapter.name}" chapter. ${chapter.subtitle}. What moment would you like to capture?`,
      }
    ],
  })

  // Extract event when AI confirms saving
  const extractEvent = useCallback(async (content: string) => {
    if (!user?.id) return;
    
    setExtractionStatus('extracting');
    
    try {
      const response = await fetch('/api/events/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          chapterId: chapter.id,
          userId: user.id
        })
      });
      
      const data = await response.json();
      
      if (data.saved && data.eventId) {
        setExtractionStatus('success');
        setSavedEventId(data.eventId);
        console.log('✅ Event saved:', data.eventId);
        
        // Notify parent after short delay
        setTimeout(() => {
          onEventCreated?.();
        }, 2000);
      } else if (data.extracted) {
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
  }, [user?.id, chapter.id, onEventCreated]);

  // Watch for AI messages that indicate saving
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage?.role === 'assistant' && 
      !processedMessageIds.current.has(lastMessage.id) &&
      isSaveMessage(lastMessage.content)
    ) {
      processedMessageIds.current.add(lastMessage.id);
      extractEvent(lastMessage.content);
    }
  }, [messages, extractEvent]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
      onClick={(e) => e.target === e.currentTarget && onClose()}
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
            <span style={{ fontSize: '1.5rem' }}>{chapter.icon}</span>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--md-sys-color-on-surface)' }}>
                Add Memory
              </h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                {chapter.name}
              </p>
            </div>
          </div>
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
            aria-label="Close"
          >
            ×
          </button>
        </div>

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
          {messages.map((message) => (
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

        {/* Extraction Status Banner */}
        {extractionStatus !== 'idle' && (
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
                Saving your memory...
              </>
            )}
            {extractionStatus === 'success' && (
              <>
                <span>✅</span>
                Memory saved to your timeline!
              </>
            )}
            {extractionStatus === 'error' && (
              <>
                <span>❌</span>
                Failed to save. Please try again.
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
            placeholder="Share your memory..."
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
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
