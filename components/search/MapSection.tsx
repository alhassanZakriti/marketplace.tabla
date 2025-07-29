"use client"

import type React from "react"
import { useState, useCallback, useEffect, useRef } from "react"
import { GoogleMap, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api"
import type { google } from "google-maps"
import { Star, MapPin, Navigation, Loader2, AlertCircle, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"

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

const MobileRestaurantCard = ({ restaurant }: { restaurant: Restaurant }) => {
  return (
    <div className="flex-shrink-0 w-80 bg-white dark:bg-bgdarktheme2 rounded-xl shadow-lg  overflow-hidden hover:shadow-xl transition-shadow">
      {restaurant.main_image && (
        <div className="relative h-40 overflow-hidden">
          <img
            src={restaurant.main_image || "/placeholder.svg"}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          {restaurant.status && (
            <span
              className={`absolute top-3 right-3 px-2 py-1 text-xs font-medium rounded-full ${
                restaurant.status === "Open"
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {restaurant.status}
            </span>
          )}
        </div>
      )}

      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
            {restaurant.name}
          </h3>
          {restaurant.category && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{restaurant.category}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 mt-0.5 text-gray-500 dark:text-gray-400 shrink-0" />
            <span className="text-gray-600 dark:text-gray-300 line-clamp-2">{restaurant.address}</span>
          </div>

          {restaurant.rating !== null && (
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-gray-900 dark:text-gray-100">{restaurant.rating.toFixed(1)}</span>
              </div>
              {restaurant.reviewCount && (
                <span className="text-gray-600 dark:text-gray-400">({restaurant.reviewCount})</span>
              )}
            </div>
          )}

          {restaurant.distance !== null && (
            <div className="flex items-center gap-2 text-sm">
              <Navigation className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">{restaurant.distance.toFixed(1)} km away</span>
            </div>
          )}
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
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    region: "MA", // Set region to Morocco for proper territorial display
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
    setInfoWindowOpen(null)
    onRestaurantSelect?.(null)
  }

  const handleRestaurantCardClick = (restaurantId: string) => {
    const restaurant = restaurantsWithCoordinates.find(r => String(r.id) === restaurantId)
    const coords = restaurant ? getSafeCoordinates(restaurant) : null
    
    if (coords && map) {
      map.panTo(coords)
      map.setZoom(16)
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-bgdarktheme rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 dark:border-darkthemeitems">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Restaurant Map
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {restaurantsWithCoordinates.length} restaurant{restaurantsWithCoordinates.length !== 1 ? 's' : ''} on map
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-gray-100 dark:bg-softredtheme rounded-full flex items-center justify-center text-redtheme  hover:bg-redtheme hover:text-white transition-colors"
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
                      scale: isSelected ? 14 : 10,
                      fillColor: isSelected ? "#16a34a" : "#3b82f6",
                      fillOpacity: 0.9,
                      strokeWeight: 3,
                      strokeColor: "white",
                    }}
                    animation={isSelected ? window.google.maps.Animation.BOUNCE : undefined}
                  />
                )
              })}

              {infoWindowOpen && (
                <InfoWindow
                  position={getSafeCoordinates(restaurantsWithCoordinates.find((r) => String(r.id) === infoWindowOpen)!)!}
                  onCloseClick={handleInfoWindowClose}
                  options={{
                    pixelOffset: new window.google.maps.Size(0, -10),
                    maxWidth: 500,
                  }}
                >
                  <RestaurantInfoWindow
                    restaurant={restaurantsWithCoordinates.find((r) => String(r.id) === infoWindowOpen)!}
                    onClose={handleInfoWindowClose}
                  />
                </InfoWindow>
              )}
            </GoogleMap>
          )}
        </div>

        {/* Restaurant Cards - Bottom Section */}
        <div className="bg-gray-50 dark:bg-bgdarktheme ">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Restaurant Locations
            </h3>
            {restaurantsWithCoordinates.length > 0 ? (
              <div className="relative">
                <div
                  ref={scrollContainerRef}
                  className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide pb-2"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {restaurantsWithCoordinates.map((restaurant) => (
                    <div
                      key={restaurant.id}
                      onClick={() => handleRestaurantCardClick(String(restaurant.id))}
                      className={`cursor-pointer transition-all duration-200 ${
                        String(restaurant.id) === selectedRestaurantId 
                          ? 'ring-2 ring-blue-500 scale-105' 
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
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-darkthemeitems shadow-lg rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors z-10"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleScroll('right')}
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-darkthemeitems shadow-lg rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors z-10"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No restaurant locations available</p>
              </div>
            )}
          </div>
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

  return (
    <div className="w-[280px] bg-white dark:bg-darkthemeitems rounded-lg shadow-xl border-0 overflow-hidden">
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
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-greentheme hover:bg-greentheme/90 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-greentheme focus:ring-offset-2"
            >
              <Navigation className="w-4 h-4" />
              Directions
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-redtheme dark:hover:bg-redtheme text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
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
  className = "w-full relative flex flex-col items-center",
  isSticky = true,
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [infoWindowOpen, setInfoWindowOpen] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)
  const [isStuck, setIsStuck] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLElement | null>(null)

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    region: "MA", // Set region to Morocco for proper territorial display
  })

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
        {/* Enhanced Header */}
        <div className="p-4 bg-white dark:bg-darkthemeitems">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Map View
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {restaurantsWithCoordinates.length} restaurant{restaurantsWithCoordinates.length !== 1 ? 's' : ''} nearby
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
              <div className={`w-2 h-2 rounded-full ${isStuck ? 'bg-green-500' : 'bg-gray-400'} transition-colors`} />
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className={`${isStuck ? 'h-[calc(100%+10em)]' : 'h-[calc(100%+10em)]'} w-full`}>
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={{ lat: 33.589886, lng: -7.603869 }}
            zoom={12}
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
                    scale: isSelected ? 14 : 10,
                    fillColor: isSelected ? "#16a34a" : "#3b82f6",
                    fillOpacity: 0.9,
                    strokeWeight: 3,
                    strokeColor: "white",
                  }}
                  animation={isSelected ? window.google.maps.Animation.BOUNCE : undefined}
                />
              )
            })}

            {infoWindowOpen && (
              <InfoWindow
                position={getSafeCoordinates(restaurantsWithCoordinates.find((r) => String(r.id) === infoWindowOpen)!)!}
                onCloseClick={handleInfoWindowClose}
                options={{
                  pixelOffset: new window.google.maps.Size(0, -10),
                  maxWidth: 500,
                }}
              >
                <RestaurantInfoWindow
                  restaurant={restaurantsWithCoordinates.find((r) => String(r.id) === infoWindowOpen)!}
                  onClose={handleInfoWindowClose}
                />
              </InfoWindow>
            )}
          </GoogleMap>
        </div>
      </div>
    </div>
  )
}
