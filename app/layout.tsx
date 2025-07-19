import type React from "react"
import type { Metadata } from "next"
import { Red_Hat_Display } from "next/font/google"
import "./globals.css"
import I18nProvider from "../providers/I18nProvider"
import Header from "../components/layout/Header" // Import Header component
import Footer from "../components/layout/Footer" // Import Footer component
import { ThemeProvider } from "@/theme/ThemeProvider"
import { AuthProvider } from "@/components/auth/AuthProvider"

const inter = Red_Hat_Display({
  subsets: ["latin"],
  variable: "--font-red-hat-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  fallback: ["system-ui", "sans-serif"],
})

export const metadata: Metadata = {
  title: "Your App",
  description: "Your app description",
  icons: {
    icon: "../public/LOGO.png", 
  },
  
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
            <AuthProvider>

              <Header />
              <div className="bg-white dark:bg-bgdarktheme">{children}</div>
              <Footer />

            </AuthProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
