/**
 * Chapter Generation API
 *
 * POST: Evaluate narrative readiness and create draft chapters in place
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { evaluateNarrativeReadiness } from '@/features/chapter-planning/readiness';
import { buildDraftChapterCandidates } from '@/features/chapter-planning/planner';
import {
  clearDraftChapters,
  createDraftChapters,
  loadChapterPlanningContext,
  loadUserChapters,
} from '@/features/chapter-planning/persistence';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const ChapterPlanningRequestSchema = z.object({
  force_regenerate: z.boolean().optional().default(false),
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

    const parsedBody = ChapterPlanningRequestSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Invalid chapter planning request' }, { status: 400 });
    }

    const { force_regenerate: forceRegenerate } = parsedBody.data;
    const existingChapters = await loadUserChapters(supabase, user.id);
    const publishedChapters = existingChapters.filter((chapter: { status: string }) => chapter.status === 'published');
    const draftChapters = existingChapters.filter((chapter: { status: string }) => chapter.status === 'draft');

    if (publishedChapters.length > 0 && !forceRegenerate) {
      return NextResponse.json({
        error: 'Published chapters already exist. Confirmation flow has already completed.',
      }, { status: 400 });
    }

    const planningContext = await loadChapterPlanningContext(supabase, user.id);
    const readiness = evaluateNarrativeReadiness(
      planningContext.progressRows,
      planningContext.memories,
    );

    if (!readiness.ready) {
      return NextResponse.json({
        success: true,
        data: {
          ready: false,
          readiness,
          chapters_created: 0,
          chapters: [],
          memories_assigned: 0,
        },
      });
    }

    if (draftChapters.length > 0 && !forceRegenerate) {
      return NextResponse.json({
        success: true,
        data: {
          ready: true,
          readiness,
          chapters_created: draftChapters.length,
          chapters: draftChapters,
          memories_assigned: 0,
        },
      });
    }

    if (forceRegenerate || draftChapters.length > 0) {
      await clearDraftChapters(supabase, user.id);
    }

    const candidates = buildDraftChapterCandidates({
      readiness,
      progressRows: planningContext.progressRows,
      memories: planningContext.memories,
    });

    if (candidates.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          ready: false,
          readiness: {
            ...readiness,
            ready: false,
            gaps: [
              ...readiness.gaps,
              'Aus dem vorhandenen Material konnten noch keine belastbaren Kapitelentwürfe gebildet werden.',
            ],
          },
          chapters_created: 0,
          chapters: [],
          memories_assigned: 0,
        },
      });
    }

    const createdChapters = await createDraftChapters(supabase, {
      userId: user.id,
      readiness,
      candidates,
    });

    return NextResponse.json({
      success: true,
      data: {
        ready: true,
        readiness,
        chapters_created: createdChapters.length,
        chapters: createdChapters,
        memories_assigned: 0,
      },
    });
  } catch (error) {
    console.error('Chapter generation error:', error);
    return NextResponse.json({ error: 'Failed to generate chapters' }, { status: 500 });
  }
}
