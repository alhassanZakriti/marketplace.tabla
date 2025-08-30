'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { restaurantDataProvider, type Reservation, type ReservationsAPIResponse, type BookingRequest, type BookingResponse, type ReservationAvailabilityRequest, type ReservationAvailabilityResponse, type TimeSlotRequest, type ProcessedTimeSlotsResponse, type MonthlyAvailabilityResponse, type OfferType } from '@/lib/dataProvider'
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

// Check reservation availability using the reservation endpoint
export const useReservationAvailability = (
  restaurantId: string | number | undefined,
  request: ReservationAvailabilityRequest | undefined,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['reservationAvailability', restaurantId, request],
    queryFn: () => {
      if (!restaurantId || !request) {
        throw new Error('Restaurant ID and availability request are required')
      }
      return restaurantDataProvider.checkReservationAvailability(restaurantId, request)
    },
    enabled: enabled && !!restaurantId && !!request,
    staleTime: 30 * 1000, // 30 seconds - availability can change quickly
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 1, // Only retry once for availability checks
  })
}

// Get available time slots for a specific date and guest count
export const useTimeSlots = (
  restaurantId: string | number | undefined,
  request: TimeSlotRequest | undefined,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['timeSlots', restaurantId, request?.date, request?.number_of_guests],
    queryFn: () => {
      if (!restaurantId || !request) {
        throw new Error('Restaurant ID and time slot request are required')
      }
      return restaurantDataProvider.getTimeSlots(restaurantId, request)
    },
    enabled: enabled && !!restaurantId && !!request,
    staleTime: 60 * 1000, // 1 minute - time slots change less frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2, // Retry twice for time slots
    // Provide default data structure on error
    placeholderData: {
      date: request?.date || '',
      available_slots: []
    }
  })
}

// Get monthly availability for date filtering in calendar
export const useMonthlyAvailability = (
  restaurantId: string | number | undefined,
  year: number,
  month: number,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['monthlyAvailability', restaurantId, year, month],
    queryFn: () => {
      if (!restaurantId) {
        throw new Error('Restaurant ID is required')
      }
      return restaurantDataProvider.getMonthlyAvailability(restaurantId, year, month)
    },
    enabled: enabled && !!restaurantId,
    staleTime: 5 * 60 * 1000, // 5 minutes - availability doesn't change very frequently
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2, // Retry twice for availability
    // Provide default data structure on error
    placeholderData: []
  })
}

// Get restaurant offers
export const useOffers = (restaurantId?: number | string, enabled = true) => {
  return useQuery({
    queryKey: ['offers', restaurantId],
    queryFn: () => restaurantDataProvider.getOffers(restaurantId!),
    enabled: enabled && !!restaurantId,
    staleTime: 10 * 60 * 1000, // 10 minutes - offers don't change very often
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2
  })
}
