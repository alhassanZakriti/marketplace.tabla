"use client"

import { useTranslation as useI18nTranslation } from "react-i18next"
import { useEffect, useState } from "react"

export function useClientTranslation() {
  const [isClient, setIsClient] = useState(false)
  const translation = useI18nTranslation()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Return a safe translation function that works on both server and client
  const t = (key: string, fallback?: string, options?: any) => {
    if (!isClient) {
      return fallback || key
    }
    if (fallback !== undefined) {
      return translation.t(key, { ...options, defaultValue: fallback })
    }
    return translation.t(key, options)
  }

  return {
    ...translation,
    t,
    isClient,
  }
}
