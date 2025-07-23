'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { restaurantDataProvider, type Reservation, type ReservationsAPIResponse, type BookingRequest, type BookingResponse } from '@/lib/dataProvider'
import { useAuth } from '@/components/auth/AuthProvider'

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
  
  return useMutation({
    mutationFn: (id: string | number) => restaurantDataProvider.cancelReservation(id),
    onSuccess: (data, variables) => {
      // Update reservation status in cache
      queryClient.setQueryData(
        reservationKeys.list(),
        (oldData: ReservationsAPIResponse | undefined) => {
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
      
      // Invalidate reservations list to ensure data consistency
      queryClient.invalidateQueries({ queryKey: reservationKeys.list() })
    },
    onError: (error) => {
      console.error('Failed to cancel reservation:', error)
    }
  })
}

// Create booking mutation
export const useCreateBooking = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (bookingData: BookingRequest) => restaurantDataProvider.createBooking(bookingData),
    onSuccess: (data) => {
      // Invalidate reservations list to show the new booking
      queryClient.invalidateQueries({ queryKey: reservationKeys.list() })
      
      console.log('Booking created successfully:', data)
    },
    onError: (error) => {
      console.error('Failed to create booking:', error)
    }
  })
}
