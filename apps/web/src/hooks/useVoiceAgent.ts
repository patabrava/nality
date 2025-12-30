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
 * Handles interruptions, utterance detection, and sentence-level TTS streaming
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
  const agentLanguage = 'de'; // Agent language (LLM + TTS) per docs
  const sttLanguage = 'de-DE'; // Web Speech API locale for STT
  const [agentState, setAgentState] = useState<VoiceAgentState>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isActive, setIsActive] = useState(false);

  // Track processed content for TTS streaming
  const processedCharCountRef = useRef(0);
  const lastAssistantIdRef = useRef<string | undefined>(undefined);
  const isProcessingUtteranceRef = useRef(false);

  // Initialize chat with AI SDK
  // Use chapter-specific endpoint if chapterId provided, otherwise generic chat
  const { 
    messages, 
    append, 
    isLoading: isThinking,
    setMessages 
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

  // Handle utterance end - user stopped speaking
  const handleUtteranceEnd = useCallback(async (transcript: string) => {
    if (!transcript.trim() || isProcessingUtteranceRef.current) return;
    
    isProcessingUtteranceRef.current = true;
    console.log('🎯 Processing utterance:', transcript);
    
    // Reset processed char count for new response
    processedCharCountRef.current = 0;
    
    // Send to AI
    try {
      await append({
        role: 'user',
        content: transcript,
      });
    } catch (err) {
      console.error('❌ Failed to send message:', err);
      const error = err instanceof Error ? err : new Error('Failed to process speech');
      setError(error);
      onError?.(error);
    } finally {
      isProcessingUtteranceRef.current = false;
    }
  }, [append, onError]);

  // Initialize voice input
  const voiceInput = useVoiceInput({
    language: sttLanguage,
    onUtteranceEnd: handleUtteranceEnd,
    onError: (err) => {
      setError(err);
      setAgentState('error');
      onError?.(err);
    },
  });

  // Initialize audio player
  const audioPlayer = useAudioPlayer({
    voice,
    onPlayStart: () => setAgentState('speaking'),
    onPlayEnd: () => {
      // Return to listening after speaking
      if (isActive && !isMuted) {
        setAgentState('listening');
      } else {
        setAgentState('idle');
      }
    },
    onError: (err) => {
      setError(err);
      onError?.(err);
    },
  });

  // Stream AI response to TTS sentence by sentence
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'assistant') return;

    // Reset processed count when a new assistant message arrives
    if (lastAssistantIdRef.current !== lastMessage.id) {
      processedCharCountRef.current = 0;
      lastAssistantIdRef.current = lastMessage.id;
    }

    const fullContent = lastMessage.content;
    const newContent = fullContent.slice(processedCharCountRef.current);

    // If nothing has been spoken yet for this message, speak the whole thing once
    if (processedCharCountRef.current === 0 && newContent.trim() && !isMuted) {
      console.log('🔊 Speaking assistant message (full):', newContent);
      audioPlayer.playText(newContent.trim());
      processedCharCountRef.current = fullContent.length;
      return;
    }

    // Find complete sentences to speak
    const sentenceRegex = /[^.!?]*[.!?]+(?:\s|$)/g;
    let match;
    let lastEndIndex = 0;

    while ((match = sentenceRegex.exec(newContent)) !== null) {
      const sentence = match[0].trim();
      if (sentence && !isMuted) {
        audioPlayer.playText(sentence);
      }
      lastEndIndex = match.index + match[0].length;
    }

    if (lastEndIndex > 0) {
      processedCharCountRef.current += lastEndIndex;
    }

    // Fallback: if no punctuation yet and stream finished, speak remaining chunk
    const remaining = newContent.slice(lastEndIndex).trim();
    if (lastEndIndex === 0 && remaining && !isThinking && !isMuted) {
      audioPlayer.playText(remaining);
      processedCharCountRef.current = fullContent.length;
    }

    // Check for memory save indicators
    const savePatterns = [
      /\[SAVE_MEMORY\]/i,
      /memory saved/i,
      /added to your timeline/i,
      /i've saved/i,
    ];

    if (savePatterns.some(p => p.test(fullContent))) {
      // Extract event ID if present
      const idMatch = fullContent.match(/event[_-]?id[:\s]+([a-z0-9-]+)/i);
      if (idMatch && idMatch[1]) {
        onMemorySaved?.(idMatch[1]);
      } else {
        onMemorySaved?.('');
      }
    }
  }, [messages, audioPlayer, isMuted, onMemorySaved]);

  // Update agent state based on sub-system states
  useEffect(() => {
    if (!isActive) {
      setAgentState('idle');
      return;
    }

    if (audioPlayer.isPlaying) {
      setAgentState('speaking');
    } else if (isThinking) {
      setAgentState('thinking');
    } else if (voiceInput.isListening) {
      setAgentState('listening');
    } else {
      setAgentState('idle');
    }
  }, [isActive, audioPlayer.isPlaying, isThinking, voiceInput.isListening]);

  // Start voice session
  const startSession = useCallback(async () => {
    console.log('🎙️ Starting voice session');
    setIsActive(true);
    setError(null);
    processedCharCountRef.current = 0;
    
    try {
      await voiceInput.startListening();
      
      // Play welcome message if we have one
      const firstMessage = messages[0];
      if (messages.length > 0 && firstMessage && firstMessage.role === 'assistant') {
        audioPlayer.playText(firstMessage.content);
      }
    } catch (err) {
      console.error('❌ Failed to start voice session:', err);
      const error = err instanceof Error ? err : new Error('Failed to start voice session');
      setError(error);
      setAgentState('error');
      onError?.(error);
    }
  }, [voiceInput, audioPlayer, messages, onError]);

  // End voice session
  const endSession = useCallback(() => {
    console.log('🛑 Ending voice session');
    setIsActive(false);
    voiceInput.stopListening();
    audioPlayer.stop();
    setAgentState('idle');
  }, [voiceInput, audioPlayer]);

  // Toggle mute (stop TTS playback)
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      if (!prev) {
        // Muting - stop current playback
        audioPlayer.stop();
      }
      return !prev;
    });
  }, [audioPlayer]);

  // Auto-start if enabled (run only once on mount)
  const hasAutoStarted = useRef(false);
  
  useEffect(() => {
    if (autoStart && !hasAutoStarted.current) {
      hasAutoStarted.current = true;
      startSession();
    }
  }, [autoStart]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount (run once)
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
