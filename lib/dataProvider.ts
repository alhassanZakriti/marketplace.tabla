// Base API configuration
const API_BASE_URL = "https://api.dev.tabla.ma"

// Generic API request function
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}/${endpoint.replace(/^\//, "")}`

  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  }

  // Add auth token if available
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token")
    if (token) {
      defaultOptions.headers = {
        ...defaultOptions.headers,
        Authorization: `Bearer ${token}`,
      }
    }
  }

  try {
    const response = await fetch(url, defaultOptions)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("API request failed:", error)
    throw error
  }
}

// Restaurant-specific interfaces
export interface Restaurant {
  id: string | number
  name: string
  address: string
  distance: number | null
  rating: number | null
  status: "Closed" | "Open"
  main_image: string | null
  location: [number, number] | null
  cuisine?: string
  phone?: string
  description?: string
  hours?: string
  city_name?: string
  website?: string
  average_price?: number
  category_name?: string
  gallery?: { file: string }[]
  offers?: OfferType[]
  services?: ExtraService[]
  food_rating?: number
  service_rating?: number
  ambience_rating?: number
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
}

// Define the offer type to match the API structure
export interface OfferType {
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

export interface GalleryItem {
  file: string
  uploaded_at: string
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

// Auth data provider
export interface User {
  id: string
  email: string
  name: string
  phone?: string
  avatar?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  phone?: string
}

export interface AuthResponse {
  user: User
  token: string
  refresh_token?: string
}

export const authDataProvider = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>("auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })

    // Store auth data
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", response.token)
      localStorage.setItem("user", JSON.stringify(response.user))
      if (response.refresh_token) {
        localStorage.setItem("refresh_token", response.refresh_token)
      }
    }

    return response
  },

  // Register
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>("auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await apiRequest("auth/logout", { method: "POST" })
    } catch (error) {
      console.error("Logout API error:", error)
    } finally {
      // Clear local storage regardless of API response
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user")
        localStorage.removeItem("refresh_token")
      }
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
    return !!localStorage.getItem("auth_token")
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>("auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  },
}

// Generic data provider that combines all providers
export const dataProvider = {
  restaurants: restaurantDataProvider,
  cities: cityDataProvider,
  auth: authDataProvider,
}

export default dataProvider
