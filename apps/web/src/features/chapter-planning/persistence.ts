import { ChapterPlanningBasisSchema, type ChapterPlanningBasis, type DraftChapterCandidate, type NarrativeReadiness, type PlanningMemory, type PlanningProgressRow } from './contracts';

type SupabaseLikeClient = {
  from: (table: string) => any;
};

function dedupeProgressRows(rows: Array<PlanningProgressRow & { updated_at?: string | null }>): PlanningProgressRow[] {
  const latestRowsByQuestionId = new Map<string, PlanningProgressRow>();

  for (const row of rows) {
    if (!latestRowsByQuestionId.has(row.question_id)) {
      const { question_id, topic_id, state, answer_excerpt, answered_at, answer_memory_id } = row;
      latestRowsByQuestionId.set(question_id, {
        question_id,
        topic_id,
        state,
        answer_excerpt,
        answered_at,
        answer_memory_id,
      });
    }
  }

  return Array.from(latestRowsByQuestionId.values()).sort((left, right) =>
    left.question_id.localeCompare(right.question_id),
  );
}

export async function loadChapterPlanningContext(
  supabase: SupabaseLikeClient,
  userId: string,
): Promise<{
  memories: PlanningMemory[];
  progressRows: PlanningProgressRow[];
}> {
  const [{ data: memories, error: memoriesError }, { data: progressRows, error: progressError }] =
    await Promise.all([
      supabase
        .from('memories')
        .select('id, raw_transcript, cleaned_content, captured_at, interview_topic, interview_question, topics, chapter_id, processing_status')
        .eq('user_id', userId)
        .order('captured_at', { ascending: true }),
      supabase
        .from('interview_question_progress')
        .select('question_id, topic_id, state, answer_excerpt, answered_at, answer_memory_id, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false }),
    ]);

  if (memoriesError) {
    throw memoriesError;
  }

  if (progressError) {
    throw progressError;
  }

  return {
    memories: (memories ?? []) as PlanningMemory[],
    progressRows: dedupeProgressRows(
      ((progressRows ?? []) as Array<PlanningProgressRow & { updated_at?: string | null }>),
    ),
  };
}

export async function loadUserChapters(supabase: SupabaseLikeClient, userId: string) {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('user_id', userId)
    .order('display_order', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function clearDraftChapters(supabase: SupabaseLikeClient, userId: string) {
  const { data: drafts, error: draftsError } = await supabase
    .from('chapters')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'draft');

  if (draftsError) {
    throw draftsError;
  }

  const draftIds = (drafts ?? []).map((draft: { id: string }) => draft.id);
  if (draftIds.length > 0) {
    const { error: unassignError } = await supabase
      .from('memories')
      .update({ chapter_id: null })
      .eq('user_id', userId)
      .in('chapter_id', draftIds);

    if (unassignError) {
      throw unassignError;
    }
  }

  const { error } = await supabase
    .from('chapters')
    .delete()
    .eq('user_id', userId)
    .eq('status', 'draft');

  if (error) {
    throw error;
  }
}

export async function createDraftChapters(
  supabase: SupabaseLikeClient,
  input: {
    userId: string;
    readiness: NarrativeReadiness;
    candidates: DraftChapterCandidate[];
  },
) {
  const rows = input.candidates.map((candidate) => ({
    user_id: input.userId,
    title: candidate.title,
    summary: candidate.summary,
    time_range_start: candidate.timeRangeStart,
    time_range_end: candidate.timeRangeEnd,
    status: 'draft',
    theme_keywords: candidate.themeKeywords,
    memory_count: candidate.supportingMemoryIds.length,
    display_order: candidate.suggestedDisplayOrder,
    planning_basis: {
      candidateKey: candidate.candidateKey,
      readiness: input.readiness,
      supportingMemoryIds: candidate.supportingMemoryIds,
      supportingQuestionIds: candidate.supportingQuestionIds,
      evidenceSummary: candidate.evidenceSummary,
    } satisfies ChapterPlanningBasis,
  }));

  const { data, error } = await supabase
    .from('chapters')
    .insert(rows)
    .select('*');

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function confirmDraftChapters(
  supabase: SupabaseLikeClient,
  input: {
    userId: string;
    chapterIds?: string[];
  },
) {
  let query = supabase
    .from('chapters')
    .select('*')
    .eq('user_id', input.userId)
    .eq('status', 'draft')
    .order('display_order', { ascending: true });

  if (input.chapterIds && input.chapterIds.length > 0) {
    query = query.in('id', input.chapterIds);
  }

  const { data: draftChapters, error: draftError } = await query;
  if (draftError) {
    throw draftError;
  }

  const drafts = draftChapters ?? [];
  if (drafts.length === 0) {
    return {
      chapters: [],
      memoriesAssigned: 0,
    };
  }

  const { data: existingPublished, error: publishedError } = await supabase
    .from('chapters')
    .select('display_order')
    .eq('user_id', input.userId)
    .eq('status', 'published')
    .order('display_order', { ascending: false })
    .limit(1);

  if (publishedError) {
    throw publishedError;
  }

  const nextOrderBase =
    existingPublished && existingPublished.length > 0 && existingPublished[0]
      ? (existingPublished[0].display_order || 0) + 1
      : 0;

  let memoriesAssigned = 0;
  const confirmedChapters: Array<Record<string, unknown>> = [];

  for (const [index, draft] of drafts.entries()) {
    const planningBasis = ChapterPlanningBasisSchema.safeParse(draft.planning_basis);
    const supportIds = planningBasis.success ? planningBasis.data.supportingMemoryIds : [];

    const { data: updatedChapter, error: updateError } = await supabase
      .from('chapters')
      .update({
        status: 'published',
        display_order: nextOrderBase + index,
        updated_at: new Date().toISOString(),
      })
      .eq('id', draft.id)
      .eq('user_id', input.userId)
      .select('*')
      .single();

    if (updateError) {
      throw updateError;
    }

    if (supportIds.length > 0) {
      const { error: memoryError } = await supabase
        .from('memories')
        .update({ chapter_id: draft.id })
        .eq('user_id', input.userId)
        .in('id', supportIds);

      if (memoryError) {
        throw memoryError;
      }

      memoriesAssigned += supportIds.length;
    }

    confirmedChapters.push(updatedChapter);
  }

  return {
    chapters: confirmedChapters,
    memoriesAssigned,
  };
}
