"use client"

import { useState, useEffect } from "react"
import { cityDataProvider, type City, type CitiesAPIResponse } from "../lib/dataProvider"

interface UseCitiesReturn {
  cities: City[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  retry: () => void
  isRetrying: boolean
  retryCount: number
}

export function useCities(): UseCitiesReturn {
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const MAX_RETRIES = 3

  const fetchCities = async () => {
    try {
      setLoading(true)
      setError(null)

      const response: CitiesAPIResponse = await cityDataProvider.getCities()

      setCities(response.results)
      setRetryCount(0)
      setIsRetrying(false)

      console.log(`Successfully loaded ${response.results.length} cities`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch cities"
      setError(errorMessage)
      console.error("Error fetching cities:", err)
    } finally {
      setLoading(false)
    }
  }

  const retry = async () => {
    if (retryCount >= MAX_RETRIES) {
      console.error("Max retry attempts reached")
      return
    }

    setIsRetrying(true)
    setRetryCount((prev) => prev + 1)

    // Exponential backoff delay
    const delay = 1000 * Math.pow(2, retryCount)

    setTimeout(async () => {
      console.log(`Retrying cities... Attempt ${retryCount + 1}/${MAX_RETRIES}`)
      await fetchCities()
    }, delay)
  }

  // Auto-fetch on mount
  useEffect(() => {
    fetchCities()
  }, [])

  return {
    cities,
    loading,
    error,
    refetch: fetchCities,
    retry,
    isRetrying,
    retryCount,
  }
}
