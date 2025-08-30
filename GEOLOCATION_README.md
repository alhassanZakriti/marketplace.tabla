# Geolocation Feature Implementation

This implementation adds user location detection and localStorage persistence to your Tabla marketplace application.

## Files Added/Modified

### 1. `hooks/useGeolocation.tsx` - Main Geolocation Hook
A comprehensive React hook that provides:
- **Location Detection**: Gets user's current position using the Geolocation API
- **localStorage Persistence**: Automatically stores location data for future use
- **Error Handling**: Provides user-friendly error messages
- **Permission Management**: Checks geolocation permissions
- **Data Validation**: Ensures location data is recent and valid

### 2. `components/common/LocationControl.tsx` - UI Component
A reusable component that provides:
- **"Get Location" Button**: Triggers location detection
- **Status Display**: Shows current location status
- **Error Messages**: Displays location errors to users
- **Location Details**: Optionally shows coordinates and accuracy
- **Clear Function**: Allows users to clear stored location

### 3. `components/search/MapSection.tsx` - Enhanced Map Integration
Enhanced with:
- **User Location Marker**: Red marker showing user's position
- **Distance Calculation**: Calculates distances from user to restaurants
- **Smart Centering**: Centers map on user location when available
- **Sorting**: Sorts restaurants by distance when location is known

### 4. `components/examples/LocationExample.tsx` - Usage Example
Demonstrates how to:
- Use the geolocation hook
- Calculate distances to restaurants
- Display location information
- Handle errors gracefully

## How It Works

### localStorage Structure
```javascript
// Key: "tabla_user_location" (configurable)
{
  latitude: 33.5731,
  longitude: -7.5898,
  accuracy: 10,
  timestamp: 1643723400000
}
```

### Location Data Lifecycle
1. **Request**: User clicks "Get my location"
2. **Permission**: Browser requests geolocation permission
3. **Detection**: GPS/network determines user's position
4. **Storage**: Location saved to localStorage with timestamp
5. **Usage**: Map centers on user location, distances calculated
6. **Expiry**: Data expires after 24 hours for privacy

### Distance Calculation
Uses the Haversine formula to calculate distances between coordinates:
```javascript
const distance = calculateDistance(
  userLat, userLng,
  restaurantLat, restaurantLng
)
```

## Usage Examples

### Basic Geolocation Hook
```tsx
import useGeolocation from "@/hooks/useGeolocation"

const MyComponent = () => {
  const {
    coords,           // Current coordinates
    error,           // Error object if any
    loading,         // Loading state
    hasLocation,     // Boolean if location is available
    getCurrentPosition, // Function to request location
    clearStoredLocation // Function to clear stored data
  } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 300000,
    autoRequest: false,
    storageKey: "my_app_location"
  })

  return (
    <div>
      {hasLocation ? (
        <p>Location: {coords.latitude}, {coords.longitude}</p>
      ) : (
        <button onClick={getCurrentPosition}>
          Get Location
        </button>
      )}
    </div>
  )
}
```

### Using the Location Control Component
```tsx
import LocationControl from "@/components/common/LocationControl"

const SearchPage = () => {
  const [userLocation, setUserLocation] = useState(null)

  return (
    <div>
      <LocationControl 
        onLocationUpdate={setUserLocation}
        showDetails={true}
        className="mb-4"
      />
      
      {userLocation && (
        <p>User is at: {userLocation.lat}, {userLocation.lng}</p>
      )}
    </div>
  )
}
```

### Distance-Based Restaurant Sorting
```tsx
import { calculateDistance } from "@/hooks/useGeolocation"

const sortRestaurantsByDistance = (restaurants, userLocation) => {
  return restaurants
    .map(restaurant => ({
      ...restaurant,
      distance: calculateDistance(
        userLocation.lat,
        userLocation.lng,
        restaurant.coordinates.lat,
        restaurant.coordinates.lng
      )
    }))
    .sort((a, b) => a.distance - b.distance)
}
```

## Configuration Options

### useGeolocation Hook Options
```typescript
interface UseGeolocationOptions {
  enableHighAccuracy?: boolean  // Use GPS vs network (default: true)
  timeout?: number             // Max time to wait (default: 15000ms)
  maximumAge?: number          // Cache duration (default: 300000ms)
  watchPosition?: boolean      // Continuous tracking (default: false)
  autoRequest?: boolean        // Auto-request on mount (default: false)
  storageKey?: string         // localStorage key (default: "userLocation")
}
```

### LocationControl Component Props
```typescript
interface LocationControlProps {
  onLocationUpdate?: (coords: { lat: number; lng: number }) => void
  className?: string           // Additional CSS classes
  showDetails?: boolean       // Show coordinates and accuracy
}
```

## Privacy Considerations

1. **User Consent**: Always requires explicit user action to access location
2. **Data Expiry**: Stored location expires after 24 hours
3. **Clear Option**: Users can manually clear stored location data
4. **No Server Storage**: Location data stays in browser localStorage
5. **Permission Checks**: Respects browser permission settings

## Browser Compatibility

- **Supported**: All modern browsers (Chrome, Firefox, Safari, Edge)
- **Fallback**: Graceful degradation if geolocation is not supported
- **HTTPS Required**: Geolocation only works on secure connections

## Error Handling

The implementation handles common error scenarios:
- **Permission Denied**: User blocks location access
- **Position Unavailable**: GPS/network failure
- **Timeout**: Location request takes too long
- **Unsupported**: Browser doesn't support geolocation

## Integration with Existing Features

### Map Integration
- User location marker appears on maps
- Map automatically centers on user location
- Restaurants sorted by distance from user

### Search Enhancement
- Can filter restaurants by distance
- Show "nearby" restaurants first
- Calculate delivery/pickup distances

### Restaurant Listings
- Display distance to each restaurant
- Sort by proximity
- Show travel time estimates

## Future Enhancements

1. **Continuous Tracking**: Real-time location updates
2. **Geofencing**: Alerts when near restaurants
3. **Location History**: Remember frequent locations
4. **Address Lookup**: Convert coordinates to addresses
5. **Navigation Integration**: Direct links to navigation apps

## Testing

To test the geolocation functionality:

1. **Development**: Use `localhost` or HTTPS
2. **Permission**: Grant location access when prompted
3. **Accuracy**: Test with different location services (GPS, WiFi, cellular)
4. **Persistence**: Refresh page to verify localStorage persistence
5. **Expiry**: Manually adjust timestamp to test expiration

## Troubleshooting

### Location Not Working
- Ensure HTTPS connection
- Check browser permissions
- Verify location services are enabled
- Test on different devices/browsers

### Inaccurate Location
- Enable high accuracy mode
- Use outdoors for better GPS signal
- Allow longer timeout for better positioning
- Consider fallback to IP-based location

### Performance Issues
- Limit location updates frequency
- Use appropriate maximumAge setting
- Implement debouncing for continuous tracking
- Cache calculated distances

This implementation provides a solid foundation for location-based features in your restaurant marketplace application while maintaining user privacy and providing a great user experience.
