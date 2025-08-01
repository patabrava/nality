'use client'

import { ViewPlaceholder } from '@/modules/view/ViewPlaceholder'

/**
 * View Page - Module entry point for dashboard shell
 * Loads view configurator placeholder module
 */
export default function ViewPage() {
  console.log('[ViewPage] Module page mounted')
  
  return <ViewPlaceholder />
}
