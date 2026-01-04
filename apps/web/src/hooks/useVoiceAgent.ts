'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useVoiceInput } from './useVoiceInput';
import { useAudioPlayer } from './useAudioPlayer';
import { useChat } from '@ai-sdk/react';
import { useAuth } from './useAuth';

export type VoiceAgentState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

interface UseVoiceAgentOptions {
  chapterId?: string | undefined;
  onMemorySaved?: (eventId: string) => void;
  onError?: (error: Error) => void;
  autoStart?: boolean;
  voice?: string;
  onComplete?: () => Promise<void> | void;
}

interface UseVoiceAgentReturn {
  agentState: VoiceAgentState;
  isActive: boolean;
  liveTranscript: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  error: Error | null;
  startSession: () => Promise<void>;
  endSession: () => void;
  toggleMute: () => void;
  isMuted: boolean;
}

/**
 * useVoiceAgent Hook
 * Orchestrates the complete voice conversation loop:
 * User Speech -> STT -> LLM -> TTS -> Audio Playback
 * 
 * State machine flow:
 * 1. Session starts -> play welcome -> listening
 * 2. User speaks -> utterance detected -> thinking
 * 3. AI responds -> speaking
 * 4. TTS ends -> listening (loop back to 2)
 */
export function useVoiceAgent(options: UseVoiceAgentOptions = {}): UseVoiceAgentReturn {
  const {
    chapterId,
    onMemorySaved,
    onError,
    autoStart = false,
    voice = 'aura-2-viktoria-de',
    onComplete,
  } = options;

  const { user, session } = useAuth();
  const sttLanguage = 'de-DE'; // Web Speech API locale for STT
  const [agentState, setAgentState] = useState<VoiceAgentState>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const completionHandledRef = useRef(false);
  const [onboardingSessionId, setOnboardingSessionId] = useState<string | null>(null);
  const [isOnboardingResuming, setIsOnboardingResuming] = useState(false);

  // Refs for state machine control (avoid stale closures in callbacks)
  const processedMessageIdRef = useRef<string | null>(null);
  const isTransitioningRef = useRef(false);
  const isActiveRef = useRef(false);
  const isMutedRef = useRef(false);

  // Initialize chat with AI SDK
  const { 
    messages, 
    append, 
    isLoading: isThinking,
  } = useChat({
    api: chapterId ? '/api/chat/chapter' : '/api/chat',
    body: {
      chapterId,
      userId: user?.id,
      accessToken: session?.access_token,
    },
    initialMessages: [
      {
        id: 'voice-welcome',
        role: 'assistant',
        content: chapterId 
          ? "Hallo! Ich helfe dir, deine Erinnerungen festzuhalten. Woran möchtest du dich heute erinnern?"
          : "Willkommen zum Onboarding. Ich sammle jetzt deine Basisdaten – Herkunft, wichtige Stationen und Rahmeninfos. Antworte einfach mündlich, ich führe dich Frage für Frage durch.",
      }
    ],
  });

  // Ensure onboarding session exists (only for onboarding flow)
  const ensureOnboardingSession = useCallback(async (): Promise<string | null> => {
    if (chapterId) return null; // Only needed for onboarding flow
    if (onboardingSessionId) return onboardingSessionId;

    try {
      const resp = await fetch('/api/onboarding/session', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!resp.ok) {
        console.error('❌ Failed to load onboarding session');
        return null;
      }

      const data = await resp.json();
      const sessionId = data?.session?.id ?? null;
      setOnboardingSessionId(sessionId);
      setIsOnboardingResuming(Boolean(data?.isResuming));
      return sessionId;
    } catch (err) {
      console.error('❌ Error ensuring onboarding session:', err);
      return null;
    }
  }, [chapterId, onboardingSessionId]);

  // Persist onboarding messages just like text onboarding does
  const saveOnboardingMessage = useCallback(
    async (role: 'user' | 'assistant', content: string) => {
      if (chapterId) return; // Not an onboarding flow
      const sanitized = content?.trim();
      if (!sanitized) return;

      const sessionId = onboardingSessionId ?? (await ensureOnboardingSession());
      if (!sessionId) {
        console.warn('⚠️ Cannot save onboarding message: no session available');
        return;
      }

      try {
        const resp = await fetch('/api/onboarding/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            role,
            content: sanitized,
            userId: user?.id,
            accessToken: session?.access_token,
          }),
        });

        if (!resp.ok) {
          console.error('❌ Failed to save onboarding voice message');
        }
      } catch (err) {
        console.error('❌ Error saving onboarding voice message:', err);
      }
    },
    [chapterId, ensureOnboardingSession, onboardingSessionId, session?.access_token, user?.id],
  );

  // Start listening helper - returns a promise that resolves when listening actually starts
  const startListeningInternal = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (isTransitioningRef.current) {
        console.log('⏳ Skipping startListening - transition in progress');
        resolve();
        return;
      }
      isTransitioningRef.current = true;
      console.log('🎤 Starting listening...');

      // Set up a timeout in case onstart never fires
      const timeout = setTimeout(() => {
        isTransitioningRef.current = false;
        const err = new Error('Microphone start timed out');
        setError(err);
        setAgentState('error');
        onError?.(err);
        reject(err);
      }, 5000);

      // Store original callback to chain
      const originalStartListening = voiceInputRef.current?.startListening;
      if (!originalStartListening) {
        clearTimeout(timeout);
        isTransitioningRef.current = false;
        const err = new Error('Voice input not initialized');
        reject(err);
        return;
      }

      // Call startListening and poll for isListening state
      originalStartListening.call(voiceInputRef.current).then(() => {
        // Poll for listening state (onstart callback sets it)
        const checkListening = () => {
          if (voiceInputRef.current?.isListening) {
            clearTimeout(timeout);
            isTransitioningRef.current = false;
            setAgentState('listening');
            console.log('✅ Now listening');
            resolve();
          } else if (voiceInputRef.current?.state === 'error') {
            clearTimeout(timeout);
            isTransitioningRef.current = false;
            const err = voiceInputRef.current?.error || new Error('Failed to start listening');
            setError(err);
            setAgentState('error');
            onError?.(err);
            reject(err);
          } else {
            // Keep polling
            setTimeout(checkListening, 50);
          }
        };
        checkListening();
      }).catch((err) => {
        clearTimeout(timeout);
        isTransitioningRef.current = false;
        console.error('❌ Failed to start listening:', err);
        setError(err instanceof Error ? err : new Error('Failed to start listening'));
        setAgentState('error');
        onError?.(err as Error);
        reject(err);
      });
    });
  }, [onError]);

  // Handle utterance end - user stopped speaking
  const handleUtteranceEnd = useCallback(async (transcript: string) => {
    if (!transcript.trim()) return;
    
    console.log('🎯 Processing utterance:', transcript);
    setAgentState('thinking');
    
    try {
      await saveOnboardingMessage('user', transcript);
      await append({
        role: 'user',
        content: transcript,
      });
    } catch (err) {
      console.error('❌ Failed to send message:', err);
      setError(err instanceof Error ? err : new Error('Failed to process speech'));
      onError?.(err as Error);
      // Return to listening on error
      startListeningInternal();
    }
  }, [append, onError, startListeningInternal]);

  // Store voiceInput in ref so callbacks can access it
  const voiceInputRef = useRef<ReturnType<typeof useVoiceInput> | null>(null);

  // Initialize voice input
  const voiceInput = useVoiceInput({
    language: sttLanguage,
    onUtteranceEnd: handleUtteranceEnd,
    onError: (err) => {
      console.error('❌ Voice input error:', err);
      setError(err);
      setAgentState('error');
      onError?.(err);
    },
  });
  voiceInputRef.current = voiceInput;

  // Handle TTS completion - resume listening (use refs to avoid stale closures)
  const handlePlayEnd = useCallback(() => {
    console.log('🔊 TTS playback ended, isActive:', isActiveRef.current, 'isMuted:', isMutedRef.current);
    if (isActiveRef.current && !isMutedRef.current) {
      startListeningInternal();
    } else {
      setAgentState('idle');
    }
  }, [startListeningInternal]);

  // Initialize audio player
  const audioPlayer = useAudioPlayer({
    voice,
    onPlayStart: () => {
      console.log('🔊 TTS playback started');
      // Stop STT while TTS is playing
      if (voiceInput.isListening) {
        voiceInput.stopListening();
      }
      setAgentState('speaking');
    },
    onPlayEnd: handlePlayEnd,
    onError: (err) => {
      console.error('❌ Audio playback error:', err);
      setError(err);
      onError?.(err);
      // Try to recover by resuming listening
      if (isActiveRef.current) {
        startListeningInternal();
      }
    },
  });

  // End voice session
  const endSession = useCallback(() => {
    console.log('🛑 Ending voice session');
    setIsActive(false);
    isActiveRef.current = false;
    isTransitioningRef.current = false;
    voiceInput.stopListening();
    audioPlayer.stop();
    setAgentState('idle');
  }, [voiceInput, audioPlayer]);

  // Handle new assistant messages - trigger TTS
  useEffect(() => {
    if (!isActive) return;
    if (isThinking) return; // Wait for stream to complete

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'assistant') return;

    // Skip if we already processed this message
    if (processedMessageIdRef.current === lastMessage.id) return;

    const content = lastMessage.content.trim();
    if (!content) return;

    // Persist assistant turn for onboarding flow
    (async () => {
      if (!chapterId) {
        await saveOnboardingMessage('assistant', content);
      }
    })();

    // Detect onboarding completion markers (voice path lacks ChatInterface detection)
    const lower = content.toLowerCase();
    const completionPatterns = [
      '[onboarding_complete]',
      'grunddaten sind vollständig',
      'basisdaten sind jetzt vollständig',
      'basisdaten sind erfasst',
      'deine basisdaten sind erfasst',
      'basic data is complete',
      'onboarding is complete',
      'all mandatory fields',
      'profile is complete',
      'ready to explore',
      'weiterführende biografiearbeit',
    ];
    const isCompletion = completionHandledRef.current
      ? false
      : completionPatterns.some(p => lower.includes(p));

    if (isCompletion) {
      completionHandledRef.current = true;
      console.log('🎯 Voice path onboarding completion detected');
      // Best-effort: mark onboarding complete + convert answers, if user/session available
      (async () => {
        try {
          const accessToken = session?.access_token;
          const chatSessionId = onboardingSessionId ?? (await ensureOnboardingSession());

          if (chatSessionId) {
            await fetch('/api/onboarding/session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionId: chatSessionId,
                markComplete: true,
                userId: user?.id,
                accessToken,
              }),
            });
          }

          // Convert onboarding answers to events
          await fetch('/api/events/convert-onboarding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user?.id, accessToken }),
          });

          // Stop session and bubble completion
          endSession();
          await onComplete?.();
        } catch (err) {
          console.error('❌ Failed to finalize onboarding from voice path:', err);
        }
      })();
    }

    console.log('🔊 Speaking assistant message:', lastMessage.id, content.length, 'chars');
    processedMessageIdRef.current = lastMessage.id;

    if (!isMuted) {
      audioPlayer.playText(content);
    } else {
      // If muted, skip TTS and go straight to listening
      startListeningInternal();
    }

    // Check for memory save indicators
    const savePatterns = [
      /\[SAVE_MEMORY\]/i,
      /memory saved/i,
      /added to your timeline/i,
      /i've saved/i,
    ];
    if (savePatterns.some(p => p.test(content))) {
      const idMatch = content.match(/event[_-]?id[:\s]+([a-z0-9-]+)/i);
      onMemorySaved?.(idMatch?.[1] || '');
    }
  }, [
    messages,
    isThinking,
    isActive,
    isMuted,
    audioPlayer,
    startListeningInternal,
    onMemorySaved,
    endSession,
    onComplete,
    ensureOnboardingSession,
    onboardingSessionId,
  ]);

  // Start voice session
  const startSession = useCallback(async () => {
    console.log('🎙️ Starting voice session');
    setError(null);
    processedMessageIdRef.current = null;
    voiceInput.resetTranscript();

    // Ensure onboarding session exists before any turns are spoken
    const onboardingSession = await ensureOnboardingSession();
    
    // Preflight: ensure microphone is available before any TTS
    try {
      await startListeningInternal();
    } catch (err) {
      const micError = err instanceof Error ? err : new Error('Microphone access failed');
      console.error('❌ Mic preflight failed, aborting session start:', micError.message);
      setError(micError);
      setAgentState('error');
      onError?.(micError);
      return;
    }

    // Mark active only after mic is ready
    setIsActive(true);
    isActiveRef.current = true;

    // Stop listening while we play TTS to avoid self-capture
    if (voiceInput.isListening) {
      voiceInput.stopListening();
      setAgentState('idle');
    }

    // Play welcome message first, then start listening when it ends
    const welcomeMessage = messages[0];
    if (welcomeMessage && welcomeMessage.role === 'assistant' && !isMuted) {
      console.log('🔊 Playing welcome message');
      processedMessageIdRef.current = welcomeMessage.id;
      if (!chapterId && onboardingSession && !isOnboardingResuming) {
        await saveOnboardingMessage('assistant', welcomeMessage.content);
      }
      audioPlayer.playText(welcomeMessage.content);
      // onPlayEnd will call startListeningInternal
    } else {
      // No welcome or muted - start listening directly
      await startListeningInternal();
    }
  }, [
    voiceInput,
    audioPlayer,
    messages,
    isMuted,
    startListeningInternal,
    ensureOnboardingSession,
    saveOnboardingMessage,
    chapterId,
    isOnboardingResuming,
  ]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newVal = !prev;
      isMutedRef.current = newVal;
      if (newVal) {
        audioPlayer.stop();
      }
      return newVal;
    });
  }, [audioPlayer]);

  // Auto-start if enabled
  const hasAutoStarted = useRef(false);
  useEffect(() => {
    if (autoStart && !hasAutoStarted.current) {
      hasAutoStarted.current = true;
      startSession();
    }
  }, [autoStart]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      voiceInput.stopListening();
      audioPlayer.stop();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Build conversation history for display
  const conversationHistory = messages.map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  return {
    agentState,
    isActive,
    liveTranscript: voiceInput.transcript + (voiceInput.interimTranscript ? ` ${voiceInput.interimTranscript}` : ''),
    conversationHistory,
    error,
    startSession,
    endSession,
    toggleMute,
    isMuted,
  };
}
