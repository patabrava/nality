/**
 * Biography API
 * 
 * GET: Get current biography
 * POST: Create/update biography
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { BiographyInput } from '@nality/schema';

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
    const includeAll = searchParams.get('all') === 'true';

    if (includeAll) {
      // Return all versions
      const { data: biographies, error } = await supabase
        .from('biographies')
        .select('*')
        .eq('user_id', user.id)
        .order('version', { ascending: false });

      if (error) {
        console.error('Error fetching biographies:', error);
        return NextResponse.json({ error: 'Failed to fetch biographies' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        data: biographies,
      });
    }

    // Return current version only
    const { data: biography, error } = await supabase
      .from('biographies')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_current', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: true,
          data: null,
          message: 'No biography exists yet',
        });
      }
      console.error('Error fetching biography:', error);
      return NextResponse.json({ error: 'Failed to fetch biography' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: biography,
    });
  } catch (error) {
    console.error('Biography GET error:', error);
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

    const body: Partial<BiographyInput> = await req.json();

    if (!body.content) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }

    // Get latest version number
    const { data: existingBios } = await supabase
      .from('biographies')
      .select('version')
      .eq('user_id', user.id)
      .order('version', { ascending: false })
      .limit(1);

    const nextVersion = existingBios && existingBios.length > 0 && existingBios[0]
      ? existingBios[0].version + 1
      : 1;

    // Mark all existing as not current
    await supabase
      .from('biographies')
      .update({ is_current: false })
      .eq('user_id', user.id);

    // Create new biography
    const biographyData: BiographyInput = {
      user_id: user.id,
      content: body.content,
      tone: body.tone || 'neutral',
      version: nextVersion,
      is_current: true,
      chapter_ids: body.chapter_ids || [],
    };

    const { data: biography, error } = await supabase
      .from('biographies')
      .insert(biographyData)
      .select()
      .single();

    if (error) {
      console.error('Error creating biography:', error);
      return NextResponse.json({ error: 'Failed to create biography' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: biography,
    }, { status: 201 });
  } catch (error) {
    console.error('Biography POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
