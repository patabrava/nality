'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';

type VoiceAgentState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type VoiceAgentBootstrap =
  | {
      interviewSessionId: string;
      transport: 'deepgram';
      deepgramToken: string;
      websocketUrl: string;
      settings: Record<string, unknown>;
    }
  | {
      interviewSessionId: string;
      transport: 'legacy';
      fallbackReason?: string;
    };

type DeepgramVoiceAgentBootstrap = Extract<VoiceAgentBootstrap, { transport: 'deepgram' }>;

type UseDeepgramVoiceSessionOptions = {
  interviewSessionId?: string | null;
  voice?: string;
  onError?: (error: Error) => void;
  onComplete?: () => Promise<void> | void;
};

type UseDeepgramVoiceSessionReturn = {
  agentState: VoiceAgentState;
  isActive: boolean;
  liveTranscript: string;
  conversationHistory: ConversationMessage[];
  error: Error | null;
  startSession: () => Promise<void>;
  endSession: () => void;
  toggleMute: () => void;
  isMuted: boolean;
};

type VoiceAgentEvent = {
  type?: string;
  role?: string;
  content?: string;
  text?: string;
  message?: string;
};

function extractEventText(event: VoiceAgentEvent) {
  const raw = event.content || event.text || event.message || '';
  return typeof raw === 'string' ? raw.trim() : '';
}

function downsampleTo16k(input: Float32Array, sourceSampleRate: number) {
  if (sourceSampleRate === 16000) {
    return input;
  }

  const ratio = sourceSampleRate / 16000;
  const newLength = Math.round(input.length / ratio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;

  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
    let accum = 0;
    let count = 0;
    for (let index = offsetBuffer; index < nextOffsetBuffer && index < input.length; index += 1) {
      accum += input[index] || 0;
      count += 1;
    }
    result[offsetResult] = count > 0 ? accum / count : 0;
    offsetResult += 1;
    offsetBuffer = nextOffsetBuffer;
  }

  return result;
}

function floatTo16BitPcm(float32: Float32Array) {
  const buffer = new ArrayBuffer(float32.length * 2);
  const view = new DataView(buffer);
  for (let index = 0; index < float32.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, float32[index] || 0));
    view.setInt16(index * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }
  return buffer;
}

function pcm16ToAudioBuffer(
  context: AudioContext,
  pcmBytes: ArrayBuffer,
  sampleRate: number,
) {
  const pcm = new Int16Array(pcmBytes);
  const audioBuffer = context.createBuffer(1, pcm.length, sampleRate);
  const channelData = audioBuffer.getChannelData(0);
  for (let index = 0; index < pcm.length; index += 1) {
    channelData[index] = (pcm[index] || 0) / 0x7fff;
  }
  return audioBuffer;
}

export function useDeepgramVoiceSession(
  options: UseDeepgramVoiceSessionOptions = {},
): UseDeepgramVoiceSessionReturn {
  const {
    interviewSessionId: externalInterviewSessionId = null,
    voice = 'aura-2-elara-de',
    onError,
  } = options;

  const { session } = useAuth();
  const [agentState, setAgentState] = useState<VoiceAgentState>('idle');
  const [isActive, setIsActive] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorSinkRef = useRef<GainNode | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const playbackTimeRef = useRef(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const isActiveRef = useRef(false);
  const isMutedRef = useRef(false);
  const settingsAppliedRef = useRef(false);
  const interviewSessionIdRef = useRef<string | null>(externalInterviewSessionId);
  const metricsRef = useRef<Record<string, number>>({});
  const keepAliveRef = useRef<number | null>(null);

  useEffect(() => {
    interviewSessionIdRef.current = externalInterviewSessionId;
  }, [externalInterviewSessionId]);

  const reportError = useCallback(
    (nextError: Error) => {
      setError(nextError);
      setAgentState('error');
      onError?.(nextError);
    },
    [onError],
  );

  const stopPlayback = useCallback(() => {
    for (const source of activeSourcesRef.current) {
      try {
        source.stop();
      } catch {
        // Ignore already-finished sources.
      }
    }
    activeSourcesRef.current = [];
    playbackTimeRef.current = 0;
  }, []);

  const closeAudioInput = useCallback(() => {
    processorRef.current?.disconnect();
    sourceNodeRef.current?.disconnect();
    processorSinkRef.current?.disconnect();
    processorRef.current = null;
    sourceNodeRef.current = null;
    processorSinkRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (inputContextRef.current) {
      void inputContextRef.current.close();
      inputContextRef.current = null;
    }
  }, []);

  const teardown = useCallback(() => {
    settingsAppliedRef.current = false;
    isActiveRef.current = false;
    setIsActive(false);
    setLiveTranscript('');
    stopPlayback();
    closeAudioInput();

    if (keepAliveRef.current !== null) {
      window.clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }

    if (wsRef.current) {
      const socket = wsRef.current;
      wsRef.current = null;
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close();
      }
    }
  }, [closeAudioInput, stopPlayback]);

  const ensurePlaybackContext = useCallback(async () => {
    if (!playbackContextRef.current) {
      playbackContextRef.current = new AudioContext({ sampleRate: 24000 });
    }

    if (playbackContextRef.current.state === 'suspended') {
      await playbackContextRef.current.resume();
    }

    return playbackContextRef.current;
  }, []);

  const handleAudioChunk = useCallback(
    async (buffer: ArrayBuffer) => {
      if (isMutedRef.current || !isActiveRef.current) {
        return;
      }

      const context = await ensurePlaybackContext();
      const audioBuffer = pcm16ToAudioBuffer(context, buffer, 24000);
      const source = context.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(context.destination);

      const now = context.currentTime;
      const startAt = playbackTimeRef.current > now ? playbackTimeRef.current : now + 0.01;
      playbackTimeRef.current = startAt + audioBuffer.duration;
      activeSourcesRef.current.push(source);

      if (!metricsRef.current.firstAudioByteAt) {
        metricsRef.current.firstAudioByteAt = performance.now();
      }

      source.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter((entry) => entry !== source);
        if (activeSourcesRef.current.length === 0 && isActiveRef.current && !isMutedRef.current) {
          metricsRef.current.playbackEndedAt = performance.now();
        }
      };

      source.start(startAt);
      setAgentState('speaking');
    },
    [ensurePlaybackContext],
  );

  const startMicrophoneStream = useCallback(async () => {
    if (!wsRef.current || settingsAppliedRef.current === false) {
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    streamRef.current = stream;
    metricsRef.current.micOpenedAt = performance.now();

    const context = new AudioContext();
    inputContextRef.current = context;
    const sourceNode = context.createMediaStreamSource(stream);
    sourceNodeRef.current = sourceNode;
    const processor = context.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;
    const sink = context.createGain();
    sink.gain.value = 0;
    processorSinkRef.current = sink;

    processor.onaudioprocess = (event) => {
      const socket = wsRef.current;
      if (!socket || socket.readyState !== WebSocket.OPEN || !settingsAppliedRef.current) {
        return;
      }

      const channelData = event.inputBuffer.getChannelData(0);
      const downsampled = downsampleTo16k(channelData, context.sampleRate);
      const pcm = floatTo16BitPcm(downsampled);
      socket.send(pcm);
    };

    sourceNode.connect(processor);
    processor.connect(sink);
    sink.connect(context.destination);
    setAgentState('listening');
  }, []);

  const fetchBootstrap = useCallback(async (): Promise<DeepgramVoiceAgentBootstrap> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }

    const response = await fetch('/api/voice/agent/session', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...(interviewSessionIdRef.current ? { interviewSessionId: interviewSessionIdRef.current } : {}),
        voice,
      }),
    });

    if (!response.ok) {
      throw new Error('Voice agent session bootstrap failed');
    }

    const payload = (await response.json()) as {
      data?: VoiceAgentBootstrap;
    };

    if (!payload.data) {
      throw new Error('Voice agent session bootstrap missing data');
    }

    if (payload.data.transport === 'legacy') {
      throw new Error(
        `VOICE_AGENT_FALLBACK:${payload.data.fallbackReason || 'legacy voice transport required'}`,
      );
    }

    interviewSessionIdRef.current = payload.data.interviewSessionId;
    return payload.data;
  }, [session?.access_token, voice]);

  const appendConversation = useCallback((message: ConversationMessage) => {
    setConversationHistory((current) => {
      const previous = current[current.length - 1];
      if (previous?.role === message.role && previous.content === message.content) {
        return current;
      }
      return [...current, message];
    });
  }, []);

  const handleServerEvent = useCallback(
    async (event: VoiceAgentEvent, bootstrap: DeepgramVoiceAgentBootstrap) => {
      const eventType = event.type || '';

      if (eventType === 'Welcome') {
        wsRef.current?.send(JSON.stringify({ type: 'Settings', ...bootstrap.settings }));
        return;
      }

      if (eventType === 'SettingsApplied') {
        settingsAppliedRef.current = true;
        await startMicrophoneStream();
        return;
      }

      if (eventType === 'UserStartedSpeaking') {
        stopPlayback();
        setAgentState('listening');
        metricsRef.current.userStartedSpeakingAt = performance.now();
        return;
      }

      if (eventType === 'AgentThinking') {
        setLiveTranscript('');
        setAgentState('thinking');
        metricsRef.current.agentThinkingAt = performance.now();
        return;
      }

      if (eventType === 'AgentAudioDone') {
        setLiveTranscript('');
        if (isActiveRef.current) {
          setAgentState('listening');
        }
        return;
      }

      if (eventType === 'ConversationText') {
        const text = extractEventText(event);
        if (!text) {
          return;
        }

        const role = event.role === 'assistant' ? 'assistant' : event.role === 'user' ? 'user' : null;
        if (role === 'assistant') {
          appendConversation({ role, content: text });
          setAgentState('speaking');
        } else if (role === 'user') {
          if (!metricsRef.current.firstTranscriptAt) {
            metricsRef.current.firstTranscriptAt = performance.now();
          }
          setLiveTranscript(text);
          appendConversation({ role, content: text });
          metricsRef.current.userTurnEndedAt = performance.now();
        }
        return;
      }

      if (eventType === 'Error') {
        reportError(new Error(extractEventText(event) || 'Deepgram voice agent error'));
      }
    },
    [appendConversation, reportError, startMicrophoneStream, stopPlayback],
  );

  const endSession = useCallback(() => {
    const sessionId = interviewSessionIdRef.current;
    teardown();
    setAgentState('idle');

    if (sessionId) {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      void fetch(`/api/interview-sessions?sessionId=${sessionId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          ended_at: new Date().toISOString(),
          processing_status: 'complete',
        }),
      });
    }
  }, [session?.access_token, teardown]);

  const startSession = useCallback(async () => {
    if (isActiveRef.current) {
      return;
    }

    try {
      setError(null);
      setConversationHistory([]);
      setLiveTranscript('');
      const bootstrap = await fetchBootstrap();
      const socket = new WebSocket(bootstrap.websocketUrl, ['token', bootstrap.deepgramToken]);
      socket.binaryType = 'arraybuffer';
      wsRef.current = socket;
      isActiveRef.current = true;
      setIsActive(true);
      metricsRef.current = {};

      socket.onopen = () => {
        setAgentState('thinking');
        keepAliveRef.current = window.setInterval(() => {
          const currentSocket = wsRef.current;
          if (currentSocket?.readyState === WebSocket.OPEN) {
            currentSocket.send(JSON.stringify({ type: 'KeepAlive' }));
          }
        }, 8000);
      };

      socket.onmessage = async (message) => {
        if (typeof message.data === 'string') {
          try {
            const event = JSON.parse(message.data) as VoiceAgentEvent;
            await handleServerEvent(event, bootstrap);
          } catch {
            // Ignore malformed event payloads.
          }
          return;
        }

        if (message.data instanceof ArrayBuffer) {
          void handleAudioChunk(message.data);
          return;
        }

        if (message.data instanceof Blob) {
          void message.data.arrayBuffer().then(handleAudioChunk);
        }
      };

      socket.onerror = () => {
        reportError(new Error('Deepgram voice agent connection failed'));
      };

      socket.onclose = () => {
        const shouldReport = isActiveRef.current;
        teardown();
        if (shouldReport) {
          reportError(new Error('Deepgram voice agent connection closed'));
        }
      };
    } catch (nextError) {
      const resolved = nextError instanceof Error ? nextError : new Error('Failed to start voice session');
      teardown();
      reportError(resolved);
    }
  }, [fetchBootstrap, handleAudioChunk, handleServerEvent, reportError, teardown]);

  const toggleMute = useCallback(() => {
    setIsMuted((current) => {
      const next = !current;
      isMutedRef.current = next;
      if (next) {
        stopPlayback();
      }
      return next;
    });
  }, [stopPlayback]);

  useEffect(() => {
    return () => {
      teardown();
      if (playbackContextRef.current) {
        void playbackContextRef.current.close();
        playbackContextRef.current = null;
      }
    };
  }, [teardown]);

  return {
    agentState,
    isActive,
    liveTranscript,
    conversationHistory,
    error,
    startSession,
    endSession,
    toggleMute,
    isMuted,
  };
}
