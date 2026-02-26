'use client'

import { useAuth } from '@/hooks/useAuth'
import HeroCanvas from './HeroCanvas'
import { useI18n } from '@/components/i18n/I18nProvider'
import { isAltOnboardingEnabled } from '@/lib/onboarding/flags'

interface HeroSectionProps {
  onSecondaryAction?: () => void
}

export default function HeroSection({ onSecondaryAction }: HeroSectionProps) {
  const { isAuthenticated } = useAuth()
  const { t } = useI18n()

  const handleStartStory = () => {
    if (isAuthenticated) {
      window.location.href = '/dash'
    } else {
      window.location.href = isAltOnboardingEnabled() ? '/alt-onboarding' : '/login'
    }
  }

  const handleSampleBook = () => {
    const outcomesSection = document.getElementById('outcomes')
    if (outcomesSection) {
      outcomesSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    onSecondaryAction?.()
  }

  return (
    <section className="hero-section">
      <HeroCanvas />

      <div className="hero-content">
        <div>
          <h1 className="hero-title">
            {t('hero.titleLine')}<br />
            <span className="serif-text italic text-gradient-gold">{t('hero.titleHighlight')}</span>
          </h1>
          <p className="hero-subtitle">
            {t('hero.subtitle')}
          </p>
          <div className="hero-actions">
            <button onClick={handleStartStory} className="btn btn-primary">{t('hero.primaryCta')}</button>
            <button onClick={handleSampleBook} className="btn btn-secondary">{t('hero.secondaryCta')}</button>
          </div>
          <p className="mt-8 text-xs text-gray-500 tracking-widest uppercase opacity-0 animate-[fadeUp_1s_ease-out_1.2s_forwards]">
            {t('hero.trust')}
          </p>
        </div>

        <div className="hero-visual-container">
          {/* Abstract Representation of the App */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full max-w-md mx-auto">
              {/* Background Glow */}
              

              {/* Floating Cards (Mock UI) */}
              <div className="glass-card absolute top-10 left-0 w-64 p-6 transform -rotate-6 animate-[float_6s_ease-in-out_infinite]">
                <div className="text-xs text-gold mb-2 uppercase tracking-wider">{t('hero.timelineBegin')}</div>
                <div className="h-2 w-3/4 bg-white/10 rounded mb-2"></div>
                <div className="h-2 w-1/2 bg-white/10 rounded"></div>
              </div>

              <div className="glass-card absolute top-1/2 right-0 w-72 p-6 transform rotate-3 translate-y-10 z-20 animate-[float_7s_ease-in-out_infinite_1s]">
                <div className="text-xs text-gold mb-2 uppercase tracking-wider">{t('hero.timelineLegacy')}</div>
                <div className="text-xl serif-text italic mb-2">{t('hero.momentQuote')}</div>
                <div className="h-2 w-full bg-white/10 rounded"></div>
              </div>

              <div
                            className="glass-card absolute bottom-10 left-10 w-56 p-4 transform -rotate-3 z-10 animate-[float_8s_ease-in-out_infinite_0.5s]">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                        strokeLinejoin="round">
                                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                        <line x1="12" y1="19" x2="12" y2="23" />
                                        <line x1="8" y1="23" x2="16" y2="23" />
                                    </svg>
                                </div>
                                <div className="text-sm text-gray-300">Recording Session...</div>
                            </div>
                        </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
