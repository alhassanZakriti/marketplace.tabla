// API utility functions to replace Refine's data provider
const API_BASE_URL = "https://api.dev.tabla.ma"

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`

  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  }

  // Add auth token if available
  const token = localStorage.getItem("auth_token")
  if (token) {
    defaultOptions.headers = {
      ...defaultOptions.headers,
      Authorization: `Bearer ${token}`,
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

// Example API functions
export const api = {
  // Restaurants
  getRestaurants: () => apiRequest("/restaurants"),
  getRestaurant: (id: string) => apiRequest(`/restaurants/${id}`),

  // Search
  searchRestaurants: (query: string) => apiRequest(`/restaurants/search?q=${encodeURIComponent(query)}`),

  // User profile
  getProfile: (id: string) => apiRequest(`/users/${id}`),
  updateProfile: (id: string, data: any) =>
    apiRequest(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Auth
  login: (credentials: { email: string; password: string }) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (userData: { email: string; password: string; name: string }) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  forgotPassword: (email: string) =>
    apiRequest("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
}
