import { AdminUserIdSchema } from '@/app/api/admin/contracts';
import { jsonFailure, jsonSuccess, zodErrorDetails } from '@/lib/server/api';
import { requireAdminRequestContext } from '@/lib/server/admin';
import { createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { auth, isAdmin } = await requireAdminRequestContext(request);

  if (!auth) {
    return jsonFailure(request, {
      status: 401,
      code: 'AUTH_REQUIRED',
      message: 'Authentifizierung erforderlich',
    });
  }

  if (!isAdmin) {
    return jsonFailure(request, {
      status: 403,
      code: 'ADMIN_FORBIDDEN',
      message: 'Admin-Zugriff erforderlich',
    });
  }

  const params = await context.params;
  const parsedParams = AdminUserIdSchema.safeParse(params);

  if (!parsedParams.success) {
    return jsonFailure(request, {
      status: 400,
      code: 'INVALID_USER_ID',
      message: 'Ungültige Admin-Benutzer-ID',
      details: zodErrorDetails(parsedParams.error),
    });
  }

  const serviceClient = await createServiceClient();
  const userId = parsedParams.data.id;

  const [
    { data: user, error: userError },
    { data: profile, error: profileError },
    { data: memories, error: memoriesError },
    { data: chapters, error: chaptersError },
    { data: biographies, error: biographiesError },
    { data: sessions, error: sessionsError },
    { data: chatSessions, error: chatSessionsError },
    { data: lifeEvents, error: lifeEventsError },
  ] = await Promise.all([
    serviceClient
      .from('users')
      .select(
        'id, email, full_name, onboarding_complete, form_of_address, language_style, birth_date, birth_place, created_at, updated_at, alt_onboarding_private',
      )
      .eq('id', userId)
      .maybeSingle(),
    serviceClient
      .from('user_profile')
      .select('values, motto, influences, role_models, favorite_authors, updated_at')
      .eq('user_id', userId)
      .maybeSingle(),
    serviceClient
      .from('memories')
      .select(
        'id, raw_transcript, cleaned_content, capture_mode, captured_at, interview_topic, interview_question, processing_status, source, chapter_id',
      )
      .eq('user_id', userId)
      .order('captured_at', { ascending: false })
      .limit(30),
    serviceClient
      .from('chapters')
      .select('id, title, summary, status, memory_count, display_order, created_at, updated_at')
      .eq('user_id', userId)
      .order('display_order', { ascending: true }),
    serviceClient
      .from('biographies')
      .select('id, tone, version, is_current, created_at, updated_at, content')
      .eq('user_id', userId)
      .order('version', { ascending: false })
      .limit(5),
    serviceClient
      .from('interview_sessions')
      .select('id, started_at, ended_at, topics_covered, memory_count, processing_status, summary')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(12),
    serviceClient
      .from('chat_sessions')
      .select('id, title, type, updated_at, created_at, metadata')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(12),
    serviceClient
      .from('life_event')
      .select('id, title, category, start_date, end_date, location')
      .eq('user_id', userId)
      .order('start_date', { ascending: false })
      .limit(20),
  ]);

  if (userError || profileError || memoriesError || chaptersError || biographiesError || sessionsError || chatSessionsError || lifeEventsError) {
    return jsonFailure(request, {
      status: 500,
      code: 'ADMIN_USER_DETAIL_FAILED',
      message: 'Admin-Arbeitsbereich des Benutzers konnte nicht geladen werden',
    });
  }

  if (!user) {
    return jsonFailure(request, {
      status: 404,
      code: 'USER_NOT_FOUND',
      message: 'Zielbenutzer nicht gefunden',
    });
  }

  return jsonSuccess(
    {
      user,
      profile: profile ?? null,
      memories: memories ?? [],
      chapters: chapters ?? [],
      biographies: biographies ?? [],
      interviewSessions: sessions ?? [],
      chatSessions: chatSessions ?? [],
      lifeEvents: lifeEvents ?? [],
    },
    request,
  );
}
