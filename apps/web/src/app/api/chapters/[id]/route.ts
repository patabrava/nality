/**
 * Single Chapter API
 * 
 * GET: Get a single chapter with its memories
 * PATCH: Update a chapter
 * DELETE: Delete a chapter
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ChapterUpdate } from '@nality/schema';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get chapter
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (chapterError) {
      if (chapterError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
      }
      console.error('Error fetching chapter:', chapterError);
      return NextResponse.json({ error: 'Failed to fetch chapter' }, { status: 500 });
    }

    // Get associated memories
    const { data: memories, error: memoriesError } = await supabase
      .from('memories')
      .select('*')
      .eq('chapter_id', id)
      .eq('user_id', user.id)
      .order('captured_at', { ascending: false });

    if (memoriesError) {
      console.error('Error fetching chapter memories:', memoriesError);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...chapter,
        memories: memories || [],
      },
    });
  } catch (error) {
    console.error('Chapter GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body: ChapterUpdate = await req.json();

    const { data: chapter, error } = await supabase
      .from('chapters')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
      }
      console.error('Error updating chapter:', error);
      return NextResponse.json({ error: 'Failed to update chapter' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: chapter,
    });
  } catch (error) {
    console.error('Chapter PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // First, unassign memories from this chapter
    await supabase
      .from('memories')
      .update({ chapter_id: null })
      .eq('chapter_id', id)
      .eq('user_id', user.id);

    // Delete the chapter
    const { error } = await supabase
      .from('chapters')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting chapter:', error);
      return NextResponse.json({ error: 'Failed to delete chapter' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Chapter deleted successfully',
    });
  } catch (error) {
    console.error('Chapter DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
