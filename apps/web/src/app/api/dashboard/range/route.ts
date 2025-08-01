import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/dashboard/range
 * Returns the date range covered by user's life events
 * 
 * Response: { start: string | null, end: string | null, totalYears: number }
 * Errors: 401 (unauthorized), 500 (server error)
 */
export async function GET() {
  const startTime = performance.now()
  console.log('📅 Dashboard API: Fetching date range')

  try {
    const supabase = createClient()
    
    // Get current user - fail fast if unauthorized
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.log('⚠️ Dashboard API: Unauthorized access attempt')
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Valid authentication required' },
        { status: 401 }
      )
    }

    // Query earliest and latest dates from life events
    const { data, error: queryError } = await supabase
      .from('life_events')
      .select('start_date, end_date')
      .eq('user_id', user.id)
      .order('start_date', { ascending: true })

    if (queryError) {
      console.log('❌ Dashboard API: Database query failed', { error: queryError.message })
      return NextResponse.json(
        { error: 'Database Error', message: 'Failed to fetch date range' },
        { status: 500 }
      )
    }

    // Calculate range from data
    let start: string | null = null
    let end: string | null = null
    let totalYears = 0

    if (data && data.length > 0) {
      // Find earliest start date
      const firstEvent = data[0]
      if (firstEvent) {
        start = firstEvent.start_date
      }
      
      // Find latest end date (or start_date if no end_date)
      end = data.reduce((latest, event) => {
        const eventEnd = event.end_date || event.start_date
        return !latest || eventEnd > latest ? eventEnd : latest
      }, null as string | null)

      // Calculate total years if we have both dates
      if (start && end) {
        const startDate = new Date(start)
        const endDate = new Date(end)
        totalYears = Math.floor((endDate.getTime() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      }
    }

    const range = { start, end, totalYears }

    const queryTime = performance.now() - startTime
    console.log(`✅ Dashboard API: Range fetched successfully`, { 
      range,
      eventCount: data?.length || 0,
      queryTime: `${queryTime.toFixed(2)}ms`
    })

    return NextResponse.json(range)

  } catch (error) {
    const queryTime = performance.now() - startTime
    console.log('💥 Dashboard API: Unexpected error in range endpoint', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      queryTime: `${queryTime.toFixed(2)}ms`
    })

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
