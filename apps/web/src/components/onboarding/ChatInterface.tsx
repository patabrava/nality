'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useChat } from '@ai-sdk/react';
import { Bot, User, Send, Sparkles } from 'lucide-react';

interface ChatInterfaceProps {
  placeholder?: string;
  initialMessage?: string;
}

interface ChatMessage {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

export default function ChatInterface({
  placeholder = "Erzähle mir kurz etwas über dich …",
  initialMessage = "Guten Tag! Bevor wir starten: Möchten Sie mit 'du' oder 'Sie' angesprochen werden? Welchen Namen und ggf. akademischen Titel soll ich verwenden?"
}: ChatInterfaceProps) {
  // Sanitize AI output: remove status markers and code fences
  function sanitizeAIContent(raw: string): string {
    if (!raw) return '';
    let text = raw.trim();

    // Remove known status headers/markers if present at the start
    text = text.replace(/^(prompt_generation_successful|system_ready|runtime_state)\s*/i, '');

    // If wrapped in code fences, unwrap the first fenced block
    const fenceMatch = text.match(/```(?:text|markdown|md)?\n([\s\S]*?)\n```/i);
    if (fenceMatch && fenceMatch[1]) {
      text = fenceMatch[1].trim();
    }

    // Remove any lingering triple backticks
    text = text.replace(/```/g, '').trim();

    return text;
  }

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showTyping, setShowTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { input, handleInputChange, handleSubmit, error } = useChat({
    api: '/api/chat',
    initialMessages: [],
    onFinish: (message) => {
      console.log('Message exchange completed');
      // Add AI response to our messages
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: 'bot',
        content: sanitizeAIContent(message.content),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsSubmitting(false);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      setIsSubmitting(false);
    }
  });

  const router = useRouter();

  // Initialize chat with welcome message
  useEffect(() => {
    console.log('🤖 Initializing chat with welcome message');
    
    const initializeChat = () => {
      setShowTyping(true);
      setIsSubmitting(false); // Ensure we're not stuck in submitting state
      
      // Simulate typing delay
      setTimeout(() => {
        setShowTyping(false);
        
        const botMessage: ChatMessage = {
          id: `bot-welcome`,
          type: 'bot',
          content: initialMessage,
          timestamp: new Date()
        };
        
        setMessages([botMessage]);
        setIsInitialized(true);
        console.log('💬 Welcome message added');
      }, 1500);
    };

    if (!isInitialized) {
      initializeChat();
    }
  }, [initialMessage, isInitialized]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showTyping]);

  // Handle form submission with safety timeout
  const handleSubmitResponse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isSubmitting) return;
    
    setIsSubmitting(true);

    // Safety timeout to reset submitting state if something goes wrong
    const safetyTimeout = setTimeout(() => {
      console.warn('Response submission timed out, resetting state');
      setIsSubmitting(false);
    }, 10000); // 10 second timeout
    
    // Add user message to our messages
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Submit to AI
    try {
      await handleSubmit(e);
      clearTimeout(safetyTimeout);
    } catch (error) {
      clearTimeout(safetyTimeout);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Chat Header */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--md-sys-color-outline-variant)',
          background: 'var(--md-sys-color-surface-container)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div 
            style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, var(--md-sys-color-primary), var(--md-sys-color-secondary))',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Sparkles style={{ width: '20px', height: '20px', color: 'var(--md-sys-color-on-primary)' }} />
          </div>
          <div>
            <h3 
              style={{
                margin: 0,
                fontSize: '1.125rem',
                fontWeight: 600,
                color: 'var(--md-sys-color-on-surface)',
                lineHeight: 1.2
              }}
            >
              Biografie-Assistent 💕
            </h3>
            <p 
              style={{
                margin: 0,
                fontSize: '0.875rem',
                color: 'var(--md-sys-color-on-surface-variant)',
                lineHeight: 1.2
              }}
            >
              Fast wie ein Gespräch unter Freunden.
            </p>
          </div>
        </div>
      </div>

        {/* Error display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              margin: '16px 24px',
              marginTop: '16px',
              padding: '16px',
              background: 'var(--md-sys-color-error-container)',
              border: '1px solid var(--md-sys-color-error)',
              borderRadius: '12px',
              borderLeft: '4px solid var(--md-sys-color-error)'
            }}
            role="alert"
          >
            <p style={{ 
              color: 'var(--md-sys-color-on-error-container)', 
              fontSize: '0.875rem',
              margin: 0
            }}>
              {error.message}
            </p>
          </motion.div>
        )}

        {/* Messages Area */}
        <div 
          style={{
            height: '400px',
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            scrollBehavior: 'smooth',
            background: 'var(--md-sys-color-surface)'
          }}
        >
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.25,
                  ease: [0.2, 0, 0, 1]
                }}
                style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                {message.type === 'bot' && (
                  <div 
                    style={{
                      width: '32px',
                      height: '32px',
                      background: 'linear-gradient(135deg, var(--md-sys-color-primary), var(--md-sys-color-secondary))',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Bot style={{ width: '16px', height: '16px', color: 'var(--md-sys-color-on-primary)' }} />
                  </div>
                )}
                
                <div
                  style={{
                    maxWidth: '80%',
                    background: message.type === 'user' 
                      ? 'linear-gradient(135deg, var(--md-sys-color-primary), var(--md-sys-color-secondary))' 
                      : 'var(--md-sys-color-surface-container-high)',
                    color: message.type === 'user'
                      ? 'var(--md-sys-color-on-primary)'
                      : 'var(--md-sys-color-on-surface)',
                    padding: '12px 16px',
                    borderRadius: message.type === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                    fontFamily: 'Roboto, system-ui, sans-serif',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    wordWrap: 'break-word'
                  }}
                >
                  {message.content}
                  <div 
                    style={{
                      fontSize: '0.75rem',
                      marginTop: '4px',
                      opacity: 0.7,
                      color: 'inherit'
                    }}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                {message.type === 'user' && (
                  <div 
                    style={{
                      width: '32px',
                      height: '32px',
                      background: 'var(--md-sys-color-surface-container-highest)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <User style={{ width: '16px', height: '16px', color: 'var(--md-sys-color-on-surface-variant)' }} />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {showTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-start'
              }}
            >
              <div 
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, var(--md-sys-color-primary), var(--md-sys-color-secondary))',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Bot style={{ width: '16px', height: '16px', color: 'var(--md-sys-color-on-primary)' }} />
              </div>
              <div 
                style={{
                  background: 'var(--md-sys-color-surface-container-high)',
                  borderRadius: '20px 20px 20px 4px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                }}
              >
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      style={{
                        width: '8px',
                        height: '8px',
                        background: 'var(--md-sys-color-on-surface-variant)',
                        borderRadius: '50%'
                      }}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: [0.2, 0, 0, 1]
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Response Input Area */}
        {!showTyping && messages.length > 0 && !isSubmitting && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
            style={{
              borderTop: '1px solid var(--md-sys-color-outline-variant)',
              background: 'var(--md-sys-color-surface-container)',
              padding: '16px 24px'
            }}
          >
            <form onSubmit={handleSubmitResponse}>
              <div style={{ marginBottom: '12px' }}>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  placeholder={placeholder}
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: '12px 16px',
                    border: '2px solid var(--md-sys-color-outline-variant)',
                    borderRadius: '12px',
                    color: 'var(--md-sys-color-on-surface)',
                    fontFamily: 'Roboto, system-ui, sans-serif',
                    fontSize: '1rem',
                    transition: 'all 0.2s var(--md-sys-motion-easing-standard)',
                    outline: 'none',
                    background: 'var(--md-sys-color-surface-container-highest)',
                    lineHeight: 1.4,
                    resize: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--md-sys-color-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--md-sys-color-outline-variant)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitResponse(e as any);
                    }
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{
                  fontSize: '0.75rem',
                  color: 'var(--md-sys-color-on-surface-variant)',
                  margin: 0
                }}>
                  💬 Enter zum Senden • Shift+Enter für neue Zeile
                </p>
                <button
                  type="submit"
                  disabled={!input.trim() || isSubmitting}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 20px',
                    borderRadius: '20px',
                    background: !input.trim() || isSubmitting
                      ? 'var(--md-sys-color-surface-container)'
                      : 'linear-gradient(135deg, var(--md-sys-color-primary), var(--md-sys-color-secondary))',
                    color: !input.trim() || isSubmitting
                      ? 'var(--md-sys-color-on-surface-variant)'
                      : 'var(--md-sys-color-on-primary)',
                    border: 'none',
                    cursor: !input.trim() || isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s var(--md-sys-motion-easing-standard)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    boxShadow: !input.trim() || isSubmitting ? 'none' : '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                  onMouseOver={(e) => {
                    if (!isSubmitting && input.trim()) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = !input.trim() || isSubmitting ? 'none' : '0 2px 8px rgba(0,0,0,0.15)';
                  }}
                >
                  <Send style={{ width: '16px', height: '16px' }} />
                  Senden
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Submitting State */}
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
            style={{
              borderTop: '1px solid var(--md-sys-color-outline-variant)',
              background: 'var(--md-sys-color-surface-container)',
              padding: '24px',
              textAlign: 'center',
              color: 'var(--md-sys-color-on-surface-variant)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <motion.div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--md-sys-color-primary)'
                }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, ease: [0.2, 0, 0, 1] }}
              />
              <span style={{ fontSize: '0.875rem' }}>Antwort wird verarbeitet …</span>
            </div>
          </motion.div>
        )}

        {/* Continue Later Button */}
        <div style={{ 
          padding: '16px 24px', 
          borderTop: !showTyping && messages.length > 0 && !isSubmitting ? 'none' : '1px solid var(--md-sys-color-outline-variant)',
          borderBottomLeftRadius: !showTyping && messages.length > 0 && !isSubmitting ? '0px' : '16px',
          borderBottomRightRadius: !showTyping && messages.length > 0 && !isSubmitting ? '0px' : '16px',
          background: 'var(--md-sys-color-surface-container)'
        }}>
          <button
            type="button"
            onClick={() => router.push('/timeline')}
            style={{
              width: '100%',
              padding: '12px 24px',
              background: 'transparent',
              border: '1px solid var(--md-sys-color-outline)',
              borderRadius: '20px',
              color: 'var(--md-sys-color-on-surface-variant)',
              fontFamily: 'Roboto, system-ui, sans-serif',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s var(--md-sys-motion-easing-standard)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'var(--md-sys-color-surface-container-high)';
              e.currentTarget.style.borderColor = 'var(--md-sys-color-primary)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'var(--md-sys-color-outline)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Später fortsetzen
          </button>
        </div>
    </>
  );
  }
