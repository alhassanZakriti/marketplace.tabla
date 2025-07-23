'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { restaurantDataProvider, type Restaurant, type RestaurantAPIResponse, type RestaurantFavorite, type SearchParams } from '@/lib/dataProvider'

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
  
  return useMutation({
    mutationFn: (id: string | number) => restaurantDataProvider.likeRestaurant(id),
    onSuccess: (data, variables) => {
      // Update restaurant data in cache
      queryClient.setQueryData(
        restaurantKeys.detail(variables),
        (oldData: Restaurant | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              is_liked: true,
            }
          }
          return oldData
        }
      )
      
      // Invalidate related queries to ensure data consistency
      queryClient.invalidateQueries({ queryKey: restaurantKeys.detail(variables) })
      queryClient.invalidateQueries({ queryKey: restaurantKeys.lists() })
    },
    onError: (error) => {
      console.error('Failed to like restaurant:', error)
    }
  })
}

// Unlike restaurant mutation
export const useUnlikeRestaurant = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string | number) => restaurantDataProvider.unlikeRestaurant(id),
    onSuccess: (data, variables) => {
      // Update restaurant data in cache
      queryClient.setQueryData(
        restaurantKeys.detail(variables),
        (oldData: Restaurant | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              is_liked: false,
            }
          }
          return oldData
        }
      )
      
      // Invalidate related queries to ensure data consistency
      queryClient.invalidateQueries({ queryKey: restaurantKeys.detail(variables) })
      queryClient.invalidateQueries({ queryKey: restaurantKeys.lists() })
      queryClient.invalidateQueries({ queryKey: restaurantKeys.liked() })
    },
    onError: (error) => {
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
  
  return useMutation({
    mutationFn: (id: string | number) => restaurantDataProvider.removeLikedRestaurant(id),
    onSuccess: (data, variables) => {
      // Remove restaurant from liked restaurants cache
      queryClient.setQueryData(
        restaurantKeys.liked(),
        (oldData: RestaurantFavorite[] | undefined) => {
          if (oldData) {
            return oldData.filter(restaurant => restaurant.id !== variables)
          }
          return oldData
        }
      )
      
      // Update restaurant detail if it exists in cache
      queryClient.setQueryData(
        restaurantKeys.detail(variables),
        (oldData: Restaurant | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              is_liked: false,
            }
          }
          return oldData
        }
      )
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: restaurantKeys.liked() })
      queryClient.invalidateQueries({ queryKey: restaurantKeys.lists() })
    },
    onError: (error) => {
      console.error('Failed to remove restaurant from favorites:', error)
    }
  })
}
