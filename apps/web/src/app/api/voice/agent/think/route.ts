import { z } from 'zod';
import { jsonFailure, zodErrorDetails } from '@/lib/server/api';
import { createRouteLogger } from '@/lib/server/logger';
import { verifyVoiceAgentThinkToken } from '@/lib/server/voice-agent';
import {
  generateBiographyInterviewReply,
  prepareBiographyInterviewTurn,
  sanitizeBiographyMessageContent,
} from '@/features/biography-interview/respond';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const VoiceAgentThinkBodySchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['system', 'assistant', 'user']),
      content: z.string(),
    }),
  ),
});

export async function POST(request: Request) {
  const logger = createRouteLogger('api.voice.agent.think.post', request);

  try {
    const thinkToken = request.headers.get('x-voice-agent-think-token')?.trim() || '';
    const tokenPayload = verifyVoiceAgentThinkToken(thinkToken);
    if (!tokenPayload) {
      return jsonFailure(request, {
        status: 401,
        code: 'VOICE_AGENT_THINK_FORBIDDEN',
        message: 'Voice agent think access denied',
        correlationId: logger.correlationId,
      });
    }

    const body = await request.json().catch(() => null);
    const parsedBody = VoiceAgentThinkBodySchema.safeParse(body);
    if (!parsedBody.success) {
      return jsonFailure(request, {
        status: 400,
        code: 'INVALID_BODY',
        message: 'Invalid voice agent think payload',
        details: zodErrorDetails(parsedBody.error),
        correlationId: logger.correlationId,
      });
    }

    const prepared = await prepareBiographyInterviewTurn({
      request,
      userId: tokenPayload.userId,
      interviewSessionId: tokenPayload.interviewSessionId,
      source: 'voice',
      messages: parsedBody.data.messages.map((message) => ({
        role: message.role,
        content: sanitizeBiographyMessageContent(message.content),
      })),
      routeName: 'api.voice.agent.think.post',
    });

    if (!prepared.ok) {
      return jsonFailure(request, prepared.error);
    }

    let result;
    try {
      result = await generateBiographyInterviewReply(prepared.value);
    } catch (error) {
      if (error instanceof Error && error.message === 'AI provider not configured') {
        return jsonFailure(request, {
          status: 500,
          code: 'AI_PROVIDER_NOT_CONFIGURED',
          message: 'AI provider not configured',
          correlationId: prepared.value.correlationId,
        });
      }

      throw error;
    }

    const assistantText = result.text.trim();

    return Response.json(
      {
        id: crypto.randomUUID(),
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: 'gemini-2.0-flash',
        choices: [
          {
            index: 0,
            finish_reason: 'stop',
            message: {
              role: 'assistant',
              content: assistantText,
            },
          },
        ],
      },
      {
        headers: {
          'x-correlation-id': prepared.value.correlationId,
          'x-interview-session-id': prepared.value.interviewSessionId,
          'x-active-question-id': prepared.value.activeQuestionId ?? '',
        },
      },
    );
  } catch (error) {
    logger.error('Voice agent think failed', {
      error: error instanceof Error ? error.message : 'unknown',
    });
    return jsonFailure(request, {
      status: 500,
      code: 'VOICE_AGENT_THINK_FAILED',
      message: 'Voice agent think failed',
      correlationId: logger.correlationId,
    });
  }
}
