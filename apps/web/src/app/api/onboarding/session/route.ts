/**
 * API route for managing onboarding sessions
 * Handles session creation, retrieval, and message persistence
 */

import { createClient, createServiceClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface SessionMetadata {
  progress?: number;
  last_question_topic?: string;
  is_complete?: boolean;
}

/**
 * Helper to get effective user ID from various auth methods
 */
async function getEffectiveUserId(request: Request): Promise<string | null> {
  // Try server-side auth first
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.id) {
    console.log('🔐 Authenticated via server session');
    return user.id;
  }

  // Try Authorization header with access token
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const accessToken = authHeader.slice(7);
    const authedClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      }
    );
    const { data: { user: tokenUser } } = await authedClient.auth.getUser();
    if (tokenUser?.id) {
      console.log('🔑 Authenticated via Bearer token');
      return tokenUser.id;
    }
  }

  // Try query params for userId (last resort, trust client)
  const url = new URL(request.url);
  const queryUserId = url.searchParams.get('userId');
  if (queryUserId) {
    console.log('🟡 Using client-provided userId from query');
    return queryUserId;
  }

  return null;
}

/**
 * GET /api/onboarding/session
 * Get or create the user's onboarding session
 */
export async function GET(request: Request) {
  console.log('📂 Onboarding Session API: GET request');
  
  try {
    const effectiveUserId = await getEffectiveUserId(request);
    
    if (!effectiveUserId) {
      console.log('⚠️ Onboarding Session API: Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('📂 Loading session for user:', effectiveUserId);
    const serviceClient = await createServiceClient();
    
    // Check for existing incomplete onboarding session
    const { data: existingSessions, error: fetchError } = await serviceClient
      .from('chat_sessions')
      .select('*')
      .eq('user_id', effectiveUserId)
      .eq('type', 'onboarding')
      .order('updated_at', { ascending: false })
      .limit(1);
    
    if (fetchError) {
      console.error('❌ Error fetching session:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
    }
    
    let session = null;
    let messages: Record<string, unknown>[] = [];
    let isResuming = false;
    
    if (existingSessions && existingSessions.length > 0) {
      const existing = existingSessions[0];
      
      if (!existing.metadata?.is_complete) {
        // Resume existing incomplete session
        console.log('📂 Found existing onboarding session:', existing.id);
        session = existing;
        isResuming = true;
        
        // Load existing messages
        const { data: existingMessages, error: messagesError } = await serviceClient
          .from('chat_messages')
          .select('*')
          .eq('session_id', existing.id)
          .order('created_at', { ascending: true });
        
        if (messagesError) {
          console.error('❌ Error fetching messages:', messagesError);
        } else {
          messages = existingMessages || [];
          console.log(`📨 Loaded ${messages.length} existing messages`);
        }
      } else {
        // Previous session was complete, create new one
        console.log('📂 Previous session complete, creating new one');
        session = await createNewSession(serviceClient, effectiveUserId);
      }
    } else {
      // No existing session, create new one
      console.log('📂 No existing session, creating new one');
      session = await createNewSession(serviceClient, effectiveUserId);
    }
    
    console.log('✅ Returning session response:', { 
      sessionId: session?.id, 
      messageCount: messages.length, 
      isResuming 
    });
    
    return NextResponse.json({
      session,
      messages,
      isResuming
    });
    
  } catch (error) {
    console.error('❌ Onboarding Session API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/onboarding/session
 * Save a message to the session
 */
export async function POST(request: Request) {
  console.log('📂 Onboarding Session API: POST request');
  
  try {
    const body = await request.json();
    const { sessionId, role, content, markComplete, userId: bodyUserId, accessToken } = body;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }
    
    // Get effective user ID using multiple auth methods
    let effectiveUserId: string | null = null;
    
    // Try server-side auth first
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) {
      effectiveUserId = user.id;
      console.log('🔐 POST: Authenticated via server session');
    }
    
    // Try accessToken from body
    if (!effectiveUserId && accessToken) {
      const authedClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        }
      );
      const { data: { user: tokenUser } } = await authedClient.auth.getUser();
      if (tokenUser?.id) {
        effectiveUserId = tokenUser.id;
        console.log('🔑 POST: Authenticated via accessToken');
      }
    }
    
    // Fallback to bodyUserId
    if (!effectiveUserId && bodyUserId) {
      effectiveUserId = bodyUserId;
      console.log('🟡 POST: Using client-provided userId');
    }
    
    if (!effectiveUserId) {
      console.log('⚠️ Onboarding Session API: Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const serviceClient = await createServiceClient();
    
    // If marking complete
    if (markComplete) {
      const { error: updateError } = await serviceClient
        .from('chat_sessions')
        .update({
          metadata: { is_complete: true, progress: 100 },
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);
      
      if (updateError) {
        console.error('❌ Error marking session complete:', updateError);
        return NextResponse.json({ error: 'Failed to mark complete' }, { status: 500 });
      }
      
      console.log('✅ Session marked complete:', sessionId);
      return NextResponse.json({ success: true });
    }
    
    // Save message
    if (role && content) {
      const { data: message, error: insertError } = await serviceClient
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          role,
          content,
          metadata: {}
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('❌ Error saving message:', insertError);
        return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
      }
      
      // Update session's updated_at
      await serviceClient
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId);
      
      console.log(`💾 Saved ${role} message to session ${sessionId}`);
      return NextResponse.json({ message });
    }
    
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    
  } catch (error) {
    console.error('❌ Onboarding Session API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/onboarding/session
 * Update session metadata
 */
export async function PATCH(request: Request) {
  console.log('📂 Onboarding Session API: PATCH request');
  
  try {
    const body = await request.json();
    const { sessionId, metadata } = body;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }
    
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('⚠️ Onboarding Session API: Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const serviceClient = await createServiceClient();
    
    // Get current metadata
    const { data: session } = await serviceClient
      .from('chat_sessions')
      .select('metadata')
      .eq('id', sessionId)
      .single();
    
    const newMetadata = { ...(session?.metadata || {}), ...metadata };
    
    const { error: updateError } = await serviceClient
      .from('chat_sessions')
      .update({
        metadata: newMetadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);
    
    if (updateError) {
      console.error('❌ Error updating session:', updateError);
      return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
    }
    
    console.log('📝 Updated session metadata:', metadata);
    return NextResponse.json({ success: true, metadata: newMetadata });
    
  } catch (error) {
    console.error('❌ Onboarding Session API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function createNewSession(supabase: ReturnType<typeof createServiceClient> extends Promise<infer T> ? T : never, userId: string) {
  const sessionData = {
    user_id: userId,
    title: 'Onboarding',
    type: 'onboarding',
    metadata: {
      progress: 0,
      is_complete: false
    } as SessionMetadata
  };
  
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert(sessionData)
    .select()
    .single();
  
  if (error) {
    console.error('❌ Error creating session:', error);
    return null;
  }
  
  console.log('✅ Created new onboarding session:', data.id);
  return data;
}
