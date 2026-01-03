'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useLocale } from './useLocale'
import type { Locale } from '@/lib/i18n'

interface LanguageSwitchProps {
  className?: string
}

export function LanguageSwitch({ className = '' }: LanguageSwitchProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { locale, t } = useLocale()

  const switchLocale = (newLocale: Locale) => {
    if (newLocale === locale) return

    // Determine the new path based on current locale structure
    let newPath: string
    
    if (pathname === '/' || pathname === '/de') {
      // Currently on German landing page
      newPath = newLocale === 'en' ? '/en' : '/'
    } else if (pathname === '/en') {
      // Currently on English landing page  
      newPath = newLocale === 'de' ? '/' : '/en'
    } else if (pathname.startsWith('/de/')) {
      // Currently on a German subpage
      newPath = newLocale === 'en' ? pathname.replace('/de', '/en') : pathname.replace('/de', '')
    } else if (pathname.startsWith('/en/')) {
      // Currently on an English subpage
      newPath = newLocale === 'de' ? pathname.replace('/en', '') : pathname
    } else {
      // Default handling for other paths
      newPath = newLocale === 'en' ? `/en${pathname}` : pathname
    }

    router.push(newPath)
  }

  return (
    <div className={`language-switch ${className}`} role="group" aria-label={t('common.language')}>
      <button
        onClick={() => switchLocale('de')}
        className={`language-option ${locale === 'de' ? 'active' : ''}`}
        aria-pressed={locale === 'de'}
        aria-label="Switch to German"
      >
        DE
      </button>
      <span className="separator" aria-hidden="true">|</span>
      <button
        onClick={() => switchLocale('en')}
        className={`language-option ${locale === 'en' ? 'active' : ''}`}
        aria-pressed={locale === 'en'}
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  )
}

export default LanguageSwitch