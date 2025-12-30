'use client'

import { useI18n } from '@/components/i18n/I18nProvider'
import { Languages } from 'lucide-react'
import { SUPPORTED_LOCALES } from '@/lib/i18n'

export default function Footer() {
  const { t, locale, setLocale } = useI18n()

  const sections = [
    { key: 'product', data: t('footer.product') },
    { key: 'company', data: t('footer.company') },
    { key: 'legal', data: t('footer.legal') },
    { key: 'social', data: t('footer.social') }
  ]

  return (
    <footer className="py-20 px-[5vw] border-t border-white/10">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 text-left">
        {/* Brand Section */}
        <div className="col-span-2 lg:col-span-1">
          <h2 className="text-2xl font-serif mb-6 tracking-tight text-white">NALITY</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            {t('footer.tagline')}
          </p>

          {/* Language Toggle */}
          <div className="flex items-center gap-4 pt-4 border-t border-white/5">
            <Languages size={14} className="text-gray-500" />
            <div className="flex gap-3">
              {SUPPORTED_LOCALES.map((l) => (
                <button
                  key={l}
                  onClick={() => setLocale(l)}
                  className={`text-[10px] uppercase tracking-widest transition-colors ${locale === l
                      ? 'text-[#D4AF37] font-bold'
                      : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                  {t(`common.languageOptions.${l}`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Links Sections */}
        {sections.map((section) => (
          <div key={section.key}>
            <h3 className="text-white font-medium mb-6 uppercase text-xs tracking-widest">
              {section.data?.title}
            </h3>
            <ul className="space-y-4">
              {Array.isArray(section.data?.links) && section.data.links.map((link: any, index: number) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-[#D4AF37] transition-colors text-sm flex items-center gap-2"
                  >
                    {link.icon && <span>{link.icon}</span>}
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-gray-500 text-xs">
          {t('footer.copyright').replace('{year}', String(new Date().getFullYear()))}
        </p>
        <p className="text-gray-500 text-xs italic font-serif">
          {t('footer.taglineElite')}
        </p>
      </div>
    </footer>
  )
}
