'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

type VoiceInputState = 'idle' | 'connecting' | 'listening' | 'error';

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface UseVoiceInputOptions {
  onTranscript?: (text: string, isFinal: boolean) => void;
  onUtteranceEnd?: (fullTranscript: string) => void;
  onError?: (error: Error) => void;
  language?: string;
  interimResults?: boolean;
  utteranceEndMs?: number;
}

interface UseVoiceInputReturn {
  state: VoiceInputState;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: Error | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
  resetTranscript: () => void;
}

/**
 * useVoiceInput Hook
 * Uses the Web Speech API for real-time speech-to-text transcription
 * Works natively in Chrome, Edge, and Safari without API keys
 */
export function useVoiceInput(options: UseVoiceInputOptions = {}): UseVoiceInputReturn {
  const {
    onTranscript,
    onUtteranceEnd,
    onError,
    language = 'en-US',
    interimResults = true,
  } = options;

  const [state, setState] = useState<VoiceInputState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<Error | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptRef = useRef('');
  const isListeningRef = useRef(false);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const networkErrorCountRef = useRef(0);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const preflightStreamRef = useRef<MediaStream | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // Ignore errors during cleanup
      }
      recognitionRef.current = null;
    }
    
    if (preflightStreamRef.current) {
      preflightStreamRef.current.getTracks().forEach(t => t.stop());
      preflightStreamRef.current = null;
    }
    
    isListeningRef.current = false;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const startListening = useCallback(async () => {
    if (state === 'listening' || state === 'connecting') {
      return;
    }

    // Check for Web Speech API support
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      const err = new Error('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.');
      setError(err);
      onError?.(err);
      setState('error');
      return;
    }

    try {
      // Best-effort device enumeration for logging; do not hard-fail if empty (browser may hide devices pre-permission)
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(d => d.kind === 'audioinput');
        if (audioInputs.length === 0) {
          console.warn('⚠️ No audioinput devices reported before permission prompt; attempting getUserMedia anyway.');
        }
      } catch (e) {
        console.warn('⚠️ enumerateDevices failed (continuing):', e);
      }

      setError(null);
      setState('connecting');
      transcriptRef.current = '';
      setTranscript('');
      setInterimTranscript('');

      // Request microphone permission first (with retries and minimal constraints)
      const requestMic = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true } });
          preflightStreamRef.current = stream;
          stream.getTracks().forEach(t => t.stop()); // release device so SpeechRecognition can attach
          preflightStreamRef.current = null;
        } catch (err) {
          console.warn('⚠️ getUserMedia with echoCancellation failed, retrying with plain audio:', err);
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          preflightStreamRef.current = stream;
          stream.getTracks().forEach(t => t.stop()); // release device
          preflightStreamRef.current = null;
        }
      };

      try {
        await requestMic();
      } catch (err) {
        // Retry once after a short delay in case the device list initializes late
        console.warn('⚠️ getUserMedia failed, retrying once after delay:', err);
        await new Promise(res => setTimeout(res, 400));
        await requestMic();
      }
      
      console.log('🎤 Starting Web Speech API recognition...');
      
      const recognition = new SpeechRecognitionAPI();
      recognitionRef.current = recognition;
      
      recognition.continuous = true;
      recognition.interimResults = interimResults;
      recognition.lang = language;

      recognition.onstart = () => {
        console.log('🎤 Speech recognition started');
        setState('listening');
        isListeningRef.current = true;
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interim = '';

        // Clear silence timeout on new speech
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result && result[0]) {
            const text = result[0].transcript;
            
            if (result.isFinal) {
              finalTranscript += text;
            } else {
              interim += text;
            }
          }
        }

        if (finalTranscript) {
          transcriptRef.current = (transcriptRef.current + ' ' + finalTranscript).trim();
          setTranscript(transcriptRef.current);
          setInterimTranscript('');
          onTranscript?.(finalTranscript, true);
          
          // Set silence timeout for utterance end detection
          silenceTimeoutRef.current = setTimeout(() => {
            if (transcriptRef.current.trim() && isListeningRef.current) {
              console.log('🔇 Silence detected - triggering utterance end');
              onUtteranceEnd?.(transcriptRef.current.trim());
              transcriptRef.current = '';
              setTranscript('');
            }
          }, 1500); // 1.5 second silence = end of utterance
        }

        if (interim) {
          setInterimTranscript(interim);
          onTranscript?.(interim, false);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        // Handle specific errors
        if (event.error === 'not-allowed') {
          console.error('❌ Speech recognition error:', event.error);
          const err = new Error('Microphone access denied. Please allow microphone access.');
          setError(err);
          onError?.(err);
          setState('error');
          cleanup();
        } else if (event.error === 'audio-capture') {
          console.error('❌ Speech recognition error: audio-capture (mic busy or unavailable)');
          const err = new Error('Microphone not available. Close other apps using the mic and retry.');
          setError(err);
          onError?.(err);
          setState('error');
          cleanup();
        } else if (event.error === 'service-not-allowed') {
          console.error('❌ Speech recognition error: service-not-allowed');
          const err = new Error('Speech service blocked. Please allow microphone and retry.');
          setError(err);
          onError?.(err);
          setState('error');
          cleanup();
        } else if (event.error === 'no-speech') {
          // No speech detected - this is normal, just continue
          console.log('ℹ️ No speech detected, continuing...');
        } else if (event.error === 'aborted') {
          // Aborted is expected when we call stop/abort - not an error
          console.log('ℹ️ Speech recognition aborted (expected on stop)');
        } else if (event.error === 'network') {
          // Chrome occasionally emits transient network errors; ignore first few
          networkErrorCountRef.current += 1;
          const attempts = networkErrorCountRef.current;
          console.warn(`⚠️ Speech recognition network hiccup (attempt ${attempts}) - continuing`);
          if (attempts >= 3) {
            const err = new Error('Speech recognition network issue. Please retry or switch browser (Chrome/Safari recommended).');
            setError(err);
            onError?.(err);
            setState('error');
          }
        } else {
          // For other errors, log but continue
          console.log(`ℹ️ Speech event: ${event.error}, continuing...`);
        }
      };

      recognition.onend = () => {
        console.log('🔌 Speech recognition ended');
        
        // Auto-restart if we're still supposed to be listening
        if (isListeningRef.current && state !== 'error') {
          console.log('🔄 Restarting speech recognition...');
          try {
            recognition.start();
          } catch (e) {
            console.log('Could not restart recognition:', e);
            setState('idle');
          }
        } else {
          setState('idle');
        }
      };

      recognition.start();

    } catch (err) {
      console.error('❌ Failed to start voice input:', err);
      const error = err instanceof Error ? err : new Error('Failed to start voice input');
      setError(error);
      onError?.(error);
      setState('error');
      cleanup();
    }
  }, [state, language, interimResults, onTranscript, onUtteranceEnd, onError, cleanup]);

  const stopListening = useCallback(() => {
    console.log('🛑 Stopping voice input');
    isListeningRef.current = false;
    networkErrorCountRef.current = 0;
    
    // Trigger utterance end callback with final transcript
    if (transcriptRef.current.trim()) {
      onUtteranceEnd?.(transcriptRef.current.trim());
    }
    
    cleanup();
    setState('idle');
  }, [cleanup, onUtteranceEnd]);

  const resetTranscript = useCallback(() => {
    transcriptRef.current = '';
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    state,
    isListening: state === 'listening',
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
