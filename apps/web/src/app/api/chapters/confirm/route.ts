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
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const parsedBody = ChapterConfirmationSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Invalid chapter confirmation payload' }, { status: 400 });
    }

    const result = await confirmDraftChapters(supabase, {
      userId: user.id,
      ...(parsedBody.data.chapter_ids ? { chapterIds: parsedBody.data.chapter_ids } : {}),
    });

    if (result.chapters.length === 0) {
      return NextResponse.json({ error: 'No draft chapters available to confirm' }, { status: 400 });
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
    return NextResponse.json({ error: 'Failed to confirm chapters' }, { status: 500 });
  }
}
