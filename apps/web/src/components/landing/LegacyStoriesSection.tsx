'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/components/i18n/I18nProvider'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function LegacyStoriesSection() {
  const { t } = useI18n()

  const stories = t('legacyStories.stories')
  const stats = t('socialProof.stats')
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlaying || !Array.isArray(stories)) return
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % stories.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [isAutoPlaying, stories])

  const handlePrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + (stories?.length || 0)) % (stories?.length || 1))
  }

  const handleNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % (stories?.length || 1))
  }

  const handleDotClick = (index: number) => {
    setIsAutoPlaying(false)
    setCurrentIndex(index)
  }

  return (
    <section className="section" style={{ background: 'var(--md-sys-color-surface-dim)' }}>
      {/* Legacy Stories Headline Design */}
      <div className="section-header">
        <span className="section-label">{t('legacyStories.label')}</span>
        <h2 className="section-title">
          {t('legacyStories.title')}{' '}
          <span className="serif-text italic text-gold">{t('legacyStories.titleHighlight')}</span>
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
          {t('legacyStories.description')}
        </p>
      </div>

      {/* Stats Grid from Social Proof */}
      <div className="social-proof-stats" style={{ marginBottom: '4rem' }}>
        {Array.isArray(stats) && stats.map((stat: any, index: number) => (
          <div key={index} className="stat-item">
            <div className="stat-number">{stat.number}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Testimonials Carousel from Social Proof */}
      <div className="testimonials-carousel-container">
          <div className="testimonials-carousel-wrapper">
            {Array.isArray(stories) && stories.map((story: any, index: number) => (
              <blockquote
                key={index}
                className={`editorial-testimonial-carousel ${index === currentIndex ? 'active' : ''}`}
                style={{
                  transform: `translateX(${(index - currentIndex) * 100}%)`,
                  opacity: index === currentIndex ? 1 : 0,
                }}
              >
                <div className="editorial-quote-mark">"</div>
                <p className="editorial-quote-text">
                  {story.quote}
                </p>
                <footer className="editorial-attribution">
                  <cite className="editorial-author">— {story.author}</cite>
                  <span className="editorial-context">
                    {story.context}
                  </span>
                </footer>
              </blockquote>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={handlePrevious}
            className="carousel-nav-button carousel-prev"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={handleNext}
            className="carousel-nav-button carousel-next"
            aria-label="Next testimonial"
          >
            <ChevronRight size={24} />
          </button>

          {/* Dots Navigation */}
          <div className="carousel-dots">
            {Array.isArray(stories) && stories.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                aria-label={`Go to story ${index + 1}`}
              />
            ))}
          </div>
        </div>
    </section>
  )
}
