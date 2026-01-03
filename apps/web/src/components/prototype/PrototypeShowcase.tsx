'use client'

import { useState, useRef } from 'react'
import { useLocale } from '@/components/i18n/useLocale'
import ConsentGate from '@/components/consent/ConsentGate'

interface PrototypeShowcaseProps {
  /** Custom styling */
  className?: string
  /** Show video preview */
  showVideoPreview?: boolean
  /** Show interactive elements */
  showInteractive?: boolean
}

export default function PrototypeShowcase({
  className = '',
  showVideoPreview = true,
  showInteractive = true
}: PrototypeShowcaseProps) {
  const { t } = useLocale()
  const [activeTab, setActiveTab] = useState<'timeline' | 'interview' | 'book'>('timeline')
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleVideoPlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const prototypeFeatures = [
    {
      id: 'timeline',
      icon: '📅',
      title: t('prototype.features.timeline.title'),
      description: t('prototype.features.timeline.description'),
      preview: '/images/timeline-preview.jpg'
    },
    {
      id: 'interview',
      icon: '🎙️',
      title: t('prototype.features.interview.title'),
      description: t('prototype.features.interview.description'),
      preview: '/images/interview-preview.jpg'
    },
    {
      id: 'book',
      icon: '📖',
      title: t('prototype.features.book.title'),
      description: t('prototype.features.book.description'),
      preview: '/images/book-preview.jpg'
    }
  ] as const

  const testimonials = [
    {
      quote: t('prototype.testimonials.sarah.quote'),
      author: 'Sarah M.',
      role: t('prototype.testimonials.sarah.role'),
      avatar: '👩‍💼'
    },
    {
      quote: t('prototype.testimonials.michael.quote'),
      author: 'Michael R.',
      role: t('prototype.testimonials.michael.role'),
      avatar: '👨‍🎨'
    },
    {
      quote: t('prototype.testimonials.elena.quote'),
      author: 'Elena K.',
      role: t('prototype.testimonials.elena.role'),
      avatar: '👩‍🔬'
    }
  ]

  return (
    <section className={`prototype-showcase ${className}`}>
      <div className="prototype-container">
        <div className="prototype-header">
          <span className="section-badge">
            {t('prototype.badge')}
          </span>
          
          <h2 className="section-title">
            {t('prototype.title')}
          </h2>
          
          <p className="section-subtitle">
            {t('prototype.subtitle')}
          </p>
        </div>

        {showVideoPreview && (
          <div className="prototype-video-section">
            <div className="video-container">
              <ConsentGate
                category="external-services"
                serviceName="YouTube"
                customMessage={t('prototype.video.consent')}
              >
                <div className="video-player">
                  <video
                    ref={videoRef}
                    poster="/images/video-thumbnail.jpg"
                    controls
                    className="prototype-video"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  >
                    <source src="/videos/nality-demo.mp4" type="video/mp4" />
                    {t('prototype.video.fallback')}
                  </video>
                  
                  <div className="video-overlay">
                    <button 
                      onClick={handleVideoPlay}
                      className="play-button"
                      aria-label={isPlaying ? t('prototype.video.pause') : t('prototype.video.play')}
                    >
                      <span className={`play-icon ${isPlaying ? 'playing' : ''}`}>
                        {isPlaying ? '⏸️' : '▶️'}
                      </span>
                    </button>
                  </div>
                </div>
              </ConsentGate>
              
              <div className="video-info">
                <h3 className="video-title">
                  {t('prototype.video.title')}
                </h3>
                <p className="video-description">
                  {t('prototype.video.description')}
                </p>
                <div className="video-stats">
                  <span className="stat-item">
                    <span className="stat-icon">⏱️</span>
                    {t('prototype.video.duration')}
                  </span>
                  <span className="stat-item">
                    <span className="stat-icon">👥</span>
                    {t('prototype.video.views')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {showInteractive && (
          <div className="prototype-interactive">
            <div className="feature-tabs">
              {prototypeFeatures.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => setActiveTab(feature.id)}
                  className={`tab-button ${activeTab === feature.id ? 'active' : ''}`}
                >
                  <span className="tab-icon">{feature.icon}</span>
                  <span className="tab-text">{feature.title}</span>
                </button>
              ))}
            </div>

            <div className="feature-content">
              {prototypeFeatures.map((feature) => (
                <div
                  key={feature.id}
                  className={`feature-panel ${activeTab === feature.id ? 'active' : ''}`}
                >
                  <div className="feature-preview">
                    <img
                      src={feature.preview}
                      alt={feature.title}
                      className="preview-image"
                      onError={(e) => {
                        // Fallback to placeholder
                        const target = e.target as HTMLImageElement
                        target.src = 'data:image/svg+xml;base64,' + btoa(`
                          <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                            <rect width="100%" height="100%" fill="#f3f4f6"/>
                            <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="16" fill="#9ca3af">
                              ${feature.title}
                            </text>
                          </svg>
                        `)
                      }}
                    />
                    
                    <div className="preview-overlay">
                      <button className="preview-action">
                        <span className="action-icon">👁️</span>
                        {t('prototype.interactive.viewDemo')}
                      </button>
                    </div>
                  </div>
                  
                  <div className="feature-details">
                    <h3 className="feature-title">{feature.title}</h3>
                    <p className="feature-description">{feature.description}</p>
                    
                    <div className="feature-benefits">
                      <ul className="benefits-list">
                        {feature.id === 'timeline' && (
                          <>
                            <li>{t('prototype.benefits.timeline.organize')}</li>
                            <li>{t('prototype.benefits.timeline.search')}</li>
                            <li>{t('prototype.benefits.timeline.share')}</li>
                          </>
                        )}
                        {feature.id === 'interview' && (
                          <>
                            <li>{t('prototype.benefits.interview.professional')}</li>
                            <li>{t('prototype.benefits.interview.comfortable')}</li>
                            <li>{t('prototype.benefits.interview.stories')}</li>
                          </>
                        )}
                        {feature.id === 'book' && (
                          <>
                            <li>{t('prototype.benefits.book.beautiful')}</li>
                            <li>{t('prototype.benefits.book.printed')}</li>
                            <li>{t('prototype.benefits.book.legacy')}</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="prototype-testimonials">
          <h3 className="testimonials-title">
            {t('prototype.testimonials.title')}
          </h3>
          
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-content">
                  <p className="testimonial-quote">"{testimonial.quote}"</p>
                  
                  <div className="testimonial-author">
                    <span className="author-avatar">{testimonial.avatar}</span>
                    <div className="author-info">
                      <span className="author-name">{testimonial.author}</span>
                      <span className="author-role">{testimonial.role}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="prototype-cta">
          <h3 className="cta-title">
            {t('prototype.cta.title')}
          </h3>
          
          <p className="cta-description">
            {t('prototype.cta.description')}
          </p>
          
          <div className="cta-buttons">
            <button className="cta-primary">
              {t('prototype.cta.start')}
            </button>
            
            <button className="cta-secondary">
              {t('prototype.cta.learn')}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}