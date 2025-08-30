// Base API configuration
const API_BASE_URL = "https://api.dev.tabla.ma"

// Generic API request function
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}/${endpoint.replace(/^\//, "")}`

  const defaultOptions: RequestInit = {
    ...options,
  }

  // Set Content-Type header only if not FormData (for file uploads)
  if (!(options.body instanceof FormData)) {
    defaultOptions.headers = {
      "Content-Type": "application/json",
      ...options.headers,
    }
  } else {
    defaultOptions.headers = {
      ...options.headers,
    }
  }

  // Add auth token if available
  if (typeof window !== "undefined") {
    const accessToken = localStorage.getItem("access_token")
    if (accessToken) {
      defaultOptions.headers = {
        ...defaultOptions.headers,
        Authorization: `Bearer ${accessToken}`,
      }
    }
  }

  try {
    const response = await fetch(url, defaultOptions)

    // If token expired, try to refresh
    if (response.status === 401 && typeof window !== "undefined") {
      const refreshToken = localStorage.getItem("refresh_token")
      if (refreshToken && !isTokenExpired()) {
        try {
          console.log("Attempting to refresh access token...")
          const refreshResponse = await refreshAccessToken()
          
          if (refreshResponse.access_token) {
            console.log("Token refreshed successfully, retrying original request...")
            // Retry the original request with new token
            defaultOptions.headers = {
              ...defaultOptions.headers,
              Authorization: `Bearer ${refreshResponse.access_token}`,
            }
            const retryResponse = await fetch(url, defaultOptions)
            
            if (!retryResponse.ok) {
              const errorData = await retryResponse.json().catch(() => ({}))
              throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${retryResponse.status}`)
            }
            
            return await retryResponse.json()
          } else {
            throw new Error("Refresh token response missing access token")
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError)
          // Clear invalid tokens
          clearAuthTokens()
          throw new Error("Authentication failed. Please login again.")
        }
      } else {
        // No refresh token available or token is expired
        console.log("No valid refresh token available")
        clearAuthTokens()
        throw new Error("Authentication required. Please login.")
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("API request failed:", error)
    throw error
  }
}

// Helper functions for token management
function clearAuthTokens(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("token_expires_at")
    localStorage.removeItem("user")
  }
}

function setAuthTokens(authResponse: any): void {
  if (typeof window !== "undefined") {
    console.log("Setting auth tokens from response:", authResponse)
    
    // Handle different response formats - check for both access_token and access
    const accessToken = authResponse.access_token || authResponse.access
    const refreshToken = authResponse.refresh_token || authResponse.refresh
    
    if (accessToken) {
      localStorage.setItem("access_token", accessToken)
      console.log("Access token saved:", accessToken.substring(0, 10) + "...")
    } else {
      console.error("No access token found in response:", authResponse)
    }
    
    if (refreshToken) {
      localStorage.setItem("refresh_token", refreshToken)
      console.log("Refresh token saved:", refreshToken.substring(0, 10) + "...")
    } else {
      console.error("No refresh token found in response:", authResponse)
    }
    
    // Calculate and store expiration time
    const expiresIn = authResponse.expires_in || 3600 // Default to 1 hour
    const expiresAt = Date.now() + (expiresIn * 1000)
    localStorage.setItem("token_expires_at", expiresAt.toString())
    
    if (authResponse.user) {
      localStorage.setItem("user", JSON.stringify(authResponse.user))
      console.log("User data saved:", authResponse.user)
    }
  }
}

async function refreshAccessToken(): Promise<RefreshTokenResponse> {
  const refreshToken = localStorage.getItem("refresh_token")
  if (!refreshToken) {
    throw new Error("No refresh token available")
  }

  console.log("Attempting to refresh access token...")

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/token/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh: refreshToken,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Refresh token error response:", {
        status: response.status,
        statusText: response.statusText,
        errorData
      })
      throw new Error(`Failed to refresh token: ${response.status} ${errorData.detail || errorData.message || response.statusText}`)
    }

    const data = await response.json()
    console.log("Refresh token API response:", data)
    
    // Validate the response has the expected access token
    const accessToken = data.access_token || data.access
    if (!accessToken) {
      console.error("Invalid refresh token response - no access token:", data)
      throw new Error("Invalid refresh token response: missing access token")
    }
    
    // Handle both possible response formats
    const expiresIn = data.expires_in || 3600 // Default to 1 hour if not provided
    
    // Update stored access token
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", accessToken)
      const expiresAt = Date.now() + (expiresIn * 1000)
      localStorage.setItem("token_expires_at", expiresAt.toString())
      console.log("Access token refreshed and stored")
    }
    
    return {
      access_token: accessToken,
      expires_in: expiresIn,
      token_type: data.token_type || "Bearer"
    }
  } catch (error) {
    console.error("Refresh token failed:", error)
    throw error
  }
}

async function verifyToken(): Promise<boolean> {
  const accessToken = localStorage.getItem("access_token")
  if (!accessToken) {
    return false
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/token/verify/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: accessToken,
      }),
    })

    return response.ok
  } catch (error) {
    console.error("Token verification failed:", error)
    return false
  }
}

function isTokenExpired(): boolean {
  if (typeof window === "undefined") return true
  
  const expiresAt = localStorage.getItem("token_expires_at")
  if (!expiresAt) return true
  
  return Date.now() >= parseInt(expiresAt)
}

// Restaurant-specific interfaces
export interface Restaurant {
  id: number
  name: string
  phone: string
  address: string
  city_name: string
  image: string
  description: string
  website: string
  average_price: string | number
  category_name: string
  gallery: { file: string }[]
  offers: OfferType[]
  services: ExtraService[]
  rating: number
  food_rating: number
  service_rating: number
  ambience_rating: number
  location: number[]
  is_liked: boolean
  // Additional properties for compatibility
  distance?: number | null
  status?: "Closed" | "Open"
  main_image?: string | null
}

export interface RestaurantAPIResponse {
  count: number
  next: string | null
  previous: string | null
  results: Restaurant[]
}


export interface SearchParams {
  city?: string
  term?: string
  page?: number
  limit?: number
  rating?: number
  status?: "Open" | "Closed"
  category?: string
  min_price?: number
  max_price?: number
  distance_min?: number
  distance_max?: number
  date?: string // YYYY-MM-DD format for availability filter
  time?: string // HH:MM format for availability filter
  party_size?: number // For availability filter
  ordering?: string // For sorting: 'distance', 'rating', 'price', etc.
}

// Define the offer type to match the API structure
export interface OfferType {
  id: number
  title: string
  description: string
  percentage: number
  valid_from_date: string
  valid_to_date: string
  time_range_from: string
  time_range_to: string
}

export interface OpeningHour {
  day_name: string
  is_today: boolean
  is_closed: boolean
  opening_time: string | null
  closing_time: string | null
}

export interface AvailabilityCheckRequest {
  date: string // YYYY-MM-DD format
  party_size: number
}

export interface AvailabilitySlot {
  time: string // HH:MM format
  available: boolean
  max_capacity?: number
}

export interface DayAvailability {
  date: string // YYYY-MM-DD format
  available: boolean
  slots: AvailabilitySlot[]
}

export interface AvailabilityCheckResponse {
  restaurant_id: number
  availability: DayAvailability[]
}

// Interface for reservation-based availability check
export interface ReservationAvailabilityRequest {
  date: string // YYYY-MM-DD format
  time: string // HH:MM:SS format
  number_of_guests: number
  offer?: number // Optional offer ID
}

export interface ReservationAvailabilityResponse {
  available: boolean
  message?: string
  alternative_times?: string[]
  max_capacity?: number
}

// Interface for time slots API
export interface TimeSlotRequest {
  date: string // YYYY-MM-DD format
  number_of_guests: number
}

export interface TimeSlot {
  time: string // HH:MM format
  available: boolean
  capacity?: number
}

// Updated interface to match actual API response
export interface TimeSlotsResponse {
  [mealPeriod: string]: string[] // e.g., "Lunch": ["12:00", "12:15", ...], "dinner": []
}

// Processed interface for use in components
export interface ProcessedTimeSlotsResponse {
  date: string
  available_slots: TimeSlot[]
}

// Interface for monthly availability API
export interface MonthlyAvailabilityRequest {
  year: number
  month: number // 1-12
}

export interface MonthlyDayAvailability {
  day: number // Day of the month (1-31)
  isAvailable: boolean
}

// Updated to match actual API response format (array of day objects)
export interface MonthlyAvailabilityResponse extends Array<MonthlyDayAvailability> {}

export interface MenuItem {
  name: string
  price: string | number
}

export interface Menu {
  name: string
  items: MenuItem[]
}

export interface MenuCategory {
  name: string
  menus: Menu[]
}

export interface ExtraService {
  id: number
  seq_id: number
  name: string
  description: string
  created_at: string
  updated_at: string
  restaurant: number
}

export interface Review {
  id: number
  seq_id: number
  description: string
  food_rating: string
  service_rating: string
  ambience_rating: string
  value_for_money: string
  source: string
  created_at: string
  updated_at: string
  restaurant: number
  reservation: number | null
  user: number | null
  customer: number
}

// Extended review interface for user reviews that includes restaurant data
export interface UserReview extends Review {
  restaurant_data?: {
    id: number
    name: string
    image?: string
    address?: string
  }
}

export interface RestaurantFavorite {
    id: number;
    name: string;
    address: string;
    distance: number | null;
    rating: number | null;
    status: string;
    main_image: string | null;
    location: [number, number]; // Array containing latitude and longitude
    is_liked: boolean;
}  

export interface GalleryItem {
  file: string
  uploaded_at: string
}

export interface Reservation {
    id: number;
    seq_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    title: string;
    has_customer: boolean;
    status: string; // Could be narrowed to a union like "PENDING" | "CONFIRMED" | etc.
    source: string; // Could be narrowed to "BACK_OFFICE" | "ONLINE" | etc.
    commenter: string;
    internal_note: string;
    number_of_guests: number;
    date: string; // Format: "YYYY-MM-DD"
    time: string; // Format: "HH:mm:ss"
    other_cancellation_reason: boolean;
    cancellation_note: string | null;
    review_link: string | null;
    created_at: string; // ISO date-time
    edit_at: string; // ISO date-time
    is_review_sent: boolean;
    send_review_at: string | null;
    allergies: string;
    preferences: string;
    user: number;
    restaurant: number;
    customer: number | null;
    offer: number | null;
    area: number | null;
    cancellation_reason: number | null;
    occasion: number | null;
}

export interface ReservationsAPIResponse {
  count: number
  next: string | null
  previous: string | null
  results: Reservation[]
}

export interface BookingRequest {
  first_name: string
  last_name: string
  email: string
  phone: string
  title: "mr" | "mrs" | "ms"
  number_of_guests: number
  date: string // YYYY-MM-DD format
  time: string // HH:MM:SS format or ISO string
  restaurant: number
  commenter?: string
  internal_note?: string
  allergies?: string
  preferences?: string
  occasion?: number
  area?: number
  offer_id?: number[]
}

export interface BookingResponse {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  title: string
  number_of_guests: number
  date: string
  time: string
  restaurant: number
  commenter: string
  internal_note: string
  allergies: string
  preferences: string
  occasion: number | null
  area: number | null
  offer: number | null
  status: string
  created_at: string
  updated_at: string
}

// Restaurant data provider
export const restaurantDataProvider = {
  // Get all restaurants with optional pagination
  getRestaurants: async (params?: SearchParams): Promise<RestaurantAPIResponse> => {
    const searchParams = new URLSearchParams()

    if (params?.city) searchParams.append("city", params.city)
    if (params?.term) searchParams.append("search", params.term)
    if (params?.page) searchParams.append("page", params.page.toString())
    if (params?.limit) searchParams.append("limit", params.limit.toString())
    if (params?.rating) searchParams.append("rating", params.rating.toString())
    if (params?.status) searchParams.append("status", params.status)
    if (params?.category) searchParams.append("category", params.category)
    if (params?.min_price) searchParams.append("min_price", params.min_price.toString())
    if (params?.max_price) searchParams.append("max_price", params.max_price.toString())
    if (params?.distance_max) searchParams.append("distance", params.distance_max.toString())
    if (params?.date) searchParams.append("date", params.date)
    if (params?.time) searchParams.append("time", params.time)
    if (params?.party_size) searchParams.append("party_size", params.party_size.toString())
    if (params?.ordering) searchParams.append("ordering", params.ordering)

    const queryString = searchParams.toString()
    const endpoint = `api/v1/mp/restaurants/${queryString ? `?${queryString}` : ""}`

    return apiRequest<RestaurantAPIResponse>(endpoint)
  },

  // Get a single restaurant by ID
  getRestaurant: async (id: string | number): Promise<Restaurant> => {
    return apiRequest<Restaurant>(`api/v1/mp/restaurants/${id}/`)
  },

  // Search restaurants
  searchRestaurants: async (query: string, city?: string): Promise<RestaurantAPIResponse> => {
    return restaurantDataProvider.getRestaurants({ term: query, city })
  },

  // Get popular restaurants (you can modify this based on your API)
  getPopularRestaurants: async (limit = 6): Promise<RestaurantAPIResponse> => {
    return restaurantDataProvider.getRestaurants({ limit })
  },

  // Get restaurants by city
  getRestaurantsByCity: async (city: string): Promise<RestaurantAPIResponse> => {
    return restaurantDataProvider.getRestaurants({ city })
  },

  // Get restaurant availability/opening hours
  getRestaurantAvailability: async (id: string | number): Promise<OpeningHour[]> => {
    return apiRequest<OpeningHour[]>(`api/v1/mp/restaurants/${id}/availability/`)
  },

  // Check restaurant availability for specific dates and party size
  checkRestaurantAvailability: async (
    id: string | number, 
    request: AvailabilityCheckRequest
  ): Promise<AvailabilityCheckResponse> => {
    return apiRequest<AvailabilityCheckResponse>(
      `api/v1/mp/restaurants/${id}/check-availability/`,
      {
        method: 'POST',
        body: JSON.stringify(request)
      }
    )
  },

  // Batch check availability for multiple restaurants
  checkMultipleRestaurantsAvailability: async (
    restaurantIds: (string | number)[],
    request: AvailabilityCheckRequest
  ): Promise<Record<string, AvailabilityCheckResponse>> => {
    const availabilityPromises = restaurantIds.map(async (id) => {
      try {
        const availability = await restaurantDataProvider.checkRestaurantAvailability(id, request)
        return { id: id.toString(), availability }
      } catch (error) {
        // If availability check fails for a restaurant, mark it as unavailable
        return { 
          id: id.toString(), 
          availability: {
            restaurant_id: Number(id),
            availability: [{
              date: request.date,
              available: false,
              slots: []
            }]
          }
        }
      }
    })

    const results = await Promise.all(availabilityPromises)
    return results.reduce((acc, { id, availability }) => {
      acc[id] = availability
      return acc
    }, {} as Record<string, AvailabilityCheckResponse>)
  },

  // Check availability using reservation endpoint (more accurate)
  checkReservationAvailability: async (
    id: string | number,
    request: ReservationAvailabilityRequest
  ): Promise<ReservationAvailabilityResponse> => {
    try {
      // Use the reservation endpoint to check if the specific time/date/party size is available
      const response = await apiRequest<any>(
        `api/v1/mp/restaurants/${id}/make_reservation_with_offer/`,
        {
          method: 'POST',
          body: JSON.stringify({
            ...request,
            // Add required fields for reservation check
            first_name: "availability_check",
            last_name: "availability_check", 
            email: "check@availability.com",
            phone: "0000000000",
            title: "mr",
            restaurant: Number(id),
            check_only: true // Flag to indicate this is just an availability check
          })
        }
      )
      
      return {
        available: true,
        message: "Time slot is available"
      }
    } catch (error: any) {
      // If the reservation fails, parse the error to understand why
      if (error.status === 400 || error.status === 409) {
        return {
          available: false,
          message: error.message || "Time slot not available",
          alternative_times: error.alternative_times || []
        }
      }
      
      // For other errors or if API returns nothing, assume available (graceful fallback)
      console.warn("Availability check failed, assuming available:", error)
      return {
        available: true,
        message: "Unable to verify availability, proceeding with reservation"
      }
    }
  },

  // Get available time slots for a specific date and guest count
  getTimeSlots: async (
    id: string | number,
    request: TimeSlotRequest
  ): Promise<ProcessedTimeSlotsResponse> => {
    const params = new URLSearchParams({
      date: request.date,
      number_of_guests: request.number_of_guests.toString()
    })
    
    try {
      const response = await apiRequest<TimeSlotsResponse>(
        `api/v1/mp/restaurants/${id}/time_slots/?${params.toString()}`
      )
      
      console.log('Raw time slots API response:', response)
      
      // Convert meal period format to flat array of time slots
      const availableSlots: TimeSlot[] = []
      
      // Process each meal period
      Object.entries(response).forEach(([mealPeriod, timeSlots]) => {
        console.log(`Processing ${mealPeriod}:`, timeSlots)
        if (Array.isArray(timeSlots)) {
          timeSlots.forEach(timeStr => {
            availableSlots.push({
              time: timeStr,
              available: true, // All returned times are available
              capacity: undefined
            })
          })
        }
      })
      
      console.log('Final processed slots:', availableSlots)
      
      return {
        date: request.date,
        available_slots: availableSlots
      }
    } catch (error) {
      console.error('Error fetching time slots:', error)
      // Return empty slots on error
      return {
        date: request.date,
        available_slots: []
      }
    }
  },

  // Get monthly availability for a restaurant
  getMonthlyAvailability: async (
    id: string | number,
    year: number,
    month: number
  ): Promise<MonthlyAvailabilityResponse> => {
    try {
      const response = await apiRequest<MonthlyAvailabilityResponse>(
        `api/v1/mp/restaurants/${id}/monthly_availability/${year}-${month.toString().padStart(2, '0')}/`
      )
      
      // Ensure response is always an array
      return Array.isArray(response) ? response : []
    } catch (error) {
      console.error('Error fetching monthly availability:', error)
      // Return empty availability on error
      return []
    }
  },

  // Get restaurant menu
  getRestaurantMenu: async (id: string | number): Promise<MenuCategory[]> => {
    return apiRequest<MenuCategory[]>(`api/v1/mp/restaurants/${id}/menu/`)
  },

  // Get restaurant reviews
  getRestaurantReviews: async (id: string | number): Promise<Review[]> => {
    return apiRequest<Review[]>(`api/v1/mp/restaurants/${id}/reviews/`)
  },

  // Get restaurant services
  getRestaurantServices: async (id: string | number): Promise<ExtraService[]> => {
    return apiRequest<ExtraService[]>(`api/v1/mp/restaurants/${id}/services/`)
  },

  // Get restaurant user photos/gallery
  getRestaurantGallery: async (id: string | number): Promise<GalleryItem[]> => {
    return apiRequest<GalleryItem[]>(`api/v1/mp/restaurants/${id}/user_photos/`)
  },

  // Like/Unlike restaurant
  likeRestaurant: async (id: string | number): Promise<{ message: string }> => {
    const url = `${API_BASE_URL}/api/v1/mp/restaurants/${id}/like/`
    
    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }

    // Add auth token if available
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem("access_token")
      if (accessToken) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
        }
      }
    }

    try {
      const response = await fetch(url, options)
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorData.message || errorMessage
        } catch {
          // If JSON parsing fails, use status text
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      // Handle empty response (204 No Content)
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return { message: "Restaurant liked successfully" }
      }

      // Try to parse JSON response
      try {
        const result = await response.json()
        return result || { message: "Restaurant liked successfully" }
      } catch {
        // If JSON parsing fails but response was ok, return success
        return { message: "Restaurant liked successfully" }
      }
    } catch (error) {
      console.error("Error liking restaurant:", error)
      throw error
    }
  },

  unlikeRestaurant: async (id: string | number): Promise<{ message: string }> => {
    const url = `${API_BASE_URL}/api/v1/mp/restaurants/${id}/unlike/`
    
    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }

    // Add auth token if available
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem("access_token")
      if (accessToken) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
        }
      }
    }

    try {
      const response = await fetch(url, options)
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorData.message || errorMessage
        } catch {
          // If JSON parsing fails, use status text
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      // Handle empty response (204 No Content)
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return { message: "Restaurant unliked successfully" }
      }

      // Try to parse JSON response
      try {
        const result = await response.json()
        return result || { message: "Restaurant unliked successfully" }
      } catch {
        // If JSON parsing fails but response was ok, return success
        return { message: "Restaurant unliked successfully" }
      }
    } catch (error) {
      console.error("Error unliking restaurant:", error)
      throw error
    }
  },

  // Get liked restaurants
  getLikedRestaurants: async (): Promise<RestaurantFavorite[]> => {
    console.log('🍽️ Fetching liked restaurants...')
    try {
      const result = await apiRequest<RestaurantFavorite[]>("api/v1/mp/liked-restaurants/")
      console.log('🍽️ Liked restaurants response:', result)
      return result || []
    } catch (error) {
      console.error('🍽️ Error fetching liked restaurants:', error)
      throw error
    }
  },

  // Remove restaurant from favorites
  removeLikedRestaurant: async (id: string | number): Promise<{ message: string }> => {
    const url = `${API_BASE_URL}/api/v1/mp/liked-restaurants/${id}/`
    
    const options: RequestInit = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }

    // Add auth token if available
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem("access_token")
      if (accessToken) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
        }
      }
    }

    try {
      const response = await fetch(url, options)
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorData.message || errorMessage
        } catch {
          // If JSON parsing fails, use status text
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      // Handle empty response (204 No Content)
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return { message: "Restaurant removed from favorites successfully" }
      }

      // Try to parse JSON response
      try {
        const result = await response.json()
        return result || { message: "Restaurant removed from favorites successfully" }
      } catch {
        // If JSON parsing fails but response was ok, return success
        return { message: "Restaurant removed from favorites successfully" }
      }
    } catch (error) {
      console.error("Error removing restaurant from favorites:", error)
      throw error
    }
  },

  // Get user reservations
  getReservations: async (): Promise<Reservation[]> => {
    console.log('📅 Fetching user reservations...')
    try {
      const result = await apiRequest<Reservation[]>("api/v1/mp/reservations/")
      console.log('📅 Raw API result:', result)
      console.log('📅 Result type:', typeof result)
      console.log('📅 Result keys:', Object.keys(result || {}))
      console.log('📅 Results array:', result)
      console.log('📅 Results length:', result?.length)
      return result
    } catch (error) {
      console.error('📅 Error fetching reservations:', error)
      throw error
    }
  },

  // Get user reviews
  getUserReviews: async (): Promise<UserReview[]> => {
    console.log('⭐ Fetching user reviews...')
    try {
      const result = await apiRequest<UserReview[]>("api/v1/mp/reviews/")
      console.log('⭐ User reviews response:', result)
      return result || []
    } catch (error) {
      console.error('⭐ Error fetching user reviews:', error)
      throw error
    }
  },

  // Create a new review for a restaurant
  createRestaurantReview: async (restaurantId: string | number, reviewData: FormData): Promise<Review> => {
    console.log('📝 Creating restaurant review...', { restaurantId, reviewData })
    try {
      const result = await apiRequest<Review>(`api/v1/mp/restaurants/${restaurantId}/make_review/`, {
        method: 'POST',
        body: reviewData, // FormData for file upload support
      })
      console.log('📝 Review created successfully:', result)
      return result
    } catch (error) {
      console.error('📝 Error creating review:', error)
      throw error
    }
  },

  // Cancel a reservation
  cancelReservation: async (id: string | number): Promise<{ message: string }> => {
    const url = `${API_BASE_URL}/api/v1/mp/reservations/${id}/cancel/`
    
    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }

    // Add auth token if available
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem("access_token")
      if (accessToken) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
        }
      }
    }

    try {
      const response = await fetch(url, options)
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorData.message || errorMessage
        } catch {
          // If JSON parsing fails, use status text
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      // Handle empty response (204 No Content)
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return { message: "Reservation cancelled successfully" }
      }

      // Try to parse JSON response
      try {
        const result = await response.json()
        return result || { message: "Reservation cancelled successfully" }
      } catch {
        // If JSON parsing fails but response was ok, return success
        return { message: "Reservation cancelled successfully" }
      }
    } catch (error) {
      console.error("Error cancelling reservation:", error)
      throw error
    }
  },

  // Get offers for a restaurant
  getOffers: async (restaurantId: string | number): Promise<OfferType[]> => {
    try {
      return await apiRequest<OfferType[]>(`api/v1/mp/restaurants/${restaurantId}/offers/`)
    } catch (error) {
      console.error("Error fetching offers:", error)
      throw error
    }
  },

  // Create a new booking/reservation
  createBooking: async (bookingData: BookingRequest): Promise<BookingResponse> => {
    console.log('📝 Creating new booking...', bookingData)
    try {
      // Use the new endpoint with restaurant ID
      const endpoint = `api/v1/mp/restaurants/${bookingData.restaurant}/make_reservation_with_offer/`
      
      const result = await apiRequest<BookingResponse>(endpoint, {
        method: "POST",
        body: JSON.stringify({
          ...bookingData,
          source: "MARKETPLACE",
        }),
      })
      console.log('📝 Booking created successfully:', result)
      return result
    } catch (error) {
      console.error('📝 Error creating booking:', error)
      throw error
    }
  },
}

// Cities data provider
export interface City {
  id: string | number
  name: string
  image: string | null
  boundary: string | null
  country: string | number
}

export interface CitiesAPIResponse {
  count: number
  next: string | null
  previous: string | null
  results: City[]
}

export const cityDataProvider = {
  // Get all cities
  getCities: async (): Promise<CitiesAPIResponse> => {
    return apiRequest<CitiesAPIResponse>("api/v1/mp/cities/")
  },

  // Get a single city by ID
  getCity: async (id: string | number): Promise<City> => {
    return apiRequest<City>(`api/v1/mp/cities/${id}/`)
  },
}

// Auth data provider - Updated to match your API
export interface User {
  id: string | number
  username: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  avatar?: string
  restaurant_id?: number
}

export interface LoginCredentials {
  username: string
  email: string
  password: string
  restaurant_id?: number
}

export interface RegisterData {
  username: string
  email: string
  password1: string
  password2: string
  first_name?: string
  last_name?: string
  phone?: string
  restaurant_id?: number
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  user?: User
}

export interface RefreshTokenResponse {
  access_token: string
  expires_in: number
  token_type: string
}

export const authDataProvider = {
  // Login - Updated to handle access/refresh tokens
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    console.log("Attempting login for:", credentials.email)
    
    const response = await apiRequest<any>("api/v1/auth/login/", {
      method: "POST",
      body: JSON.stringify({
        username: credentials.username,
        email: credentials.email,
        password: credentials.password,
        restaurant_id: credentials.restaurant_id || 0,
      }),
    })

    console.log("Login API response:", response)

    // Store auth data using helper function
    setAuthTokens(response)

    // Normalize the response to match AuthResponse interface
    const normalizedResponse: AuthResponse = {
      access_token: response.access_token || response.access,
      refresh_token: response.refresh_token || response.refresh,
      expires_in: response.expires_in || 3600,
      token_type: response.token_type || "Bearer",
      user: response.user
    }

    return normalizedResponse
  },

  // Register
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    console.log("Attempting registration for:", userData.email)
    
    const response = await apiRequest<any>("api/v1/auth/registration/", {
      method: "POST",
      body: JSON.stringify(userData),
    })

    console.log("Registration API response:", response)

    // Store auth data after successful registration
    setAuthTokens(response)

    // Normalize the response to match AuthResponse interface
    const normalizedResponse: AuthResponse = {
      access_token: response.access_token || response.access,
      refresh_token: response.refresh_token || response.refresh,
      expires_in: response.expires_in || 3600,
      token_type: response.token_type || "Bearer",
      user: response.user
    }

    return normalizedResponse
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      // Send refresh token to logout endpoint to invalidate it on server
      const refreshToken = localStorage.getItem("refresh_token")
      if (refreshToken) {
        await fetch(`${API_BASE_URL}/api/v1/auth/logout/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({
            refresh: refreshToken,
          }),
        })
      }
    } catch (error) {
      console.error("Logout API error:", error)
    } finally {
      // Clear local storage regardless of API response
      clearAuthTokens()
    }
  },

  // Get current user
  getCurrentUser: (): User | null => {
    if (typeof window === "undefined") return null
    const userStr = localStorage.getItem("user")
    return userStr ? JSON.parse(userStr) : null
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    if (typeof window === "undefined") return false
    
    const accessToken = localStorage.getItem("access_token")
    const refreshToken = localStorage.getItem("refresh_token")
    
    // User is authenticated if they have an access token that's not expired
    // OR if they have a refresh token (can get new access token)
    if (!accessToken && !refreshToken) return false
    
    // If we have an access token and it's not expired, we're authenticated
    if (accessToken && !isTokenExpired()) return true
    
    // If access token is expired but we have refresh token, we're still authenticated
    // (the API request function will handle refresh automatically)
    return !!refreshToken
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>("api/v1/auth/password/reset/", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  },

  // Get user profile
  getProfile: async (): Promise<User> => {
    return apiRequest<User>("api/v1/auth/user/")
  },

  // Update user profile
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    return apiRequest<User>("api/v1/auth/user/", {
      method: "PATCH",
      body: JSON.stringify(userData),
    })
  },

  // Refresh access token manually
  refreshToken: async (): Promise<RefreshTokenResponse> => {
    return refreshAccessToken()
  },

  // Check if token needs refresh (5 minutes before expiry)
  shouldRefreshToken: (): boolean => {
    if (typeof window === "undefined") return false
    
    const expiresAt = localStorage.getItem("token_expires_at")
    if (!expiresAt) return false
    
    // Refresh if token expires within 5 minutes
    const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000)
    return parseInt(expiresAt) <= fiveMinutesFromNow
  },

  // Get access token
  getAccessToken: (): string | null => {
    if (typeof window === "undefined") return null
    return localStorage.getItem("access_token")
  },

  // Get refresh token
  getRefreshToken: (): string | null => {
    if (typeof window === "undefined") return null
    return localStorage.getItem("refresh_token")
  },

  // Verify current access token
  verifyToken: async (): Promise<boolean> => {
    return verifyToken()
  },

  // Ensure we have a valid access token (refresh if needed)
  ensureValidToken: async (): Promise<boolean> => {
    if (typeof window === "undefined") return false

    const accessToken = localStorage.getItem("access_token")
    const refreshToken = localStorage.getItem("refresh_token")

    // No tokens at all
    if (!accessToken && !refreshToken) return false

    // If access token exists and is not expired, verify it's still valid
    if (accessToken && !isTokenExpired()) {
      const isValid = await verifyToken()
      if (isValid) return true
    }

    // If access token is expired or invalid, try to refresh
    if (refreshToken) {
      try {
        await refreshAccessToken()
        return true
      } catch (error) {
        console.error("Failed to refresh token:", error)
        clearAuthTokens()
        return false
      }
    }

    return false
  },
}

// Generic data provider that combines all providers
export const dataProvider = {
  restaurants: restaurantDataProvider,
  cities: cityDataProvider,
  auth: authDataProvider,
}

export default dataProvider
