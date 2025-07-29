'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { restaurantDataProvider, type Restaurant, type RestaurantAPIResponse, type RestaurantFavorite, type SearchParams, type AvailabilityCheckRequest, type AvailabilityCheckResponse } from '@/lib/dataProvider'
import { useQueryInvalidator } from './invalidationUtils'

// Query keys for restaurants
export const restaurantKeys = {
  all: ['restaurants'] as const,
  lists: () => [...restaurantKeys.all, 'list'] as const,
  list: (params?: SearchParams) => [...restaurantKeys.lists(), params] as const,
  details: () => [...restaurantKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...restaurantKeys.details(), id] as const,
  liked: () => [...restaurantKeys.all, 'liked'] as const,
  menu: (id: string | number) => [...restaurantKeys.detail(id), 'menu'] as const,
  reviews: (id: string | number) => [...restaurantKeys.detail(id), 'reviews'] as const,
  gallery: (id: string | number) => [...restaurantKeys.detail(id), 'gallery'] as const,
  availability: (id: string | number) => [...restaurantKeys.detail(id), 'availability'] as const,
  availabilityCheck: (id: string | number, date: string, partySize: number) => 
    [...restaurantKeys.detail(id), 'availability-check', date, partySize] as const,
  services: (id: string | number) => [...restaurantKeys.detail(id), 'services'] as const,
}

// Get restaurants with optional filters
export const useRestaurants = (params?: SearchParams) => {
  return useQuery({
    queryKey: restaurantKeys.list(params),
    queryFn: () => restaurantDataProvider.getRestaurants(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime in v4)
  })
}

// Get single restaurant
export const useRestaurant = (id: string | number, enabled = true) => {
  return useQuery({
    queryKey: restaurantKeys.detail(id),
    queryFn: () => restaurantDataProvider.getRestaurant(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000, // Cache longer for individual restaurants
  })
}

// Search restaurants
export const useSearchRestaurants = (query: string, city?: string, enabled = true) => {
  return useQuery({
    queryKey: restaurantKeys.list({ term: query, city }),
    queryFn: () => restaurantDataProvider.searchRestaurants(query, city),
    enabled: enabled && !!query,
    staleTime: 2 * 60 * 1000, // Shorter stale time for search
  })
}

// Get popular restaurants
export const usePopularRestaurants = (limit = 6) => {
  return useQuery({
    queryKey: restaurantKeys.list({ limit }),
    queryFn: () => restaurantDataProvider.getPopularRestaurants(limit),
    staleTime: 10 * 60 * 1000, // Cache popular restaurants longer
  })
}

// Get restaurants by city
export const useRestaurantsByCity = (city: string, enabled = true) => {
  return useQuery({
    queryKey: restaurantKeys.list({ city }),
    queryFn: () => restaurantDataProvider.getRestaurantsByCity(city),
    enabled: enabled && !!city,
    staleTime: 5 * 60 * 1000,
  })
}

// Get restaurant menu
export const useRestaurantMenu = (id: string | number, enabled = true) => {
  return useQuery({
    queryKey: restaurantKeys.menu(id),
    queryFn: () => restaurantDataProvider.getRestaurantMenu(id),
    enabled: enabled && !!id,
    staleTime: 15 * 60 * 1000, // Menu changes less frequently
  })
}

// Get restaurant reviews
export const useRestaurantReviews = (id: string | number, enabled = true) => {
  return useQuery({
    queryKey: restaurantKeys.reviews(id),
    queryFn: () => restaurantDataProvider.getRestaurantReviews(id),
    enabled: enabled && !!id,
    staleTime: 3 * 60 * 1000, // Reviews change more frequently
  })
}

// Get restaurant gallery
export const useRestaurantGallery = (id: string | number, enabled = true) => {
  return useQuery({
    queryKey: restaurantKeys.gallery(id),
    queryFn: () => restaurantDataProvider.getRestaurantGallery(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000,
  })
}

// Get restaurant availability
export const useRestaurantAvailability = (id: string | number, enabled = true) => {
  return useQuery({
    queryKey: restaurantKeys.availability(id),
    queryFn: () => restaurantDataProvider.getRestaurantAvailability(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// Check restaurant availability for specific dates and party size
export const useRestaurantAvailabilityCheck = (
  id: string | number, 
  date: string, 
  partySize: number, 
  enabled = true
) => {
  return useQuery({
    queryKey: restaurantKeys.availabilityCheck(id, date, partySize),
    queryFn: () => restaurantDataProvider.checkRestaurantAvailability(id, { date, party_size: partySize }),
    enabled: enabled && !!id && !!date && partySize > 0,
    staleTime: 2 * 60 * 1000, // Shorter stale time for availability checks
  })
}

// Get restaurant services
export const useRestaurantServices = (id: string | number, enabled = true) => {
  return useQuery({
    queryKey: restaurantKeys.services(id),
    queryFn: () => restaurantDataProvider.getRestaurantServices(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000,
  })
}

// Like restaurant mutation
export const useLikeRestaurant = () => {
  const queryClient = useQueryClient()
  const invalidator = useQueryInvalidator()
  
  return useMutation({
    mutationFn: (id: string | number) => restaurantDataProvider.likeRestaurant(id),
    onMutate: async (variables) => {
      // Optimistic update
      const rollback = await invalidator.optimisticUpdate<Restaurant>(
        restaurantKeys.detail(variables),
        (oldData) => oldData ? { ...oldData, is_liked: true } : oldData
      )
      return { rollback }
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries to ensure data consistency across the app
      invalidator.invalidateRestaurant(variables)
      invalidator.invalidateRestaurants()
      invalidator.invalidateLikedRestaurants()
      invalidator.invalidateSearchResults()
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.rollback) {
        context.rollback()
      }
      console.error('Failed to like restaurant:', error)
    }
  })
}

// Unlike restaurant mutation
export const useUnlikeRestaurant = () => {
  const queryClient = useQueryClient()
  const invalidator = useQueryInvalidator()
  
  return useMutation({
    mutationFn: (id: string | number) => restaurantDataProvider.unlikeRestaurant(id),
    onMutate: async (variables) => {
      // Optimistic update
      const rollback = await invalidator.optimisticUpdate<Restaurant>(
        restaurantKeys.detail(variables),
        (oldData) => oldData ? { ...oldData, is_liked: false } : oldData
      )
      return { rollback }
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries to ensure data consistency across the app
      invalidator.invalidateRestaurant(variables)
      invalidator.invalidateRestaurants()
      invalidator.invalidateLikedRestaurants()
      invalidator.invalidateSearchResults()
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.rollback) {
        context.rollback()
      }
      console.error('Failed to unlike restaurant:', error)
    }
  })
}

// Get liked restaurants
export const useLikedRestaurants = () => {
  return useQuery({
    queryKey: restaurantKeys.liked(),
    queryFn: () => restaurantDataProvider.getLikedRestaurants(),
    staleTime: 2 * 60 * 1000, // 2 minutes - favorites change more frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry if it's an authentication error
      if (error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
        return false
      }
      return failureCount < 2
    }
  })
}

// Remove restaurant from liked/favorites
export const useRemoveLikedRestaurant = () => {
  const queryClient = useQueryClient()
  const invalidator = useQueryInvalidator()
  
  return useMutation({
    mutationFn: (id: string | number) => restaurantDataProvider.removeLikedRestaurant(id),
    onMutate: async (variables) => {
      // Optimistic updates for multiple queries
      const likedRollback = await invalidator.optimisticUpdate<RestaurantFavorite[]>(
        restaurantKeys.liked(),
        (oldData) => oldData ? oldData.filter(restaurant => restaurant.id !== variables) : oldData
      )
      
      const detailRollback = await invalidator.optimisticUpdate<Restaurant>(
        restaurantKeys.detail(variables),
        (oldData) => oldData ? { ...oldData, is_liked: false } : oldData
      )
      
      return { likedRollback, detailRollback }
    },
    onSuccess: (data, variables) => {
      // Comprehensive invalidation to ensure data consistency
      invalidator.invalidateRestaurant(variables)
      invalidator.invalidateRestaurants()
      invalidator.invalidateLikedRestaurants()
      invalidator.invalidateSearchResults()
    },
    onError: (error, variables, context) => {
      // Rollback all optimistic updates
      if (context?.likedRollback) {
        context.likedRollback()
      }
      if (context?.detailRollback) {
        context.detailRollback()
      }
      console.error('Failed to remove restaurant from favorites:', error)
    }
  })
}

// Create restaurant review mutation
export const useCreateRestaurantReview = () => {
  const queryClient = useQueryClient()
  const invalidator = useQueryInvalidator()
  
  return useMutation({
    mutationFn: ({ restaurantId, reviewData }: { restaurantId: string | number, reviewData: FormData }) => 
      restaurantDataProvider.createRestaurantReview(restaurantId, reviewData),
    onSuccess: (data, variables) => {
      console.log('✅ Review created successfully:', data)
      
      // Invalidate restaurant-related queries (reviews, menu, gallery, etc.)
      invalidator.invalidateRestaurantRelated(variables.restaurantId)
      
      // Invalidate restaurant details (might affect rating)
      invalidator.invalidateRestaurant(variables.restaurantId)
      
      // Invalidate user reviews to show in profile
      invalidator.invalidateUserRelatedData()
      
      // Invalidate restaurant lists in case the new review affects ratings/rankings
      invalidator.invalidateRestaurants()
    },
    onError: (error, variables) => {
      console.error('❌ Failed to create review:', error)
    }
  })
}
