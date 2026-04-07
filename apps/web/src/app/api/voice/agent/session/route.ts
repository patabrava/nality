import { z } from 'zod';
import type { InterviewSessionInput } from '@nality/schema';
import {
  authenticationRequiredResponse,
  getAuthenticatedRequestContext,
} from '@/lib/server/auth';
import { jsonFailure, jsonSuccess, zodErrorDetails } from '@/lib/server/api';
import { getOptionalEnv, getRequiredEnv } from '@/lib/server/env';
import { createRouteLogger } from '@/lib/server/logger';
import { createVoiceAgentThinkToken } from '@/lib/server/voice-agent';
import { createServiceClient } from '@/lib/supabase/server';
import { BIOGRAPHY_INTERVIEW_START_TOKEN } from '@/lib/biography/interview';
import { BIOGRAPHY_INTERVIEW_CATALOG_VERSION } from '@/features/biography-interview/catalog';
import { seedInterviewQuestionProgress } from '@/features/biography-interview/progress-store';
import {
  buildBiographyVoiceAgentRuntimeContext,
  generateBiographyInterviewReply,
  prepareBiographyInterviewTurn,
} from '@/features/biography-interview/respond';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const VoiceAgentSessionBodySchema = z.object({
  interviewSessionId: z.string().uuid().optional(),
  voice: z.string().optional(),
});

type DeepgramGrantResponse = {
  key?: string;
  token?: string;
  access_token?: string;
};

type DeepgramTempTokenResult =
  | { ok: true; token: string }
  | { ok: false; reason: 'INSUFFICIENT_PERMISSIONS' };

async function createInterviewSession(userId: string) {
  const serviceClient = await createServiceClient();
  const payload: InterviewSessionInput = {
    user_id: userId,
    started_at: new Date().toISOString(),
    ended_at: null,
    topics_covered: [],
    memory_count: 0,
    processing_status: 'processing',
    summary: null,
    catalog_version: BIOGRAPHY_INTERVIEW_CATALOG_VERSION,
    active_question_id: null,
  };

  const { data: session, error } = await serviceClient
    .from('interview_sessions')
    .insert(payload)
    .select('id')
    .single();

  if (error || !session?.id) {
    throw new Error('INTERVIEW_SESSION_CREATE_FAILED');
  }

  await seedInterviewQuestionProgress(serviceClient, {
    interviewSessionId: session.id,
    userId,
  });

  return session.id;
}

async function createDeepgramTempToken(ttlSeconds: number) {
  const apiKey = getRequiredEnv('DEEPGRAM_KEY');
  const response = await fetch(
    `https://api.deepgram.com/v1/auth/grant?scope=agent&ttl=${ttlSeconds}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
      },
    },
  );

  if (response.status === 403) {
    return { ok: false, reason: 'INSUFFICIENT_PERMISSIONS' } satisfies DeepgramTempTokenResult;
  }

  if (!response.ok) {
    throw new Error(`DEEPGRAM_GRANT_FAILED:${response.status}`);
  }

  const payload = (await response.json()) as DeepgramGrantResponse;
  const token = payload.key || payload.token || payload.access_token;
  if (!token) {
    throw new Error('DEEPGRAM_GRANT_INVALID');
  }

  return { ok: true, token } satisfies DeepgramTempTokenResult;
}

async function validateInterviewSession(interviewSessionId: string, userId: string) {
  const serviceClient = await createServiceClient();
  const { data: session, error } = await serviceClient
    .from('interview_sessions')
    .select('id')
    .eq('id', interviewSessionId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !session?.id) {
    throw new Error('INTERVIEW_SESSION_NOT_FOUND');
  }
}

async function buildVoiceAgentGreeting(request: Request, userId: string, interviewSessionId: string) {
  const prepared = await prepareBiographyInterviewTurn({
    request,
    userId,
    interviewSessionId,
    source: 'voice',
    messages: [
      {
        role: 'user',
        content: BIOGRAPHY_INTERVIEW_START_TOKEN,
      },
    ],
    routeName: 'api.voice.agent.session.greeting',
  });

  if (!prepared.ok) {
    throw new Error(prepared.error.code);
  }

  const result = await generateBiographyInterviewReply(prepared.value);
  return result.text.trim();
}

export async function POST(request: Request) {
  const logger = createRouteLogger('api.voice.agent.session.post', request);

  try {
    const auth = await getAuthenticatedRequestContext(request);
    if (!auth) {
      return authenticationRequiredResponse(request);
    }

    const body = await request.json().catch(() => null);
    const parsedBody = VoiceAgentSessionBodySchema.safeParse(body);
    if (!parsedBody.success) {
      return jsonFailure(request, {
        status: 400,
        code: 'INVALID_BODY',
        message: 'Invalid voice agent session payload',
        details: zodErrorDetails(parsedBody.error),
        correlationId: logger.correlationId,
      });
    }

    const interviewSessionId = parsedBody.data.interviewSessionId ?? (await createInterviewSession(auth.user.id));
    if (parsedBody.data.interviewSessionId) {
      await validateInterviewSession(parsedBody.data.interviewSessionId, auth.user.id);
    }
    const deepgramTokenResult = await createDeepgramTempToken(600);

    if (!deepgramTokenResult.ok) {
      logger.warn('Deepgram temp token grant unavailable; falling back to legacy voice transport', {
        reason: deepgramTokenResult.reason,
      });

      return jsonSuccess(
        {
          interviewSessionId,
          transport: 'legacy',
          fallbackReason:
            'The configured Deepgram key cannot grant browser-safe agent tokens. Falling back to the legacy voice loop.',
        },
        request,
        {
          correlationId: logger.correlationId,
        },
      );
    }

    const appUrl = getOptionalEnv('NEXT_PUBLIC_APP_URL') || new URL(request.url).origin;
    const greeting = await buildVoiceAgentGreeting(request, auth.user.id, interviewSessionId);
    const contextMessages = await buildBiographyVoiceAgentRuntimeContext({
      userId: auth.user.id,
      interviewSessionId,
    });
    const thinkToken = createVoiceAgentThinkToken({
      userId: auth.user.id,
      interviewSessionId,
      exp: Date.now() + 10 * 60 * 1000,
    });
    const voice = parsedBody.data.voice || 'aura-2-elara-de';

    return jsonSuccess(
      {
        interviewSessionId,
        transport: 'deepgram',
        deepgramToken: deepgramTokenResult.token,
        websocketUrl: 'wss://agent.deepgram.com/v1/agent/converse',
        settings: {
          audio: {
            input: {
              encoding: 'linear16',
              sample_rate: 16000,
            },
            output: {
              encoding: 'linear16',
              sample_rate: 24000,
              container: 'none',
            },
          },
          agent: {
            greeting,
            context: {
              messages: contextMessages,
            },
            listen: {
              provider: {
                type: 'deepgram',
                model: 'nova-3',
                language: 'de',
                smart_format: true,
              },
            },
            think: {
              provider: {
                type: 'open_ai',
                model: 'gemini-2.0-flash',
                temperature: 0.7,
              },
              endpoint: {
                url: `${appUrl}/api/voice/agent/think`,
                headers: {
                  'x-voice-agent-think-token': thinkToken,
                },
              },
            },
            speak: {
              provider: {
                type: 'deepgram',
                model: voice,
              },
            },
          },
        },
      },
      request,
      {
        correlationId: logger.correlationId,
      },
    );
  } catch (error) {
    logger.error('Voice agent session bootstrap failed', {
      error: error instanceof Error ? error.message : 'unknown',
    });
    return jsonFailure(request, {
      status: 500,
      code: 'VOICE_AGENT_SESSION_FAILED',
      message: 'Voice agent session could not be created',
      correlationId: logger.correlationId,
    });
  }
}
