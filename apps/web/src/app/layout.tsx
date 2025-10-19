import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import "../styles/timeline.css";
import "../styles/landing.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nality — Your life, beautifully told",
  description: "Turn memories into a living timeline and a beautiful Life Book. Private by design. Start in minutes.",
  keywords: ["life story", "timeline", "memories", "family history", "personal timeline", "AI assistant", "life book", "memoir"],
  authors: [{ name: "Nality Team" }],
  creator: "Nality",
  publisher: "Nality",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Nality — Your life, beautifully told",
    description: "Turn memories into a living timeline and a beautiful Life Book.",
    type: "website",
    images: [
      {
        url: "/hero/hero-timeline-book.png", // Will be created later
        width: 1200,
        height: 800,
        alt: "A life timeline with photos alongside a preview of a printed Life Book"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Nality — Your life, beautifully told",
    description: "Turn memories into a living timeline and a beautiful Life Book.",
    images: ["/hero/hero-timeline-book.png"]
  },
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
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className={`${roboto.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
