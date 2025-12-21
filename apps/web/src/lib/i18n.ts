'use client'

import en from '../../messages/en.json'
import de from '../../messages/de.json'

export const SUPPORTED_LOCALES = ['en', 'de'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

export const messages: Record<Locale, Record<string, any>> = {
  en,
  de
}

export function resolveLocale(locale?: string | null): Locale {
  if (!locale) return DEFAULT_LOCALE
  const match = SUPPORTED_LOCALES.find(l => l === locale)
  return match ?? DEFAULT_LOCALE
}

export function getNestedValue(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return acc[key]
    }
    return undefined
  }, obj as any)
}
