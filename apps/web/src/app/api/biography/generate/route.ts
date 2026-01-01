/**
 * Biography Generation API
 * 
 * POST: Generate biography from chapters using AI
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import type { BiographyToneType } from '@nality/schema';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 120;

const TONE_PROMPTS: Record<BiographyToneType, string> = {
  neutral: 'Write in a clear, balanced, and accessible style. Use straightforward language that is engaging but not overly emotional.',
  poetic: 'Write in a lyrical, expressive style. Use vivid imagery, metaphors, and emotional language to create a deeply personal and moving narrative.',
  formal: 'Write in a professional, structured style. Use formal language and clear organization, suitable for official documentation or publication.',
};

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const tone: BiographyToneType = body.tone || 'neutral';
    const chapterIds: string[] = body.chapter_ids || [];
    const regenerate = body.regenerate || false;

    // Get chapters (all or specified)
    let chaptersQuery = supabase
      .from('chapters')
      .select('*')
      .eq('user_id', user.id)
      .order('display_order', { ascending: true });

    if (chapterIds.length > 0) {
      chaptersQuery = chaptersQuery.in('id', chapterIds);
    }

    const { data: chapters, error: chaptersError } = await chaptersQuery;

    if (chaptersError) {
      console.error('Error fetching chapters:', chaptersError);
      return NextResponse.json({ error: 'Failed to fetch chapters' }, { status: 500 });
    }

    if (!chapters || chapters.length === 0) {
      return NextResponse.json({
        error: 'No chapters available to generate biography from',
      }, { status: 400 });
    }

    // Get memories for each chapter
    const chapterContents = [];
    for (const chapter of chapters) {
      const { data: memories } = await supabase
        .from('memories')
        .select('raw_transcript, cleaned_content, captured_at')
        .eq('chapter_id', chapter.id)
        .eq('user_id', user.id)
        .order('captured_at', { ascending: true });

      const memoryTexts = (memories || [])
        .map(m => m.cleaned_content || m.raw_transcript)
        .join('\n\n');

      chapterContents.push({
        title: chapter.title,
        summary: chapter.summary,
        timeRange: chapter.time_range_start && chapter.time_range_end
          ? `${chapter.time_range_start} to ${chapter.time_range_end}`
          : 'Various periods',
        content: memoryTexts,
      });
    }

    // Get user profile for personalization
    const { data: userProfile } = await supabase
      .from('users')
      .select('full_name, birth_date, birth_place')
      .eq('id', user.id)
      .single();

    // Generate biography using AI
    const { text: biographyContent } = await generateText({
      model: openai('gpt-4o'),
      prompt: `You are a skilled biographer helping to write a personal autobiography.

${TONE_PROMPTS[tone]}

Here is information about the person:
- Name: ${userProfile?.full_name || 'Unknown'}
- Birth Date: ${userProfile?.birth_date || 'Unknown'}
- Birth Place: ${userProfile?.birth_place || 'Unknown'}

Here are the chapters of their life story:

${chapterContents.map((ch, idx) => `
## Chapter ${idx + 1}: ${ch.title}
Time Period: ${ch.timeRange}
Summary: ${ch.summary || 'No summary available'}

Memories:
${ch.content || 'No specific memories recorded for this chapter.'}
`).join('\n\n')}

Write a cohesive, flowing autobiography that weaves together these chapters into a compelling narrative. 
- Begin with an introduction that sets the scene
- Transition smoothly between life periods
- Capture the essence of their experiences and emotions
- End with a reflection on their journey

The biography should be approximately 500-1000 words, depending on the depth of material available.`,
    });

    // Check if we should create new version or this is first
    const { data: existingBios } = await supabase
      .from('biographies')
      .select('version')
      .eq('user_id', user.id)
      .order('version', { ascending: false })
      .limit(1);

    const nextVersion = existingBios && existingBios.length > 0 && existingBios[0]
      ? existingBios[0].version + 1
      : 1;

    // Mark existing as not current
    if (regenerate || nextVersion > 1) {
      await supabase
        .from('biographies')
        .update({ is_current: false })
        .eq('user_id', user.id);
    }

    // Save the generated biography
    const { data: biography, error: saveError } = await supabase
      .from('biographies')
      .insert({
        user_id: user.id,
        content: biographyContent,
        tone,
        version: nextVersion,
        is_current: true,
        chapter_ids: chapters.map(c => c.id),
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving biography:', saveError);
      return NextResponse.json({ error: 'Failed to save biography' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        biography,
        chapters_used: chapters.length,
        word_count: biographyContent.split(/\s+/).length,
      },
    });
  } catch (error) {
    console.error('Biography generation error:', error);
    return NextResponse.json({ error: 'Failed to generate biography' }, { status: 500 });
  }
}
