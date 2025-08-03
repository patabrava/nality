import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateUUID } from '@nality/schema/chat';

export const dynamic = 'force-dynamic';

/**
 * GET /api/chat/messages?sessionId=uuid
 * Fetch messages for a specific chat session
 */
export async function GET(request: Request) {
  console.log('📨 Chat Messages API: GET request received');
  
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      console.log('❌ Chat Messages API: Missing sessionId parameter');
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('⚠️ Chat Messages API: Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Verify user owns the session
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id, user_id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();
      
    if (sessionError || !session) {
      console.log('❌ Chat Messages API: Session not found or unauthorized', { sessionId, userId: user.id });
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // Fetch messages for the session
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
      
    if (messagesError) {
      console.error('❌ Chat Messages API: Error fetching messages', messagesError);
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }
    
    console.log(`✅ Chat Messages API: Fetched ${messages.length} messages for session ${sessionId}`);
    return NextResponse.json({ messages });
    
  } catch (error) {
    console.error('❌ Chat Messages API: Unexpected error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chat/messages
 * Create a new message in a chat session
 */
export async function POST(request: Request) {
  console.log('📨 Chat Messages API: POST request received');
  
  try {
    const body = await request.json();
    const { sessionId, role, content, metadata } = body;
    
    if (!sessionId || !role || !content) {
      console.log('❌ Chat Messages API: Missing required fields', { sessionId, role, hasContent: !!content });
      return NextResponse.json(
        { error: 'sessionId, role, and content are required' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('⚠️ Chat Messages API: Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Verify user owns the session
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id, user_id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();
      
    if (sessionError || !session) {
      console.log('❌ Chat Messages API: Session not found or unauthorized', { sessionId, userId: user.id });
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // Create the message
    const messageData = {
      id: generateUUID(),
      session_id: sessionId,
      role,
      content,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
    };
    
    const { data: message, error: insertError } = await supabase
      .from('chat_messages')
      .insert(messageData)
      .select()
      .single();
      
    if (insertError) {
      console.error('❌ Chat Messages API: Error creating message', insertError);
      return NextResponse.json(
        { error: 'Failed to create message' },
        { status: 500 }
      );
    }
    
    console.log(`✅ Chat Messages API: Created message ${message.id} in session ${sessionId}`);
    return NextResponse.json({ message }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Chat Messages API: Unexpected error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
