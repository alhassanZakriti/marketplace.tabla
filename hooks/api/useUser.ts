'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { restaurantDataProvider, type UserReview } from '@/lib/dataProvider'
import { useAuth } from '@/components/auth/AuthProvider'
import { useQueryInvalidator } from './invalidationUtils'

// Query keys for user data
export const userKeys = {
  all: ['user'] as const,
  reviews: () => [...userKeys.all, 'reviews'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
}

// Get user reviews
export const useUserReviews = () => {
  const { isAuthenticated } = useAuth()
  
  return useQuery({
    queryKey: userKeys.reviews(),
    queryFn: () => restaurantDataProvider.getUserReviews(),
    enabled: isAuthenticated, // Only run query when user is authenticated
    staleTime: 2 * 60 * 1000, // 2 minutes - reviews don't change often
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

// Create review mutation (if needed later)
export const useCreateReview = () => {
  const queryClient = useQueryClient()
  const invalidator = useQueryInvalidator()
  
  return useMutation({
    mutationFn: (reviewData: any) => {
      // This would be implemented when you have a create review API
      throw new Error('Create review API not implemented yet')
    },
    onSuccess: (data, variables) => {
      // Invalidate user reviews to show the new review
      invalidator.invalidateUserRelatedData()
      
      // If we know the restaurant ID, invalidate its reviews too
      if (variables.restaurant_id) {
        queryClient.invalidateQueries({ 
          predicate: (query) => {
            const queryKey = query.queryKey
            return Boolean(queryKey[0] === 'restaurants' && 
                   queryKey.includes('reviews') && 
                   queryKey.includes(variables.restaurant_id))
          }
        })
      }
      
      console.log('Review created successfully:', data)
    },
    onError: (error: any) => {
      console.error('Failed to create review:', error)
    }
  })
}

// Update review mutation (if needed later)
export const useUpdateReview = () => {
  const queryClient = useQueryClient()
  const invalidator = useQueryInvalidator()
  
  return useMutation({
    mutationFn: ({ id, reviewData }: { id: string | number; reviewData: any }) => {
      // This would be implemented when you have an update review API
      throw new Error('Update review API not implemented yet')
    },
    onSuccess: (data, variables) => {
      // Invalidate user reviews
      invalidator.invalidateUserRelatedData()
      
      console.log('Review updated successfully:', data)
    },
    onError: (error: any) => {
      console.error('Failed to update review:', error)
    }
  })
}

// Delete review mutation (if needed later)
export const useDeleteReview = () => {
  const queryClient = useQueryClient()
  const invalidator = useQueryInvalidator()
  
  return useMutation({
    mutationFn: (id: string | number) => {
      // This would be implemented when you have a delete review API
      throw new Error('Delete review API not implemented yet')
    },
    onSuccess: (data, variables) => {
      // Invalidate user reviews
      invalidator.invalidateUserRelatedData()
      
      console.log('Review deleted successfully:', data)
    },
    onError: (error: any) => {
      console.error('Failed to delete review:', error)
    }
  })
}
