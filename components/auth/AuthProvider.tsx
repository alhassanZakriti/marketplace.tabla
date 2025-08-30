"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { dataProvider, type User } from "../../lib/dataProvider"
import { useQueryClient } from "@tanstack/react-query"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (credentials: any) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
  refreshUser: () => Promise<void>
  ensureValidToken: () => Promise<boolean>
  shouldRefreshToken: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const queryClient = useQueryClient()

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (dataProvider.auth.isAuthenticated()) {
          const currentUser = dataProvider.auth.getCurrentUser()
          if (currentUser) {
            setUser(currentUser)
          } else {
            // Try to fetch user profile from API
            try {
              const profile = await dataProvider.auth.getProfile()
              setUser(profile)
              localStorage.setItem("user", JSON.stringify(profile))
            } catch (error) {
              // If profile fetch fails, clear auth data
              await logout()
            }
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (credentials: any) => {
    setLoading(true)
    try {
      const response = await dataProvider.auth.login(credentials)

      // If user data is not in response, fetch it
      if (response.user) {
        setUser(response.user)
      } else {
        try {
          const profile = await dataProvider.auth.getProfile()
          setUser(profile)
          localStorage.setItem("user", JSON.stringify(profile))
        } catch (error) {
          console.error("Failed to fetch user profile:", error)
        }
      }

      // Invalidate all queries to refresh data for authenticated user
      queryClient.invalidateQueries()
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await dataProvider.auth.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
      
      // Clear all cached data on logout
      queryClient.clear()
      
      setLoading(false)
    }
  }

  const refreshUser = async () => {
    if (!dataProvider.auth.isAuthenticated()) return

    try {
      const profile = await dataProvider.auth.getProfile()
      setUser(profile)
      localStorage.setItem("user", JSON.stringify(profile))
    } catch (error) {
      console.error("Failed to refresh user:", error)
      await logout()
    }
  }

  const ensureValidToken = async (): Promise<boolean> => {
    try {
      return await dataProvider.auth.ensureValidToken()
    } catch (error) {
      console.error('Token validation failed:', error)
      await logout()
      return false
    }
  }

  const shouldRefreshToken = (): boolean => {
    return dataProvider.auth.shouldRefreshToken()
  }

  // Set up automatic token refresh
  useEffect(() => {
    if (!user) return

    // Check token every 4 minutes and refresh if needed
    const interval = setInterval(async () => {
      await ensureValidToken()
    }, 4 * 60 * 1000) // 4 minutes

    return () => clearInterval(interval)
  }, [user])

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user && dataProvider.auth.isAuthenticated(),
    refreshUser,
    ensureValidToken,
    shouldRefreshToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
