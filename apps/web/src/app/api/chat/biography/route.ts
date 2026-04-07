import { z } from 'zod';
import {
  authenticationRequiredResponse,
  getAuthenticatedRequestContext,
} from '@/lib/server/auth';
import { jsonFailure, zodErrorDetails } from '@/lib/server/api';
import {
  prepareBiographyInterviewTurn,
  streamBiographyInterviewReply,
} from '@/features/biography-interview/respond';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const BiographyInterviewBodySchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['system', 'assistant', 'user']),
      content: z.string(),
    }),
  ),
  interviewSessionId: z.string().uuid(),
  source: z.enum(['voice', 'text']).optional(),
});

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedRequestContext(request);

    if (!auth) {
      return authenticationRequiredResponse(request);
    }

    const body = await request.json().catch(() => null);
    const parsedBody = BiographyInterviewBodySchema.safeParse(body);

    if (!parsedBody.success) {
      return jsonFailure(request, {
        status: 400,
        code: 'INVALID_BODY',
        message: 'Invalid biography interview payload',
        details: zodErrorDetails(parsedBody.error),
      });
    }

    const prepared = await prepareBiographyInterviewTurn({
      request,
      userId: auth.user.id,
      interviewSessionId: parsedBody.data.interviewSessionId,
      source: parsedBody.data.source ?? 'text',
      messages: parsedBody.data.messages,
      routeName: 'api.chat.biography.post',
    });

    if (!prepared.ok) {
      return jsonFailure(request, prepared.error);
    }

    let result;
    try {
      result = await streamBiographyInterviewReply(prepared.value);
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

    return result.toDataStreamResponse({
      headers: {
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'x-correlation-id': prepared.value.correlationId,
        'x-interview-session-id': prepared.value.interviewSessionId,
        'x-active-question-id': prepared.value.activeQuestionId ?? '',
      },
    });
  } catch {
    return jsonFailure(request, {
      status: 500,
      code: 'BIOGRAPHY_INTERVIEW_FAILED',
      message: 'Die Interview-Antwort konnte gerade nicht erzeugt werden.',
    });
  }
}
