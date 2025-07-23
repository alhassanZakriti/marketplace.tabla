'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authDataProvider, type LoginCredentials, type RegisterData, type AuthResponse } from '@/lib/dataProvider'

// Auth mutations
export const useLogin = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authDataProvider.login(credentials),
    onSuccess: (data: AuthResponse) => {
      // Clear all queries on login to ensure fresh data
      queryClient.clear()
      // You might want to set user data in a query here if needed
      // queryClient.setQueryData(['user'], data.user)
    },
    onError: (error) => {
      console.error('Login failed:', error)
    }
  })
}

export const useRegister = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: RegisterData) => authDataProvider.register(data),
    onSuccess: (data: AuthResponse) => {
      // Clear all queries on registration to ensure fresh data
      queryClient.clear()
    },
    onError: (error) => {
      console.error('Registration failed:', error)
    }
  })
}

export const useLogout = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: () => authDataProvider.logout(),
    onSuccess: () => {
      // Clear all queries on logout
      queryClient.clear()
    },
    onError: (error) => {
      console.error('Logout failed:', error)
    }
  })
}

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: () => authDataProvider.refreshToken(),
    onError: (error) => {
      console.error('Token refresh failed:', error)
    }
  })
}
