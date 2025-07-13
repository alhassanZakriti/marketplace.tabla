"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"
type ColorTheme = "green" | "red" | "orange" | "purple" | "blush" | "blue" | "brown" | "yellow"

interface ThemeContextType {
  theme: Theme
  colorTheme: ColorTheme
  setTheme: (theme: Theme) => void
  setColorTheme: (colorTheme: ColorTheme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light")
  const [colorTheme, setColorTheme] = useState<ColorTheme>("green")

  useEffect(() => {
    const savedTheme = localStorage.getItem("tabla-theme") as Theme
    const savedColorTheme = localStorage.getItem("tabla-color-theme") as ColorTheme

    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      setTheme(systemTheme)
    }

    if (savedColorTheme) {
      setColorTheme(savedColorTheme)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement

    // Apply theme
    if (theme === "dark") {
      root.style.setProperty("--background", "var(--color-bgdarktheme)")
      root.style.setProperty("--foreground", "var(--color-textdarktheme)")
    } else {
      root.style.setProperty("--background", "var(--color-whitetheme)")
      root.style.setProperty("--foreground", "var(--color-blacktheme)")
    }

    // Apply color theme by updating CSS variables
    const colorMap = {
      green: "--color-greentheme",
      red: "--color-redtheme",
      orange: "--color-orangetheme",
      purple: "--color-purpletheme",
      blush: "--color-blushtheme",
      blue: "--color-bluetheme",
      brown: "--color-browntheme",
      yellow: "--color-yellowtheme",
    }

    const softColorMap = {
      green: "--color-softgreentheme",
      red: "--color-softredtheme",
      orange: "--color-softorangetheme",
      purple: "--color-softpurpletheme",
      blush: "--color-softblushtheme",
      blue: "--color-softbluetheme",
      brown: "--color-softbrowntheme",
      yellow: "--color-softyellowtheme",
    }

    // Set primary colors based on selected theme
    root.style.setProperty("--color-primary", `var(${colorMap[colorTheme]})`)
    root.style.setProperty("--color-primary-soft", `var(${softColorMap[colorTheme]})`)

    localStorage.setItem("tabla-theme", theme)
    localStorage.setItem("tabla-color-theme", colorTheme)
  }, [theme, colorTheme])

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colorTheme,
        setTheme,
        setColorTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
