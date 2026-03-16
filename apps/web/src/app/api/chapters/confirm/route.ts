/**
 * Chapter Confirmation API
 *
 * POST: Publish draft chapters and assign memories on explicit user confirmation
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { confirmDraftChapters } from '@/features/chapter-planning/persistence';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const ChapterConfirmationSchema = z.object({
  chapter_ids: z.array(z.string().uuid()).optional(),
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentifizierung erforderlich' }, { status: 401 });
    }

    const parsedBody = ChapterConfirmationSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Ungültige Bestätigungsdaten für Kapitel' }, { status: 400 });
    }

    const result = await confirmDraftChapters(supabase, {
      userId: user.id,
      ...(parsedBody.data.chapter_ids ? { chapterIds: parsedBody.data.chapter_ids } : {}),
    });

    if (result.chapters.length === 0) {
      return NextResponse.json({ error: 'Es sind keine Entwurfskapitel zur Bestätigung vorhanden' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        chapters_confirmed: result.chapters.length,
        chapters: result.chapters,
        memories_assigned: result.memoriesAssigned,
      },
    });
  } catch (error) {
    console.error('Chapter confirmation error:', error);
    return NextResponse.json({ error: 'Kapitel konnten nicht bestätigt werden' }, { status: 500 });
  }
}
