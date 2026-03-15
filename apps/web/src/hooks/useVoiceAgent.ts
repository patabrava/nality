'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useVoiceInput } from './useVoiceInput';
import { useAudioPlayer } from './useAudioPlayer';
import { useDeepgramVoiceSession } from './useDeepgramVoiceSession';
import {
  clearStartedBiographyVoiceSession,
  getBiographyVoiceSessionTransport,
  hasStartedBiographyVoiceSession,
  getLastBiographyVoiceAssistantMessageId,
  markBiographyVoiceSessionStarted,
  setBiographyVoiceSessionTransport,
  setLastBiographyVoiceAssistantMessageId,
} from './biographyVoiceSessionRegistry';
import { useChat } from '@ai-sdk/react';
import { useAuth } from './useAuth';
import { BIOGRAPHY_INTERVIEW_START_TOKEN } from '@/lib/biography/interview';

export type VoiceAgentState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';
export type GuidedVoiceMode = 'onboarding' | 'biography';

interface UseVoiceAgentOptions {
  chapterId?: string | undefined;
  onMemorySaved?: (eventId: string) => void;
  onError?: (error: Error) => void;
  autoStart?: boolean;
  voice?: string;
  onComplete?: () => Promise<void> | void;
  mode?: GuidedVoiceMode;
  interviewSessionId?: string | null;
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
    voice = 'aura-2-elara-de',
    onComplete,
    mode = 'biography',
    interviewSessionId: externalInterviewSessionId = null,
  } = options;

  const { session } = useAuth();
  const voiceMode: 'chapter' | GuidedVoiceMode = chapterId ? 'chapter' : mode;
  const authHeaders = session?.access_token
    ? {
        Authorization: `Bearer ${session.access_token}`,
      }
    : null;
  const sttLanguage = 'de-DE'; // Web Speech API locale for STT
  const [agentState, setAgentState] = useState<VoiceAgentState>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [biographyTransport, setBiographyTransport] = useState<'deepgram' | 'legacy'>(() => {
    if (externalInterviewSessionId) {
      return getBiographyVoiceSessionTransport(externalInterviewSessionId) ?? 'deepgram';
    }

    return 'deepgram';
  });
  const completionHandledRef = useRef(false);
  const biographyAutoStartKeyRef = useRef<string | null>(null);
  const [onboardingSessionId, setOnboardingSessionId] = useState<string | null>(null);
  const [isOnboardingResuming, setIsOnboardingResuming] = useState(false);
  const [interviewSessionId, setInterviewSessionId] = useState<string | null>(externalInterviewSessionId);
  // Refs for state machine control (avoid stale closures in callbacks)
  const processedMessageIdRef = useRef<string | null>(null);
  const isTransitioningRef = useRef(false);
  const isActiveRef = useRef(false);
  const isMutedRef = useRef(false);
  const handleBiographyVoiceError = useCallback(
    (err: Error) => {
      if (err.message.startsWith('VOICE_AGENT_FALLBACK:')) {
        if (interviewSessionId) {
          setBiographyVoiceSessionTransport(interviewSessionId, 'legacy');
        }
        setBiographyTransport('legacy');
        return;
      }

      onError?.(err);
    },
    [interviewSessionId, onError],
  );

  const deepgramBiographySession = useDeepgramVoiceSession({
    interviewSessionId,
    voice,
    onError: handleBiographyVoiceError,
    ...(onComplete ? { onComplete } : {}),
  });

  useEffect(() => {
    if (externalInterviewSessionId) {
      setInterviewSessionId(externalInterviewSessionId);
      setBiographyTransport(getBiographyVoiceSessionTransport(externalInterviewSessionId) ?? 'deepgram');
      processedMessageIdRef.current = getLastBiographyVoiceAssistantMessageId(externalInterviewSessionId);
    } else {
      processedMessageIdRef.current = null;
    }
    biographyAutoStartKeyRef.current = null;
  }, [externalInterviewSessionId]);

  // Initialize chat with AI SDK
  const { 
    messages, 
    append, 
    isLoading: isThinking,
  } = useChat({
    api:
      voiceMode === 'chapter'
        ? '/api/chat/chapter'
        : voiceMode === 'onboarding'
        ? '/api/chat'
        : '/api/chat/biography',
    ...(authHeaders ? { headers: authHeaders } : {}),
    body: {
      ...(chapterId ? { chapterId } : {}),
      ...(voiceMode === 'onboarding' && onboardingSessionId ? { sessionId: onboardingSessionId } : {}),
      ...(voiceMode === 'biography' && interviewSessionId
        ? { interviewSessionId, source: 'voice' as const }
        : {}),
    },
    initialMessages:
      voiceMode === 'biography'
        ? []
        : [
            {
              id: 'voice-welcome',
              role: 'assistant',
              content:
                voiceMode === 'chapter'
                  ? "Hallo! Ich helfe dir, deine Erinnerungen festzuhalten. Woran möchtest du dich heute erinnern?"
                  : "Willkommen zum Onboarding. Ich sammle jetzt deine Basisdaten – Herkunft, wichtige Stationen und Rahmeninfos. Antworte einfach mündlich, ich führe dich Frage für Frage durch.",
            },
          ],
  });

  // Ensure onboarding session exists (only for onboarding flow)
  const ensureOnboardingSession = useCallback(async (): Promise<string | null> => {
    if (voiceMode !== 'onboarding') return null;
    if (onboardingSessionId) return onboardingSessionId;

    try {
      const resp = await fetch('/api/onboarding/session', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeaders || {}),
        },
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
  }, [authHeaders, onboardingSessionId, voiceMode]);

  const ensureInterviewSession = useCallback(async (): Promise<string | null> => {
    if (voiceMode !== 'biography') return null;
    if (interviewSessionId) return interviewSessionId;

    try {
      const response = await fetch('/api/interview-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeaders || {}),
        },
        body: JSON.stringify({
          topics_covered: [],
          memory_count: 0,
          processing_status: 'processing',
        }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const nextSessionId = data?.data?.id ?? null;
      setInterviewSessionId(nextSessionId);
      return nextSessionId;
    } catch {
      return null;
    }
  }, [authHeaders, interviewSessionId, voiceMode]);

  // Persist onboarding messages just like text onboarding does
  const saveOnboardingMessage = useCallback(
    async (role: 'user' | 'assistant', content: string) => {
      if (voiceMode !== 'onboarding') return;
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
          headers: {
            'Content-Type': 'application/json',
            ...(authHeaders || {}),
          },
          body: JSON.stringify({
            sessionId,
            role,
            content: sanitized,
          }),
        });

        if (!resp.ok) {
          console.error('❌ Failed to save onboarding voice message');
        }
      } catch (err) {
        console.error('❌ Error saving onboarding voice message:', err);
      }
    },
    [authHeaders, ensureOnboardingSession, onboardingSessionId, voiceMode],
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

  const resumeBiographySession = useCallback(async () => {
    console.log('🎤 Resuming biography voice session without bootstrap');
    setError(null);
    setIsActive(true);
    isActiveRef.current = true;

    try {
      await startListeningInternal();
    } catch (err) {
      const resumeError =
        err instanceof Error ? err : new Error('Failed to resume biography voice session');
      setError(resumeError);
      setAgentState('error');
      onError?.(resumeError);
    }
  }, [onError, startListeningInternal]);

  // Handle utterance end - user stopped speaking
  const handleUtteranceEnd = useCallback(async (transcript: string) => {
    if (!transcript.trim()) return;
    
    console.log('🎯 Processing utterance:', transcript);
    setAgentState('thinking');
    
    try {
      if (voiceMode === 'onboarding') {
        await saveOnboardingMessage('user', transcript);
      }
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
  }, [append, onError, saveOnboardingMessage, startListeningInternal, voiceMode]);

  // Store voiceInput in ref so callbacks can access it
  const voiceInputRef = useRef<ReturnType<typeof useVoiceInput> | null>(null);

  // Initialize voice input
  const voiceInput = useVoiceInput({
    language: sttLanguage,
    utteranceEndMs: voiceMode === 'biography' ? 900 : 1500,
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
    if (voiceMode === 'biography' && interviewSessionId) {
      clearStartedBiographyVoiceSession(interviewSessionId);
    }

    if (voiceMode === 'biography' && interviewSessionId) {
      void fetch(`/api/interview-sessions?sessionId=${interviewSessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeaders || {}),
        },
        body: JSON.stringify({
          ended_at: new Date().toISOString(),
          processing_status: 'complete',
        }),
      });
    }

    setIsActive(false);
    isActiveRef.current = false;
    isTransitioningRef.current = false;
    voiceInput.stopListening();
    audioPlayer.stop();
    setAgentState('idle');
  }, [audioPlayer, authHeaders, interviewSessionId, voiceInput, voiceMode]);

  // Handle new assistant messages - trigger TTS
  useEffect(() => {
    if (!isActive) return;
    if (isThinking) return; // Wait for stream to complete

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'assistant') return;

    if (
      voiceMode === 'biography' &&
      interviewSessionId &&
      !processedMessageIdRef.current &&
      getLastBiographyVoiceAssistantMessageId(interviewSessionId) === lastMessage.id
    ) {
      processedMessageIdRef.current = lastMessage.id;
      return;
    }

    // Skip if we already processed this message
    if (processedMessageIdRef.current === lastMessage.id) return;

    const content = lastMessage.content.trim();
    if (!content) return;

    // Persist assistant turn for onboarding flow
    (async () => {
      if (voiceMode === 'onboarding') {
        await saveOnboardingMessage('assistant', content);
      }
    })();

    // Detect onboarding completion markers (voice path lacks ChatInterface detection)
    if (voiceMode === 'onboarding') {
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
          const chatSessionId = onboardingSessionId ?? (await ensureOnboardingSession());
          const requestHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(authHeaders || {}),
          };

          if (chatSessionId) {
            await fetch('/api/onboarding/session', {
              method: 'POST',
              headers: requestHeaders,
              body: JSON.stringify({
                sessionId: chatSessionId,
                markComplete: true,
              }),
            });
          }

          // Convert onboarding answers to events
          await fetch('/api/events/convert-onboarding', {
            method: 'POST',
            headers: requestHeaders,
          });

          // Stop session and bubble completion
          endSession();
          await onComplete?.();
        } catch (err) {
          console.error('❌ Failed to finalize onboarding from voice path:', err);
        }
      })();
    }
    }

    console.log('🔊 Speaking assistant message:', lastMessage.id, content.length, 'chars');
    processedMessageIdRef.current = lastMessage.id;
    if (voiceMode === 'biography' && interviewSessionId) {
      setLastBiographyVoiceAssistantMessageId(interviewSessionId, lastMessage.id);
    }

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
    authHeaders,
    voiceMode,
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
    interviewSessionId,
    onboardingSessionId,
    saveOnboardingMessage,
  ]);

  // Start voice session
  const startSession = useCallback(async () => {
    console.log('🎙️ Starting voice session');
    setError(null);
    processedMessageIdRef.current = null;
    voiceInput.resetTranscript();

    // Ensure onboarding session exists before any turns are spoken
    const onboardingSession = await ensureOnboardingSession();
    const biographySessionId = await ensureInterviewSession();
    
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

    if (voiceMode === 'biography') {
      if (!biographySessionId) {
        const sessionError = new Error('Interview session could not be started');
        setError(sessionError);
        setAgentState('error');
        setIsActive(false);
        isActiveRef.current = false;
        onError?.(sessionError);
        return;
      }

      try {
        setAgentState('thinking');
        markBiographyVoiceSessionStarted(biographySessionId, 'legacy');
        setBiographyVoiceSessionTransport(biographySessionId, 'legacy');
        setLastBiographyVoiceAssistantMessageId(biographySessionId, null);
        await append(
          {
            role: 'user',
            content: BIOGRAPHY_INTERVIEW_START_TOKEN,
          },
          {
            body: {
              interviewSessionId: biographySessionId,
              source: 'voice',
            },
            ...(authHeaders ? { headers: authHeaders } : {}),
          },
        );
      } catch (err) {
        clearStartedBiographyVoiceSession(biographySessionId);
        const bootstrapError =
          err instanceof Error ? err : new Error('Failed to bootstrap biography interview');
        setError(bootstrapError);
        setAgentState('error');
        setIsActive(false);
        isActiveRef.current = false;
        onError?.(bootstrapError);
      }
      return;
    }

    // Play welcome message first, then start listening when it ends
    const welcomeMessage = messages[0];
    if (welcomeMessage && welcomeMessage.role === 'assistant' && !isMuted) {
      console.log('🔊 Playing welcome message');
      processedMessageIdRef.current = welcomeMessage.id;
      if (voiceMode === 'onboarding' && onboardingSession && !isOnboardingResuming) {
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
    append,
    authHeaders,
    messages,
    isMuted,
    startListeningInternal,
    ensureOnboardingSession,
    ensureInterviewSession,
    saveOnboardingMessage,
    isOnboardingResuming,
    onError,
    voiceMode,
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
  const legacyBiographyStartSessionRef = useRef(startSession);
  const deepgramBiographyStartSessionRef = useRef(deepgramBiographySession.startSession);
  useEffect(() => {
    legacyBiographyStartSessionRef.current = startSession;
  }, [startSession]);
  useEffect(() => {
    deepgramBiographyStartSessionRef.current = deepgramBiographySession.startSession;
  }, [deepgramBiographySession.startSession]);
  useEffect(() => {
    if (voiceMode === 'biography') {
      return;
    }

    if (autoStart && !hasAutoStarted.current) {
      hasAutoStarted.current = true;
      startSession();
    }
  }, [autoStart, startSession, voiceMode]);

  // Cleanup on unmount
  useEffect(() => {
    if (voiceMode === 'biography') {
      return undefined;
    }

    return () => {
      voiceInput.stopListening();
      audioPlayer.stop();
    };
  }, [audioPlayer, voiceInput, voiceMode]);

  // Build conversation history for display
  const conversationHistory = messages.map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  })).filter((message) =>
    !(voiceMode === 'biography' && message.role === 'user' && message.content === BIOGRAPHY_INTERVIEW_START_TOKEN),
  );

  useEffect(() => {
    if (voiceMode !== 'biography' || !autoStart) {
      biographyAutoStartKeyRef.current = null;
      return;
    }

    const autoStartKey = `${biographyTransport}:${interviewSessionId ?? 'pending'}`;

    if (interviewSessionId && hasStartedBiographyVoiceSession(interviewSessionId)) {
      if (biographyAutoStartKeyRef.current === autoStartKey) {
        return;
      }

      biographyAutoStartKeyRef.current = autoStartKey;
      void resumeBiographySession();
      return;
    }

    if (biographyAutoStartKeyRef.current === autoStartKey) {
      return;
    }

    biographyAutoStartKeyRef.current = autoStartKey;
    if (biographyTransport === 'deepgram') {
      void deepgramBiographyStartSessionRef.current();
    } else {
      void legacyBiographyStartSessionRef.current();
    }
  }, [autoStart, biographyTransport, interviewSessionId, resumeBiographySession, voiceMode]);

  if (voiceMode === 'biography' && biographyTransport === 'deepgram') {
    return deepgramBiographySession;
  }

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
