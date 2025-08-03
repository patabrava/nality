import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateUUID, ChatSessionType } from '@nality/schema/chat';

export const dynamic = 'force-dynamic';

/**
 * GET /api/chat/sessions
 * Fetch all chat sessions for the authenticated user
 */
export async function GET() {
  console.log('📂 Chat Sessions API: GET request received');
  
  try {
    const supabase = await createClient();
    console.log('✅ Chat Sessions API: Supabase client created');
    
    // Verify user authentication with detailed debugging
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('🔍 Chat Sessions API: Auth check result', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      authError: authError?.message,
      authErrorCode: authError?.code
    });
    
    if (authError || !user) {
      console.log('⚠️ Chat Sessions API: Unauthorized access attempt', {
        authError: authError?.message,
        hasUser: !!user
      });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Fetch user's chat sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
      
    if (sessionsError) {
      console.error('❌ Chat Sessions API: Error fetching sessions', sessionsError);
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500 }
      );
    }
    
    console.log(`✅ Chat Sessions API: Fetched ${sessions.length} sessions for user ${user.id}`);
    return NextResponse.json({ sessions });
    
  } catch (error) {
    console.error('❌ Chat Sessions API: Unexpected error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chat/sessions
 * Create a new chat session
 */
export async function POST(request: Request) {
  console.log('📂 Chat Sessions API: POST request received');
  
  try {
    const body = await request.json();
    const { title, type = 'onboarding', metadata } = body;
    
    // Validate session type
    if (!['onboarding', 'general'].includes(type)) {
      console.log('❌ Chat Sessions API: Invalid session type', { type });
      return NextResponse.json(
        { error: 'Session type must be "onboarding" or "general"' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    console.log('✅ Chat Sessions API: Supabase client created');
    
    // Verify user authentication with detailed debugging
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('🔍 Chat Sessions API: Auth check result', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      authError: authError?.message,
      authErrorCode: authError?.code
    });
    
    if (authError || !user) {
      console.log('⚠️ Chat Sessions API: Unauthorized access attempt', {
        authError: authError?.message,
        hasUser: !!user
      });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Create the session
    const sessionData = {
      id: generateUUID(),
      user_id: user.id,
      title: title || null,
      type: type as ChatSessionType,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const { data: session, error: insertError } = await supabase
      .from('chat_sessions')
      .insert(sessionData)
      .select()
      .single();
      
    if (insertError) {
      console.error('❌ Chat Sessions API: Error creating session', insertError);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }
    
    console.log(`✅ Chat Sessions API: Created session ${session.id} for user ${user.id}`);
    return NextResponse.json({ session }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Chat Sessions API: Unexpected error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/chat/sessions?sessionId=uuid
 * Update a chat session (title, metadata)
 */
export async function PATCH(request: Request) {
  console.log('📂 Chat Sessions API: PATCH request received');
  
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      console.log('❌ Chat Sessions API: Missing sessionId parameter');
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { title, metadata } = body;
    
    const supabase = await createClient();
    
    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('⚠️ Chat Sessions API: Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Verify user owns the session and update it
    const updateData: any = { updated_at: new Date().toISOString() };
    if (title !== undefined) updateData.title = title;
    if (metadata !== undefined) updateData.metadata = metadata;
    
    const { data: session, error: updateError } = await supabase
      .from('chat_sessions')
      .update(updateData)
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .select()
      .single();
      
    if (updateError) {
      console.error('❌ Chat Sessions API: Error updating session', updateError);
      return NextResponse.json(
        { error: 'Failed to update session' },
        { status: 500 }
      );
    }
    
    if (!session) {
      console.log('❌ Chat Sessions API: Session not found or unauthorized', { sessionId, userId: user.id });
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    console.log(`✅ Chat Sessions API: Updated session ${sessionId}`);
    return NextResponse.json({ session });
    
  } catch (error) {
    console.error('❌ Chat Sessions API: Unexpected error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
