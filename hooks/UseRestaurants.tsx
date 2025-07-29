"use client"

import { useState, useEffect } from "react"
import {
  restaurantDataProvider,
  type Restaurant,
  type RestaurantAPIResponse,
  type SearchParams,
} from "../lib/dataProvider"

interface UseRestaurantsOptions {
  autoFetch?: boolean
  retryAttempts?: number
  retryDelay?: number
}

interface UseRestaurantsReturn {
  restaurants: Restaurant[]
  loading: boolean
  error: string | null
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  refetch: (params?: SearchParams) => Promise<void>
  retry: () => void
  isRetrying: boolean
  retryCount: number
}

export function useRestaurants(
  initialParams?: SearchParams,
  options: UseRestaurantsOptions = {},
): UseRestaurantsReturn {
  const { autoFetch = true, retryAttempts = 3, retryDelay = 1000 } = options

  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPreviousPage, setHasPreviousPage] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [lastParams, setLastParams] = useState<SearchParams | undefined>(initialParams)

  const fetchRestaurants = async (params?: SearchParams) => {
    try {
      setLoading(true)
      setError(null)

      const response: RestaurantAPIResponse = await restaurantDataProvider.getRestaurants(params)

      setRestaurants(response.results)
      setTotalCount(response.count)
      setHasNextPage(!!response.next)
      setHasPreviousPage(!!response.previous)
      setRetryCount(0)
      setIsRetrying(false)
      setLastParams(params)

      console.log(`Successfully loaded ${response.results.length} restaurants`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch restaurants"
      setError(errorMessage)
      console.error("Error fetching restaurants:", err)
    } finally {
      setLoading(false)
    }
  }

  const retry = async () => {
    if (retryCount >= retryAttempts) {
      console.error("Max retry attempts reached")
      return
    }

    setIsRetrying(true)
    setRetryCount((prev) => prev + 1)

    // Exponential backoff delay
    const delay = retryDelay * Math.pow(2, retryCount)

    setTimeout(async () => {
      console.log(`Retrying... Attempt ${retryCount + 1}/${retryAttempts}`)
      await fetchRestaurants(lastParams)
    }, delay)
  }

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchRestaurants(initialParams)
    }
  }, [autoFetch])

  return {
    restaurants,
    loading,
    error,
    totalCount,
    hasNextPage,
    hasPreviousPage,
    refetch: fetchRestaurants,
    retry,
    isRetrying,
    retryCount,
  }
}

// Specialized hook for popular restaurants
export function usePopularRestaurants(limit = 6) {
  return useRestaurants({ limit }, { autoFetch: true })
}

// Specialized hook for restaurant search
export function useRestaurantSearch() {
  const [searchResults, setSearchResults] = useState<Restaurant[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const search = async (query: string, city?: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    try {
      setSearching(true)
      setSearchError(null)

      const response = await restaurantDataProvider.searchRestaurants(query, city)
      setSearchResults(response.results)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Search failed"
      setSearchError(errorMessage)
      console.error("Search error:", err)
    } finally {
      setSearching(false)
    }
  }

  const clearSearch = () => {
    setSearchResults([])
    setSearchError(null)
  }

  return {
    searchResults,
    searching,
    searchError,
    search,
    clearSearch,
  }
}

// Hook for fetching liked restaurants
export function useLikedRestaurants() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchLikedRestaurants = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const result = await restaurantDataProvider.getLikedRestaurants()
        setData(result)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLikedRestaurants()
  }, [])

  return { data, isLoading, error }
}
