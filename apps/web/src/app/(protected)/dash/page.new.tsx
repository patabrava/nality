'use client'

import { MemoryFeedModule } from '@/modules/feed/MemoryFeedModule'

/**
 * Main Dashboard Page
 * 
 * Displays the Memory Feed as the home screen for the new UX.
 * Users can view their memories chronologically and add new ones.
 */
export default function DashboardPage() {
  return <MemoryFeedModule />
}
