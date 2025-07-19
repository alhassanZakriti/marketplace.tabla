"use client"

import type React from "react"

import { useEffect } from "react"
import "../config/i18n"

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize i18n on client side
    const savedLanguage = localStorage.getItem("language")
    if (savedLanguage) {
      import("i18next").then(({ default: i18n }) => {
        i18n.changeLanguage(savedLanguage)
      })
    }
  }, [])

  return <>{children}</>
}