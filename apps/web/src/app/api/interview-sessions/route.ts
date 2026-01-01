/**
 * Interview Sessions API
 * 
 * GET: List interview sessions
 * POST: Create a new interview session
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { InterviewSessionInput } from '@nality/schema';

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
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data: sessions, error } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching interview sessions:', error);
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error('Interview sessions GET error:', error);
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

    const body: Partial<InterviewSessionInput> = await req.json();

    const sessionData: InterviewSessionInput = {
      user_id: user.id,
      started_at: body.started_at || new Date().toISOString(),
      ended_at: body.ended_at || null,
      topics_covered: body.topics_covered || [],
      memory_count: body.memory_count || 0,
      processing_status: body.processing_status || 'pending',
      summary: body.summary || null,
    };

    const { data: session, error } = await supabase
      .from('interview_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) {
      console.error('Error creating interview session:', error);
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: session,
    }, { status: 201 });
  } catch (error) {
    console.error('Interview sessions POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
