import type { Metadata } from "next"
import { cookies, headers } from "next/headers"
import { Roboto } from "next/font/google"
import "../styles/tokens.css"
import "../styles/utilities.css"
import "./globals.css"
import "../styles/timeline.css"
import "../styles/landing.css"
import { ThemeProvider, ThemeScript } from "@/components/theme/ThemeProvider"
import { I18nProvider } from "@/components/i18n/I18nProvider"
import { messages, resolveLocale } from "@/lib/i18n"

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get("locale")?.value
  const locale = resolveLocale(localeCookie)
  const heroDescription =
    messages[locale]?.hero?.subtitle ??
    "Turn memories into a living timeline and a beautiful Life Book. Private by design. Start in minutes."

  return {
    title: {
      template: '%s | Nality',
      default: 'Nality — Your Life, Beautifully Told',
    },
    description: heroDescription,
    keywords: [
      "life story",
      "timeline",
      "memories",
      "family history",
      "personal timeline",
      "AI assistant",
      "life book",
      "memoir",
    ],
    authors: [{ name: "Nality Team" }],
    creator: "Nality",
    publisher: "Nality",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      title: 'Nality — Your Life, Beautifully Told',
      description: heroDescription,
      type: "website",
      images: [
        {
          url: "/hero/hero-timeline-book.png",
          width: 1200,
          height: 800,
          alt: "A life timeline with photos alongside a preview of a printed Life Book",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: 'Nality — Your Life, Beautifully Told',
      description: heroDescription,
      images: ["/hero/hero-timeline-book.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies()
  const headersList = await headers()
  const localeCookie = cookieStore.get("locale")?.value
  const localeHeader = headersList.get("x-locale")
  const pathname = headersList.get("x-pathname") || headersList.get("x-invoke-path") || ""
  
  // Extract locale from pathname if available (e.g., /de or /en)
  let localeFromPath: string | null = null
  const pathMatch = pathname.match(/^\/(de|en)(?:\/|$)/)
  if (pathMatch && pathMatch[1]) {
    localeFromPath = pathMatch[1]
  }
  
  // Priority: pathname > header (middleware) > cookie
  const locale = resolveLocale(localeFromPath || localeHeader || localeCookie)

  return (
    <html lang={locale} data-theme="dark" suppressHydrationWarning>
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" 
          rel="stylesheet" 
        />
        <meta name="theme-color" content="#000000" />
        <ThemeScript />
      </head>
      <body className={`${roboto.variable} antialiased`}>
        <I18nProvider initialLocale={locale}>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
