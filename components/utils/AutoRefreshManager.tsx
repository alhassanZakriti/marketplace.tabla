'use client'

import { useAutoRefresh } from '@/hooks/api'

export default function AutoRefreshManager() {
  // Enable auto-refresh with default settings
  useAutoRefresh({
    enabled: true,
    interval: 5 * 60 * 1000, // 5 minutes
    onFocus: true,
    onReconnect: true,
    background: true
  })

  // This component doesn't render anything, it just manages auto-refresh
  return null
}
