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
  } = options;

  const { user, session } = useAuth();
  const sttLanguage = 'de-DE'; // Web Speech API locale for STT
  const [agentState, setAgentState] = useState<VoiceAgentState>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isActive, setIsActive] = useState(false);

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
          : "Hallo! Ich bin deine persönliche Erinnerungsassistentin. Erzähl mir von einem Moment, den du bewahren möchtest.",
      }
    ],
  });

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
  }, [messages, isThinking, isActive, isMuted, audioPlayer, startListeningInternal, onMemorySaved]);

  // Start voice session
  const startSession = useCallback(async () => {
    console.log('🎙️ Starting voice session');
    setError(null);
    processedMessageIdRef.current = null;
    voiceInput.resetTranscript();
    
    // Preflight: ensure microphone is available before any TTS
    try {
      await startListeningInternal();
    } catch (err) {
      console.error('❌ Mic preflight failed, aborting session start');
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
      audioPlayer.playText(welcomeMessage.content);
      // onPlayEnd will call startListeningInternal
    } else {
      // No welcome or muted - start listening directly
      await startListeningInternal();
    }
  }, [voiceInput, audioPlayer, messages, isMuted, startListeningInternal]);

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
