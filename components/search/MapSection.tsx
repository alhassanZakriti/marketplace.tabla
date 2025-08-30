"use client"

import type React from "react"
import { useState, useCallback, useEffect, useRef } from "react"
import { GoogleMap, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api"
import type { google } from "google-maps"
import { Star, MapPin, Navigation, Loader2, AlertCircle, ExternalLink, ChevronLeft, ChevronRight, Crosshair } from "lucide-react"
import useGeolocation, { calculateDistance } from "@/hooks/useGeolocation"
import { usePathname } from "next/navigation"

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
  isSticky?: boolean
}

// Use environment variable for API key
const GOOGLE_MAPS_API_KEY = "AIzaSyC60-vVmVncg9pqxwkXz1dLPRktRVRWwco"

// Custom marker SVG generator using your beautiful custom shape design
const createCustomMarker = (rating: number | null, status: "Open" | "Closed", isSelected: boolean = false) => {
  const size = isSelected ? 40 : 32 // Much smaller sizes
  const statusColor = status === "Open" ? "#335a06" : "#ef4444" // Use greentheme color for open, red for closed
  const ratingText = rating !== null ? rating.toFixed(1) : "N/A"
  
  // Scale factor to fit your design into our marker size - much smaller now
  const scale = size / 369.17
  const scaledWidth = 369.17 * scale
  const scaledHeight = 469.08 * scale
  
  const svgMarker = `
    <svg width="${scaledWidth}" height="${scaledHeight}" viewBox="0 0 369.17 469.08" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .cls-1, .cls-2, .cls-3 {
            stroke-width: 0px;
          }
          .cls-1, .cls-3 {
            fill: ${statusColor};
          }
          .cls-2 {
            fill: ${statusColor === "#335a06" ? "#e3e3e3" : "#e3e3e3"};
          }
          .cls-3 {
            opacity: .2;
            fill: ${statusColor === "#335a06" ? "#fff" : "#fff"};
          }
        </style>
      </defs>
      
      <!-- Shadow -->
      <rect class="cls-3" x="90.15" y="444.23" width="200.88" height="124.85" rx="8.25" ry="8.25"/>
      
      <!-- Your custom shape - colored border -->
      <path class="cls-1" d="m369.17,128.48c0,.67,0,1.34-.01,2.01-.03,4.68-.15,9.33-.37,13.96-.51-10.59-1.51-21.04-2.98-31.34-2.05-1.08-4.12-2.1-6.23-3.08-17.47-8.08-36.94-12.59-57.45-12.59-14.11,0-27.73,2.13-40.54,6.1-15.08-32.94-42.83-58.87-77.01-71.54-34.28,12.72-62.08,38.75-77.12,71.83-13.07-4.15-27-6.39-41.44-6.39-20.03,0-39.06,4.3-56.2,12.03-2.15.96-4.28,1.99-6.37,3.06-1.52,10.49-2.55,21.15-3.06,31.94-.23-4.64-.35-9.3-.38-13.98-.01-.67-.01-1.34-.01-2.01s0-1.34.01-2.01c.09-15.59,1.26-30.93,3.44-45.94,2.09-1.07,4.22-2.1,6.37-3.06,17.14-7.73,36.17-12.03,56.2-12.03,14.44,0,28.37,2.24,41.44,6.39C122.5,38.75,150.3,12.72,184.58,0c34.18,12.67,61.93,38.6,77.01,71.54,12.81-3.97,26.43-6.1,40.54-6.1,20.51,0,39.98,4.51,57.45,12.59,2.11.98,4.18,2,6.23,3.08,2.12,14.83,3.26,29.97,3.35,45.36.01.67.01,1.34.01,2.01Z"/>
      
      <!-- Your custom shape - white main body -->
      <path class="cls-2" d="m369.17,160.48c0,.67,0,1.34-.01,2.01-.47,79.2-28.7,151.83-75.46,208.63-29.69,36.07-66.85,65.76-109.11,86.7-42.29-20.96-79.47-50.67-109.17-86.76C28.69,314.26.48,241.67.01,162.49c-.01-.67-.01-1.34-.01-2.01s0-1.34.01-2.01c.02-4.69.15-9.36.38-14,.51-10.79,1.54-21.45,3.06-31.94,2.09-1.07,4.22-2.1,6.37-3.06,17.14-7.73,36.17-12.03,56.2-12.03,14.44,0,28.37,2.24,41.44,6.39,15.04-33.08,42.84-59.11,77.12-71.83,34.18,12.67,61.93,38.6,77.01,71.54,12.81-3.97,26.43-6.1,40.54-6.1,20.51,0,39.98,4.51,57.45,12.59,2.11.98,4.18,2,6.23,3.08,1.47,10.3,2.47,20.75,2.98,31.34.22,4.65.34,9.32.37,14.02.01.67.01,1.34.01,2.01Z"/>
      
      <!-- Rating text in center -->
      <text x="184.5" y="250" 
            text-anchor="middle" 
            font-family="Arial, sans-serif" 
            font-size="140px" 
            font-weight="bold" 
            fill="#333">
        ${ratingText}
      </text>
    </svg>
  `
  
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgMarker)}`
}

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
    const [lng ,lat ] = restaurant.location
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

const FloatingLocationButton = ({ 
  onLocationUpdate, 
  userLocation 
}: { 
  onLocationUpdate: (coords: { lat: number; lng: number }) => void
  userLocation: { lat: number; lng: number } | null
}) => {
  const {
    coords,
    error,
    loading,
    getCurrentPosition,
    hasLocation
  } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 300000,
    autoRequest: false,
    storageKey: "tabla_user_location"
  })

  // Notify parent component when location is available
  useEffect(() => {
    if (coords && onLocationUpdate) {
      onLocationUpdate({
        lat: coords.latitude,
        lng: coords.longitude
      })
    }
  }, [coords, onLocationUpdate])

  const handleGetLocation = async () => {
    getCurrentPosition()
  }

  return (
    <button
      onClick={handleGetLocation}
      disabled={loading}
      className={`absolute top-4 right-4 flex items-center justify-center z-10 w-10 h-10 rounded-full shadow-lg border-2 border-white transition-all duration-200 ${
        hasLocation || userLocation
          ? 'bg-greentheme hover:bg-greentheme/90 text-white'
          : 'bg-white hover:bg-gray-50 text-gray-700'
      } ${loading ? 'cursor-not-allowed opacity-50' : 'hover:scale-105'}`}
      title={loading ? 'Getting location...' : hasLocation ? 'Location found' : 'Get my location'}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Crosshair className="w-4 h-4" />
      )}
    </button>
  )
}

const MobileRestaurantCard = ({ restaurant }: { restaurant: Restaurant }) => {
  return (
    <div className="flex-shrink-0 w-80 h-24 bg-white dark:bg-bgdarktheme2 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow flex">
      {/* Image Section */}
      {restaurant.main_image && (
        <div className="relative w-24 h-full overflow-hidden">
          <img
            src={restaurant.main_image || "/placeholder.svg"}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          {restaurant.status && (
            <span
              className={`absolute top-1 right-1 px-1.5 py-0.5 text-xs font-medium rounded-full ${
                restaurant.status === "Open"
                  ? "bg-greentheme text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {restaurant.status}
            </span>
          )}
        </div>
      )}

      {/* Content Section */}
      <div className="flex-1 p-3 flex flex-col justify-between">
        {/* Header */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 mb-1">
            {restaurant.name}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            {restaurant.rating !== null && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-gray-900 dark:text-gray-100">{restaurant.rating.toFixed(1)}</span>
              </div>
            )}
            {restaurant.distance !== null && (
              <span>• {restaurant.distance.toFixed(1)} km</span>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="flex items-start gap-1 text-xs">
          <MapPin className="w-3 h-3 mt-0.5 text-gray-500 dark:text-gray-400 shrink-0" />
          <span className="text-gray-600 dark:text-gray-300 line-clamp-1">{restaurant.address}</span>
        </div>
      </div>
    </div>
  )
}

const MapButton = ({ restaurants, onClick }: { restaurants: Restaurant[], onClick: () => void }) => {
  const restaurantsWithCoordinates = restaurants.filter((restaurant) => getSafeCoordinates(restaurant) !== null)

  return (
    <button
      onClick={onClick}
      className=" bg-white fixed bottom-[2em] dark:bg-bgdarktheme rounded-xl shadow-lg  p-3 hover:shadow-xl transition-all duration-300 group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-greentheme rounded-xl flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
            <MapPin className="w-6 h-6 text-white " />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 ">
              View Restaurants on Map
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {restaurantsWithCoordinates.length} restaurant{restaurantsWithCoordinates.length !== 1 ? 's' : ''} with locations
            </p>
          </div>
        </div>
      </div>
    </button>
  )
}

const MapModal = ({ 
  restaurants, 
  selectedRestaurantId, 
  onRestaurantSelect, 
  isOpen, 
  onClose 
}: { 
  restaurants: Restaurant[]
  selectedRestaurantId: string | null
  onRestaurantSelect?: (restaurantId: string | null) => void
  isOpen: boolean
  onClose: () => void
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [infoWindowOpen, setInfoWindowOpen] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [currentMapCenter, setCurrentMapCenter] = useState<{ lat: number; lng: number } | null>(null)
  const [currentMapZoom, setCurrentMapZoom] = useState<number | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    region: "MA", // Set region to Morocco for proper territorial display
  })

  // Initialize geolocation hook for modal
  const { coords } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 300000,
    autoRequest: true,
    storageKey: "tabla_user_location"
  })

  // Update user location when geolocation coords change
  useEffect(() => {
    if (coords) {
      setUserLocation({
        lat: coords.latitude,
        lng: coords.longitude
      })
    }
  }, [coords])

  // Click outside detection for InfoWindow
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close InfoWindow if clicking outside of it
      if (infoWindowOpen) {
        const infoWindowElement = document.querySelector('.gm-style-iw-container')
        const infoWindowContent = document.querySelector('.gm-style-iw')
        const closeButton = document.querySelector('.gm-style-iw-tc')
        const targetElement = event.target as Node
        
        // Check if click is outside InfoWindow content but not on markers or close button
        if (infoWindowElement && 
            !infoWindowElement.contains(targetElement) &&
            !infoWindowContent?.contains(targetElement) &&
            !closeButton?.contains(targetElement) &&
            !(targetElement as Element)?.closest?.('[role="button"]') &&
            !(targetElement as Element)?.closest?.('.gm-style-iw-tc')) {
          handleInfoWindowClose()
        }
      }
    }

    if (infoWindowOpen) {
      // Add slight delay to allow InfoWindow to render
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside, true)
      }, 100)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside, true)
    }
  }, [infoWindowOpen])

  // Enhanced restaurant data with calculated distances
  const restaurantsWithCoordinates = restaurants
    .filter((restaurant) => getSafeCoordinates(restaurant) !== null)
    .map((restaurant) => {
      const coords = getSafeCoordinates(restaurant)!
      let distance = restaurant.distance

      // Calculate distance from user location if available and not already calculated
      if (userLocation && (!distance || distance === null)) {
        distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          coords.lat,
          coords.lng
        )
      }

      return {
        ...restaurant,
        distance,
        coordinates: coords
      }
    })
    // Sort by distance if user location is available
    .sort((a, b) => {
      if (userLocation && a.distance !== null && b.distance !== null) {
        return a.distance - b.distance
      }
      return 0
    })

  const onLoad = useCallback(
    (mapInstance: google.maps.Map) => {
      setMap(mapInstance)

      if (restaurantsWithCoordinates.length > 0) {
        const bounds = new window.google.maps.LatLngBounds()
        restaurantsWithCoordinates.forEach((restaurant) => {
          const coords = restaurant.coordinates || getSafeCoordinates(restaurant)
          if (coords) bounds.extend(coords)
        })

        // Include user location in bounds if available
        if (userLocation) {
          bounds.extend(userLocation)
        }

        mapInstance.fitBounds(bounds)

        if (restaurantsWithCoordinates.length === 1 && !userLocation) {
          mapInstance.setZoom(6)
        }
      } else {
        // Default center - use user location if available, otherwise Morocco center
        const center = userLocation || { lat: 33.589886, lng: -7.603869 }
        mapInstance.setCenter(center)
        mapInstance.setZoom(userLocation ? 13 : 6)
      }
    },
    [restaurantsWithCoordinates, userLocation],
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
        // When selectedRestaurantId becomes null, maintain current position if we have stored coordinates
        if (currentMapCenter && currentMapZoom !== null) {
          map.panTo(currentMapCenter)
          map.setZoom(currentMapZoom)
          // Clear stored coordinates after using them
          setCurrentMapCenter(null)
          setCurrentMapZoom(null)
        }
        setInfoWindowOpen(null)
      }
    }
  }, [map, isLoaded, restaurantsWithCoordinates, selectedRestaurantId, currentMapCenter, currentMapZoom])

  const handleMarkerClick = (restaurantId: string) => {
    setInfoWindowOpen(restaurantId)
    onRestaurantSelect?.(restaurantId)
    
    // Scroll to the restaurant card in the bottom list
    const restaurant = restaurantsWithCoordinates.find(r => String(r.id) === restaurantId)
    if (restaurant && scrollContainerRef.current) {
      const restaurantIndex = restaurantsWithCoordinates.findIndex(r => String(r.id) === restaurantId)
      const cardWidth = 320
      const scrollLeft = restaurantIndex * (cardWidth + 16) // 16px gap
      scrollContainerRef.current.scrollTo({ left: scrollLeft, behavior: 'smooth' })
    }
  }

  const handleInfoWindowClose = () => {
    // Store current map position before closing
    if (map) {
      const center = map.getCenter()
      const zoom = map.getZoom()
      if (center) {
        setCurrentMapCenter({ lat: center.lat(), lng: center.lng() })
      }
      if (zoom !== undefined) {
        setCurrentMapZoom(zoom)
      }
    }
    
    setInfoWindowOpen(null)
    // Clear restaurant selection when closing info window in modal
    onRestaurantSelect?.(null)
  }

  const handleRestaurantCardClick = (restaurantId: string) => {
    const restaurant = restaurantsWithCoordinates.find(r => String(r.id) === restaurantId)
    const coords = restaurant ? getSafeCoordinates(restaurant) : null
    
    if (coords && map) {
      map.panTo(coords)
      map.setZoom(6)
      setInfoWindowOpen(restaurantId)
      onRestaurantSelect?.(restaurantId)
    }
  }

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current
    const cardWidth = 320
    const scrollAmount = direction === 'left' ? -cardWidth : cardWidth

    container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-bgdarktheme rounded-2xl shadow-2xl w-full h-full md:max-w-6xl md:h-[90vh] md:m-4 md:rounded-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 dark:border-darkthemeitems">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Restaurant Map
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {restaurantsWithCoordinates.length} restaurant{restaurantsWithCoordinates.length !== 1 ? 's' : ''} found
                {userLocation && (
                  <span className="ml-2 text-greentheme font-medium">• Location detected</span>
                )}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-gray-100 dark:bg-softredtheme rounded-full flex items-center justify-center text-redtheme hover:bg-redtheme hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          {!isLoaded ? (
            <LoadingState />
          ) : loadError ? (
            <ErrorState message="Failed to load map" />
          ) : restaurantsWithCoordinates.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="relative w-full h-full">
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={{ lat: 33.589886, lng: -7.603869 }}
                zoom={6}
                
                options={{
                  ...defaultMapOptions,
                  styles: [
                    ...defaultMapOptions.styles || [],
                    {
                      featureType: "all",
                      elementType: "geometry",
                      
                      stylers: [{ saturation: -20 }]
                    }
                  ]
                }}
                onLoad={onLoad}
                onUnmount={onUnmount}
                onClick={handleInfoWindowClose}
              >
                {restaurantsWithCoordinates.map((restaurant) => {
                  const coords = restaurant.coordinates || getSafeCoordinates(restaurant)!
                  const isSelected = String(restaurant.id) === selectedRestaurantId

                  return (
                    <Marker
                      key={restaurant.id}
                      position={coords}
                      title={restaurant.name}
                      onClick={() => handleMarkerClick(String(restaurant.id))}
                      icon={{
                        url: createCustomMarker(restaurant.rating, restaurant.status, isSelected),
                        scaledSize: new window.google.maps.Size(isSelected ? 40 : 32, isSelected ? 51 : 41),
                        anchor: new window.google.maps.Point(isSelected ? 20 : 16, isSelected ? 48 : 39)
                      }}
                      animation={undefined}
                    />
                  )
                })}

                {/* User Location Marker in Modal */}
                {userLocation && (
                  <Marker
                    position={userLocation}
                    title="Your Location"
                    icon={{
                      path: window.google.maps.SymbolPath.CIRCLE,
                      scale: 8,
                      fillColor: "#ef4444",
                      fillOpacity: 1,
                      strokeWeight: 3,
                      strokeColor: "white",
                    }}
                    zIndex={1000}
                  />
                )}

                {infoWindowOpen && (
                  <InfoWindow
                    position={getSafeCoordinates(restaurantsWithCoordinates.find((r) => String(r.id) === infoWindowOpen)!)!}
                    onCloseClick={handleInfoWindowClose}
                    options={{
                      pixelOffset: new window.google.maps.Size(0, -15),
                      maxWidth: 320,
                      disableAutoPan: false,
                    }}
                  >
                    <RestaurantInfoWindow
                      restaurant={restaurantsWithCoordinates.find((r) => String(r.id) === infoWindowOpen)!}
                      onClose={handleInfoWindowClose}
                    />
                  </InfoWindow>
                )}
              </GoogleMap>
              
              {/* Floating Location Button */}
              <FloatingLocationButton 
                onLocationUpdate={setUserLocation}
                userLocation={userLocation}
              />

              {/* Overlaid Restaurant Cards */}
              {restaurantsWithCoordinates.length > 0 && (
                <div className="absolute bottom-4 left-0 right-0 z-10">
                  <div className="px-4">
                    <div className="relative">
                      <div
                        ref={scrollContainerRef}
                        className="flex gap-3 overflow-x-auto scroll-smooth scrollbar-hide pb-2"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                      >
                        {restaurantsWithCoordinates.map((restaurant) => (
                          <div
                            key={restaurant.id}
                            onClick={() => handleRestaurantCardClick(String(restaurant.id))}
                            className={`cursor-pointer transition-all duration-200 ${
                              String(restaurant.id) === selectedRestaurantId 
                                ? 'ring-2 ring-greentheme scale-105' 
                                : 'hover:scale-102'
                            }`}
                          >
                            <MobileRestaurantCard restaurant={restaurant} />
                          </div>
                        ))}
                      </div>

                      {/* Navigation Arrows */}
                      {restaurantsWithCoordinates.length > 1 && (
                        <>
                          <button
                            onClick={() => handleScroll('left')}
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm shadow-lg rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors z-10"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleScroll('right')}
                            className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm shadow-lg rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors z-10"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

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
      const url = `https://www.google.co.ma/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`
      window.open(url, "_blank")
    }
  }

  const handleViewDetails = () => {
    // Navigate to restaurant details page
    window.open(`/restaurant/${restaurant.id}`, '_blank')
  }

  return (
    <div className=" overflow-hidden">
      {/* Restaurant Image with Overlay */}
      {(restaurant.main_image || restaurant.imageUrl) && (
        <div className="relative h-36 rounded-sm overflow-hidden">
          <img
            src={restaurant.main_image || restaurant.imageUrl || "/placeholder.svg"}
            alt={restaurant.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          
          {/* Status Badge - Floating */}
          {restaurant.status && (
            <div className="absolute top-3 right-3">
              <span
                className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full backdrop-blur-md border ${
                  restaurant.status === "Open"
                    ? "bg-greentheme/90 text-white border-greentheme/20 shadow-lg shadow-greentheme/25"
                    : "bg-red-500/90 text-white border-red-500/20 shadow-lg shadow-red-500/25"
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                  restaurant.status === "Open" ? "bg-white" : "bg-white"
                }`} />
                {restaurant.status}
              </span>
            </div>
          )}

          {/* Rating Badge - Floating */}
          {restaurant.rating !== null && (
            <div className="absolute top-3 left-3">
              <div className="flex items-center gap-1 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-full shadow-lg">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-semibold text-gray-900">
                  {restaurant.rating.toFixed(1)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1 truncate">
            {restaurant.name}
          </h3>
          {restaurant.category && (
            <p className="text-sm text-gray-600 font-medium truncate">
              {restaurant.category}
            </p>
          )}
        </div>

        {/* Details */}
        <div className="space-y-3">
          {/* Address */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-gray-500" />
            </div>
            <span className="text-sm text-gray-700 leading-relaxed flex-1 line-clamp-2">
              {restaurant.address}
            </span>
          </div>

          {/* Rating & Reviews */}
          {restaurant.rating !== null && (
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                <Star className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-gray-900">
                  {restaurant.rating.toFixed(1)}
                </span>
                {restaurant.reviewCount && (
                  <span className="text-gray-600 truncate">
                    ({restaurant.reviewCount} {restaurant.reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Distance */}
          {restaurant.distance !== null && (
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                <Navigation className="w-4 h-4 text-gray-500" />
              </div>
              <span className="text-sm text-gray-700">
                {restaurant.distance.toFixed(1)} km away
              </span>
            </div>
          )}

          {/* Price Range */}
          {restaurant.priceRange && (
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                <span className="text-gray-500 font-bold text-sm">€</span>
              </div>
              <span className="text-sm text-gray-700 truncate">
                {restaurant.priceRange}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-gray-100 mt-4">
          <button
            onClick={handleDirections}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-greentheme hover:bg-greentheme/90 text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-greentheme/25 focus:outline-none focus:ring-2 focus:ring-greentheme focus:ring-offset-2 focus:ring-offset-white"
          >
            <Navigation className="w-4 h-4" />
            Directions
          </button>
          
          <button
            onClick={handleViewDetails}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-white"
          >
            <ExternalLink className="w-4 h-4" />
            View Details
          </button>
        </div>
      </div>
    </div>
  )
}

export const MapComponent: React.FC<MapComponentProps> = ({
  restaurants,
  selectedRestaurantId,
  onRestaurantSelect,
  className = "w-full relative flex flex-col items-center",
  isSticky = true,
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [infoWindowOpen, setInfoWindowOpen] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)
  const [isStuck, setIsStuck] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [currentMapCenter, setCurrentMapCenter] = useState<{ lat: number; lng: number } | null>(null)
  const [currentMapZoom, setCurrentMapZoom] = useState<number | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLElement | null>(null)

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    region: "MA", // Set region to Morocco for proper territorial display
  })

  // Initialize geolocation hook
  const { coords, hasLocation } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 300000,
    autoRequest: true, // Auto-request location on component mount
    storageKey: "tabla_user_location"
  })

  // Update user location when geolocation coords change
  useEffect(() => {
    if (coords) {
      setUserLocation({
        lat: coords.latitude,
        lng: coords.longitude
      })
    }
  }, [coords])

  // Click outside detection for InfoWindow (Desktop component)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close InfoWindow if clicking outside of it
      if (infoWindowOpen) {
        const infoWindowElement = document.querySelector('.gm-style-iw-container')
        const infoWindowContent = document.querySelector('.gm-style-iw')
        const closeButton = document.querySelector('.gm-style-iw-tc')
        const targetElement = event.target as Node
        
        // Check if click is outside InfoWindow content but not on markers or close button
        if (infoWindowElement && 
            !infoWindowElement.contains(targetElement) &&
            !infoWindowContent?.contains(targetElement) &&
            !closeButton?.contains(targetElement) &&
            !(targetElement as Element)?.closest?.('[role="button"]') &&
            !(targetElement as Element)?.closest?.('.gm-style-iw-tc')) {
          handleInfoWindowClose()
        }
      }
    }

    if (infoWindowOpen) {
      // Add slight delay to allow InfoWindow to render
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside, true)
      }, 100)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside, true)
    }
  }, [infoWindowOpen])

  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024) // Use lg breakpoint (1024px)
    }
    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)
    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Sticky behavior with intersection observer (only for desktop)
  useEffect(() => {
    if (!isSticky || isMobile) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === mapContainerRef.current) {
            // Map container intersection
            setIsStuck(entry.boundingClientRect.top <= 24) // 24px offset for spacing
          } else if (entry.target === footerRef.current) {
            // Footer intersection - unstick when footer is visible
            if (entry.isIntersecting) {
              setIsStuck(false)
            }
          }
        })
      },
      {
        threshold: 0,
        rootMargin: '-24px 0px 0px 0px', // 24px offset from top
      }
    )

    // Find footer element
    const footer = document.querySelector('footer')
    if (footer) {
      footerRef.current = footer
      observer.observe(footer)
    }

    if (mapContainerRef.current) {
      observer.observe(mapContainerRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [isSticky, isMobile])

  // Enhanced restaurant data with calculated distances
  const restaurantsWithCoordinates = restaurants
    .filter((restaurant) => getSafeCoordinates(restaurant) !== null)
    .map((restaurant) => {
      const coords = getSafeCoordinates(restaurant)!
      let distance = restaurant.distance

      // Calculate distance from user location if available and not already calculated
      if (userLocation && (!distance || distance === null)) {
        distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          coords.lat,
          coords.lng
        )
      }

      return {
        ...restaurant,
        distance,
        coordinates: coords
      }
    })
    // Sort by distance if user location is available
    .sort((a, b) => {
      if (userLocation && a.distance !== null && b.distance !== null) {
        return a.distance - b.distance
      }
      return 0
    })

  const onLoad = useCallback(
    (mapInstance: google.maps.Map) => {
      setMap(mapInstance)

      if (restaurantsWithCoordinates.length > 0) {
        const bounds = new window.google.maps.LatLngBounds()
        restaurantsWithCoordinates.forEach((restaurant) => {
          const coords = restaurant.coordinates || getSafeCoordinates(restaurant)
          if (coords) bounds.extend(coords)
        })

        // Include user location in bounds if available
        if (userLocation) {
          bounds.extend(userLocation)
        }

        mapInstance.fitBounds(bounds)

        if (restaurantsWithCoordinates.length === 1 && !userLocation) {
          mapInstance.setZoom(15)
        }
      } else {
        // Default center - use user location if available, otherwise Morocco center
        const center = userLocation || { lat: 33.589886, lng: -7.603869 }
        mapInstance.setCenter(center)
        mapInstance.setZoom(userLocation ? 13 : 6)
      }
    },
    [restaurantsWithCoordinates, userLocation],
  )

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  const [isProfile, setIsProfile] = useState(false)


  const pathname = usePathname();

  useEffect(() => {
    if (pathname.includes("/restaurant")) {
      setIsProfile(true);
    } else {
      setIsProfile(false);
    }
  }, [pathname]);

  useEffect(() => {
    if (map && isLoaded && restaurantsWithCoordinates.length > 0) {
      if (selectedRestaurantId) {
        const selected = restaurantsWithCoordinates.find((r) => String(r.id) === selectedRestaurantId)
        const coords = selected ? getSafeCoordinates(selected) : null

        if (coords) {
          map.panTo(coords)
          map.setZoom(15)
          setInfoWindowOpen(String(selected?.id))
        }
      } else {
        // When selectedRestaurantId becomes null, maintain current position if we have stored coordinates
        if (currentMapCenter && currentMapZoom !== null) {
          map.panTo(currentMapCenter)
          map.setZoom(currentMapZoom)
          // Clear stored coordinates after using them
          setCurrentMapCenter(null)
          setCurrentMapZoom(null)
        }
        setInfoWindowOpen(null)
      }
    }
  }, [map, isLoaded, restaurantsWithCoordinates, selectedRestaurantId, currentMapCenter, currentMapZoom])

  const handleMarkerClick = (restaurantId: string) => {
    setInfoWindowOpen(restaurantId)
    onRestaurantSelect?.(restaurantId)
  }

  const handleInfoWindowClose = () => {
    // Store current map position before closing
    if (map) {
      const center = map.getCenter()
      const zoom = map.getZoom()
      if (center) {
        setCurrentMapCenter({ lat: center.lat(), lng: center.lng() })
      }
      if (zoom !== undefined) {
        setCurrentMapZoom(zoom)
      }
    }
    
    setInfoWindowOpen(null)
    // Clear restaurant selection when closing info window on desktop
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
    return isMobile ? (
      <div className="flex items-center justify-center h-full rounded-lg">
        <MapButton 
          restaurants={restaurants} 
          onClick={() => setIsMapModalOpen(true)} 
        />
      </div>
    ) : (
      <EmptyState />
    )
  }

  // Mobile view - show map button that opens modal
  if (isMobile) {
    return (
      <div ref={mapContainerRef} className={className}>
        <MapButton 
          restaurants={restaurants} 
          onClick={() => setIsMapModalOpen(true)} 
        />
        
        <MapModal
          restaurants={restaurants}
          selectedRestaurantId={selectedRestaurantId}
          onRestaurantSelect={onRestaurantSelect}
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
        />
      </div>
    )
  }

  // Desktop view - embedded sticky map (original experience)
  return (
    <div 
      ref={mapContainerRef}
      className={`${className} ${
        isSticky 
          ? isStuck 
            ? 'fixed top-6 right-6 z-40 w-[calc(33.333333%-1.5rem)] max-w-md transition-all duration-300 ease-in-out shadow-2xl' 
            : 'sticky top-6 transition-all duration-300 ease-in-out'
          : ''
      }`}
    >
      <div className={`${isStuck ? 'h-[calc(95vh)]' : 'h-[calc(95vh)]'} w-full rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300`}>
        {!isProfile &&
        <div className="p-4 bg-white dark:bg-darkthemeitems">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Nearby Restaurants
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {restaurantsWithCoordinates.length} restaurant{restaurantsWithCoordinates.length !== 1 ? 's' : ''} found
                {userLocation && (
                  <span className="ml-2 text-greentheme font-medium">• Location detected</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selectedRestaurantId && (
                <button
                  onClick={() => onRestaurantSelect?.(null)}
                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Clear
                </button>
              )}
              <div className={`w-2 h-2 rounded-full ${isStuck ? 'bg-greentheme' : 'bg-gray-400'} transition-colors`} />
            </div>
          </div>
        </div>}

        {/* Map Container */}
        <div className={`${isStuck ? 'h-[calc(100%+10em)]' : 'h-[calc(100%+10em)]'} w-full relative`}>
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={{ lat: 33.589886, lng: -7.603869 }}
            zoom={5}
            options={{
              ...defaultMapOptions,
              
              styles: [
                ...defaultMapOptions.styles || [],
                {
                  featureType: "all",
                  elementType: "geometry",
                  stylers: [{ saturation: -20 }]
                }
              ]
            }}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={handleInfoWindowClose}
          >
            {restaurantsWithCoordinates.map((restaurant) => {
              const coords = restaurant.coordinates || getSafeCoordinates(restaurant)!
              const isSelected = String(restaurant.id) === selectedRestaurantId

              return (
                <Marker
                  key={restaurant.id}
                  position={coords}
                  title={restaurant.name}
                  onClick={() => handleMarkerClick(String(restaurant.id))}
                  icon={{
                    url: createCustomMarker(restaurant.rating, restaurant.status, isSelected),
                    scaledSize: new window.google.maps.Size(isSelected ? 40 : 32, isSelected ? 51 : 41),
                    anchor: new window.google.maps.Point(isSelected ? 20 : 16, isSelected ? 48 : 39)
                  }}
                  // animation={isSelected ? window.google.maps.Animation.BOUNCE : undefined}
                />
              )
            })}

            {/* User Location Marker */}
            {userLocation && (
              <Marker
                position={userLocation}
                title="Your Location"
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: "#185204",
                  fillOpacity: 1,
                  strokeWeight: 3,
                  strokeColor: "white",
                }}
                zIndex={1000} // Ensure user location marker is always on top
              />
            )}

            {infoWindowOpen && (
              <InfoWindow
                position={getSafeCoordinates(restaurantsWithCoordinates.find((r) => String(r.id) === infoWindowOpen)!)!}
                onCloseClick={handleInfoWindowClose}
                options={{
                  pixelOffset: new window.google.maps.Size(0, -0),
                  disableAutoPan: false,
                  headerDisabled: true
                }}
              >
                <RestaurantInfoWindow
                  restaurant={restaurantsWithCoordinates.find((r) => String(r.id) === infoWindowOpen)!}
                  onClose={handleInfoWindowClose}
                />
              </InfoWindow>
            )}
          </GoogleMap>
          
          {/* Floating Location Button */}
          <FloatingLocationButton 
            onLocationUpdate={setUserLocation}
            userLocation={userLocation}
          />
        </div>
      </div>
    </div>
  )
}
