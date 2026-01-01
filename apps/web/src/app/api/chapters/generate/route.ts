/**
 * Chapter Generation API
 * 
 * POST: Generate chapters from memories using AI clustering
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const ChapterSuggestionSchema = z.object({
  chapters: z.array(z.object({
    title: z.string().describe('A meaningful, evocative title for this chapter'),
    summary: z.string().describe('A brief 1-2 sentence summary of the chapter theme'),
    time_range_start: z.string().nullable().describe('Approximate start date in YYYY-MM-DD format'),
    time_range_end: z.string().nullable().describe('Approximate end date in YYYY-MM-DD format'),
    theme_keywords: z.array(z.string()).describe('3-5 keywords that capture the theme'),
    memory_indices: z.array(z.number()).describe('Indices of memories that belong to this chapter'),
  })),
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const minMemories = body.min_memories || 5;
    const forceRegenerate = body.force_regenerate || false;

    // Get user's memories
    const { data: memories, error: memoriesError } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', user.id)
      .order('captured_at', { ascending: true });

    if (memoriesError) {
      console.error('Error fetching memories:', memoriesError);
      return NextResponse.json({ error: 'Failed to fetch memories' }, { status: 500 });
    }

    if (!memories || memories.length < minMemories) {
      return NextResponse.json({
        error: `Need at least ${minMemories} memories to generate chapters`,
        current_count: memories?.length || 0,
      }, { status: 400 });
    }

    // Check if chapters already exist
    if (!forceRegenerate) {
      const { data: existingChapters } = await supabase
        .from('chapters')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (existingChapters && existingChapters.length > 0) {
        return NextResponse.json({
          error: 'Chapters already exist. Use force_regenerate: true to regenerate.',
        }, { status: 400 });
      }
    }

    // Prepare memories for LLM analysis
    const memorySummaries = memories.map((m, idx) => ({
      index: idx,
      content: m.cleaned_content || m.raw_transcript,
      captured_at: m.captured_at,
      suggested_category: m.suggested_category,
      topics: m.topics,
    }));

    // Generate chapter suggestions using AI
    const { object: suggestions } = await generateObject({
      model: openai('gpt-4o'),
      schema: ChapterSuggestionSchema,
      prompt: `You are helping organize a person's life memories into meaningful chapters for their autobiography.

Here are their memories in chronological order:
${memorySummaries.map(m => `[${m.index}] ${m.captured_at?.split('T')[0] || 'Unknown date'}: ${m.content?.substring(0, 200)}...`).join('\n\n')}

Analyze these memories and group them into 3-7 meaningful life chapters. Consider:
1. **Time periods**: Natural life phases (childhood, education, career, etc.)
2. **Themes**: Common topics or emotional threads
3. **Significance**: Major life transitions or events

For each chapter:
- Create an evocative, personal title (not generic like "Childhood")
- Write a brief summary capturing the essence
- Identify approximate time boundaries
- List relevant keywords
- Assign memory indices that belong to this chapter

Every memory should belong to exactly one chapter.`,
    });

    // Delete existing chapters if force regenerating
    if (forceRegenerate) {
      await supabase
        .from('memories')
        .update({ chapter_id: null })
        .eq('user_id', user.id);

      await supabase
        .from('chapters')
        .delete()
        .eq('user_id', user.id);
    }

    // Create chapters and assign memories
    const createdChapters = [];
    let totalMemoriesAssigned = 0;

    for (let i = 0; i < suggestions.chapters.length; i++) {
      const chapterSuggestion = suggestions.chapters[i];
      if (!chapterSuggestion) continue;

      // Create chapter
      const { data: chapter, error: chapterError } = await supabase
        .from('chapters')
        .insert({
          user_id: user.id,
          title: chapterSuggestion.title,
          summary: chapterSuggestion.summary,
          time_range_start: chapterSuggestion.time_range_start,
          time_range_end: chapterSuggestion.time_range_end,
          theme_keywords: chapterSuggestion.theme_keywords,
          status: 'draft',
          display_order: i,
          memory_count: chapterSuggestion.memory_indices.length,
        })
        .select()
        .single();

      if (chapterError) {
        console.error('Error creating chapter:', chapterError);
        continue;
      }

      createdChapters.push(chapter);

      // Assign memories to this chapter
      const memoryIds = chapterSuggestion.memory_indices
        .filter(idx => idx >= 0 && idx < memories.length)
        .map(idx => memories[idx].id);

      if (memoryIds.length > 0) {
        const { error: updateError } = await supabase
          .from('memories')
          .update({ chapter_id: chapter.id })
          .in('id', memoryIds)
          .eq('user_id', user.id);

        if (!updateError) {
          totalMemoriesAssigned += memoryIds.length;
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        chapters_created: createdChapters.length,
        chapters: createdChapters,
        memories_assigned: totalMemoriesAssigned,
      },
    });
  } catch (error) {
    console.error('Chapter generation error:', error);
    return NextResponse.json({ error: 'Failed to generate chapters' }, { status: 500 });
  }
}
