/**
 * Memories API
 * 
 * GET: List memories (paginated, date-grouped)
 * POST: Create a new memory
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Memory, MemoryInput } from '@nality/schema';

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
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const captureMode = searchParams.get('capture_mode');
    const chapterId = searchParams.get('chapter_id');

    let query = supabase
      .from('memories')
      .select('*')
      .eq('user_id', user.id)
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
      console.error('Error fetching memories:', error);
      return NextResponse.json({ error: 'Failed to fetch memories' }, { status: 500 });
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('memories')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    return NextResponse.json({
      success: true,
      data: memories,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (offset + limit) < (count || 0),
      },
    });
  } catch (error) {
    console.error('Memories GET error:', error);
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

    const body: Partial<MemoryInput> = await req.json();

    // Validate required fields
    if (!body.raw_transcript) {
      return NextResponse.json({ error: 'raw_transcript is required' }, { status: 400 });
    }

    const memoryData: MemoryInput = {
      user_id: user.id,
      raw_transcript: body.raw_transcript,
      cleaned_content: body.cleaned_content || null,
      captured_at: body.captured_at || new Date().toISOString(),
      capture_mode: body.capture_mode || 'free_talk',
      interview_session_id: body.interview_session_id || null,
      interview_question: body.interview_question || null,
      interview_topic: body.interview_topic || null,
      people: body.people || [],
      places: body.places || [],
      topics: body.topics || [],
      emotions: body.emotions || null,
      suggested_category: body.suggested_category || null,
      suggested_chapter_id: body.suggested_chapter_id || null,
      suggestion_confidence: body.suggestion_confidence || 0,
      source: body.source || 'voice',
      processing_status: body.processing_status || 'pending',
      processed_at: body.processed_at || null,
      chapter_id: body.chapter_id || null,
    };

    const { data: memory, error } = await supabase
      .from('memories')
      .insert(memoryData)
      .select()
      .single();

    if (error) {
      console.error('Error creating memory:', error);
      return NextResponse.json({ error: 'Failed to create memory' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: memory,
    }, { status: 201 });
  } catch (error) {
    console.error('Memories POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
