'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authDataProvider, type LoginCredentials, type RegisterData, type AuthResponse } from '@/lib/dataProvider'
import { useQueryInvalidator } from './invalidationUtils'

// Auth mutations
export const useLogin = () => {
  const queryClient = useQueryClient()
  const invalidator = useQueryInvalidator()
  
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authDataProvider.login(credentials),
    onSuccess: (data: AuthResponse) => {
      // Clear all queries on login to ensure fresh data for the authenticated user
      invalidator.clearAll()
      
      // Optionally set user data in cache if you have a user query
      // queryClient.setQueryData(['user'], data.user)
      
      console.log('Login successful:', data)
    },
    onError: (error: any) => {
      console.error('Login failed:', error)
    }
  })
}

export const useRegister = () => {
  const queryClient = useQueryClient()
  const invalidator = useQueryInvalidator()
  
  return useMutation({
    mutationFn: (data: RegisterData) => authDataProvider.register(data),
    onSuccess: (data: AuthResponse) => {
      // Clear all queries on registration to ensure fresh data
      invalidator.clearAll()
      
      console.log('Registration successful:', data)
    },
    onError: (error: any) => {
      console.error('Registration failed:', error)
    }
  })
}

export const useLogout = () => {
  const queryClient = useQueryClient()
  const invalidator = useQueryInvalidator()
  
  return useMutation({
    mutationFn: () => authDataProvider.logout(),
    onSuccess: () => {
      // Clear all queries on logout to remove user-specific data
      invalidator.clearAll()
      
      console.log('Logout successful')
    },
    onError: (error: any) => {
      console.error('Logout failed:', error)
      // Even if logout fails on server, clear local cache
      invalidator.clearAll()
    }
  })
}

export const useRefreshToken = () => {
  const invalidator = useQueryInvalidator()
  
  return useMutation({
    mutationFn: () => authDataProvider.refreshToken(),
    onSuccess: () => {
      // On successful token refresh, invalidate user-related data to refetch with new token
      invalidator.invalidateUserRelatedData({ silent: true })
    },
    onError: (error: any) => {
      console.error('Token refresh failed:', error)
    }
  })
}
