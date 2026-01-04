'use client'

import { useI18n } from './I18nProvider'
import { Locale, SUPPORTED_LOCALES } from '@/lib/i18n'

export function LanguageSwitcher() {
    const { locale, setLocale, t } = useI18n()

    const languages = {
        en: { code: 'EN', name: t('common.languageOptions.en') },
        de: { code: 'DE', name: t('common.languageOptions.de') },
    }

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
        }}>
            {SUPPORTED_LOCALES.map((lang, index) => (
                <div key={lang} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                        onClick={() => setLocale(lang as Locale)}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontFamily: locale === lang ? 'var(--font-serif)' : 'var(--font-sans)',
                            fontSize: locale === lang ? '1rem' : '0.875rem',
                            fontWeight: locale === lang ? '400' : '300',
                            color: locale === lang ? '#D4AF37' : 'rgba(255, 255, 255, 0.5)',
                            cursor: 'pointer',
                            padding: '0.25rem 0.75rem',
                            transition: 'color 0.2s ease',
                            letterSpacing: '0.05em',
                        }}
                        onMouseEnter={(e) => {
                            if (locale !== lang) {
                                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (locale !== lang) {
                                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'
                            }
                        }}
                        aria-label={`Switch to ${languages[lang as Locale].name}`}
                        aria-pressed={locale === lang}
                    >
                        {languages[lang as Locale].code}
                    </button>
                    {index < SUPPORTED_LOCALES.length - 1 && (
                        <span style={{
                            color: 'rgba(212, 175, 55, 0.3)',
                            fontSize: '0.875rem',
                            fontWeight: '300',
                        }}>|</span>
                    )}
                </div>
            ))}
        </div>
    )
}

