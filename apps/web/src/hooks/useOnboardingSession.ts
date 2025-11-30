/**
 * Hook for managing onboarding chat session persistence
 * Uses API routes to bypass RLS issues
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface OnboardingSession {
  id: string;
  user_id: string;
  title: string | null;
  type: 'onboarding';
  created_at: string;
  updated_at: string;
  metadata: {
    progress?: number;
    last_question_topic?: string;
    is_complete?: boolean;
  };
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

interface UseOnboardingSessionReturn {
  session: OnboardingSession | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  isResuming: boolean;
  createSession: () => Promise<OnboardingSession | null>;
  saveMessage: (role: 'user' | 'assistant', content: string) => Promise<void>;
  updateSessionMetadata: (metadata: Partial<OnboardingSession['metadata']>) => Promise<void>;
  markComplete: () => Promise<void>;
}

export function useOnboardingSession(userId: string | null): UseOnboardingSessionReturn {
  const [session, setSession] = useState<OnboardingSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isResuming, setIsResuming] = useState(false);

  // Load or create onboarding session
  const loadOrCreateSession = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get access token for API auth
      const { data: { session: authSession } } = await supabase.auth.getSession();
      const accessToken = authSession?.access_token;
      
      // Use API route to get/create session (bypasses RLS)
      // Pass userId as query param and accessToken in header
      const url = `/api/onboarding/session?userId=${encodeURIComponent(userId)}`;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error fetching onboarding session:', errorData);
        setError('Failed to load session');
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      
      setSession(data.session);
      setMessages(data.messages || []);
      setIsResuming(data.isResuming || false);
      
      console.log('📂 Session loaded:', {
        sessionId: data.session?.id,
        messageCount: data.messages?.length || 0,
        isResuming: data.isResuming
      });
      
    } catch (err) {
      console.error('❌ Unexpected error in loadOrCreateSession:', err);
      setError('Unexpected error loading session');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Load or create onboarding session on mount
  useEffect(() => {
    if (!userId) {
      // Keep isLoading TRUE when userId is null - we're waiting for auth
      // Only reset other states
      setIsResuming(false);
      setMessages([]);
      setSession(null);
      return;
    }

    // userId is now available - load session
    // isLoading should already be true from initial state
    loadOrCreateSession();
  }, [userId, loadOrCreateSession]);

  const createSession = useCallback(async (): Promise<OnboardingSession | null> => {
    // Reload session
    await loadOrCreateSession();
    return session;
  }, [session, loadOrCreateSession]);

  const saveMessage = useCallback(async (role: 'user' | 'assistant', content: string) => {
    if (!session) {
      console.warn('⚠️ Cannot save message: no active session');
      return;
    }

    try {
      // Get access token for API auth
      const { data: { session: authSession } } = await supabase.auth.getSession();
      const accessToken = authSession?.access_token;
      
      const response = await fetch('/api/onboarding/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          role,
          content,
          userId,
          accessToken
        })
      });

      if (!response.ok) {
        console.error('❌ Error saving message');
        return;
      }

      const data = await response.json();
      console.log(`💾 Saved ${role} message to session ${session.id}`);
      
      // Update local state
      if (data.message) {
        setMessages(prev => [...prev, data.message as ChatMessage]);
      }
    } catch (err) {
      console.error('❌ Error saving message:', err);
    }
  }, [session, userId]);

  const updateSessionMetadata = useCallback(async (metadata: Partial<OnboardingSession['metadata']>) => {
    if (!session) return;

    try {
      const response = await fetch('/api/onboarding/session', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          metadata
        })
      });

      if (!response.ok) {
        console.error('❌ Error updating session metadata');
        return;
      }

      const data = await response.json();
      setSession(prev => prev ? { ...prev, metadata: data.metadata } : null);
      console.log('📝 Updated session metadata:', metadata);
    } catch (err) {
      console.error('❌ Error updating session metadata:', err);
    }
  }, [session]);

  const markComplete = useCallback(async () => {
    if (!session) return;

    try {
      // Get access token for API auth
      const { data: { session: authSession } } = await supabase.auth.getSession();
      const accessToken = authSession?.access_token;
      
      const response = await fetch('/api/onboarding/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          markComplete: true,
          userId,
          accessToken
        })
      });

      if (!response.ok) {
        console.error('❌ Error marking session complete');
        return;
      }

      console.log('✅ Marked onboarding session as complete');
    } catch (err) {
      console.error('❌ Error marking session complete:', err);
    }
  }, [session, userId]);

  return {
    session,
    messages,
    isLoading,
    error,
    isResuming,
    createSession,
    saveMessage,
    updateSessionMetadata,
    markComplete,
  };
}
