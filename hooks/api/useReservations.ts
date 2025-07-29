'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { restaurantDataProvider, type Reservation, type ReservationsAPIResponse, type BookingRequest, type BookingResponse } from '@/lib/dataProvider'
import { useAuth } from '@/components/auth/AuthProvider'
import { useQueryInvalidator } from './invalidationUtils'

// Query keys for reservations
export const reservationKeys = {
  all: ['reservations'] as const,
  lists: () => [...reservationKeys.all, 'list'] as const,
  list: (params?: any) => [...reservationKeys.lists(), params] as const,
  details: () => [...reservationKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...reservationKeys.details(), id] as const,
}

// Get user reservations
export const useReservations = () => {
  const { isAuthenticated } = useAuth()
  
  return useQuery({
    queryKey: reservationKeys.list(),
    queryFn: () => restaurantDataProvider.getReservations(),
    enabled: isAuthenticated, // Only run query when user is authenticated
    staleTime: 2 * 60 * 1000, // 2 minutes - reservations can change frequently
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

// Cancel reservation mutation
export const useCancelReservation = () => {
  const queryClient = useQueryClient()
  const invalidator = useQueryInvalidator()
  
  return useMutation({
    mutationFn: (id: string | number) => restaurantDataProvider.cancelReservation(id),
    onMutate: async (variables) => {
      // Optimistic update - mark reservation as cancelled
      const rollback = await invalidator.optimisticUpdate<ReservationsAPIResponse>(
        reservationKeys.list(),
        (oldData) => {
          if (oldData) {
            return {
              ...oldData,
              results: oldData.results.map(reservation => 
                reservation.id === variables 
                  ? { ...reservation, status: 'cancelled' as const }
                  : reservation
              )
            }
          }
          return oldData
        }
      )
      return { rollback }
    },
    onSuccess: (data, variables) => {
      // Invalidate reservations and related restaurant availability
      invalidator.invalidateReservations()
      
      // If we know the restaurant ID from the reservation, invalidate its availability
      const reservationData = queryClient.getQueryData<ReservationsAPIResponse>(reservationKeys.list())
      const cancelledReservation = reservationData?.results.find(r => r.id === variables)
      if (cancelledReservation?.restaurant) {
        // Invalidate restaurant availability since a slot was freed up
        queryClient.invalidateQueries({ 
          predicate: (query) => {
            const queryKey = query.queryKey
            return Boolean(queryKey[0] === 'restaurants' && 
                   queryKey.includes('availability') && 
                   queryKey.includes(cancelledReservation.restaurant))
          }
        })
      }
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.rollback) {
        context.rollback()
      }
      console.error('Failed to cancel reservation:', error)
    }
  })
}

// Create booking mutation
export const useCreateBooking = () => {
  const queryClient = useQueryClient()
  const invalidator = useQueryInvalidator()
  
  return useMutation({
    mutationFn: (bookingData: BookingRequest) => restaurantDataProvider.createBooking(bookingData),
    onSuccess: (data, variables) => {
      // Invalidate reservations list to show the new booking
      invalidator.invalidateReservations()
      
      // Invalidate restaurant availability since a slot was taken
      if (variables.restaurant) {
        queryClient.invalidateQueries({ 
          predicate: (query) => {
            const queryKey = query.queryKey
            return Boolean(queryKey[0] === 'restaurants' && 
                   queryKey.includes('availability') && 
                   queryKey.includes(variables.restaurant))
          }
        })
      }
      
      console.log('Booking created successfully:', data)
    },
    onError: (error: any) => {
      console.error('Failed to create booking:', error)
    }
  })
}
