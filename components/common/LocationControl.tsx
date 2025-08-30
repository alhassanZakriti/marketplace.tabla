"use client"

import React from "react"
import { MapPin, Navigation, Loader2, AlertCircle, RotateCcw, Check, Clock } from "lucide-react"
import useGeolocation, { calculateDistance } from "@/hooks/useGeolocation"

interface LocationControlProps {
  onLocationUpdate?: (coords: { lat: number; lng: number }) => void
  className?: string
  showDetails?: boolean
}

export const LocationControl: React.FC<LocationControlProps> = ({
  onLocationUpdate,
  className = "",
  showDetails = false
}) => {
  const {
    coords,
    error,
    loading,
    supported,
    getCurrentPosition,
    clearStoredLocation,
    hasLocation,
    isRecent,
    checkPermission
  } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 300000, // 5 minutes
    autoRequest: false, // Don't auto-request, let user choose
    storageKey: "tabla_user_location"
  })

  // Notify parent component when location is available
  React.useEffect(() => {
    if (coords && onLocationUpdate) {
      onLocationUpdate({
        lat: coords.latitude,
        lng: coords.longitude
      })
    }
  }, [coords, onLocationUpdate])

  const handleGetLocation = async () => {
    // Check permission first
    const permission = await checkPermission()
    if (permission === 'denied') {
      alert('Location access has been denied. Please enable location access in your browser settings.')
      return
    }
    
    getCurrentPosition()
  }

  const formatLocationAge = (timestamp: number): string => {
    const age = Date.now() - timestamp
    const minutes = Math.floor(age / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  if (!supported) {
    return (
      <div className={`p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800 ${className}`}>
        <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Geolocation not supported</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main Location Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleGetLocation}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            hasLocation
              ? 'bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900 dark:hover:bg-green-800 dark:text-green-200'
              : 'bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-200'
          } ${loading ? 'cursor-not-allowed opacity-50' : 'hover:scale-105'}`}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : hasLocation ? (
            <Check className="w-4 h-4" />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
          <span className="text-sm">
            {loading ? 'Getting location...' : hasLocation ? 'Location found' : 'Get my location'}
          </span>
        </button>

        {hasLocation && (
          <button
            onClick={clearStoredLocation}
            className="flex items-center gap-1 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="text-xs">Clear</span>
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-800 dark:text-red-200">
              <p className="font-medium">Location Error</p>
              <p className="text-xs mt-1 opacity-90">{error.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Location Details */}
      {showDetails && coords && (
        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Navigation className="w-4 h-4" />
            <span className="text-sm font-medium">Current Location</span>
          </div>
          
          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Latitude:</span>
              <span className="font-mono">{coords.latitude.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span>Longitude:</span>
              <span className="font-mono">{coords.longitude.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span>Accuracy:</span>
              <span>{Math.round(coords.accuracy)}m</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Updated:</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatLocationAge(coords.timestamp)}</span>
                {isRecent && <span className="text-green-600 dark:text-green-400">•</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {coords && !showDetails && (
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Clock className="w-3 h-3" />
          <span>Updated {formatLocationAge(coords.timestamp)}</span>
          {isRecent && (
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <span className="w-1 h-1 bg-current rounded-full"></span>
              Recent
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default LocationControl
