'use client'

import React, { createContext, useContext, useMemo, useState, useCallback } from 'react'
import { DEFAULT_LOCALE, Locale, messages, getNestedValue, resolveLocale } from '@/lib/i18n'

type I18nContextValue = {
  locale: Locale
  t: (path: string) => any
  setLocale: (locale: Locale) => void
  messages: Record<string, any>
}

const I18nContext = createContext<I18nContextValue | null>(null)

function setLocaleCookie(locale: Locale) {
  if (typeof document === 'undefined') return
  const expires = new Date()
  expires.setFullYear(expires.getFullYear() + 1)
  document.cookie = `locale=${locale}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`
}

export function I18nProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: React.ReactNode
  initialLocale?: Locale
}) {
  const [locale, setLocaleState] = useState<Locale>(resolveLocale(initialLocale))

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(resolveLocale(newLocale))
    setLocaleCookie(resolveLocale(newLocale))
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }, [])

  const t = useCallback(
    (path: string) => {
      const localeMessages = messages[locale] ?? messages[DEFAULT_LOCALE]
      const value = getNestedValue(localeMessages, path)
      if (value !== undefined) return value
      return getNestedValue(messages[DEFAULT_LOCALE], path) ?? path
    },
    [locale]
  )

  const value = useMemo(
    () => ({
      locale,
      t,
      setLocale,
      messages: messages[locale] ?? messages[DEFAULT_LOCALE],
    }),
    [locale, t]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return ctx
}
