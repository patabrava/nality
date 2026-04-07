import { TimelineModule } from '@/modules/timeline/TimelineModule'

// Force dynamic rendering to avoid build-time Supabase errors
export const dynamic = 'force-dynamic'

/**
 * Timeline Page - Module entry point for dashboard shell
 * Loads timeline module within dashboard navigation structure
 */
export default function TimelinePage() {
  return <TimelineModule />
}
