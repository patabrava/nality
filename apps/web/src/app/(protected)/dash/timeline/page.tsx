'use client'

import { TimelineModule } from '@/modules/timeline/TimelineModule'
import { usePageTitle } from '@/hooks/usePageTitle'

// Force dynamic rendering to avoid build-time Supabase errors
export const dynamic = 'force-dynamic'

/**
 * Timeline Page - Module entry point for dashboard shell
 * Loads timeline module within dashboard navigation structure
 */
export default function TimelinePage() {
  usePageTitle('Timeline')
  console.log('[TimelinePage] Module page mounted')
  
  return <TimelineModule />
}
