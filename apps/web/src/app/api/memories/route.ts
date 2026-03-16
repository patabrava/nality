import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import type { MemoryInput } from '@nality/schema';
import {
  authenticationRequiredResponse,
  getAuthenticatedRequestContext,
} from '@/lib/server/auth';
import { jsonFailure, jsonSuccess, zodErrorDetails } from '@/lib/server/api';
import { createRouteLogger } from '@/lib/server/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MemoriesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  capture_mode: z.enum(['interview', 'free_talk', 'text']).optional(),
  chapter_id: z.string().uuid().optional(),
});

const EmotionsInputSchema = z
  .object({
    valence: z.number().min(-1).max(1).optional(),
    arousal: z.number().min(0).max(1).optional(),
    confidence: z.number().min(0).max(1).optional(),
  })
  .passthrough();

const CreateMemoryBodySchema = z.object({
  raw_transcript: z.string().trim().min(1, 'raw_transcript is required'),
  cleaned_content: z.string().optional().nullable(),
  captured_at: z.string().datetime().optional(),
  capture_mode: z.enum(['interview', 'free_talk', 'text']).default('free_talk'),
  interview_session_id: z.string().uuid().optional().nullable(),
  interview_question: z.string().optional().nullable(),
  interview_topic: z.string().optional().nullable(),
  people: z.array(z.string()).default([]),
  places: z.array(z.string()).default([]),
  topics: z.array(z.string()).default([]),
  emotions: EmotionsInputSchema.optional().nullable(),
  suggested_category: z.string().optional().nullable(),
  suggested_chapter_id: z.string().uuid().optional().nullable(),
  suggestion_confidence: z.number().min(0).max(1).default(0),
  source: z.enum(['voice', 'text']).default('voice'),
  processing_status: z.enum(['pending', 'processing', 'complete', 'failed']).default('pending'),
  processed_at: z.string().datetime().optional().nullable(),
  chapter_id: z.string().uuid().optional().nullable(),
});

export async function GET(req: Request) {
  const logger = createRouteLogger('api.memories.get', req);
  try {
    const auth = await getAuthenticatedRequestContext(req);
    if (!auth) {
      return authenticationRequiredResponse(req);
    }

    const parsedQuery = MemoriesQuerySchema.safeParse(
      Object.fromEntries(new URL(req.url).searchParams.entries()),
    );

    if (!parsedQuery.success) {
      return jsonFailure(req, {
        status: 400,
        code: 'INVALID_QUERY',
        message: 'Ungültige Erinnerungsanfrage',
        details: zodErrorDetails(parsedQuery.error),
        correlationId: logger.correlationId,
      });
    }

    const supabase = await createClient();
    const { limit, offset, capture_mode: captureMode, chapter_id: chapterId } = parsedQuery.data;

    let query = supabase
      .from('memories')
      .select('*')
      .eq('user_id', auth.user.id)
      .order('captured_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (captureMode) {
      query = query.eq('capture_mode', captureMode);
    }

    if (chapterId) {
      query = query.eq('chapter_id', chapterId);
    }

    const { data: memories, error } = await query;

    if (error) {
      logger.error('Failed to fetch memories', {
        code: error.code,
        message: error.message,
      });
      return jsonFailure(req, {
        status: 500,
        code: 'MEMORIES_FETCH_FAILED',
        message: 'Erinnerungen konnten nicht geladen werden',
        correlationId: logger.correlationId,
      });
    }

    const { count } = await supabase
      .from('memories')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', auth.user.id);

    return jsonSuccess(memories ?? [], req, {
      correlationId: logger.correlationId,
      meta: {
        pagination: {
          total: count || 0,
          limit,
          offset,
          hasMore: offset + limit < (count || 0),
        },
      },
    });
  } catch (error) {
    logger.error('Unexpected memories GET error', {
      error: error instanceof Error ? error.message : 'unknown',
    });
    return jsonFailure(req, {
      status: 500,
      code: 'MEMORIES_GET_FAILED',
      message: 'Interner Serverfehler',
      correlationId: logger.correlationId,
    });
  }
}

export async function POST(req: Request) {
  const logger = createRouteLogger('api.memories.post', req);
  try {
    const auth = await getAuthenticatedRequestContext(req);
    if (!auth) {
      return authenticationRequiredResponse(req);
    }

    const body = await req.json().catch(() => null);
    const parsedBody = CreateMemoryBodySchema.safeParse(body);

    if (!parsedBody.success) {
      return jsonFailure(req, {
        status: 400,
        code: 'INVALID_BODY',
        message: 'Ungültige Erinnerungsdaten',
        details: zodErrorDetails(parsedBody.error),
        correlationId: logger.correlationId,
      });
    }

    const supabase = await createClient();
    const bodyData = parsedBody.data;

    const memoryData: MemoryInput = {
      user_id: auth.user.id,
      raw_transcript: bodyData.raw_transcript,
      cleaned_content: bodyData.cleaned_content || null,
      captured_at: bodyData.captured_at || new Date().toISOString(),
      capture_mode: bodyData.capture_mode,
      interview_session_id: bodyData.interview_session_id || null,
      interview_question: bodyData.interview_question || null,
      interview_topic: bodyData.interview_topic || null,
      people: bodyData.people,
      places: bodyData.places,
      topics: bodyData.topics,
      emotions: bodyData.emotions || null,
      suggested_category: bodyData.suggested_category || null,
      suggested_chapter_id: bodyData.suggested_chapter_id || null,
      suggestion_confidence: bodyData.suggestion_confidence,
      source: bodyData.source,
      processing_status: bodyData.processing_status,
      processed_at: bodyData.processed_at || null,
      chapter_id: bodyData.chapter_id || null,
    };

    const { data: memory, error } = await supabase
      .from('memories')
      .insert(memoryData)
      .select()
      .single();

    if (error) {
      logger.error('Failed to create memory', {
        code: error.code,
        message: error.message,
      });
      return jsonFailure(req, {
        status: 500,
        code: 'MEMORY_CREATE_FAILED',
        message: 'Erinnerung konnte nicht erstellt werden',
        correlationId: logger.correlationId,
      });
    }

    return jsonSuccess(memory, req, {
      status: 201,
      correlationId: logger.correlationId,
    });
  } catch (error) {
    logger.error('Unexpected memories POST error', {
      error: error instanceof Error ? error.message : 'unknown',
    });
    return jsonFailure(req, {
      status: 500,
      code: 'MEMORIES_POST_FAILED',
      message: 'Interner Serverfehler',
      correlationId: logger.correlationId,
    });
  }
}
