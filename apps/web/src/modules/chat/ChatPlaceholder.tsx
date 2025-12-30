import { MessageSquare, Bot, Check } from 'lucide-react'
import { useI18n } from '@/components/i18n/I18nProvider'

/**
 * Chat Module Placeholder
 * Preview interface for future chat functionality
 */
export function ChatPlaceholder() {
  const { t } = useI18n()
  console.log('[ChatPlaceholder] Component mounted')

  return (
    <section
      className="flex h-full items-center justify-center p-8"
      style={{
        backgroundColor: 'var(--c-primary-invert)',
        minHeight: '100vh'
      }}
    >
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
            <Bot size={48} strokeWidth={1.5} />
          </div>
        </div>

        <h2
          className="text-3xl font-semibold"
          style={{ color: 'var(--c-primary-100)' }}
        >
          {t('dashboardNav.chat.comingSoon')}
        </h2>

        <p
          className="text-lg leading-relaxed"
          style={{ color: 'var(--c-neutral-dark)' }}
        >
          {t('dashboardNav.chat.subtitle')}
        </p>

        <div className="pt-4">
          <button
            className="h-12 px-8 rounded-xl font-semibold text-lg transition-all duration-200 opacity-60 cursor-not-allowed"
            style={{
              backgroundColor: 'var(--c-neutral-medium)',
              color: 'var(--c-primary-invert)'
            }}
            disabled
          >
            {t('dashboardNav.chat.startChat')}
          </button>
        </div>

        <div className="pt-6 space-y-3">
          <p
            className="text-sm font-medium"
            style={{ color: 'var(--c-primary-100)' }}
          >
            {t('dashboardNav.chat.plannedFeatures')}
          </p>
          <ul
            className="text-sm space-y-2 text-left inline-block mx-auto"
            style={{ color: 'var(--c-neutral-dark)' }}
          >
            <li className="flex items-center gap-2"><Check size={14} className="text-[#D4AF37]" /> {t('dashboardNav.chat.featureTimeline')}</li>
            <li className="flex items-center gap-2"><Check size={14} className="text-[#D4AF37]" /> {t('dashboardNav.chat.featureMemories')}</li>
            <li className="flex items-center gap-2"><Check size={14} className="text-[#D4AF37]" /> {t('dashboardNav.chat.featureDescriptions')}</li>
            <li className="flex items-center gap-2"><Check size={14} className="text-[#D4AF37]" /> {t('dashboardNav.chat.featureInsights')}</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
