'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useQueryInvalidator } from './invalidationUtils'
import { useAuth } from '@/components/auth/AuthProvider'

interface UseAutoRefreshOptions {
  enabled?: boolean
  interval?: number // in milliseconds
  onFocus?: boolean // refresh when window gains focus
  onReconnect?: boolean // refresh when network reconnects
  background?: boolean // whether to refresh silently in background
}

export const useAutoRefresh = (options: UseAutoRefreshOptions = {}) => {
  const {
    enabled = true,
    interval = 5 * 60 * 1000, // 5 minutes default
    onFocus = true,
    onReconnect = true,
    background = true
  } = options

  const invalidator = useQueryInvalidator()
  const { isAuthenticated } = useAuth()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const refreshUserData = useCallback(() => {
    if (isAuthenticated) {
      invalidator.invalidateUserRelatedData({ silent: background })
    }
  }, [invalidator, isAuthenticated, background])

  const refreshPublicData = useCallback(() => {
    invalidator.invalidateRestaurants({ silent: background })
    invalidator.invalidateCities({ silent: background })
  }, [invalidator, background])

  const refreshAll = useCallback(() => {
    refreshUserData()
    refreshPublicData()
  }, [refreshUserData, refreshPublicData])

  // Periodic refresh
  useEffect(() => {
    if (!enabled) return

    intervalRef.current = setInterval(() => {
      refreshAll()
    }, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, interval, refreshAll])

  // Refresh on window focus
  useEffect(() => {
    if (!enabled || !onFocus) return

    const handleFocus = () => {
      refreshAll()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [enabled, onFocus, refreshAll])

  // Refresh on network reconnect
  useEffect(() => {
    if (!enabled || !onReconnect) return

    const handleOnline = () => {
      refreshAll()
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [enabled, onReconnect, refreshAll])

  return {
    refreshUserData,
    refreshPublicData,
    refreshAll,
    manualRefresh: () => refreshAll()
  }
}

// Hook for manual invalidation triggers
export const useManualInvalidation = () => {
  const invalidator = useQueryInvalidator()
  const { isAuthenticated } = useAuth()

  return {
    // Trigger when user likes/unlikes a restaurant
    onRestaurantInteraction: (restaurantId: string | number) => {
      invalidator.invalidateRestaurant(restaurantId)
      invalidator.invalidateRestaurants()
      if (isAuthenticated) {
        invalidator.invalidateLikedRestaurants()
      }
    },

    // Trigger when user makes/cancels a reservation
    onReservationChange: (restaurantId?: string | number) => {
      invalidator.invalidateReservations()
      if (restaurantId) {
        // Invalidate restaurant availability
        invalidator.invalidateRestaurantRelated(restaurantId)
      }
    },

    // Trigger when user profile is updated
    onProfileUpdate: () => {
      if (isAuthenticated) {
        invalidator.invalidateUserRelatedData()
      }
    },

    // Trigger when search criteria change
    onSearchUpdate: () => {
      invalidator.invalidateSearchResults()
      invalidator.invalidateRestaurants()
    },

    // Trigger when location/city changes
    onLocationChange: () => {
      invalidator.invalidateRestaurants()
      invalidator.invalidateSearchResults()
    },

    // Nuclear option - refresh everything
    refreshEverything: () => {
      invalidator.invalidateAll()
    }
  }
}

// Hook for handling stale data scenarios
export const useStaleDataHandler = () => {
  const queryClient = useQueryClient()
  const invalidator = useQueryInvalidator()

  return {
    // Mark data as stale without refetching
    markAsStale: (queryKey: unknown[]) => {
      queryClient.invalidateQueries({ 
        queryKey, 
        refetchType: 'none' 
      })
    },

    // Force refetch stale data
    refetchStale: () => {
      queryClient.refetchQueries({
        stale: true
      })
    },

    // Handle error scenarios - mark related data as stale
    handleError: (errorContext: { type: 'restaurant' | 'reservation' | 'auth', id?: string | number }) => {
      const { type, id } = errorContext
      
      switch (type) {
        case 'restaurant':
          if (id) {
            invalidator.invalidateRestaurant(id, { silent: true })
          } else {
            invalidator.invalidateRestaurants({ silent: true })
          }
          break
        case 'reservation':
          invalidator.invalidateReservations({ silent: true })
          break
        case 'auth':
          invalidator.invalidateUserRelatedData({ silent: true })
          break
      }
    }
  }
}
