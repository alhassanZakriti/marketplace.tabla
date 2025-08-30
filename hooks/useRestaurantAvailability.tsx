"use client"

import { useState, useEffect } from "react"
import {
  restaurantDataProvider,
  type AvailabilityCheckRequest,
  type AvailabilityCheckResponse,
  type Restaurant,
} from "../lib/dataProvider"

interface UseRestaurantAvailabilityOptions {
  enabled?: boolean
  retryAttempts?: number
  retryDelay?: number
}

interface UseRestaurantAvailabilityReturn {
  availabilityData: Record<string, AvailabilityCheckResponse>
  loading: boolean
  error: string | null
  checkAvailability: (restaurants: Restaurant[], request: AvailabilityCheckRequest) => Promise<void>
  isRestaurantAvailable: (restaurantId: string | number, time?: string) => boolean
  getAvailableSlots: (restaurantId: string | number, date: string) => { time: string; available: boolean }[]
  refetch: () => void
  isRetrying: boolean
  retryCount: number
}

export function useRestaurantAvailability(
  options: UseRestaurantAvailabilityOptions = {}
): UseRestaurantAvailabilityReturn {
  const { enabled = true, retryAttempts = 2, retryDelay = 1000 } = options

  const [availabilityData, setAvailabilityData] = useState<Record<string, AvailabilityCheckResponse>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [lastRequest, setLastRequest] = useState<{
    restaurants: Restaurant[]
    request: AvailabilityCheckRequest
  } | null>(null)

  const checkAvailability = async (restaurants: Restaurant[], request: AvailabilityCheckRequest) => {
    if (!enabled || restaurants.length === 0) return

    try {
      setLoading(true)
      setError(null)
      setLastRequest({ restaurants, request })

      const restaurantIds = restaurants.map(r => r.id)
      const availabilityResults = await restaurantDataProvider.checkMultipleRestaurantsAvailability(
        restaurantIds, 
        request
      )

      setAvailabilityData(availabilityResults)
      setRetryCount(0)
      setIsRetrying(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to check availability"
      setError(errorMessage)
      
      // Implement retry logic
      if (retryCount < retryAttempts) {
        setIsRetrying(true)
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          if (lastRequest) {
            checkAvailability(lastRequest.restaurants, lastRequest.request)
          }
        }, retryDelay * (retryCount + 1))
      } else {
        setIsRetrying(false)
      }
    } finally {
      setLoading(false)
    }
  }

  const isRestaurantAvailable = (restaurantId: string | number, time?: string): boolean => {
    const restaurantAvailability = availabilityData[restaurantId.toString()]
    if (!restaurantAvailability?.availability?.length) return true // Default to available if no data

    const dayAvailability = restaurantAvailability.availability[0] // Assuming single day check
    if (!dayAvailability.available) return false

    if (time) {
      // Check specific time slot
      const slot = dayAvailability.slots.find(s => s.time === time)
      return slot?.available ?? false
    }

    // If no specific time, check if any slot is available
    return dayAvailability.slots.some(slot => slot.available)
  }

  const getAvailableSlots = (restaurantId: string | number, date: string) => {
    const restaurantAvailability = availabilityData[restaurantId.toString()]
    if (!restaurantAvailability?.availability?.length) return []

    const dayAvailability = restaurantAvailability.availability.find(day => day.date === date)
    return dayAvailability?.slots || []
  }

  const refetch = () => {
    if (lastRequest) {
      setRetryCount(0)
      checkAvailability(lastRequest.restaurants, lastRequest.request)
    }
  }

  return {
    availabilityData,
    loading,
    error,
    checkAvailability,
    isRestaurantAvailable,
    getAvailableSlots,
    refetch,
    isRetrying,
    retryCount,
  }
}

export default useRestaurantAvailability
