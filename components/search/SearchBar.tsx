"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "../ui/Button"

interface City {
  id: string | number
  name: string
  image: string | null
  boundary: string | null
  country: string | number
}

interface CitiesAPIResponse {
  count: number
  next: string | null
  previous: string | null
  results: City[]
}

const SearchBar = () => {
  const searchParams = useSearchParams()
  const cityParam = searchParams.get("city")
  const termParam = searchParams.get("term")
  const city = cityParam || ""
  const term = termParam || ""

  const [cities, setCities] = useState<City[]>([])
  const [citiesLoaded, setCitiesLoaded] = useState(false)
  const [citiesLoading, setCitiesLoading] = useState(false)
  const [citiesError, setCitiesError] = useState<string | null>(null)

  // API retry logic
  const MAX_RETRIES = 3
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  const [searchTerm, setSearchTerm] = useState(term)
  const [cityTerm, setCityTerm] = useState("")
  const [selectedCityId, setSelectedCityId] = useState<string | number | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [isCityFocused, setIsCityFocused] = useState(false)

  // Popular search suggestions
  const popularSearches = ["Pizza", "Sushi", "Burger", "Italian", "Chinese", "Mexican", "Seafood", "Vegetarian"]

  const [suggestions, setSuggestions] = useState<string[]>([])
  const [citySuggestions, setCitySuggestions] = useState<City[]>([])

  // Fetch cities function
  const fetchCities = async () => {
    try {
      setCitiesLoading(true)
      setCitiesError(null)

      const response = await fetch("https://api.dev.tabla.ma/api/v1/mp/cities/", {
        headers: {
          "Content-Type": "application/json",
          // Add auth headers if needed
          // Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: CitiesAPIResponse = await response.json()
      console.log("Cities API Success:", data)

      if (data && data.results && Array.isArray(data.results)) {
        setCities(data.results)
        setCitiesLoaded(true)
        setRetryCount(0)
        setIsRetrying(false)
        console.log(`Successfully loaded ${data.results.length} cities`)
      } else {
        console.error("Invalid cities API response structure:", data)
        throw new Error("Invalid API response structure")
      }
    } catch (error) {
      console.error("Cities API Error:", error)
      setCitiesError(error instanceof Error ? error.message : "Failed to fetch cities")
      setIsRetrying(false)

      if (retryCount < MAX_RETRIES) {
        console.log(`Will retry cities API... Attempt ${retryCount + 1}/${MAX_RETRIES}`)
      } else {
        console.error("Max retries reached for cities API")
      }
    } finally {
      setCitiesLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchCities()
  }, [])

  // Handle manual retry logic for cities
  useEffect(() => {
    if (citiesError && retryCount < MAX_RETRIES && retryCount > 0) {
      setIsRetrying(true)
      const timeoutId = setTimeout(
        () => {
          console.log(`Retrying cities API call... Attempt ${retryCount}/${MAX_RETRIES}`)
          fetchCities()
        },
        1000 * Math.pow(2, retryCount - 1), // Exponential backoff
      )
      return () => clearTimeout(timeoutId)
    }
  }, [retryCount, citiesError])

  // Initialize city term and selected city ID from URL params
  useEffect(() => {
    if (city && cities.length > 0) {
      // Try to find city by ID first
      const cityById = cities.find((c) => String(c.id) === city)
      if (cityById) {
        setCityTerm(cityById.name)
        setSelectedCityId(cityById.id)
      } else {
        // Try to find city by name
        const cityByName = cities.find((c) => c.name.toLowerCase() === city.toLowerCase())
        if (cityByName) {
          setCityTerm(cityByName.name)
          setSelectedCityId(cityByName.id)
        } else {
          // If not found, just use the city param as display name
          setCityTerm(city)
          setSelectedCityId(null)
        }
      }
    }
  }, [city, cities])

  // Update suggestions when cities are loaded
  useEffect(() => {
    if (cities.length > 0) {
      setCitySuggestions(cities)
    }
  }, [cities])

  const searchInputRef = useRef<HTMLInputElement>(null)
  const cityInputRef = useRef<HTMLInputElement>(null)

  const filterSuggestions = (term: string, data: string[]) => {
    if (!term.trim()) return data.slice(0, 5) // Show popular searches when empty
    return data.filter((item) => item.toLowerCase().includes(term.toLowerCase())).slice(0, 8)
  }

  const filterCitySuggestions = (term: string, data: City[]) => {
    if (!term.trim()) return data.slice(0, 8) // Show first 8 cities when empty
    return data.filter((city) => city.name.toLowerCase().includes(term.toLowerCase())).slice(0, 8)
  }

  const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value
    setSearchTerm(newSearchTerm)
    setSuggestions(filterSuggestions(newSearchTerm, popularSearches))
  }

  const handleCityTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newCityTerm = event.target.value
    setCityTerm(newCityTerm)
    setSelectedCityId(null) // Reset selected city when typing
    setCitySuggestions(filterCitySuggestions(newCityTerm, cities))
  }

  const handleFocus = () => {
    setIsFocused(true)
    if (!searchTerm.trim()) {
      setSuggestions(popularSearches.slice(0, 5))
    }
  }

  const handleBlur = () => setTimeout(() => setIsFocused(false), 150)

  const handleCityFocus = () => {
    setIsCityFocused(true)
    if (!cityTerm.trim()) {
      setCitySuggestions(cities.slice(0, 8))
    }
  }

  const handleCityBlur = () => setTimeout(() => setIsCityFocused(false), 150)

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion)
    setIsFocused(false)
  }

  const handleCitySuggestionClick = (city: City) => {
    setCityTerm(city.name)
    setSelectedCityId(city.id)
    setIsCityFocused(false)
  }

  // Manual retry function for cities
  const handleCitiesRetry = () => {
    if (retryCount < MAX_RETRIES) {
      setRetryCount((prev) => prev + 1)
    }
  }

  const handleCitiesTryAgain = () => {
    setRetryCount(1)
    setIsRetrying(true)
    fetchCities()
  }

  const hasCitiesError = citiesError && retryCount >= MAX_RETRIES

  return (
    <div className="border-1 dark:border-gray-600 border-gray-200 sm:flex hidden bg-white dark:bg-bgdarktheme items  p-4 rounded-2xl transition-all duration-200 hover:shadow-xl dark:hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3)] max-w-4xl mx-auto relative items-center gap-4">
      {/* City Input */}
      <div className="relative flex-1 min-w-[180px]">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9 0C10.6569 0 12 1.34315 12 3L12.0001 4.17067C12.3128 4.06014 12.6494 4 13 4H17C18.6569 4 20 5.34315 20 7V17C20 18.6569 18.6569 20 17 20H3C1.34315 20 0 18.6569 0 17V3C0 1.34315 1.34315 0 3 0H9ZM9 2H3C2.44772 2 2 2.44772 2 3V17C2 17.5523 2.44772 18 3 18H10V3C10 2.44772 9.55229 2 9 2ZM17 6H13C12.4477 6 12 6.44772 12 7V18H17C17.5523 18 18 17.5523 18 17V7C18 6.44772 17.5523 6 17 6ZM7 12C7.55228 12 8 12.4477 8 13C8 13.5523 7.55228 14 7 14H5C4.44772 14 4 13.5523 4 13C4 12.4477 4.44772 12 5 12H7ZM16 12C16.5523 12 17 12.4477 17 13C17 13.5523 16.5523 14 16 14H14C13.4477 14 13 13.5523 13 13C13 12.4477 13.4477 12 14 12H16ZM7 8C7.55228 8 8 8.44771 8 9C8 9.55229 7.55228 10 7 10H5C4.44772 10 4 9.55229 4 9C4 8.44771 4.44772 8 5 8H7ZM16 8C16.5523 8 17 8.44771 17 9C17 9.55229 16.5523 10 16 10H14C13.4477 10 13 9.55229 13 9C13 8.44771 13.4477 8 14 8H16ZM7 4C7.55228 4 8 4.44772 8 5C8 5.55228 7.55228 6 7 6H5C4.44772 6 4 5.55228 4 5C4 4.44772 4.44772 4 5 4H7Z"
              className="fill-gray-400 dark:fill-gray-500"
            />
          </svg>
        </div>
        <input
          type="text"
          ref={cityInputRef}
          value={cityTerm}
          onChange={handleCityTermChange}
          placeholder={citiesLoading ? "Loading cities..." : "City"}
          disabled={!!citiesLoading || !!hasCitiesError}
          className="w-full pl-10 pr-4 py-3 rounded-xl  outline-none transition-all duration-200 font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-bgdarktheme2 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          onFocus={handleCityFocus}
          onBlur={handleCityBlur}
        />
        {/* City loading indicator */}
        {citiesLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 "></div>
          </div>
        )}
        {/* City suggestions dropdown */}
        {citySuggestions.length > 0 && isCityFocused && !citiesLoading && !hasCitiesError && (
          <ul
            className="absolute left-0 right-0 mt-2 bg-white dark:bg-bgdarktheme shadow-2xl dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.4)] rounded-xl overflow-hidden z-30 max-h-[200px] overflow-y-auto"
            role="listbox"
          >
            <div className="p-3  ">
              <p className="font-semibold text-bgbg-bgdarktheme dark:text-white text-sm">
                Cities {isRetrying && <span className="text-yellow-600 text-xs">(Retrying...)</span>}
              </p>
            </div>
            {citySuggestions.map((city) => (
              <li
                key={city.id}
                className="px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-bgdarktheme2 flex items-center cursor-pointer transition-colors duration-150 "
                onMouseDown={() => handleCitySuggestionClick(city)}
                role="option"
                aria-selected={cityTerm === city.name}
              >
                <span className="text-green-600 mr-3">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M9 0C10.6569 0 12 1.34315 12 3L12.0001 4.17067C12.3128 4.06014 12.6494 4 13 4H17C18.6569 4 20 5.34315 20 7V17C20 18.6569 18.6569 20 17 20H3C1.34315 20 0 18.6569 0 17V3C0 1.34315 1.34315 0 3 0H9ZM9 2H3C2.44772 2 2 2.44772 2 3V17C2 17.5523 2.44772 18 3 18H10V3C10 2.44772 9.55229 2 9 2ZM17 6H13C12.4477 6 12 6.44772 12 7V18H17C17.5523 18 18 17.5523 18 17V7C18 6.44772 17.5523 6 17 6ZM7 12C7.55228 12 8 12.4477 8 13C8 13.5523 7.55228 14 7 14H5C4.44772 14 4 13.5523 4 13C4 12.4477 4.44772 12 5 12H7ZM16 12C16.5523 12 17 12.4477 17 13C17 13.5523 16.5523 14 16 14H14C13.4477 14 13 13.5523 13 13C13 12.4477 13.4477 12 14 12H16ZM7 8C7.55228 8 8 8.44771 8 9C8 9.55229 7.55228 10 7 10H5C4.44772 10 4 9.55229 4 9C4 8.44771 4.44772 8 5 8H7ZM16 8C16.5523 8 17 8.44771 17 9C17 9.55229 16.5523 10 16 10H14C13.4477 10 13 9.55229 13 9C13 8.44771 13.4477 8 14 8H16ZM7 4C7.55228 4 8 4.44772 8 5C8 5.55228 7.55228 6 7 6H5C4.44772 6 4 5.55228 4 5C4 4.44772 4.44772 4 5 4H7Z"
                      className="fill-gray-400 dark:fill-gray-500"
                    />
                  </svg>
                </span>
                <span className="font-medium text-bgbg-bgdarktheme2 dark:text-white">{city.name}</span>
              </li>
            ))}
          </ul>
        )}
        {/* Cities error state */}
        {hasCitiesError && isCityFocused && (
          <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-bgdarktheme shadow-2xl rounded-xl overflow-hidden z-30">
            <div className="p-4 text-center">
              <p className="text-red-600 dark:text-red-400 text-sm mb-2">Failed to load cities</p>
              <button
                onClick={handleCitiesTryAgain}
                className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-10 w-px bg-gray-200 dark:bg-gray-600 mx-1"></div>

      {/* Search Input */}
      <div className="relative flex-1 min-w-[180px]">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9.91669 0.166687C15.3015 0.166687 19.6667 4.53191 19.6667 9.91669C19.6667 12.2185 18.869 14.3341 17.535 16.002L21.5161 19.984C21.9391 20.4071 21.9391 21.093 21.5161 21.5161C21.1255 21.9066 20.511 21.9366 20.086 21.6062L19.984 21.5161L16.002 17.535C14.3341 18.869 12.2185 19.6667 9.91669 19.6667C4.53191 19.6667 0.166687 15.3015 0.166687 9.91669C0.166687 4.53191 4.53191 0.166687 9.91669 0.166687ZM9.91669 2.33335C5.72853 2.33335 2.33335 5.72853 2.33335 9.91669C2.33335 14.1048 5.72853 17.5 9.91669 17.5C14.1048 17.5 17.5 14.1048 17.5 9.91669C17.5 5.72853 14.1048 2.33335 9.91669 2.33335Z"
              className="fill-gray-400 dark:fill-gray-500"
            />
          </svg>
        </div>
        <input
          type="text"
          ref={searchInputRef}
          value={searchTerm}
          onChange={handleSearchTermChange}
          placeholder="Search restaurants, cuisine..."
          className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all duration-200 font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-bgdarktheme2 text-gray-900 dark:text-white"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {/* Search suggestions dropdown */}
        {suggestions.length > 0 && isFocused && (
          <ul
            className="absolute left-0 right-0 mt-2 bg-white dark:bg-bgdarktheme shadow-2xl dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.4)] rounded-xl overflow-hidden z-50 max-h-[200px] overflow-y-auto"
            role="listbox"
          >
            <div className="p-3 ">
              <p className="font-semibold text-bgbg-bgdarktheme dark:text-white text-sm">
                {searchTerm.trim() ? "Suggestions" : "Popular Searches"}
              </p>
            </div>
            {suggestions.map((suggestion, index) => (
              <li
                key={`${suggestion}-${index}`}
                className="px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-bgdarktheme2 flex items-center cursor-pointer transition-colors duration-150 "
                onMouseDown={() => handleSuggestionClick(suggestion)}
                role="option"
                aria-selected={searchTerm === suggestion}
              >
                <span className="text-green-600 mr-3">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M9.91669 0.166687C15.3015 0.166687 19.6667 4.53191 19.6667 9.91669C19.6667 12.2185 18.869 14.3341 17.535 16.002L21.5161 19.984C21.9391 20.4071 21.9391 21.093 21.5161 21.5161C21.1255 21.9066 20.511 21.9366 20.086 21.6062L19.984 21.5161L16.002 17.535C14.3341 18.869 12.2185 19.6667 9.91669 19.6667C4.53191 19.6667 0.166687 15.3015 0.166687 9.91669C0.166687 4.53191 4.53191 0.166687 9.91669 0.166687ZM9.91669 2.33335C5.72853 2.33335 2.33335 5.72853 2.33335 9.91669C2.33335 14.1048 5.72853 17.5 9.91669 17.5C14.1048 17.5 17.5 14.1048 17.5 9.91669C17.5 5.72853 14.1048 2.33335 9.91669 2.33335Z"
                      className="fill-gray-400 dark:fill-gray-500"
                    />
                  </svg>
                </span>
                <span className="font-medium text-bgbg-bgdarktheme2 dark:text-white">{suggestion}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Search Button */}
        <Button
            variant="primary"
            className="ml-2"
            onClick={() => {
            const searchUrl = `/search?term=${encodeURIComponent(searchTerm)}&city=${encodeURIComponent(
                selectedCityId ? String(selectedCityId) : cityTerm,
            )}`
            window.location.href = searchUrl
            }}
            >
            <Link href={`/search?term=${encodeURIComponent(searchTerm)}&city=${encodeURIComponent(selectedCityId ? String(selectedCityId) : cityTerm)}`}>
            Search
            </Link>
        </Button> 
    </div>
  )
}

export default SearchBar
