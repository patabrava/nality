/**
 * API route for managing onboarding sessions
 * Handles session creation, retrieval, and message persistence
 */

import { createServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import {
  authenticationRequiredResponse,
  authorizationDeniedResponse,
  getAuthenticatedRequestContext,
} from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

interface SessionMetadata {
  progress?: number;
  last_question_topic?: string;
  is_complete?: boolean;
}

/**
 * GET /api/onboarding/session
 * Get or create the user's onboarding session
 */
export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedRequestContext(request);
    
    if (!auth) {
      return authenticationRequiredResponse();
    }
    
    const serviceClient = await createServiceClient();
    
    // Check for existing incomplete onboarding session
    const { data: existingSessions, error: fetchError } = await serviceClient
      .from('chat_sessions')
      .select('*')
      .eq('user_id', auth.user.id)
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
    
    // Check if user has already completed onboarding
    const { data: userData } = await serviceClient
      .from('users')
      .select('onboarding_complete')
      .eq('id', auth.user.id)
      .single();
    
    const userOnboardingComplete = userData?.onboarding_complete === true;
    
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
      } else if (userOnboardingComplete) {
        // User already completed onboarding, return the completed session without creating new
        console.log('📂 User already completed onboarding, returning completed session');
        session = existing;
        isResuming = false;
      } else {
        // Previous session was complete but user not marked complete, create new one
        session = await createNewSession(serviceClient, auth.user.id);
      }
    } else {
      // No existing session, create new one
      session = await createNewSession(serviceClient, auth.user.id);
    }

    if (!session) {
      return NextResponse.json({ error: 'Failed to load session' }, { status: 500 });
    }

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
  try {
    const auth = await getAuthenticatedRequestContext(request);
    if (!auth) {
      return authenticationRequiredResponse();
    }

    const body = await request.json();
    const { sessionId, role, content, markComplete } = body;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }
    
    const serviceClient = await createServiceClient();

    const { data: sessionCheck, error: sessionCheckError } = await serviceClient
      .from('chat_sessions')
      .select('id, user_id, metadata')
      .eq('id', sessionId)
      .single();

    if (sessionCheckError || !sessionCheck) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (sessionCheck.user_id !== auth.user.id) {
      return authorizationDeniedResponse();
    }
    
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
      
      // Also mark user as onboarding complete (using service client to bypass RLS)
      const { error: userUpdateError } = await serviceClient
        .from('users')
        .update({
          onboarding_complete: true,
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('id', auth.user.id);
      
      if (userUpdateError) {
        // Don't fail the request, session is already marked complete
      }
      
      return NextResponse.json({ success: true, userUpdated: !userUpdateError });
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
        return NextResponse.json({ error: 'Failed to save message', details: insertError.message }, { status: 500 });
      }
      
      // Update session's updated_at
      await serviceClient
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId);
      
      return NextResponse.json({ message });
    }
    
    return NextResponse.json({ error: 'Invalid request - role and content are required' }, { status: 400 });
    
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
  try {
    const auth = await getAuthenticatedRequestContext(request);
    if (!auth) {
      return authenticationRequiredResponse();
    }

    const body = await request.json();
    const { sessionId, metadata } = body;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }
    
    const serviceClient = await createServiceClient();
    
    // Get current metadata
    const { data: session } = await serviceClient
      .from('chat_sessions')
      .select('metadata, user_id')
      .eq('id', sessionId)
      .single();

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.user_id !== auth.user.id) {
      return authorizationDeniedResponse();
    }
    
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
