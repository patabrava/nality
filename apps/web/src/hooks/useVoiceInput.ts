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
    language = 'de-DE',
    interimResults = true,
    utteranceEndMs = 1500,
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
      const err = new Error('Die Spracherkennung wird in diesem Browser nicht unterstützt. Bitte nutze Chrome, Edge oder Safari.');
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

      // Request microphone permission with robust retries
      const requestMic = async (attempt = 1): Promise<void> => {
        const maxAttempts = 3;
        const constraints = [
          { audio: { echoCancellation: true } },
          { audio: true },
          { audio: { deviceId: 'default' } },
        ];

        for (const constraint of constraints) {
          try {
            console.log(`🎤 Attempting getUserMedia (attempt ${attempt}):`, JSON.stringify(constraint));
            const stream = await navigator.mediaDevices.getUserMedia(constraint);
            preflightStreamRef.current = stream;
            stream.getTracks().forEach(t => t.stop()); // release device so SpeechRecognition can attach
            preflightStreamRef.current = null;
            console.log('✅ Microphone access granted');
            return; // Success!
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : String(err);
            console.warn(`⚠️ getUserMedia failed with constraint ${JSON.stringify(constraint)}:`, errMsg);
            // Continue to next constraint
          }
        }

        // All constraints failed for this attempt
        if (attempt < maxAttempts) {
          console.warn(`⚠️ All constraints failed, retrying after delay (attempt ${attempt}/${maxAttempts})...`);
          await new Promise(res => setTimeout(res, 500 * attempt));
          // Re-enumerate devices to refresh browser's device cache
          try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioInputs = devices.filter(d => d.kind === 'audioinput');
            console.log(`🔍 Found ${audioInputs.length} audio input device(s) after re-enumeration`);
            if (audioInputs.length === 0) {
              throw new Error('Es wurde kein Mikrofon erkannt. Bitte schließe ein Mikrofon an und versuche es erneut.');
            }
          } catch (enumErr) {
            console.warn('⚠️ Device re-enumeration failed:', enumErr);
          }
          return requestMic(attempt + 1);
        }

        // Final failure - throw descriptive error
        throw new Error('Auf das Mikrofon kann nicht zugegriffen werden. Bitte prüfe Verbindung und Browser-Berechtigungen und versuche es erneut.');
      };

      await requestMic()
      
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
              const fullTranscript = transcriptRef.current.trim();
              isListeningRef.current = false;
              transcriptRef.current = '';
              setTranscript('');
              setInterimTranscript('');
              try {
                recognitionRef.current?.stop();
              } catch (stopError) {
                console.warn('⚠️ Failed to stop speech recognition after utterance end:', stopError);
              }
              onUtteranceEnd?.(fullTranscript);
            }
          }, utteranceEndMs);
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
          const err = new Error('Der Mikrofonzugriff wurde verweigert. Bitte erlaube den Zugriff auf das Mikrofon.');
          setError(err);
          onError?.(err);
          setState('error');
          cleanup();
        } else if (event.error === 'audio-capture') {
          console.error('❌ Speech recognition error: audio-capture (mic busy or unavailable)');
          const err = new Error('Das Mikrofon ist nicht verfügbar. Schließe andere Apps, die das Mikrofon nutzen, und versuche es erneut.');
          setError(err);
          onError?.(err);
          setState('error');
          cleanup();
        } else if (event.error === 'service-not-allowed') {
          console.error('❌ Speech recognition error: service-not-allowed');
          const err = new Error('Der Sprachdienst ist blockiert. Bitte erlaube den Mikrofonzugriff und versuche es erneut.');
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
            const err = new Error('Netzwerkproblem bei der Spracherkennung. Bitte versuche es erneut oder wechsle den Browser (Chrome oder Safari empfohlen).');
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
      const error = err instanceof Error ? err : new Error('Die Spracheingabe konnte nicht gestartet werden');
      setError(error);
      onError?.(error);
      setState('error');
      cleanup();
    }
  }, [state, language, interimResults, onTranscript, onUtteranceEnd, onError, cleanup, utteranceEndMs]);

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
