'use client'

import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, messages, getNestedValue } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'

export function useLocale() {
  const pathname = usePathname()

  const locale = useMemo((): Locale => {
    // Extract locale from pathname
    if (pathname === '/en' || pathname.startsWith('/en/')) {
      return 'en'
    }
    // Default to German for / and any other path
    return 'de'
  }, [pathname])

  const t = useMemo(() => {
    return (path: string) => {
      const localeMessages = messages[locale] ?? messages[DEFAULT_LOCALE]
      const value = getNestedValue(localeMessages, path)
      if (value !== undefined) return value
      return getNestedValue(messages[DEFAULT_LOCALE], path) ?? path
    }
  }, [locale])

  return {
    locale,
    t,
    messages: messages[locale]
  }
}