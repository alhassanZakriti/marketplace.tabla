# React Query Invalidation System

This document outlines the comprehensive React Query invalidation system implemented in the TABLA marketplace application.

## Overview

The invalidation system ensures that data stays fresh across your application by automatically refreshing queries when related data changes. This prevents stale data issues and provides a better user experience.

## Key Features

- **Optimistic Updates**: Updates UI immediately while API calls are in progress
- **Automatic Invalidation**: Refreshes related data when mutations succeed
- **Background Refresh**: Keeps data fresh without disrupting user experience
- **Error Handling**: Rolls back optimistic updates when API calls fail
- **Smart Caching**: Invalidates only relevant queries to minimize unnecessary API calls

## Main Components

### 1. QueryInvalidator (`invalidationUtils.ts`)

Central utility class that handles all invalidation logic:

```typescript
import { useQueryInvalidator } from '@/hooks/api'

const Component = () => {
  const invalidator = useQueryInvalidator()
  
  // Invalidate specific restaurant
  invalidator.invalidateRestaurant(restaurantId)
  
  // Invalidate all restaurants
  invalidator.invalidateRestaurants()
  
  // Clear all cache (useful for logout)
  invalidator.clearAll()
}
```

### 2. Enhanced Mutation Hooks

All mutation hooks now include:
- Optimistic updates for instant UI feedback
- Comprehensive invalidation on success
- Rollback on error

#### Example: Restaurant Like/Unlike

```typescript
import { useLikeRestaurant, useUnlikeRestaurant } from '@/hooks/api'

const Component = () => {
  const likeMutation = useLikeRestaurant()
  const unlikeMutation = useUnlikeRestaurant()
  
  const handleLike = async (restaurantId) => {
    try {
      await likeMutation.mutateAsync(restaurantId)
      // Optimistic update happens automatically
      // Related queries are invalidated automatically
    } catch (error) {
      // Optimistic update is rolled back automatically
      console.error('Failed to like restaurant:', error)
    }
  }
}
```

### 3. Auto-Refresh System

Keeps data fresh automatically:

```typescript
import { useAutoRefresh } from '@/hooks/api'

const Component = () => {
  // Enable auto-refresh with custom settings
  useAutoRefresh({
    enabled: true,
    interval: 5 * 60 * 1000, // 5 minutes
    onFocus: true, // Refresh when window gains focus
    onReconnect: true, // Refresh when network reconnects
    background: true // Silent background refresh
  })
}
```

### 4. Manual Invalidation Hooks

For triggering invalidations manually:

```typescript
import { useManualInvalidation } from '@/hooks/api'

const Component = () => {
  const {
    onRestaurantInteraction,
    onReservationChange,
    onProfileUpdate,
    onSearchUpdate,
    onLocationChange,
    refreshEverything
  } = useManualInvalidation()
  
  // Use when user interacts with restaurant
  const handleRestaurantAction = (restaurantId) => {
    onRestaurantInteraction(restaurantId)
  }
}
```

## Implementation Details

### Mutation Enhancements

All mutations now follow this pattern:

1. **onMutate**: Perform optimistic updates
2. **onSuccess**: Invalidate related queries
3. **onError**: Rollback optimistic updates

### Query Key Structure

Organized hierarchically for efficient invalidation:

```typescript
const restaurantKeys = {
  all: ['restaurants'],
  lists: () => [...restaurantKeys.all, 'list'],
  list: (params) => [...restaurantKeys.lists(), params],
  details: () => [...restaurantKeys.all, 'detail'],
  detail: (id) => [...restaurantKeys.details(), id],
  liked: () => [...restaurantKeys.all, 'liked'],
  // ... more specific keys
}
```

### Invalidation Strategies

1. **Exact Match**: Invalidate specific queries
2. **Predicate Match**: Invalidate queries matching criteria
3. **Silent Invalidation**: Mark as stale without immediate refetch
4. **Background Invalidation**: Refetch silently in background

## Usage Examples

### Restaurant Operations

```typescript
// Like a restaurant
const likeMutation = useLikeRestaurant()
await likeMutation.mutateAsync(restaurantId)
// Automatically invalidates:
// - Restaurant detail
// - Restaurant lists
// - Liked restaurants
// - Search results

// Unlike a restaurant  
const unlikeMutation = useUnlikeRestaurant()
await unlikeMutation.mutateAsync(restaurantId)
// Automatically invalidates the same queries
```

### Reservation Operations

```typescript
// Create a booking
const createBooking = useCreateBooking()
await createBooking.mutateAsync(bookingData)
// Automatically invalidates:
// - User reservations
// - Restaurant availability

// Cancel a reservation
const cancelReservation = useCancelReservation()
await cancelReservation.mutateAsync(reservationId)
// Automatically invalidates:
// - User reservations
// - Restaurant availability
```

### Authentication Operations

```typescript
// Login
const login = useLogin()
await login.mutateAsync(credentials)
// Clears all cache for fresh user-specific data

// Logout
const logout = useLogout()
await logout.mutateAsync()
// Clears all cache to remove user-specific data
```

## Best Practices

1. **Use Optimistic Updates**: Provide immediate feedback to users
2. **Invalidate Conservatively**: Only invalidate what's necessary
3. **Handle Errors Gracefully**: Always provide fallback mechanisms
4. **Use Background Refresh**: Keep data fresh without disrupting UX
5. **Monitor Performance**: Watch for excessive invalidations

## Advanced Features

### Stale Data Handling

```typescript
import { useStaleDataHandler } from '@/hooks/api'

const { markAsStale, refetchStale, handleError } = useStaleDataHandler()

// Mark data as stale without refetching
markAsStale(['restaurants', 'list'])

// Refetch all stale data
refetchStale()

// Handle specific error scenarios
handleError({ type: 'restaurant', id: restaurantId })
```

### Custom Invalidation

```typescript
const invalidator = useQueryInvalidator()

// Custom predicate-based invalidation
queryClient.invalidateQueries({
  predicate: (query) => {
    return query.queryKey[0] === 'restaurants' && 
           query.queryKey.includes('some-criteria')
  }
})
```

## Global Setup

The system is automatically initialized in the app layout:

```typescript
// app/layout.tsx
<QueryProvider>
  <AuthProvider>
    <AutoRefreshManager /> {/* Handles global auto-refresh */}
    {/* Rest of app */}
  </AuthProvider>
</QueryProvider>
```

## Monitoring and Debugging

- Use React Query DevTools to monitor invalidations
- Check console logs for mutation success/failure
- Watch network tab for refetch patterns
- Monitor component re-renders

This system ensures your application always displays fresh, consistent data while providing optimal user experience through optimistic updates and intelligent caching strategies.
