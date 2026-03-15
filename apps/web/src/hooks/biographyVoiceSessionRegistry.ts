type BiographyVoiceRegistryHost = typeof globalThis & {
  __nalityBiographyVoiceSessionState?: Map<string, BiographyVoiceSessionState>;
};

type BiographyVoiceTransport = 'deepgram' | 'legacy';

type BiographyVoiceSessionState = {
  started: boolean;
  transport: BiographyVoiceTransport;
  lastAssistantMessageId: string | null;
};

function getBiographyVoiceSessionStateMap(): Map<string, BiographyVoiceSessionState> {
  const host = globalThis as BiographyVoiceRegistryHost;
  if (!host.__nalityBiographyVoiceSessionState) {
    host.__nalityBiographyVoiceSessionState = new Map<string, BiographyVoiceSessionState>();
  }

  return host.__nalityBiographyVoiceSessionState;
}

function getOrCreateBiographyVoiceSessionState(sessionId: string): BiographyVoiceSessionState {
  const stateMap = getBiographyVoiceSessionStateMap();
  const existingState = stateMap.get(sessionId);
  if (existingState) {
    return existingState;
  }

  const nextState: BiographyVoiceSessionState = {
    started: false,
    transport: 'deepgram',
    lastAssistantMessageId: null,
  };
  stateMap.set(sessionId, nextState);
  return nextState;
}

export function hasStartedBiographyVoiceSession(sessionId: string): boolean {
  return getBiographyVoiceSessionStateMap().get(sessionId)?.started === true;
}

export function markBiographyVoiceSessionStarted(
  sessionId: string,
  transport: BiographyVoiceTransport,
): void {
  const state = getOrCreateBiographyVoiceSessionState(sessionId);
  state.started = true;
  state.transport = transport;
}

export function getBiographyVoiceSessionTransport(
  sessionId: string,
): BiographyVoiceTransport | null {
  return getBiographyVoiceSessionStateMap().get(sessionId)?.transport ?? null;
}

export function setBiographyVoiceSessionTransport(
  sessionId: string,
  transport: BiographyVoiceTransport,
): void {
  const state = getOrCreateBiographyVoiceSessionState(sessionId);
  state.transport = transport;
}

export function getLastBiographyVoiceAssistantMessageId(sessionId: string): string | null {
  return getBiographyVoiceSessionStateMap().get(sessionId)?.lastAssistantMessageId ?? null;
}

export function setLastBiographyVoiceAssistantMessageId(
  sessionId: string,
  messageId: string | null,
): void {
  const state = getOrCreateBiographyVoiceSessionState(sessionId);
  state.lastAssistantMessageId = messageId;
}

export function clearStartedBiographyVoiceSession(sessionId: string): void {
  getBiographyVoiceSessionStateMap().delete(sessionId);
}
