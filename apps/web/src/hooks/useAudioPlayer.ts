'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

type AudioPlayerState = 'idle' | 'loading' | 'playing' | 'error';

interface UseAudioPlayerOptions {
  voice?: string;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  onError?: (error: Error) => void;
}

interface UseAudioPlayerReturn {
  state: AudioPlayerState;
  isPlaying: boolean;
  isLoading: boolean;
  error: Error | null;
  queueLength: number;
  resume: () => Promise<void>;
  playText: (text: string) => Promise<void>;
  stop: () => void;
  clearQueue: () => void;
}

/**
 * useAudioPlayer Hook
 * Manages TTS audio playback with queuing support
 * Plays sentences sequentially for natural conversation flow
 */
export function useAudioPlayer(options: UseAudioPlayerOptions = {}): UseAudioPlayerReturn {
  const {
    voice = 'aura-asteria-en',
    onPlayStart,
    onPlayEnd,
    onError,
  } = options;

  const [state, setState] = useState<AudioPlayerState>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [queueLength, setQueueLength] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const queueRef = useRef<string[]>([]);
  const isProcessingRef = useRef(false);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize AudioContext lazily (requires user interaction)
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  // Process the queue
  const processQueue = useCallback(async () => {
    if (isProcessingRef.current || queueRef.current.length === 0) {
      return;
    }

    isProcessingRef.current = true;
    const text = queueRef.current.shift();
    setQueueLength(queueRef.current.length);

    if (!text) {
      isProcessingRef.current = false;
      setState('idle');
      return;
    }

    try {
      setState('loading');
      setError(null);

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      // Fetch audio from TTS API
      const preview = text.length > 60 ? `${text.slice(0, 60)}…` : text;
      console.log(`🔊 Requesting TTS (${voice}):`, preview);

      const response = await fetch('/api/voice/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const bodyText = await response.text().catch(() => '');
        throw new Error(`Failed to generate speech (${response.status}): ${bodyText || response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioContext = getAudioContext();

      // Resume context if suspended (Safari/auto-play requirement)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Decode audio data
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Create and play source
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      currentSourceRef.current = source;

      setState('playing');
      onPlayStart?.();

      // Wait for playback to complete
      await new Promise<void>((resolve) => {
        source.onended = () => resolve();
        source.start(0);
      });

      currentSourceRef.current = null;
      
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Playback was intentionally stopped
        console.log('🔇 Audio playback aborted');
      } else {
        console.error('❌ Audio playback error:', err);
        const error = err instanceof Error ? err : new Error('Audio playback failed');
        setError(error);
        onError?.(error);
        setState('error');
      }
    } finally {
      isProcessingRef.current = false;
      abortControllerRef.current = null;

      // Process next item in queue
      if (queueRef.current.length > 0) {
        processQueue();
      } else {
        setState('idle');
        onPlayEnd?.();
      }
    }
  }, [voice, getAudioContext, onPlayStart, onPlayEnd, onError]);

  // Ensure AudioContext is resumed (call after user gesture)
  const resume = useCallback(async () => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
  }, [getAudioContext]);

  // Add text to queue and start processing
  const playText = useCallback(async (text: string) => {
    if (!text.trim()) return;

    queueRef.current.push(text);
    setQueueLength(queueRef.current.length);
    
    // Start processing if not already
    processQueue();
  }, [processQueue]);

  // Stop playback and clear queue
  const stop = useCallback(() => {
    // Abort any pending requests
    abortControllerRef.current?.abort();

    // Stop current audio
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch (e) {
        // Ignore errors if already stopped
      }
      currentSourceRef.current = null;
    }

    // Clear queue
    queueRef.current = [];
    setQueueLength(0);
    isProcessingRef.current = false;
    setState('idle');
  }, []);

  // Clear queue without stopping current playback
  const clearQueue = useCallback(() => {
    queueRef.current = [];
    setQueueLength(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [stop]);

  return {
    state,
    isPlaying: state === 'playing',
    isLoading: state === 'loading',
    error,
    queueLength,
    resume,
    playText,
    stop,
    clearQueue,
  };
}
