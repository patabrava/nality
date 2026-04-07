import { createHmac, timingSafeEqual } from 'node:crypto';
import { getRequiredEnv } from '@/lib/server/env';

type VoiceAgentThinkTokenPayload = {
  userId: string;
  interviewSessionId: string;
  exp: number;
};

function getVoiceAgentSecret() {
  return getRequiredEnv('DEEPGRAM_KEY');
}

function encodeBase64Url(input: string) {
  return Buffer.from(input, 'utf8').toString('base64url');
}

function decodeBase64Url(input: string) {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function signValue(value: string) {
  return createHmac('sha256', getVoiceAgentSecret()).update(value).digest('base64url');
}

export function createVoiceAgentThinkToken(payload: VoiceAgentThinkTokenPayload) {
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = signValue(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifyVoiceAgentThinkToken(token: string): VoiceAgentThinkTokenPayload | null {
  const [encodedPayload, providedSignature] = token.split('.');
  if (!encodedPayload || !providedSignature) {
    return null;
  }

  const expectedSignature = signValue(encodedPayload);
  const providedBuffer = Buffer.from(providedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as VoiceAgentThinkTokenPayload;
    if (!payload.userId || !payload.interviewSessionId || payload.exp <= Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
