"use client"

import { useState, useEffect, useCallback } from "react"

export interface GeolocationCoords {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
}

export interface GeolocationError {
  code: number
  message: string
}

export interface GeolocationState {
  coords: GeolocationCoords | null
  error: GeolocationError | null
  loading: boolean
  supported: boolean
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
  watchPosition?: boolean
  autoRequest?: boolean
  storageKey?: string
}

const DEFAULT_OPTIONS: UseGeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 15000, // 15 seconds
  maximumAge: 300000, // 5 minutes
  watchPosition: false,
  autoRequest: false,
  storageKey: "userLocation"
}

export const useGeolocation = (options: UseGeolocationOptions = {}) => {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    error: null,
    loading: false,
    supported: false
  })

  // Check if geolocation is supported
  useEffect(() => {
    const supported = 'geolocation' in navigator
    setState(prev => ({ ...prev, supported }))
    
    // Load from localStorage on mount
    if (typeof window !== 'undefined' && opts.storageKey) {
      const stored = localStorage.getItem(opts.storageKey)
      if (stored) {
        try {
          const parsedCoords = JSON.parse(stored) as GeolocationCoords
          // Check if stored location is not too old (24 hours)
          const now = Date.now()
          const locationAge = now - parsedCoords.timestamp
          const maxAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
          
          if (locationAge < maxAge) {
            setState(prev => ({ ...prev, coords: parsedCoords }))
          } else {
            // Remove expired location
            localStorage.removeItem(opts.storageKey)
          }
        } catch (error) {
          console.error('Failed to parse stored location:', error)
          localStorage.removeItem(opts.storageKey)
        }
      }
    }
    
    // Auto-request if enabled and no stored location
    if (opts.autoRequest && supported) {
      getCurrentPosition()
    }
  }, [])

  // Success callback
  const onSuccess = useCallback((position: GeolocationPosition) => {
    const coords: GeolocationCoords = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: Date.now()
    }

    setState(prev => ({
      ...prev,
      coords,
      error: null,
      loading: false
    }))

    // Store in localStorage
    if (typeof window !== 'undefined' && opts.storageKey) {
      try {
        localStorage.setItem(opts.storageKey, JSON.stringify(coords))
        console.log('📍 User location saved to localStorage:', coords)
      } catch (error) {
        console.error('Failed to save location to localStorage:', error)
      }
    }
  }, [opts.storageKey])

  // Error callback
  const onError = useCallback((error: GeolocationPositionError) => {
    const geolocationError: GeolocationError = {
      code: error.code,
      message: getErrorMessage(error.code)
    }

    setState(prev => ({
      ...prev,
      error: geolocationError,
      loading: false
    }))

    console.error('Geolocation error:', geolocationError)
  }, [])

  // Get current position
  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: {
          code: -1,
          message: 'Geolocation is not supported by this browser'
        }
      }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    const positionOptions: PositionOptions = {
      enableHighAccuracy: opts.enableHighAccuracy,
      timeout: opts.timeout,
      maximumAge: opts.maximumAge
    }

    navigator.geolocation.getCurrentPosition(
      onSuccess,
      onError,
      positionOptions
    )
  }, [onSuccess, onError, opts.enableHighAccuracy, opts.timeout, opts.maximumAge])

  // Watch position (for real-time tracking)
  const watchPosition = useCallback(() => {
    if (!navigator.geolocation) return null

    setState(prev => ({ ...prev, loading: true, error: null }))

    const positionOptions: PositionOptions = {
      enableHighAccuracy: opts.enableHighAccuracy,
      timeout: opts.timeout,
      maximumAge: opts.maximumAge
    }

    const watchId = navigator.geolocation.watchPosition(
      onSuccess,
      onError,
      positionOptions
    )

    return watchId
  }, [onSuccess, onError, opts.enableHighAccuracy, opts.timeout, opts.maximumAge])

  // Clear stored location
  const clearStoredLocation = useCallback(() => {
    if (typeof window !== 'undefined' && opts.storageKey) {
      localStorage.removeItem(opts.storageKey)
      setState(prev => ({ ...prev, coords: null }))
      console.log('📍 Stored location cleared')
    }
  }, [opts.storageKey])

  // Get stored location without triggering a new request
  const getStoredLocation = useCallback((): GeolocationCoords | null => {
    if (typeof window === 'undefined' || !opts.storageKey) return null
    
    const stored = localStorage.getItem(opts.storageKey)
    if (!stored) return null
    
    try {
      const parsedCoords = JSON.parse(stored) as GeolocationCoords
      // Check if stored location is not too old (24 hours)
      const now = Date.now()
      const locationAge = now - parsedCoords.timestamp
      const maxAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
      
      if (locationAge < maxAge) {
        return parsedCoords
      } else {
        // Remove expired location
        localStorage.removeItem(opts.storageKey)
        return null
      }
    } catch (error) {
      console.error('Failed to parse stored location:', error)
      localStorage.removeItem(opts.storageKey)
      return null
    }
  }, [opts.storageKey])

  // Check if user has granted location permission
  const checkPermission = useCallback(async (): Promise<PermissionState | null> => {
    if (!navigator.permissions) return null
    
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' })
      return result.state
    } catch (error) {
      console.error('Failed to check geolocation permission:', error)
      return null
    }
  }, [])

  return {
    ...state,
    getCurrentPosition,
    watchPosition,
    clearStoredLocation,
    getStoredLocation,
    checkPermission,
    // Utility methods
    hasLocation: !!state.coords,
    isRecent: state.coords ? (Date.now() - state.coords.timestamp) < 600000 : false, // Less than 10 minutes old
  }
}

// Helper function to get human-readable error messages
const getErrorMessage = (code: number): string => {
  switch (code) {
    case 1:
      return 'Location access denied by user'
    case 2:
      return 'Location information is unavailable'
    case 3:
      return 'Location request timed out'
    default:
      return 'An unknown error occurred while retrieving location'
  }
}

// Utility function to calculate distance between two coordinates
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1)
  const dLng = deg2rad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Distance in kilometers
  return d
}

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180)
}

export default useGeolocation
