'use client'

import { QueryClient } from '@tanstack/react-query'
import { restaurantKeys } from './useRestaurants'
import { reservationKeys } from './useReservations'
import { cityKeys } from './useCities'
import { userKeys } from './useUser'

export interface InvalidationOptions {
  exact?: boolean // Whether to invalidate exact matches only
  silent?: boolean // Whether to refetch data silently in background
}

export class QueryInvalidator {
  constructor(private queryClient: QueryClient) {}

  // Restaurant-related invalidations
  invalidateRestaurants(options: InvalidationOptions = {}) {
    const { exact = false, silent = false } = options
    
    if (exact) {
      this.queryClient.invalidateQueries({ 
        queryKey: restaurantKeys.lists(),
        refetchType: silent ? 'none' : 'active'
      })
    } else {
      this.queryClient.invalidateQueries({ 
        predicate: (query) => Boolean(query.queryKey[0] === 'restaurants'),
        refetchType: silent ? 'none' : 'active'
      })
    }
  }

  invalidateRestaurant(id: string | number, options: InvalidationOptions = {}) {
    const { silent = false } = options
    
    this.queryClient.invalidateQueries({ 
      queryKey: restaurantKeys.detail(id),
      refetchType: silent ? 'none' : 'active'
    })
  }

  invalidateRestaurantRelated(id: string | number, options: InvalidationOptions = {}) {
    const { silent = false } = options
    
    // Invalidate all restaurant-related queries (menu, reviews, gallery, etc.)
    this.queryClient.invalidateQueries({ 
      predicate: (query) => {
        const queryKey = query.queryKey
        return Boolean(queryKey[0] === 'restaurants' && 
               queryKey.length > 2 && 
               queryKey[2] === id)
      },
      refetchType: silent ? 'none' : 'active'
    })
  }

  invalidateLikedRestaurants(options: InvalidationOptions = {}) {
    const { silent = false } = options
    
    this.queryClient.invalidateQueries({ 
      queryKey: restaurantKeys.liked(),
      refetchType: silent ? 'none' : 'active'
    })
  }

  // Reservation-related invalidations
  invalidateReservations(options: InvalidationOptions = {}) {
    const { silent = false } = options
    
    this.queryClient.invalidateQueries({ 
      queryKey: reservationKeys.list(),
      refetchType: silent ? 'none' : 'active'
    })
  }

  invalidateReservation(id: string | number, options: InvalidationOptions = {}) {
    const { silent = false } = options
    
    this.queryClient.invalidateQueries({ 
      queryKey: reservationKeys.detail(id),
      refetchType: silent ? 'none' : 'active'
    })
  }

  // City-related invalidations
  invalidateCities(options: InvalidationOptions = {}) {
    const { silent = false } = options
    
    this.queryClient.invalidateQueries({ 
      queryKey: cityKeys.list(),
      refetchType: silent ? 'none' : 'active'
    })
  }

  // User-related invalidations
  invalidateUserReviews(options: InvalidationOptions = {}) {
    const { silent = false } = options
    
    this.queryClient.invalidateQueries({ 
      queryKey: userKeys.reviews(),
      refetchType: silent ? 'none' : 'active'
    })
  }

  invalidateUserProfile(options: InvalidationOptions = {}) {
    const { silent = false } = options
    
    this.queryClient.invalidateQueries({ 
      queryKey: userKeys.profile(),
      refetchType: silent ? 'none' : 'active'
    })
  }

  // Global invalidations
  invalidateAll(options: InvalidationOptions = {}) {
    const { silent = false } = options
    
    this.queryClient.invalidateQueries({
      refetchType: silent ? 'none' : 'active'
    })
  }

  // User-related invalidations (for when user data changes)
  invalidateUserRelatedData(options: InvalidationOptions = {}) {
    const { silent = false } = options
    
    // Invalidate user-specific data
    this.invalidateReservations({ silent })
    this.invalidateLikedRestaurants({ silent })
    this.invalidateUserReviews({ silent })
    this.invalidateUserProfile({ silent })
    
    // Also invalidate restaurant lists as they might show different data for authenticated users
    this.invalidateRestaurants({ silent })
  }

  // Search-related invalidations
  invalidateSearchResults(options: InvalidationOptions = {}) {
    const { silent = false } = options
    
    this.queryClient.invalidateQueries({ 
      predicate: (query) => {
        const queryKey = query.queryKey
        return Boolean(queryKey[0] === 'restaurants' && 
               queryKey[1] === 'list' && 
               queryKey[2] && 
               (queryKey[2] as any)?.term !== undefined)
      },
      refetchType: silent ? 'none' : 'active'
    })
  }

  // Clear cache (useful for logout/login)
  clearAll() {
    this.queryClient.clear()
  }

  // Remove specific queries from cache
  removeQueries(queryKey: unknown[]) {
    this.queryClient.removeQueries({ queryKey })
  }

  // Optimistic updates helper
  async optimisticUpdate<T>(
    queryKey: readonly unknown[],
    updater: (oldData: T | undefined) => T | undefined,
    rollbackData?: T
  ) {
    // Cancel outgoing refetches
    await this.queryClient.cancelQueries({ queryKey: [...queryKey] })

    // Snapshot previous value
    const previousData = this.queryClient.getQueryData<T>([...queryKey])

    // Optimistically update
    this.queryClient.setQueryData<T>([...queryKey], updater)

    // Return rollback function
    return () => {
      this.queryClient.setQueryData<T>([...queryKey], rollbackData ?? previousData)
    }
  }
}

// Hook to use the invalidator
export const useQueryInvalidator = () => {
  const queryClient = useQueryClient()
  return new QueryInvalidator(queryClient)
}

// Import useQueryClient for the hook
import { useQueryClient } from '@tanstack/react-query'
