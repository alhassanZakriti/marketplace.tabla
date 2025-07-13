"use client"

import { useTheme } from "./ThemeProvider"

export function ThemeSwitcher() {
  const { theme, colorTheme, toggleTheme, setColorTheme } = useTheme()

  const colorThemes = [
    { name: "green", color: "rgb(16 185 129)", label: "Green" },
    { name: "blue", color: "rgb(59 130 246)", label: "Blue" },
    { name: "purple", color: "rgb(147 51 234)", label: "Purple" },
    { name: "orange", color: "rgb(249 115 22)", label: "Orange" },
    { name: "pink", color: "rgb(236 72 153)", label: "Pink" },
  ]

  return (
    <div className="flex items-center gap-4 p-4 bg-surface rounded-lg border">
      {/* Dark/Light Mode Toggle */}
      <button
        onClick={toggleTheme}
        className="flex items-center gap-2 px-3 py-2 rounded-md bg-surface-secondary hover:opacity-80 transition-opacity"
      >
        {theme === "light" ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        )}
        <span className="text-sm font-medium">{theme === "light" ? "Dark" : "Light"}</span>
      </button>

      {/* Color Theme Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-secondary">Color:</span>
        <div className="flex gap-1">
          {colorThemes.map((ct) => (
            <button
              key={ct.name}
              onClick={() => setColorTheme(ct.name as any)}
              className={`w-6 h-6 rounded-full border-2 transition-all ${
                colorTheme === ct.name ? "border-foreground scale-110" : "border-border hover:scale-105"
              }`}
              style={{ backgroundColor: ct.color }}
              title={ct.label}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
