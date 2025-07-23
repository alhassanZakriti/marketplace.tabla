"use client"

import { useState, useEffect, useCallback } from 'react'
import { dataProvider, type User, type AuthResponse, type LoginCredentials, type RegisterData } from '@/lib/dataProvider'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  })

  // Initialize auth state on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const isAuthenticated = dataProvider.auth.isAuthenticated()
        const user = dataProvider.auth.getCurrentUser()

        setAuthState({
          user,
          isAuthenticated,
          isLoading: false,
          error: null
        })

        // If authenticated but token needs refresh, refresh it
        if (isAuthenticated && dataProvider.auth.shouldRefreshToken()) {
          try {
            await dataProvider.auth.refreshToken()
          } catch (error) {
            console.error('Token refresh failed:', error)
            // If refresh fails, log out user
            await logout()
          }
        }
      } catch (error) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Failed to initialize authentication'
        })
      }
    }

    initializeAuth()
  }, [])

  // Login function
  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const response: AuthResponse = await dataProvider.auth.login(credentials)
      
      setAuthState({
        user: response.user || null,
        isAuthenticated: true,
        isLoading: false,
        error: null
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
      throw error
    }
  }, [])

  // Register function
  const register = useCallback(async (userData: RegisterData): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const response: AuthResponse = await dataProvider.auth.register(userData)
      
      setAuthState({
        user: response.user || null,
        isAuthenticated: true,
        isLoading: false,
        error: null
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed'
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
      throw error
    }
  }, [])

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }))
    
    try {
      await dataProvider.auth.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      })
    }
  }, [])

  // Update user profile
  const updateProfile = useCallback(async (userData: Partial<User>): Promise<User> => {
    try {
      const updatedUser = await dataProvider.auth.updateProfile(userData)
      
      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }))
      
      return updatedUser
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed'
      setAuthState(prev => ({
        ...prev,
        error: errorMessage
      }))
      throw error
    }
  }, [])

  // Get user profile
  const getProfile = useCallback(async (): Promise<User> => {
    try {
      const profile = await dataProvider.auth.getProfile()
      
      setAuthState(prev => ({
        ...prev,
        user: profile
      }))
      
      return profile
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load profile'
      setAuthState(prev => ({
        ...prev,
        error: errorMessage
      }))
      throw error
    }
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }))
  }, [])

  // Check and refresh token if needed
  const ensureValidToken = useCallback(async (): Promise<boolean> => {
    try {
      if (!authState.isAuthenticated) {
        return false
      }

      if (dataProvider.auth.shouldRefreshToken()) {
        await dataProvider.auth.refreshToken()
      }
      
      return true
    } catch (error) {
      console.error('Token refresh failed:', error)
      await logout()
      return false
    }
  }, [authState.isAuthenticated, logout])

  return {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
    getProfile,
    clearError,
    ensureValidToken
  }
}

// Hook to automatically refresh tokens
export function useTokenRefresh() {
  const { ensureValidToken, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) return

    // Set up interval to check and refresh token every 4 minutes
    const interval = setInterval(async () => {
      await ensureValidToken()
    }, 4 * 60 * 1000) // 4 minutes

    return () => clearInterval(interval)
  }, [isAuthenticated, ensureValidToken])

  return { ensureValidToken }
}
