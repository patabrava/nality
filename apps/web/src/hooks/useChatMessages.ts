'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChatMessage } from '@nality/schema/chat';

interface UseChatMessagesProps {
  sessionId?: string | undefined;
  enabled?: boolean;
}

/**
 * Message operations using native React state
 * Handles message fetching, optimistic updates, and error states
 */
export function useChatMessages({ sessionId, enabled = true }: UseChatMessagesProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [sendError, setSendError] = useState<Error | null>(null);

  // Fetch messages for a session
  const fetchMessages = useCallback(async () => {
    if (!sessionId || !enabled) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`📨 Fetching messages for session: ${sessionId}`);
      
      const response = await fetch(`/api/chat/messages?sessionId=${sessionId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }
      
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch messages');
      setError(error);
      console.error('❌ Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, enabled]);

  // Auto-fetch messages when session changes
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Send message with optimistic updates
  const sendMessage = useCallback(async (content: string) => {
    if (!sessionId || !content.trim()) return;
    
    setIsSending(true);
    setSendError(null);
    
    // Optimistic update
    const tempMessage: ChatMessage = {
      id: `temp_${Date.now()}_${Math.random()}`,
      session_id: sessionId,
      role: 'user',
      content: content.trim(),
      created_at: new Date(),
    };
    
    setMessages(prev => [...prev, tempMessage]);
    
    try {
      console.log(`💬 Sending message to session: ${sessionId}`);
      
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          content: content.trim(),
          role: 'user'
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      console.log('✅ Message sent successfully');
      
      // Refetch to get real message with proper ID
      await fetchMessages();
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to send message');
      setSendError(error);
      console.error('❌ Failed to send message:', error);
      
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    } finally {
      setIsSending(false);
    }
  }, [sessionId, fetchMessages]);

  // Add message to local state (for AI responses)
  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);

  // Clear messages (for session reset)
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    error,
    refetch: fetchMessages,
    sendMessage,
    isSending,
    sendError,
    addMessage,
    clearMessages,
  };
}
