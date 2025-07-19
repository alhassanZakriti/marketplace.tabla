"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { GoogleMap, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api"
import type { google } from "google-maps"
import { Star, MapPin, Navigation, Loader2, AlertCircle } from "lucide-react"

interface Restaurant {
  id: string | number
  name: string
  address: string
  distance: number | null
  rating: number | null
  status: "Closed" | "Open"
  main_image: string | null
  location: [number, number] | null
  imageUrl?: string
  category?: string
  isOpen?: boolean
  priceRange?: string
  coordinates?: { lat: number; lng: number }
  reviewCount?: number
}

interface MapComponentProps {
  restaurants: Restaurant[]
  selectedRestaurantId: string | null
  onRestaurantSelect?: (restaurantId: string | null) => void
  className?: string
}

// Use environment variable for API key
const GOOGLE_MAPS_API_KEY = "AIzaSyC60-vVmVncg9pqxwkXz1dLPRktRVRWwco"

const defaultMapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  gestureHandling: "cooperative",
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "transit",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "road",
      elementType: "labels.icon",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "administrative.land_parcel",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "administrative.neighborhood",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ],
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "12px",
}

// Helper function to get safe coordinates - moved to top
const getSafeCoordinates = (restaurant: Restaurant): { lat: number; lng: number } | null => {
  if (
    restaurant.coordinates &&
    typeof restaurant.coordinates.lat === "number" &&
    typeof restaurant.coordinates.lng === "number" &&
    !isNaN(restaurant.coordinates.lat) &&
    !isNaN(restaurant.coordinates.lng)
  ) {
    return restaurant.coordinates
  }

  if (restaurant.location && Array.isArray(restaurant.location) && restaurant.location.length === 2) {
    const [lat, lng] = restaurant.location
    if (typeof lat === "number" && typeof lng === "number" && !isNaN(lat) && !isNaN(lng)) {
      return { lat, lng }
    }
  }

  return null
}

const LoadingState = () => (
  <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <p className="text-sm text-gray-600 dark:text-gray-400">Loading map...</p>
    </div>
  </div>
)

const ErrorState = ({ message }: { message: string }) => (
  <div className="h-full flex items-center justify-center bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
    <div className="flex flex-col items-center gap-3 p-6 text-center">
      <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
      <div>
        <p className="font-medium text-red-800 dark:text-red-200">Map Error</p>
        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{message}</p>
      </div>
    </div>
  </div>
)

const EmptyState = () => (
  <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
    <div className="flex flex-col items-center gap-3 p-6 text-center">
      <MapPin className="h-8 w-8 text-gray-400 dark:text-gray-600" />
      <div>
        <p className="font-medium text-gray-900 dark:text-gray-100">No Locations</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">No restaurant locations available to display</p>
      </div>
    </div>
  </div>
)

const RestaurantInfoWindow = ({
  restaurant,
  onClose,
}: {
  restaurant: Restaurant
  onClose: () => void
}) => {
  const handleDirections = () => {
    const coords = getSafeCoordinates(restaurant)
    if (coords) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`
      window.open(url, "_blank")
    }
  }

  return (
    <div className="w-[280px] bg-white dark:bg-gray-800 rounded-lg shadow-xl border-0 overflow-hidden">
      {restaurant.imageUrl && (
        <div className="relative h-32 overflow-hidden">
          <img
            src={restaurant.imageUrl || "/placeholder.svg"}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold leading-tight truncate text-gray-900 dark:text-gray-100">
              {restaurant.name}
            </h3>
            {restaurant.category && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{restaurant.category}</p>
            )}
          </div>
          {restaurant.status && (
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full shrink-0 ${
                restaurant.status === "Open"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              {restaurant.status}
            </span>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 mt-0.5 text-gray-500 dark:text-gray-400 shrink-0" />
            <span className="text-gray-600 dark:text-gray-300 leading-relaxed">{restaurant.address}</span>
          </div>

          {restaurant.rating !== null && (
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-gray-900 dark:text-gray-100">{restaurant.rating.toFixed(1)}</span>
              </div>
              {restaurant.reviewCount && (
                <span className="text-gray-600 dark:text-gray-400">({restaurant.reviewCount} reviews)</span>
              )}
            </div>
          )}

          {restaurant.priceRange && (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-900 dark:text-gray-100">Price:</span>
              <span className="text-gray-600 dark:text-gray-400">{restaurant.priceRange}</span>
            </div>
          )}

          {restaurant.distance !== null && (
            <div className="flex items-center gap-2 text-sm">
              <Navigation className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">{restaurant.distance.toFixed(1)} km away</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleDirections}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Navigation className="w-4 h-4" />
              Directions
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const MapComponent: React.FC<MapComponentProps> = ({
  restaurants,
  selectedRestaurantId,
  onRestaurantSelect,
  className = "",
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [infoWindowOpen, setInfoWindowOpen] = useState<string | null>(null)

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  })

  const restaurantsWithCoordinates = restaurants.filter((restaurant) => getSafeCoordinates(restaurant) !== null)

  const onLoad = useCallback(
    (mapInstance: google.maps.Map) => {
      setMap(mapInstance)

      if (restaurantsWithCoordinates.length > 0) {
        const bounds = new window.google.maps.LatLngBounds()
        restaurantsWithCoordinates.forEach((restaurant) => {
          const coords = getSafeCoordinates(restaurant)
          if (coords) bounds.extend(coords)
        })

        mapInstance.fitBounds(bounds)

        if (restaurantsWithCoordinates.length === 1) {
          mapInstance.setZoom(15)
        }
      } else {
        // Default to Casablanca
        mapInstance.setCenter({ lat: 33.589886, lng: -7.603869 })
        mapInstance.setZoom(12)
      }
    },
    [restaurantsWithCoordinates],
  )

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  useEffect(() => {
    if (map && isLoaded && restaurantsWithCoordinates.length > 0) {
      if (selectedRestaurantId) {
        const selected = restaurantsWithCoordinates.find((r) => String(r.id) === selectedRestaurantId)
        const coords = selected ? getSafeCoordinates(selected) : null

        if (coords) {
          map.panTo(coords)
          map.setZoom(16)
          setInfoWindowOpen(String(selected?.id))
        }
      } else {
        setInfoWindowOpen(null)
      }
    }
  }, [map, isLoaded, restaurantsWithCoordinates, selectedRestaurantId])

  const handleMarkerClick = (restaurantId: string) => {
    setInfoWindowOpen(restaurantId)
    onRestaurantSelect?.(restaurantId)
  }

  const handleInfoWindowClose = () => {
    setInfoWindowOpen(null)
    onRestaurantSelect?.(null)
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <ErrorState message="Google Maps API key is not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables." />
    )
  }

  if (loadError) {
    return <ErrorState message="Failed to load Google Maps. Please check your API key and try again." />
  }

  if (!isLoaded) {
    return <LoadingState />
  }

  if (restaurantsWithCoordinates.length === 0) {
    return <EmptyState />
  }

  return (
    <div className={`w-full h-[500px] rounded-lg overflow-hidden ${className}`}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={{ lat: 33.589886, lng: -7.603869 }}
        zoom={12}
        options={defaultMapOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {restaurantsWithCoordinates.map((restaurant) => {
          const coords = getSafeCoordinates(restaurant)!
          const isSelected = String(restaurant.id) === selectedRestaurantId

          return (
            <Marker
              key={restaurant.id}
              position={coords}
              title={restaurant.name}
              onClick={() => handleMarkerClick(String(restaurant.id))}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: isSelected ? 12 : 8,
                fillColor: isSelected ? "#16a34a" : "#374151",
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: "white",
              }}
              animation={isSelected ? window.google.maps.Animation.BOUNCE : undefined}
            />
          )
        })}

        {/* {infoWindowOpen && (
          <InfoWindow
            position={getSafeCoordinates(restaurantsWithCoordinates.find((r) => String(r.id) === infoWindowOpen)!)!}
            onCloseClick={handleInfoWindowClose}
            options={{
              pixelOffset: new window.google.maps.Size(0, -10),
            }}
          >
            <RestaurantInfoWindow
              restaurant={restaurantsWithCoordinates.find((r) => String(r.id) === infoWindowOpen)!}
              onClose={handleInfoWindowClose}
            />
          </InfoWindow>
        )} */}
      </GoogleMap>
    </div>
  )
}
