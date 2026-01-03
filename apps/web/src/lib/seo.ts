import type { Metadata } from 'next'
import { messages } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'

interface SEOConfig {
  locale: Locale
  path?: string
  pageType?: 'homepage' | 'legal' | 'other'
}

export function generateSEOMetadata({ locale, path = '', pageType = 'homepage' }: SEOConfig): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nality.com'
  const localeMessages = messages[locale]
  
  // Generate URLs
  const canonicalUrl = locale === 'de' 
    ? `${baseUrl}${path}` 
    : `${baseUrl}/en${path}`
  
  // Get content based on page type
  let title: string
  let description: string
  
  if (pageType === 'homepage') {
    const heroTitle = localeMessages?.hero?.title ?? "Your life, beautifully told"
    title = `Nality — ${heroTitle}`
    description = localeMessages?.hero?.subtitle ?? "Turn memories into a living timeline and a beautiful Life Book. Private by design. Start in minutes."
  } else if (pageType === 'legal') {
    title = `${localeMessages?.legal?.placeholder || 'Legal'} — Nality`
    description = `Legal information for Nality - ${localeMessages?.hero?.subtitle || 'Life story platform'}`
  } else {
    title = "Nality — Your life, beautifully told"
    description = "Turn memories into a living timeline and a beautiful Life Book."
  }

  // Generate structured data for homepage
  const structuredData = pageType === 'homepage' ? {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Nality",
    "description": description,
    "url": canonicalUrl,
    "applicationCategory": "LifestyleApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock"
    },
    "inLanguage": [
      {
        "@type": "Language",
        "name": "German",
        "alternateName": "de"
      },
      {
        "@type": "Language", 
        "name": "English",
        "alternateName": "en"
      }
    ],
    "publisher": {
      "@type": "Organization",
      "name": "Nality"
    }
  } : null

  return {
    title,
    description,
    keywords: pageType === 'homepage' ? [
      "life story",
      "timeline",
      "memories", 
      "family history",
      "personal timeline",
      "AI assistant",
      "life book",
      "memoir",
      "biography",
      "storytelling",
      ...(locale === 'de' ? ["lebensgeschichte", "erinnerungen", "timeline", "familie"] : [])
    ] : undefined,
    authors: [{ name: "Nality Team" }],
    creator: "Nality",
    publisher: "Nality",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'de': baseUrl,
        'en': `${baseUrl}/en`,
        'x-default': baseUrl,
      }
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Nality',
      locale: locale === 'de' ? 'de_DE' : 'en_US',
      type: 'website',
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: title,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/og-image.png`],
    },
    other: structuredData ? {
      'application/ld+json': JSON.stringify(structuredData)
    } : undefined,
  }
}