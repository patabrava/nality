/**
 * Chapters API
 * 
 * GET: List chapters
 * POST: Create a new chapter
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ChapterInput } from '@nality/schema';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let query = supabase
      .from('chapters')
      .select('*')
      .eq('user_id', user.id)
      .order('display_order', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: chapters, error } = await query;

    if (error) {
      console.error('Error fetching chapters:', error);
      return NextResponse.json({ error: 'Failed to fetch chapters' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: chapters,
    });
  } catch (error) {
    console.error('Chapters GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body: Partial<ChapterInput> = await req.json();

    if (!body.title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    // Get next display order
    const { data: existingChapters } = await supabase
      .from('chapters')
      .select('display_order')
      .eq('user_id', user.id)
      .order('display_order', { ascending: false })
      .limit(1);

    const nextOrder = existingChapters && existingChapters.length > 0 && existingChapters[0]
      ? (existingChapters[0].display_order || 0) + 1
      : 0;

    const chapterData: ChapterInput = {
      user_id: user.id,
      title: body.title,
      summary: body.summary || null,
      time_range_start: body.time_range_start || null,
      time_range_end: body.time_range_end || null,
      status: body.status || 'draft',
      theme_keywords: body.theme_keywords || [],
      memory_count: body.memory_count || 0,
      display_order: body.display_order ?? nextOrder,
    };

    const { data: chapter, error } = await supabase
      .from('chapters')
      .insert(chapterData)
      .select()
      .single();

    if (error) {
      console.error('Error creating chapter:', error);
      return NextResponse.json({ error: 'Failed to create chapter' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: chapter,
    }, { status: 201 });
  } catch (error) {
    console.error('Chapters POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
