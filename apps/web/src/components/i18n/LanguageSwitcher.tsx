'use client'

import { useI18n } from './I18nProvider'
import { Locale, SUPPORTED_LOCALES } from '@/lib/i18n'
import { motion, AnimatePresence } from 'framer-motion'
import { Languages, ChevronDown, Check } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export function LanguageSwitcher() {
    const { locale, setLocale, t } = useI18n()
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const languages = {
        en: { name: t('common.languageOptions.en'), flag: '🇬🇧' },
        de: { name: t('common.languageOptions.de'), flag: '🇩🇪' },
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 group"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-label={t('common.language')}
            >
                <Languages className="w-4 h-4 text-gray-400 group-hover:text-[#D4AF37] transition-colors" />
                <span className="text-sm font-medium text-gray-300 uppercase">{locale}</span>
                <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.ul
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="absolute right-0 mt-2 w-40 py-2 bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-[10001] overflow-hidden"
                        role="listbox"
                    >
                        {SUPPORTED_LOCALES.map((lang) => (
                            <li key={lang}>
                                <button
                                    onClick={() => {
                                        setLocale(lang as Locale)
                                        setIsOpen(false)
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-white/5 ${locale === lang ? 'text-[#D4AF37]' : 'text-gray-300'
                                        }`}
                                    role="option"
                                    aria-selected={locale === lang}
                                >
                                    <div className="flex items-center gap-3">
                                        <span>{languages[lang as Locale].flag}</span>
                                        <span>{languages[lang as Locale].name}</span>
                                    </div>
                                    {locale === lang && <Check className="w-4 h-4" />}
                                </button>
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    )
}
