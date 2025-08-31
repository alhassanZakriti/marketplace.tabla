"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "../ui/Button"
import { 
  Building, Pin, Table, MapPin, Search, SearchCheck, SearchIcon, 
  LocationEdit, Navigation, Building2, SeparatorHorizontal, Store,
  Utensils, Gift, ChefHat, Calendar, Heart, Star
} from "lucide-react"

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

interface Suggestion {
  id: string | number
  word: string
  category: 'Cuisine' | 'Offer' | 'Dish' | 'Moments' | 'Recommended by Tabla.ma'
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
  const [cityTerm, setCityTerm] = useState("Casablanca")
  const [selectedCityId, setSelectedCityId] = useState<string | number | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [isCityFocused, setIsCityFocused] = useState(false)

  // Search suggestions with categories
  const searchSuggestions: Suggestion[] = [
    // Cuisine suggestions
    { id: 17, word: "Date Night", category: "Moments" },
    { id: 25, word: "Rooftop", category: "Recommended by Tabla.ma" },
    { id: 1, word: "Italian", category: "Cuisine" },
    { id: 12, word: "Ramen", category: "Dish" },
    { id: 10, word: "Pasta", category: "Dish" },
    { id: 18, word: "Business Lunch", category: "Moments" },
    { id: 3, word: "Mexican", category: "Cuisine" },
    { id: 4, word: "Japanese", category: "Cuisine" },
    { id: 5, word: "French", category: "Cuisine" },
    
    // Dish suggestions
    { id: 7, word: "Pizza", category: "Dish" },
    { id: 8, word: "Sushi", category: "Dish" },
    { id: 15, word: "Weekend Special", category: "Offer" },
    { id: 11, word: "Tacos", category: "Dish" },
    
    // Offer suggestions
    { id: 13, word: "Happy Hour", category: "Offer" },
    { id: 6, word: "Mediterranean", category: "Cuisine" },
    { id: 22, word: "Seafood", category: "Recommended by Tabla.ma" },
    { id: 14, word: "Lunch Deal", category: "Offer" },
    { id: 16, word: "Family Package", category: "Offer" },
    
    { id: 2, word: "Chinese", category: "Cuisine" },
    // Moments suggestions
    { id: 19, word: "Family Dinner", category: "Moments" },
    { id: 24, word: "Fine Dining", category: "Recommended by Tabla.ma" },
    { id: 20, word: "Birthday Celebration", category: "Moments" },
    { id: 23, word: "Vegetarian", category: "Recommended by Tabla.ma" },
    { id: 21, word: "Anniversary", category: "Moments" },
    
    // Recommended by Tabla.ma
    { id: 26, word: "Live Music", category: "Recommended by Tabla.ma" },
    { id: 9, word: "Burger", category: "Dish" }
  ]

  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [citySuggestions, setCitySuggestions] = useState<City[]>([])
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [selectedCitySuggestionIndex, setSelectedCitySuggestionIndex] = useState(-1)

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
      // Handle "Near me" special case
      if (city === 'near-me' || city.toLowerCase() === 'near me') {
        setCityTerm('Near me')
        setSelectedCityId('near-me')
        return
      }
      
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

  const filterSuggestions = (term: string, data: Suggestion[]) => {
    if (!term.trim()) return data.slice(0, 5) // Show popular searches when empty
    return data.filter((item) => item.word.toLowerCase().includes(term.toLowerCase())).slice(0, 8)
  }

  const filterCitySuggestions = (term: string, data: City[]) => {
    const filteredCities = !term.trim() 
      ? data.slice(0, 8) // Show first 8 cities when empty
      : data.filter((city) => city.name.toLowerCase().includes(term.toLowerCase())).slice(0, 8)
    
    // Create "Near me" option
    const nearMeOption: City = {
      id: 'near-me',
      name: 'Near me',
      image: null,
      boundary: null,
      country: 'current-location'
    }
    
    // Add "Near me" at the top if search term is empty or matches "near"
    if (!term.trim() || 'near me'.includes(term.toLowerCase())) {
      return [nearMeOption, ...filteredCities]
    }
    
    return filteredCities
  }

  const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value
    setSearchTerm(newSearchTerm)
    setSelectedSuggestionIndex(-1)
    setSuggestions(filterSuggestions(newSearchTerm, searchSuggestions))
  }

  const handleCityTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newCityTerm = event.target.value
    setCityTerm(newCityTerm)
    setSelectedCityId(null) // Reset selected city when typing
    setSelectedCitySuggestionIndex(-1)
    setCitySuggestions(filterCitySuggestions(newCityTerm, cities))
  }

  // Handle Enter key press for search input
  const handleSearchKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
        // Select the highlighted suggestion
        const selectedSuggestion = suggestions[selectedSuggestionIndex]
        setSearchTerm(selectedSuggestion.word)
        setIsFocused(false)
        setTimeout(() => performSearch(selectedSuggestion.word), 100)
      } else {
        // Perform search with current input
        setIsFocused(false)
        performSearch()
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      setSelectedSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      )
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setSelectedSuggestionIndex(prev => prev > -1 ? prev - 1 : -1)
    } else if (event.key === 'Escape') {
      setIsFocused(false)
      setSelectedSuggestionIndex(-1)
    }
  }

  // Handle Enter key press for city input
  const handleCityKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      if (selectedCitySuggestionIndex >= 0 && selectedCitySuggestionIndex < citySuggestions.length) {
        // Select the highlighted city suggestion
        const selectedCity = citySuggestions[selectedCitySuggestionIndex]
        if (selectedCity.id === 'near-me') {
          setCityTerm('Near me')
          setSelectedCityId('near-me')
        } else {
          setCityTerm(selectedCity.name)
          setSelectedCityId(selectedCity.id)
        }
        setIsCityFocused(false)
        setTimeout(() => {
          if (searchInputRef.current) {
            searchInputRef.current.focus()
          }
        }, 100)
      } else if (citySuggestions.length > 0) {
        // Select the first matching city suggestion
        const firstMatch = citySuggestions[0]
        if (firstMatch.id === 'near-me') {
          setCityTerm('Near me')
          setSelectedCityId('near-me')
        } else {
          setCityTerm(firstMatch.name)
          setSelectedCityId(firstMatch.id)
        }
        setIsCityFocused(false)
        setTimeout(() => {
          if (searchInputRef.current) {
            searchInputRef.current.focus()
          }
        }, 100)
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      setSelectedCitySuggestionIndex(prev => 
        prev < citySuggestions.length - 1 ? prev + 1 : prev
      )
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setSelectedCitySuggestionIndex(prev => prev > -1 ? prev - 1 : -1)
    } else if (event.key === 'Escape') {
      setIsCityFocused(false)
      setSelectedCitySuggestionIndex(-1)
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
    setSelectedSuggestionIndex(-1)
    if (!searchTerm.trim()) {
      setSuggestions(searchSuggestions.slice(0, 26))
    }
  }

  const handleBlur = () => setTimeout(() => {
    setIsFocused(false)
    setSelectedSuggestionIndex(-1)
  }, 150)

  const handleCityFocus = () => {
    setIsCityFocused(true)
    setSelectedCitySuggestionIndex(-1)
    if (!cityTerm.trim()) {
      setCitySuggestions(cities.slice(0, 8))
    }
  }

  const handleCityBlur = () => setTimeout(() => {
    setIsCityFocused(false)
    setSelectedCitySuggestionIndex(-1)
  }, 150)

  // Function to perform search navigation
  const performSearch = (searchValue: string = searchTerm, cityValue: string | number = selectedCityId || cityTerm) => {
    const searchUrl = `/search?term=${encodeURIComponent(searchValue)}&city=${encodeURIComponent(String(cityValue))}`
    window.location.href = searchUrl
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setSearchTerm(suggestion.word)
    setIsFocused(false)
    
    // Automatically perform search when suggestion is selected
    setTimeout(() => {
      performSearch(suggestion.word)
    }, 100)
  }

  const handleCitySuggestionClick = (city: City) => {
    // Handle "Near me" option
    if (city.id === 'near-me') {
      setCityTerm('Near me')
      setSelectedCityId('near-me')
      setIsCityFocused(false)
      
      // Automatically focus the search input after city selection
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus()
        }
      }, 100)
      return
    }
    
    // Handle regular city selection
    setCityTerm(city.name)
    setSelectedCityId(city.id)
    setIsCityFocused(false)
    
    // Automatically focus the search input after city selection
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus()
      }
    }, 100)
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
      <div className="relative flex-1 cursor-pointer min-w-[180px]">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-greentheme">
          <Building2 className="w-5 h-5" />
        </div>
        <input
          type="text"
          ref={cityInputRef}
          value={cityTerm}
          onChange={handleCityTermChange}
          onKeyPress={handleCityKeyPress}
          placeholder={citiesLoading ? "Loading cities..." : "City"}
          disabled={!!citiesLoading || !!hasCitiesError}
          className="w-full pl-10 pr-4 py-3 cursor-pointer rounded-xl  outline-none transition-all duration-200 font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-bgdarktheme2 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
            <li className="px-3 py-2.5 hover:bg-softgreentheme flex items-center cursor-pointer transition-colors duration-150">
              <Navigation className="w-5 h-5 mr-3 text-greentheme" />
              <span className="font-medium  dark:text-white">Near Me</span>
            </li>
            <div className="px-3 py-1">
              <p className="font-semibold text-bgdarktheme bg-bgdarktheme dark:text-white text-left text-sm">
                {cityTerm.trim() ? "Search Results" : "Locations"} {isRetrying && <span className="text-yellow-600 text-xs">(Retrying...)</span>}
              </p>
            </div>
            {citySuggestions.map((city, index) => (
              <li
                key={city.id}
                className={`px-3 py-2.5 flex items-center cursor-pointer transition-colors duration-150 ${
                  index === selectedCitySuggestionIndex 
                    ? 'bg-green-50 dark:bg-green-900/20' 
                    : 'hover:bg-gray-50 dark:hover:bg-bgdarktheme2'
                } ${city.id === 'near-me' ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}
                onMouseDown={() => handleCitySuggestionClick(city)}
                onMouseEnter={() => setSelectedCitySuggestionIndex(index)}
                role="option"
                aria-selected={cityTerm === city.name}
              >
                <span className="text-greentheme mr-3">
                  {city.id === 'near-me' ? <LocationEdit className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                </span>
                <span className={`font-medium ${
                  city.id === 'near-me' 
                    ? 'text-green-600 dark:text-green-400 font-semibold' 
                    : 'text-bgbg-bgdarktheme2 dark:text-white'
                }`}>
                  {city.name}
                </span>
                {city.id === 'near-me' && (
                  <span className="ml-auto text-sm text-green-600 dark:text-green-400 font-medium">
                    Use current location
                  </span>
                )}
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
      <div className="relative flex-1 cursor-pointer min-w-[180px]">
        <div className="absolute left-3  top-1/2 -translate-y-1/2 text-greentheme">
          <SearchIcon />
        </div>
        <input
          type="text"
          ref={searchInputRef}
          value={searchTerm}
          onChange={handleSearchTermChange}
          onKeyPress={handleSearchKeyPress}
          placeholder="Search restaurants, cuisine..."
          className="w-full pl-10 pr-4 py-3 cursor-pointer rounded-xl outline-none transition-all duration-200 font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-bgdarktheme2 text-gray-900 dark:text-white"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {/* Search suggestions dropdown */}
        {suggestions.length > 0 && isFocused && (
          <ul
            className="absolute left-0 right-0 mt-2 bg-white dark:bg-bgdarktheme shadow-2xl dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.4)] rounded-xl overflow-hidden z-50 max-h-[200px] overflow-y-auto"
            role="listbox"
          >
            <li className="px-3 py-2.5 hover:bg-softgreentheme flex items-center cursor-pointer transition-colors duration-150">
              <Store className="w-5 h-5 mr-3 text-greentheme" />
              <span className="font-medium  dark:text-white">View All Restaurants</span>
            </li>
            <div className="p-3 ">
              <p className="font-semibold text-left text-bgbg-bgdarktheme dark:text-white text-sm">
                {searchTerm.trim() ? "Suggestions" : "Trending on Tabla.ma"}
              </p>
            </div>
            {suggestions.map((suggestion, index) => {
              // Select icon based on category
              let IconComponent = Star; // Default icon
              switch (suggestion.category) {
                case 'Cuisine':
                  IconComponent = Utensils;
                  break;
                case 'Offer':
                  IconComponent = Gift;
                  break;
                case 'Dish':
                  IconComponent = ChefHat;
                  break;
                case 'Moments':
                  IconComponent = Calendar;
                  break;
                case 'Recommended by Tabla.ma':
                  IconComponent = Heart;
                  break;
                default:
                  IconComponent = Star;
              }

              return (
                <li
                  key={`${suggestion.id}-${index}`}
                  className={`px-3 py-2.5 flex items-center cursor-pointer transition-colors duration-150 ${
                    index === selectedSuggestionIndex 
                      ? 'bg-green-50 dark:bg-green-900/20' 
                      : 'hover:bg-gray-50 dark:hover:bg-bgdarktheme2'
                  }`}
                  onMouseDown={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => setSelectedSuggestionIndex(index)}
                  role="option"
                  aria-selected={searchTerm === suggestion.word}
                >
                  <span className="text-greentheme mr-3">
                    <IconComponent />
                  </span>
                  <span className="font-medium text-bgbg-bgdarktheme2 dark:text-white">{suggestion.word}</span>
                  <span className="text-xs text-gray-500 ml-auto">{suggestion.category}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Search Button */}
        <Button
            variant="primary"
            className="ml-2"
            onClick={() => performSearch()}
            >
            Search
        </Button> 
    </div>
  )
}

export default SearchBar
