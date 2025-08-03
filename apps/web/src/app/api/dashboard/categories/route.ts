import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/dashboard/categories
 * Returns category breakdown of user's life events
 * 
 * Response: { categories: Record<string, number>, total: number }
 * Errors: 401 (unauthorized), 500 (server error)
 */
export async function GET() {
  const startTime = performance.now()
  console.log('🏷️ Dashboard API: Fetching category breakdown')

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

    // Query categories from life events
    const { data, error: queryError } = await supabase
      .from('life_events')
      .select('category')
      .eq('user_id', user.id)

    if (queryError) {
      console.log('❌ Dashboard API: Database query failed', { error: queryError.message })
      return NextResponse.json(
        { error: 'Database Error', message: 'Failed to fetch category data' },
        { status: 500 }
      )
    }

    // Count categories
    const categories: Record<string, number> = {}
    let total = 0

    if (data) {
      data.forEach(event => {
        const category = event.category || 'other'
        categories[category] = (categories[category] || 0) + 1
        total++
      })
    }

    const breakdown = { categories, total }

    const queryTime = performance.now() - startTime
    console.log(`✅ Dashboard API: Categories fetched successfully`, { 
      categoryCounts: Object.keys(categories).length,
      totalEvents: total,
      queryTime: `${queryTime.toFixed(2)}ms`
    })

    return NextResponse.json(breakdown)

  } catch (error) {
    const queryTime = performance.now() - startTime
    console.log('💥 Dashboard API: Unexpected error in categories endpoint', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      queryTime: `${queryTime.toFixed(2)}ms`
    })

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
