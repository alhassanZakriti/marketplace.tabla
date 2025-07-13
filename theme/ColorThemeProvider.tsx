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

export function ColorThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light")
  const [colorTheme, setColorTheme] = useState<ColorTheme>("green")

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem("tabla-theme") as Theme
    const savedColorTheme = localStorage.getItem("tabla-color-theme") as ColorTheme

    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      // Check system preference
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      setTheme(systemTheme)
    }

    if (savedColorTheme) {
      setColorTheme(savedColorTheme)
    }
  }, [])

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement

    // Remove all theme classes
    root.classList.remove("light", "dark")
    root.classList.remove(
      "theme-green",
      "theme-red",
      "theme-orange",
      "theme-purple",
      "theme-blush",
      "theme-blue",
      "theme-brown",
      "theme-yellow",
    )

    // Add current theme classes
    root.classList.add(theme)
    root.classList.add(`theme-${colorTheme}`)

    // Save to localStorage
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

export function useColorTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useColorTheme must be used within a ColorThemeProvider")
  }
  return context
}
