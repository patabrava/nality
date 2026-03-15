import type { Metadata } from "next"
import { cookies } from "next/headers"
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
  const heroTitle = messages[locale]?.hero?.title ?? "Nality — Dein Leben, schön erzählt"
  const heroDescription =
    messages[locale]?.hero?.subtitle ??
    "Verwandle Erinnerungen in eine lebendige Zeitleiste und ein wunderschönes Lebensbuch. Datenschutz von Anfang an. Starte in wenigen Minuten."

  return {
    title: `Nality — ${heroTitle}`,
    description: heroDescription,
    keywords: [
      "Lebensgeschichte",
      "Zeitleiste",
      "Erinnerungen",
      "Familiengeschichte",
      "persönliche Biografie",
      "KI-Begleitung",
      "Lebensbuch",
      "Memoiren",
    ],
    authors: [{ name: "Nality-Team" }],
    creator: "Nality",
    publisher: "Nality",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      title: `Nality — ${heroTitle}`,
      description: heroDescription,
      type: "website",
      images: [
        {
          url: "/hero/hero-timeline-book.png",
          width: 1200,
          height: 800,
          alt: "Eine Lebenszeitleiste mit Fotos neben der Vorschau eines gedruckten Lebensbuchs",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Nality — ${heroTitle}`,
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
  const localeCookie = cookieStore.get("locale")?.value
  const locale = resolveLocale(localeCookie)

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
