import type React from "react"
import type { Metadata } from "next"
import { Red_Hat_Display } from "next/font/google"
import "./globals.css"
import I18nProvider from "../providers/I18nProvider"
import Header from "../components/layout/Header" // Import Header component
import Footer from "../components/layout/Footer" // Import Footer component
import AutoRefreshManager from "../components/utils/AutoRefreshManager" // Import AutoRefresh component
import { ThemeProvider } from "@/theme/ThemeProvider"
import { AuthProvider } from "@/components/auth/AuthProvider"
import QueryProvider from "@/providers/QueryProvider"

const inter = Red_Hat_Display({
  subsets: ["latin"],
  variable: "--font-red-hat-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  fallback: ["system-ui", "sans-serif"],
})

export const metadata: Metadata = {
  title: {
    default: "Tabla | Taste Morocco's Best Restaurants",
    template: "%s | Tabla"
  },
  description: "Discover and book the best restaurants in Morocco. Taste authentic Moroccan cuisine and find your perfect dining experience with Tabla.",
  icons: {
    icon: [
      { url: "/LOGO.svg", type: "image/svg+xml" },
      { url: "/LOGO.png", type: "image/png" }
    ],
    apple: "/android-chrome-512x512.png",
    shortcut: "/LOGO.png"
  },
  keywords: ["restaurants", "Morocco", "dining", "food", "reservations", "Moroccan cuisine"],
  authors: [{ name: "Tabla" }],
  creator: "Tabla",
  publisher: "Tabla",
  metadataBase: new URL('https://tabla.ma'),
  openGraph: {
    title: "Tabla | Taste Morocco's Best Restaurants",
    description: "Discover and book the best restaurants in Morocco. Taste authentic Moroccan cuisine and find your perfect dining experience.",
    url: 'https://tabla.ma',
    siteName: 'Tabla',
    images: [
      {
        url: '/LOGO.png',
        width: 1200,
        height: 630,
        alt: 'Tabla - Taste Morocco\'s Best',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Tabla | Taste Morocco's Best Restaurants",
    description: "Discover and book the best restaurants in Morocco. Taste authentic Moroccan cuisine and find your perfect dining experience.",
    images: ['/LOGO.png'],
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
  },
  manifest: '/manifest.json',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}




export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-whitetheme dark:bg-bgdarktheme text-blacktheme dark:text-textdarktheme`}>
        <I18nProvider>
          <ThemeProvider>
            <QueryProvider>
              <AuthProvider>
                <AutoRefreshManager />
                <Header />
                <div className="bg-white dark:bg-bgdarktheme">{children}</div>
                <Footer />

              </AuthProvider>
            </QueryProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
