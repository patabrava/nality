'use client'

import { useI18n } from '@/components/i18n/I18nProvider'

export default function CustomerValueSection() {
  const { t } = useI18n()

  const customerSegments = [
    {
      title: t('customerValue.segments.0.title'),
      subtitle: t('customerValue.segments.0.subtitle'),
      description: t('customerValue.segments.0.description'),
      benefits: t('customerValue.segments.0.benefits'),
      testimonial: t('customerValue.segments.0.testimonial'),
      author: t('customerValue.segments.0.author'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 17l-5-3 5-3" />
        </svg>
      )
    },
    {
      title: t('customerValue.segments.1.title'),
      subtitle: t('customerValue.segments.1.subtitle'),
      description: t('customerValue.segments.1.description'),
      benefits: t('customerValue.segments.1.benefits'),
      testimonial: t('customerValue.segments.1.testimonial'),
      author: t('customerValue.segments.1.author'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      )
    },
    {
      title: t('customerValue.segments.2.title'),
      subtitle: t('customerValue.segments.2.subtitle'),
      description: t('customerValue.segments.2.description'),
      benefits: t('customerValue.segments.2.benefits'),
      testimonial: t('customerValue.segments.2.testimonial'),
      author: t('customerValue.segments.2.author'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18" />
          <path d="M5 21V7l8-4v18" />
          <path d="M19 21V11l-6-4" />
          <path d="M9 9v1" />
          <path d="M9 15v1" />
          <path d="M15 13v1" />
        </svg>
      )
    }
  ]

  return (
    <section className="section">
      <div className="section-header">
        <span className="section-label">{t('customerValue.label')}</span>
        <h2 className="section-title">
          {t('customerValue.title')} <span className="serif-text italic text-gold">{t('customerValue.highlight')}</span>
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
          {t('customerValue.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {customerSegments.map((segment, index) => (
          <div
            key={index}
            className="bg-white p-8 text-center group hover:transform hover:scale-105 transition-all duration-500 rounded-lg border border-gray-200 shadow-lg"
          >
            {/* Icon */}
            <div className="feature-icon text-4xl mb-6 text-gold">
              {segment.icon}
            </div>

            {/* Title */}
            <h3 className="text-2xl font-serif mb-2 text-gray-900">{segment.title}</h3>
            <h4 className="text-lg mb-4 text-gold font-medium">{segment.subtitle}</h4>

            {/* Description */}
            <p className="text-gray-700 mb-6 leading-relaxed">{segment.description}</p>

            {/* Benefits */}
            <ul className="text-sm text-gray-600 mb-6 space-y-2">
              {Array.isArray(segment.benefits) && segment.benefits.map((benefit: string, benefitIndex: number) => (
                <li key={benefitIndex} className="flex items-center text-left">
                  <svg className="w-4 h-4 mr-3 text-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ width: '16px', height: '16px', minWidth: '16px', minHeight: '16px' }}>
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {benefit}
                </li>
              ))}
            </ul>

            {/* Testimonial */}
            <blockquote className="border-l-4 border-gold pl-4 italic text-gray-600 text-sm text-left">
              <p>{segment.testimonial}</p>
              <cite className="block mt-2 text-gold font-medium">— {segment.author}</cite>
            </blockquote>
          </div>
        ))}
      </div>
    </section>
  )
}