import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/dashboard/stats
 * Returns basic life event statistics for dashboard KPIs
 * 
 * Response: { eventCount: number, user_id: string }
 * Errors: 401 (unauthorized), 500 (server error)
 */
export async function GET() {
  const startTime = performance.now()
  console.log('📊 Dashboard API: Fetching life event statistics')

  try {
    const supabase = await createClient()
    
    // Get current user - fail fast if unauthorized
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.log('⚠️ Dashboard API: Unauthorized access attempt')
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Valid authentication required' },
        { status: 401 }
      )
    }

    // Query life events count for current user
    const { count, error: queryError } = await supabase
      .from('life_events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (queryError) {
      console.log('❌ Dashboard API: Database query failed', { error: queryError.message })
      return NextResponse.json(
        { error: 'Database Error', message: 'Failed to fetch statistics' },
        { status: 500 }
      )
    }

    const stats = {
      eventCount: count || 0,
      user_id: user.id
    }

    const queryTime = performance.now() - startTime
    console.log(`✅ Dashboard API: Stats fetched successfully`, { 
      eventCount: stats.eventCount,
      queryTime: `${queryTime.toFixed(2)}ms`
    })

    return NextResponse.json(stats)

  } catch (error) {
    const queryTime = performance.now() - startTime
    console.log('💥 Dashboard API: Unexpected error in stats endpoint', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      queryTime: `${queryTime.toFixed(2)}ms`
    })

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
