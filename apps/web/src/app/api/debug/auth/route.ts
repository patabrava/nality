import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log('🔍 Debug Auth API: Starting authentication check');
  
  try {
    const supabase = await createClient();
    console.log('✅ Debug Auth API: Supabase client created');
    
    // Check user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('🔍 Debug Auth API: User check result', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      userError: userError?.message
    });
    
    // Check session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('🔍 Debug Auth API: Session check result', {
      hasSession: !!session,
      sessionUser: session?.user?.id,
      sessionError: sessionError?.message
    });
    
    return NextResponse.json({
      user: {
        id: user?.id || null,
        email: user?.email || null,
        authenticated: !!user
      },
      session: {
        exists: !!session,
        userId: session?.user?.id || null,
        expiresAt: session?.expires_at || null
      },
      errors: {
        userError: userError?.message || null,
        sessionError: sessionError?.message || null
      },
      debug: {
        timestamp: new Date().toISOString(),
        hasSupabaseClient: !!supabase
      }
    });
    
  } catch (error) {
    console.error('❌ Debug Auth API: Unexpected error', error);
    return NextResponse.json(
      { 
        error: 'Debug auth check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
