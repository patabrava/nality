import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import type { InterviewSessionInput } from '@nality/schema';
import {
  authenticationRequiredResponse,
  getAuthenticatedRequestContext,
} from '@/lib/server/auth';
import { jsonFailure, jsonSuccess, zodErrorDetails } from '@/lib/server/api';
import { createRouteLogger } from '@/lib/server/logger';
import { BIOGRAPHY_INTERVIEW_CATALOG_VERSION } from '@/features/biography-interview/catalog';
import {
  getProgressSummary,
  seedInterviewQuestionProgress,
} from '@/features/biography-interview/progress-store';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const InterviewSessionQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  sessionId: z.string().uuid().optional(),
  active: z.coerce.boolean().optional().default(false),
});

const CreateInterviewSessionBodySchema = z.object({
  started_at: z.string().datetime().optional(),
  ended_at: z.string().datetime().optional().nullable(),
  topics_covered: z.array(z.string()).default([]),
  memory_count: z.number().int().min(0).default(0),
  processing_status: z.enum(['pending', 'processing', 'complete', 'failed']).default('pending'),
  summary: z.string().optional().nullable(),
  catalog_version: z.string().optional(),
  active_question_id: z.string().optional().nullable(),
});

const UpdateInterviewSessionBodySchema = z.object({
  ended_at: z.string().datetime().optional().nullable(),
  topics_covered: z.array(z.string()).optional(),
  memory_count: z.number().int().min(0).optional(),
  processing_status: z.enum(['pending', 'processing', 'complete', 'failed']).optional(),
  summary: z.string().optional().nullable(),
  catalog_version: z.string().optional(),
  active_question_id: z.string().optional().nullable(),
});

export async function GET(req: Request) {
  const logger = createRouteLogger('api.interview-sessions.get', req);

  try {
    const auth = await getAuthenticatedRequestContext(req);
    if (!auth) {
      return authenticationRequiredResponse(req);
    }

    const parsedQuery = InterviewSessionQuerySchema.safeParse(
      Object.fromEntries(new URL(req.url).searchParams.entries()),
    );

    if (!parsedQuery.success) {
      return jsonFailure(req, {
        status: 400,
        code: 'INVALID_QUERY',
        message: 'Ungültige Interviewsitzungsanfrage',
        details: zodErrorDetails(parsedQuery.error),
        correlationId: logger.correlationId,
      });
    }

    const serviceClient = await createServiceClient();
    const { limit, offset, sessionId, active } = parsedQuery.data;

    if (sessionId) {
      const { data: session, error } = await serviceClient
        .from('interview_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', auth.user.id)
        .maybeSingle();

      if (error) {
        logger.error('Failed to fetch interview session detail', {
          code: error.code,
          message: error.message,
        });
        return jsonFailure(req, {
          status: 500,
          code: 'INTERVIEW_SESSION_FETCH_FAILED',
          message: 'Sitzung konnte nicht geladen werden',
          correlationId: logger.correlationId,
        });
      }

      if (!session) {
        return jsonFailure(req, {
          status: 404,
          code: 'INTERVIEW_SESSION_NOT_FOUND',
          message: 'Interviewsitzung nicht gefunden',
          correlationId: logger.correlationId,
        });
      }

      const progressSummary = await getProgressSummary(serviceClient, {
        interviewSessionId: sessionId,
        userId: auth.user.id,
        activeQuestionId: session.active_question_id ?? null,
      });

      return jsonSuccess(
        {
          session,
          progressSummary,
        },
        req,
        {
          correlationId: logger.correlationId,
        },
      );
    }

    if (active) {
      const { data: sessions, error } = await serviceClient
        .from('interview_sessions')
        .select('*')
        .eq('user_id', auth.user.id)
        .order('updated_at', { ascending: false })
        .limit(Math.min(limit, 20));

      if (error) {
        logger.error('Failed to fetch active interview session', {
          code: error.code,
          message: error.message,
        });
        return jsonFailure(req, {
          status: 500,
          code: 'INTERVIEW_ACTIVE_SESSION_FETCH_FAILED',
          message: 'Aktive Sitzung konnte nicht geladen werden',
          correlationId: logger.correlationId,
        });
      }

      const resumableSessions = (sessions ?? []).filter(
        (session) => session.processing_status !== 'failed',
      );

      for (const candidate of resumableSessions) {
        const progressSummary = await getProgressSummary(serviceClient, {
          interviewSessionId: candidate.id,
          userId: auth.user.id,
          activeQuestionId: candidate.active_question_id ?? null,
        });

        if (progressSummary.counts.remainingRequired <= 0) {
          continue;
        }

        return jsonSuccess(
          {
            session: candidate,
            progressSummary,
          },
          req,
          {
            correlationId: logger.correlationId,
          },
        );
      }

      return jsonSuccess(null, req, {
        correlationId: logger.correlationId,
      });
    }

    const { data: sessions, error } = await serviceClient
      .from('interview_sessions')
      .select('*')
      .eq('user_id', auth.user.id)
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('Failed to fetch interview sessions', {
        code: error.code,
        message: error.message,
      });
      return jsonFailure(req, {
        status: 500,
        code: 'INTERVIEW_SESSIONS_FETCH_FAILED',
        message: 'Sitzungen konnten nicht geladen werden',
        correlationId: logger.correlationId,
      });
    }

    return jsonSuccess(sessions ?? [], req, {
      correlationId: logger.correlationId,
    });
  } catch (error) {
    logger.error('Unexpected interview sessions GET error', {
      error: error instanceof Error ? error.message : 'unknown',
    });
    return jsonFailure(req, {
      status: 500,
      code: 'INTERVIEW_SESSIONS_GET_FAILED',
      message: 'Interner Serverfehler',
      correlationId: logger.correlationId,
    });
  }
}

export async function POST(req: Request) {
  const logger = createRouteLogger('api.interview-sessions.post', req);

  try {
    const auth = await getAuthenticatedRequestContext(req);
    if (!auth) {
      return authenticationRequiredResponse(req);
    }

    const body = await req.json().catch(() => null);
    const parsedBody = CreateInterviewSessionBodySchema.safeParse(body);

    if (!parsedBody.success) {
      return jsonFailure(req, {
        status: 400,
        code: 'INVALID_BODY',
        message: 'Ungültige Interviewsitzungsdaten',
        details: zodErrorDetails(parsedBody.error),
        correlationId: logger.correlationId,
      });
    }

    const serviceClient = await createServiceClient();
    const payload = parsedBody.data;
    const sessionData: InterviewSessionInput = {
      user_id: auth.user.id,
      started_at: payload.started_at || new Date().toISOString(),
      ended_at: payload.ended_at || null,
      topics_covered: payload.topics_covered,
      memory_count: payload.memory_count,
      processing_status: payload.processing_status,
      summary: payload.summary || null,
      catalog_version: payload.catalog_version || BIOGRAPHY_INTERVIEW_CATALOG_VERSION,
      active_question_id: payload.active_question_id ?? null,
    };

    const { data: session, error } = await serviceClient
      .from('interview_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) {
      logger.error('Failed to create interview session', {
        code: error.code,
        message: error.message,
      });
      return jsonFailure(req, {
        status: 500,
        code: 'INTERVIEW_SESSION_CREATE_FAILED',
        message: 'Sitzung konnte nicht erstellt werden',
        correlationId: logger.correlationId,
      });
    }

    try {
      await seedInterviewQuestionProgress(serviceClient, {
        interviewSessionId: session.id,
        userId: auth.user.id,
      });
    } catch (seedError) {
      logger.error('Failed to seed interview question progress', {
        error: seedError instanceof Error ? seedError.message : 'unknown',
        sessionId: session.id,
      });
      return jsonFailure(req, {
        status: 500,
        code: 'INTERVIEW_PROGRESS_SEED_FAILED',
        message: 'Interviewfortschritt konnte nicht initialisiert werden',
        correlationId: logger.correlationId,
      });
    }

    const progressSummary = await getProgressSummary(serviceClient, {
      interviewSessionId: session.id,
      userId: auth.user.id,
      activeQuestionId: session.active_question_id ?? null,
    });

    return jsonSuccess({
      ...session,
      progressSummary,
    }, req, {
      status: 201,
      correlationId: logger.correlationId,
    });
  } catch (error) {
    logger.error('Unexpected interview sessions POST error', {
      error: error instanceof Error ? error.message : 'unknown',
    });
    return jsonFailure(req, {
      status: 500,
      code: 'INTERVIEW_SESSIONS_POST_FAILED',
      message: 'Interner Serverfehler',
      correlationId: logger.correlationId,
    });
  }
}

export async function PATCH(req: Request) {
  const logger = createRouteLogger('api.interview-sessions.patch', req);

  try {
    const auth = await getAuthenticatedRequestContext(req);
    if (!auth) {
      return authenticationRequiredResponse(req);
    }

    const parsedQuery = InterviewSessionQuerySchema.safeParse(
      Object.fromEntries(new URL(req.url).searchParams.entries()),
    );

    if (!parsedQuery.success) {
      return jsonFailure(req, {
        status: 400,
        code: 'INVALID_QUERY',
        message: 'Ungültige Interviewsitzungsanfrage',
        details: zodErrorDetails(parsedQuery.error),
        correlationId: logger.correlationId,
      });
    }

    if (!parsedQuery.data.sessionId) {
      return jsonFailure(req, {
        status: 400,
        code: 'SESSION_ID_REQUIRED',
        message: 'Eine Sitzungs-ID ist erforderlich',
        correlationId: logger.correlationId,
      });
    }

    const body = await req.json().catch(() => null);
    const parsedBody = UpdateInterviewSessionBodySchema.safeParse(body);

    if (!parsedBody.success) {
      return jsonFailure(req, {
        status: 400,
        code: 'INVALID_BODY',
        message: 'Ungültige Aktualisierungsdaten für die Interviewsitzung',
        details: zodErrorDetails(parsedBody.error),
        correlationId: logger.correlationId,
      });
    }

    const serviceClient = await createServiceClient();
    const sessionId = parsedQuery.data.sessionId;
    const payload = parsedBody.data;
    const updates = {
      ended_at: payload.ended_at ?? undefined,
      topics_covered: payload.topics_covered ?? undefined,
      memory_count: payload.memory_count ?? undefined,
      processing_status: payload.processing_status ?? undefined,
      summary: payload.summary ?? undefined,
      catalog_version: payload.catalog_version ?? undefined,
      active_question_id: payload.active_question_id ?? undefined,
      updated_at: new Date().toISOString(),
    };

    const { data: session, error } = await serviceClient
      .from('interview_sessions')
      .update(updates)
      .eq('id', sessionId)
      .eq('user_id', auth.user.id)
      .select()
      .maybeSingle();

    if (error) {
      logger.error('Failed to update interview session', {
        code: error.code,
        message: error.message,
      });
      return jsonFailure(req, {
        status: 500,
        code: 'INTERVIEW_SESSION_UPDATE_FAILED',
        message: 'Sitzung konnte nicht aktualisiert werden',
        correlationId: logger.correlationId,
      });
    }

    if (!session) {
      return jsonFailure(req, {
        status: 404,
        code: 'INTERVIEW_SESSION_NOT_FOUND',
        message: 'Interviewsitzung nicht gefunden',
        correlationId: logger.correlationId,
      });
    }

    return jsonSuccess(session, req, {
      correlationId: logger.correlationId,
    });
  } catch (error) {
    logger.error('Unexpected interview sessions PATCH error', {
      error: error instanceof Error ? error.message : 'unknown',
    });
    return jsonFailure(req, {
      status: 500,
      code: 'INTERVIEW_SESSIONS_PATCH_FAILED',
      message: 'Interner Serverfehler',
      correlationId: logger.correlationId,
    });
  }
}
