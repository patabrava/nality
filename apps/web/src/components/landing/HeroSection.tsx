'use client'

import { useAuth } from '@/hooks/useAuth'
import HeroCanvas from './HeroCanvas'

interface HeroSectionProps {
  onSecondaryAction?: () => void
}

export default function HeroSection({ onSecondaryAction }: HeroSectionProps) {
  const { isAuthenticated } = useAuth()

  const handleStartStory = () => {
    if (isAuthenticated) {
      window.location.href = '/dash'
    } else {
      window.location.href = '/login'
    }
  }

  const handleSampleBook = () => {
    onSecondaryAction?.()
    console.log('Sample book clicked')
  }

  return (
    <section className="hero-section">
      <HeroCanvas />

      <div className="hero-content">
        <div>
          <h1 className="hero-title">Your life,<br/><span className="serif-text italic text-gradient-gold">beautifully told.</span></h1>
          <p className="hero-subtitle">
            Nality helps you turn memories into a living timeline and a gorgeous Life Book—guided by an
            intelligent companion and, if you like, a real interviewer.
          </p>
          <div className="hero-actions">
            <button onClick={handleStartStory} className="btn btn-primary">Start My Story</button>
            <button onClick={handleSampleBook} className="btn btn-secondary">View Sample Book</button>
          </div>
          <p className="mt-8 text-xs text-gray-500 tracking-widest uppercase opacity-0 animate-[fadeUp_1s_ease-out_1.2s_forwards]">
            Private by design. You control who sees your story.
          </p>
        </div>

        <div className="hero-visual-container">
          {/* Abstract Representation of the App */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full max-w-md mx-auto">
              {/* Background Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-900 rounded-full blur-[100px] opacity-20"></div>

              {/* Floating Cards (Mock UI) */}
              <div className="glass-card absolute top-10 left-0 w-64 p-6 transform -rotate-6 animate-[float_6s_ease-in-out_infinite]">
                <div className="text-xs text-gold mb-2 uppercase tracking-wider">1985 • The Beginning</div>
                <div className="h-2 w-3/4 bg-white/10 rounded mb-2"></div>
                <div className="h-2 w-1/2 bg-white/10 rounded"></div>
              </div>

              <div className="glass-card absolute top-1/2 right-0 w-72 p-6 transform rotate-3 translate-y-10 z-20 animate-[float_7s_ease-in-out_infinite_1s]">
                <div className="text-xs text-gold mb-2 uppercase tracking-wider">2023 • Legacy</div>
                <div className="text-xl serif-text italic mb-2">"It was a moment of absolute clarity..."</div>
                <div className="h-2 w-full bg-white/10 rounded"></div>
              </div>

              <div className="glass-card absolute bottom-10 left-10 w-56 p-4 transform -rotate-3 z-10 animate-[float_8s_ease-in-out_infinite_0.5s]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
