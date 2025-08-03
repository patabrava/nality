'use client';

import { useState, useCallback, useEffect } from 'react';
import { useChatMessages } from './useChatMessages';
import { ChatSession } from '@nality/schema/chat';

interface UseChatProps {
  initialSessionId?: string | undefined;
  autoCreateSession?: boolean;
}

interface CreateSessionOptions {
  title?: string;
  type?: 'onboarding' | 'general';
}

/**
 * Main chat orchestration hook
 * Manages chat sessions, messages, and overall chat state
 */
export function useChat({ initialSessionId, autoCreateSession = false }: UseChatProps = {}) {
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(initialSessionId);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [sessionError, setSessionError] = useState<Error | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  // Initialize messages hook for current session
  const {
    messages,
    isLoading: isLoadingMessages,
    error: messagesError,
    sendMessage,
    isSending,
    sendError,
    addMessage,
    clearMessages,
    refetch: refetchMessages
  } = useChatMessages({
    sessionId: currentSessionId || '',
    enabled: !!currentSessionId
  });

  // Fetch user's chat sessions
  const fetchSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    setSessionError(null);
    
    try {
      console.log('📂 Fetching chat sessions');
      
      const response = await fetch('/api/chat/sessions');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch sessions: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSessions(data.sessions || []);
      
      console.log(`✅ Fetched ${data.sessions?.length || 0} sessions`);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch sessions');
      setSessionError(error);
      console.error('❌ Failed to fetch sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  // Create a new chat session
  const createSession = useCallback(async (options: CreateSessionOptions = {}) => {
    setIsCreatingSession(true);
    setSessionError(null);
    
    try {
      console.log('🆕 Creating new chat session');
      
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: options.title,
          type: options.type || 'general'
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.statusText}`);
      }

      const data = await response.json();
      const newSession = data.session as ChatSession;
      
      console.log(`✅ Created session: ${newSession.id}`);
      
      // Update sessions list
      setSessions(prev => [newSession, ...prev]);
      
      // Set as current session
      setCurrentSessionId(newSession.id);
      
      return newSession;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create session');
      setSessionError(error);
      console.error('❌ Failed to create session:', error);
      throw error;
    } finally {
      setIsCreatingSession(false);
    }
  }, []);

  // Switch to a different session
  const switchToSession = useCallback((sessionId: string) => {
    console.log(`🔄 Switching to session: ${sessionId}`);
    setCurrentSessionId(sessionId);
  }, []);

  // Auto-create session if needed
  useEffect(() => {
    if (autoCreateSession && !currentSessionId && !isCreatingSession) {
      createSession({ type: 'general' }).catch(console.error);
    }
  }, [autoCreateSession, currentSessionId, isCreatingSession, createSession]);

  // Fetch sessions on mount
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Enhanced send message that handles session creation
  const sendMessageWithSession = useCallback(async (content: string, sessionOptions?: CreateSessionOptions) => {
    let sessionId = currentSessionId;
    
    // Create session if none exists
    if (!sessionId) {
      try {
        const newSession = await createSession(sessionOptions);
        sessionId = newSession.id;
      } catch (err) {
        console.error('Failed to create session for message:', err);
        return;
      }
    }
    
    // Send the message
    await sendMessage(content);
  }, [currentSessionId, createSession, sendMessage]);

  // Current session data
  const currentSession = sessions.find(session => session.id === currentSessionId);

  return {
    // Session management
    currentSessionId,
    currentSession,
    sessions,
    isLoadingSessions,
    sessionError,
    fetchSessions,
    createSession,
    switchToSession,
    isCreatingSession,
    
    // Messages
    messages,
    isLoadingMessages,
    messagesError,
    sendMessage: sendMessageWithSession,
    isSending,
    sendError,
    addMessage,
    clearMessages,
    refetchMessages,
    
    // Combined states
    isLoading: isLoadingSessions || isLoadingMessages || isCreatingSession,
    error: sessionError || messagesError || sendError,
  };
}
