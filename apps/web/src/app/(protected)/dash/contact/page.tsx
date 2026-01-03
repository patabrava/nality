'use client'

import { ContactPlaceholder } from '@/modules/contact/ContactPlaceholder'
import { usePageTitle } from '@/hooks/usePageTitle'

/**
 * Contact Page - Module entry point for dashboard shell
 * Loads contact placeholder module
 */
export default function ContactPage() {
  usePageTitle('Contact')
  console.log('[ContactPage] Module page mounted')
  
  return <ContactPlaceholder />
}
