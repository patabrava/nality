'use client'

import { ContactPlaceholder } from '@/modules/contact/ContactPlaceholder'

/**
 * Contact Page - Module entry point for dashboard shell
 * Loads contact placeholder module
 */
export default function ContactPage() {
  console.log('[ContactPage] Module page mounted')
  
  return <ContactPlaceholder />
}
