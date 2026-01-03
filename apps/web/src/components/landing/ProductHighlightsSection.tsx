'use client'

import { useLocale } from '@/components/i18n/useLocale'

const features = [
  {
    title: "AI-Powered Memory Assistant",
    description: "Our intelligent chat guides you through your life story with personalized questions. Voice or text input, automatic structuring, and smart gap detection to ensure nothing important is forgotten.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    )
  },
  {
    title: "Interactive Life Timeline",
    description: "Beautiful, drag-and-drop timeline with rich media support. Organize by decades, themes, or relationships. Real-time collaboration and automatic backups ensure your story is always safe.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l4 2" />
      </svg>
    )
  },
  {
    title: "Expert Interview Service",
    description: "Professional storytellers and journalists help capture deeper narratives. Seamless booking, HD recording, AI transcription, and integration into your timeline. Perfect for family elders.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <circle cx="19" cy="7" r="2" />
        <path d="M19 14v7" />
        <path d="M22 17l-3-3 3-3" />
      </svg>
    )
  },
  {
    title: "Premium Publishing Suite",
    description: "Transform your timeline into a stunning hardbound book, digital memoir, or shareable family archive. Custom layouts, professional printing, and secure family sharing options.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        <path d="M9 10h6" />
        <path d="M9 14h6" />
      </svg>
    )
  },
  {
    title: "Rich Media Library",
    description: "Upload photos, videos, documents, and audio recordings. Smart organization, facial recognition, and automatic metadata extraction. Cloud storage with family access controls.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
    )
  },
  {
    title: "Legacy Preservation Technology",
    description: "Bank-grade security, automatic backups, and 100-year digital preservation guarantee. Your family's stories will outlast generations with our quantum-resistant encryption.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        <circle cx="12" cy="16" r="1" />
      </svg>
    )
  }
]

export default function ProductHighlightsSection() {
  const { t } = useLocale()
  const detailedFeatures = t('productHighlights.detailedFeatures') as Array<{ title: string; description: string }>

  return (
    <section className="section">
      <div className="section-header">
        <span className="section-label">{t('productHighlights.sectionLabel')}</span>
        <h2 className="section-title">{t('productHighlights.sectionTitle')} <span className="serif-text italic text-gold">{t('productHighlights.sectionTitleHighlight')}</span></h2>
        <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
          {t('productHighlights.sectionDescription')}
        </p>
      </div>

      <div className="feature-grid">
        {detailedFeatures.map((feature, index) => (
          <div key={index} className="feature-card">
            <div className="feature-icon">
              {features[index]?.icon}
            </div>
            <h3 className="text-2xl font-serif mb-4">{feature.title}</h3>
            <p className="text-gray-400 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
