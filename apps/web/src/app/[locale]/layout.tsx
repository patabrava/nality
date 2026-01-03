import type { Metadata } from "next"
import { ConsentProvider } from "@/contexts/ConsentContext"
import ConsentBanner from "@/components/consent/ConsentBanner"
import { resolveLocale, SUPPORTED_LOCALES, DEFAULT_LOCALE } from "@/lib/i18n"
import { generateSEOMetadata } from "@/lib/seo"
import type { Locale } from "@/lib/i18n"

interface LocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: localeParam } = await params
  const locale = resolveLocale(localeParam) as Locale
  
  return generateSEOMetadata({
    locale,
    pageType: 'homepage'
  })
}

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({
    locale,
  }))
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: localeParam } = await params
  
  // Robust locale resolution with explicit fallback
  const locale = (SUPPORTED_LOCALES.includes(localeParam as Locale) ? localeParam : DEFAULT_LOCALE) as Locale
  
  // Nested layout should NOT render html/body tags OR duplicate providers
  // Root layout already provides ThemeProvider and I18nProvider
  // This layout only adds locale-specific providers like ConsentProvider
  return (
    <ConsentProvider>
      {children}
      <ConsentBanner />
    </ConsentProvider>
  )
}