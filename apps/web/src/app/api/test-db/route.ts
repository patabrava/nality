import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET() {
  try {
    console.log('Testing database connection...')
    
    // Test life_event table directly with minimal query
    const { data: lifeEvents, error: lifeEventsError } = await supabase
      .from('life_event')
      .select('*')
      .limit(1)

    if (lifeEventsError) {
      console.error('Life events query error:', lifeEventsError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to query life_event table',
        details: lifeEventsError
      }, { status: 500 })
    }

    console.log('Life events data:', lifeEvents)

    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      lifeEventsCount: lifeEvents?.length || 0,
      sampleData: lifeEvents
    })

  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
