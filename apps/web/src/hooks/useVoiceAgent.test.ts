import { afterEach, describe, expect, it } from 'vitest';
import {
  clearStartedBiographyVoiceSession,
  getBiographyVoiceSessionTransport,
  getLastBiographyVoiceAssistantMessageId,
  hasStartedBiographyVoiceSession,
  markBiographyVoiceSessionStarted,
  setLastBiographyVoiceAssistantMessageId,
} from './biographyVoiceSessionRegistry';

describe('useVoiceAgent biography session registry', () => {
  const sessionId = '11111111-1111-1111-1111-111111111111';

  afterEach(() => {
    clearStartedBiographyVoiceSession(sessionId);
  });

  it('tracks started biography voice sessions by interview session id', () => {
    expect(hasStartedBiographyVoiceSession(sessionId)).toBe(false);
    expect(getBiographyVoiceSessionTransport(sessionId)).toBe(null);
    expect(getLastBiographyVoiceAssistantMessageId(sessionId)).toBe(null);

    markBiographyVoiceSessionStarted(sessionId, 'legacy');
    expect(hasStartedBiographyVoiceSession(sessionId)).toBe(true);
    expect(getBiographyVoiceSessionTransport(sessionId)).toBe('legacy');

    setLastBiographyVoiceAssistantMessageId(sessionId, 'assistant-1');
    expect(getLastBiographyVoiceAssistantMessageId(sessionId)).toBe('assistant-1');

    clearStartedBiographyVoiceSession(sessionId);
    expect(hasStartedBiographyVoiceSession(sessionId)).toBe(false);
    expect(getBiographyVoiceSessionTransport(sessionId)).toBe(null);
    expect(getLastBiographyVoiceAssistantMessageId(sessionId)).toBe(null);
  });
});
