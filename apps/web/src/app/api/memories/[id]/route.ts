/**
 * Single Memory API
 * 
 * GET: Get a single memory
 * PATCH: Update a memory
 * DELETE: Delete a memory
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { MemoryUpdate } from '@nality/schema';

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

    const { data: memory, error } = await supabase
      .from('memories')
      .select(`
        *,
        chapters:chapter_id (
          id,
          title
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
      }
      console.error('Error fetching memory:', error);
      return NextResponse.json({ error: 'Failed to fetch memory' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: memory,
    });
  } catch (error) {
    console.error('Memory GET error:', error);
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

    const body: MemoryUpdate = await req.json();

    // Remove fields that shouldn't be updated directly
    const { ...updateData } = body;

    const { data: memory, error } = await supabase
      .from('memories')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
      }
      console.error('Error updating memory:', error);
      return NextResponse.json({ error: 'Failed to update memory' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: memory,
    });
  } catch (error) {
    console.error('Memory PATCH error:', error);
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

    const { error } = await supabase
      .from('memories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting memory:', error);
      return NextResponse.json({ error: 'Failed to delete memory' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Memory deleted successfully',
    });
  } catch (error) {
    console.error('Memory DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
