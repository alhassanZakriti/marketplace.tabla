"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { GoogleMap, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api"
import type { google } from "google-maps"
import { Card } from "../ui/Card"
import { Badge } from "lucide-react"
import { Star, MapPin, Clock } from "lucide-react"

const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />
)
CardHeader.displayName = "CardHeader"

const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`} {...props} />
)
CardTitle.displayName = "CardTitle"

const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={`p-6 pt-0 ${className}`} {...props} />
)
CardContent.displayName = "CardContent"

interface Restaurant {
  id: string | number
  name: string
  address: string
  distance: number | null
  rating: number | null
  status: "Closed" | "Open"
  main_image: string | null
  location: [number, number] | null // [lat, lng]
  imageUrl?: string
  category?: string
  isOpen?: boolean
  priceRange?: string
  coordinates?: { lat: number; lng: number } // Preferred for clarity if available
}

interface MapComponentProps {
  restaurants: Restaurant[]
  selectedRestaurantId: string | null
}

// Your Google Maps API Key
// In a real application, this should be loaded from an environment variable.
// For this example, it's kept as provided.
const GOOGLE_MAPS_API_KEY = "AIzaSyC60-vVmVncg9pqxwkXz1dLPRktRVRWwco"

// Default map options for consistent styling and behavior
const defaultMapOptions = {
  disableDefaultUI: true, // Disable default UI for custom controls
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  mapId: "DEMO_MAP_ID", // Use a map ID for cloud-based map styling if needed
  // Styles to make the map look cleaner, similar to TheFork's minimal style
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

// Map's styling - adjusted to fit the existing card-like layout of MapSection
export const defaultMapContainerStyle = {
  width: "100%",
  height: "500px", // Keeping the fixed height for consistency with MapSection's card
  borderRadius: "0px 0px 15px 15px", // Rounded bottom corners to match MapSection's card
}

const MapComponent: React.FC<MapComponentProps> = ({ restaurants, selectedRestaurantId }) => {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [infoWindowOpen, setInfoWindowOpen] = useState<string | null>(null) // State to control which info window is open

  // Hook to load the Google Maps JavaScript API
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    // You can add other libraries here if needed, e.g., libraries: ["places"]
  })

  // Helper function to get safe coordinates from a restaurant object
  const getSafeCoordinates = (restaurant: Restaurant): { lat: number; lng: number } | null => {
    if (
      restaurant.coordinates &&
      typeof restaurant.coordinates.lat === "number" &&
      typeof restaurant.coordinates.lng === "number"
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

  // Filter restaurants that have valid coordinates to display on the map
  const restaurantsWithCoordinates = restaurants.filter((restaurant) => getSafeCoordinates(restaurant) !== null)

  // Callback function when the Google Map component loads
  const onLoad = useCallback(
    function callback(mapInstance: google.maps.Map) {
      setMap(mapInstance) // Store map instance in state
      // Fit map bounds to show all restaurants initially
      if (restaurantsWithCoordinates.length > 0) {
        const bounds = new window.google.maps.LatLngBounds()
        restaurantsWithCoordinates.forEach((restaurant) => {
          const coords = getSafeCoordinates(restaurant)
          if (coords) bounds.extend(coords)
        })
        mapInstance.fitBounds(bounds)
        // If only one restaurant, set a closer zoom level
        if (restaurantsWithCoordinates.length === 1) {
          mapInstance.setZoom(15)
        }
      } else {
        // Default center if no restaurants with coordinates (Casablanca)
        mapInstance.setCenter({ lat: 33.589886, lng: -7.603869 })
        mapInstance.setZoom(12)
      }
    },
    [restaurantsWithCoordinates],
  )

  // Callback function when the Google Map component unmounts
  const onUnmount = useCallback(function callback() {
    setMap(null) // Clear map instance
  }, [])

  // Effect to update map center/zoom when restaurants or selected restaurant changes
  useEffect(() => {
    if (map && isLoaded) {
      if (restaurantsWithCoordinates.length > 0) {
        const bounds = new window.google.maps.LatLngBounds()
        restaurantsWithCoordinates.forEach((restaurant) => {
          const coords = getSafeCoordinates(restaurant)
          if (coords) bounds.extend(coords)
        })
        map.fitBounds(bounds)
        if (restaurantsWithCoordinates.length === 1) {
          map.setZoom(15)
        }
      } else {
        map.setCenter({ lat: 33.589886, lng: -7.603869 })
        map.setZoom(12)
      }

      // Pan to selected restaurant if it exists and is different from current info window
      if (selectedRestaurantId) {
        const selected = restaurantsWithCoordinates.find((r) => String(r.id) === selectedRestaurantId)
        const coords = selected ? getSafeCoordinates(selected) : null
        if (coords) {
          map.panTo(coords)
          map.setZoom(15) // Zoom in on selected restaurant
          setInfoWindowOpen(String(selected?.id)) // Open info window for selected restaurant
        }
      } else {
        // If no restaurant is selected, close any open info window
        setInfoWindowOpen(null)
      }
    }
  }, [map, isLoaded, restaurantsWithCoordinates, selectedRestaurantId]) // Removed infoWindowOpen from dependency array to prevent re-triggering when setting it

  // Render loading, error, or map content based on API load status
  if (loadError) {
    return (
      <div className="h-full flex items-center justify-center flex-col text-red-500 dark:text-red-400">
        <p className="text-center max-w-xs px-4">Error loading map. Please check your API key.</p>
      </div>
    )
  }
  if (!isLoaded) {
    return (
      <div className="h-full flex items-center justify-center flex-col text-gray-500 dark:text-gray-400">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
        <p className="text-center max-w-xs px-4">Loading map...</p>
      </div>
    )
  }
  if (restaurantsWithCoordinates.length === 0) {
    return (
      <div className="h-full flex items-center justify-center flex-col text-gray-500 dark:text-gray-400">
        <p className="text-center max-w-xs px-4">No location data available for restaurants</p>
      </div>
    )
  }
  return (
    <div className="w-full h-full">
      <GoogleMap
        mapContainerStyle={defaultMapContainerStyle}
        center={{ lat: 31.5917, lng: -8.02 }} // Default center (Marrakech) - will be overridden by onLoad
        zoom={15} // Default zoom - will be overridden by onLoad
        options={defaultMapOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {restaurantsWithCoordinates.map((restaurant) => {
          const coords = getSafeCoordinates(restaurant)!
          const isSelected = String(restaurant.id) === selectedRestaurantId
          // Define marker colors using HSL values for consistency
          const markerColor = isSelected ? "hsl(142.1 76.2% 36.3%)" : "hsl(210 4% 60%)" // mapGreen vs mapGrey
          const markerStrokeColor = isSelected ? "hsl(0 0% 100%)" : "transparent" // White border for selected

          return (
            <Marker
              key={restaurant.id}
              position={coords}
              title={restaurant.name}
              onClick={() => setInfoWindowOpen(String(restaurant.id))} // Open info window on marker click
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE, // Using a circle path for the marker icon
                scale: isSelected ? 10 : 7, // Larger scale if selected
                fillColor: markerColor,
                fillOpacity: 1,
                strokeWeight: isSelected ? 2 : 0, // Border if selected
                strokeColor: markerStrokeColor,
              }}
              animation={isSelected ? window.google.maps.Animation.BOUNCE : undefined} // Bounce animation if selected
            />
          )
        })}
        {/* InfoWindow to display restaurant details on marker click */}
        {infoWindowOpen && (
          <InfoWindow
            position={getSafeCoordinates(restaurantsWithCoordinates.find((r) => String(r.id) === infoWindowOpen)!)!}
            onCloseClick={() => setInfoWindowOpen(null)} // Close info window
          >
            <Card className="w-[250px] shadow-lg border-none">
              {restaurantsWithCoordinates.find((r) => String(r.id) === infoWindowOpen)?.imageUrl && (
                <img
                  src={
                    restaurantsWithCoordinates.find((r) => String(r.id) === infoWindowOpen)?.imageUrl ||
                    "/placeholder.svg" ||
                    "/placeholder.svg"
                  }
                  alt={
                    restaurantsWithCoordinates.find((r) => String(r.id) === infoWindowOpen)?.name || "Restaurant image"
                  }
                  className="w-full h-32 object-cover rounded-t-lg"
                />
              )}
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-50">
                  {restaurantsWithCoordinates.find((r) => String(r.id) === infoWindowOpen)?.name}
                </CardTitle>
                {restaurantsWithCoordinates.find((r) => String(r.id) === infoWindowOpen)?.category && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {restaurantsWithCoordinates.find((r) => String(r.id) === infoWindowOpen)?.category}
                  </p>
                )}
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2 text-sm">
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <MapPin className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                  <span>{restaurantsWithCoordinates.find((r) => String(r.id) === infoWindowOpen)?.address}</span>
                </div>
                {restaurantsWithCoordinates.find((r) => String(r.id) === infoWindowOpen)?.rating !== null && (
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <Star className="w-4 h-4 mr-2 text-yellow-500" />
                    <span>
                      {restaurantsWithCoordinates.find((r) => String(r.id) === infoWindowOpen)?.rating?.toFixed(1)} (
                      {"120 reviews"}) {/* Placeholder for review count */}
                    </span>
                  </div>
                )}
                {restaurantsWithCoordinates.find((r) => String(r.id) === infoWindowOpen)?.status && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                    <Badge
                    //   variant={
                    //     restaurantsWithCoordinates.find((r) => String(r.id) === infoWindowOpen)?.status === "Open"
                    //       ? "default"
                    //       : "destructive"
                    //   }
                      className={
                        restaurantsWithCoordinates.find((r) => String(r.id) === infoWindowOpen)?.status === "Open"
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-red-500 hover:bg-red-600"
                      }
                    >
                      {restaurantsWithCoordinates.find((r) => String(r.id) === infoWindowOpen)?.status}
                    </Badge>
                  </div>
                )}
                {restaurantsWithCoordinates.find((r) => String(r.id) === infoWindowOpen)?.priceRange && (
                  <div className="text-gray-700 dark:text-gray-300">
                    Price: {restaurantsWithCoordinates.find((r) => String(r.id) === infoWindowOpen)?.priceRange}
                  </div>
                )}
              </CardContent>
            </Card>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  )
}

export { MapComponent }
