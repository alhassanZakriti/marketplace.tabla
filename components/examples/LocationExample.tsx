import React from "react"
import useGeolocation, { calculateDistance } from "@/hooks/useGeolocation"
import LocationControl from "@/components/common/LocationControl"

// Example of how to use the geolocation hook in your search or other components
const LocationExample: React.FC = () => {
  const [nearbyRestaurants, setNearbyRestaurants] = React.useState<any[]>([])
  
  const {
    coords,
    error,
    loading,
    supported,
    getCurrentPosition,
    clearStoredLocation,
    hasLocation,
    isRecent
  } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 300000, // 5 minutes
    autoRequest: false, // Let user choose when to get location
    storageKey: "tabla_user_location"
  })

  // Example: Calculate distances to nearby restaurants when location is available
  React.useEffect(() => {
    if (coords) {
      // This is just an example - replace with your actual restaurant data
      const exampleRestaurants = [
        { id: 1, name: "Restaurant A", lat: 33.5731, lng: -7.5898 },
        { id: 2, name: "Restaurant B", lat: 33.5951, lng: -7.6167 },
        { id: 3, name: "Restaurant C", lat: 33.5881, lng: -7.6114 }
      ]

      const restaurantsWithDistances = exampleRestaurants.map(restaurant => ({
        ...restaurant,
        distance: calculateDistance(
          coords.latitude,
          coords.longitude,
          restaurant.lat,
          restaurant.lng
        )
      })).sort((a, b) => a.distance - b.distance) // Sort by distance

      setNearbyRestaurants(restaurantsWithDistances)
    }
  }, [coords])

  return (
    <div className="p-6 max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Location Service Demo
      </h2>
      
      {/* Location Control Component */}
      <LocationControl 
        onLocationUpdate={(location) => {
          console.log("Location updated:", location)
        }}
        showDetails={true}
        className="mb-6"
      />

      {/* Display location info */}
      {coords && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900 rounded-lg">
          <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
            Current Location
          </h3>
          <p className="text-sm text-green-700 dark:text-green-300">
            Lat: {coords.latitude.toFixed(6)}<br />
            Lng: {coords.longitude.toFixed(6)}<br />
            Accuracy: {Math.round(coords.accuracy)}m
          </p>
        </div>
      )}

      {/* Display nearby restaurants with calculated distances */}
      {nearbyRestaurants.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Nearby Restaurants
          </h3>
          <div className="space-y-2">
            {nearbyRestaurants.map(restaurant => (
              <div 
                key={restaurant.id}
                className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {restaurant.name}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {restaurant.distance.toFixed(1)} km
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900 rounded-lg">
          <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
            Location Error
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300">
            {error.message}
          </p>
        </div>
      )}

      {/* Usage info */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        <h4 className="font-semibold mb-2">How it works:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Location is automatically stored in localStorage</li>
          <li>Data persists between page reloads</li>
          <li>Expires after 24 hours for privacy</li>
          <li>Calculate distances to restaurants</li>
          <li>Sort results by proximity</li>
        </ul>
      </div>
    </div>
  )
}

export default LocationExample
