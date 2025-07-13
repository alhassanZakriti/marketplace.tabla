"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "../ui/Button"
import { useCities } from "../../hooks/UseCities"

const SearchBarMobile = () => {
  const searchParams = useSearchParams()
  const cityParam = searchParams.get("city")
  const termParam = searchParams.get("term")

  const { cities, loading: citiesLoading, error: citiesError } = useCities()

  const [searchTerm, setSearchTerm] = useState(termParam || "")
  const [cityTerm, setCityTerm] = useState("")
  const [cityValue, setCityValue] = useState(cityParam || "City")
  const [searchValue, setSearchValue] = useState(termParam || "Search...")
  const [selectedCityId, setSelectedCityId] = useState<string | number | null>(null)
  const [isCity, setIsCity] = useState(false)
  const [isSearch, setIsSearch] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isCityFocused, setIsCityFocused] = useState(false)

  // Local data sources
  const cuisineDataSource = ["Greek", "Syrian", "Moroccan", "French", "Italian", "Pizza", "Sushi", "Burger"]

  const [citySuggestions, setCitySuggestions] = useState(cities)
  const [suggestions, setSuggestions] = useState(cuisineDataSource)

  const searchInputRef = useRef<HTMLInputElement>(null)
  const cityInputRef = useRef<HTMLInputElement>(null)

  // Initialize values from URL params
  useEffect(() => {
    if (cityParam && cities.length > 0) {
      const cityById = cities.find((c) => String(c.id) === cityParam)
      if (cityById) {
        setCityValue(cityById.name)
        setSelectedCityId(cityById.id)
      } else {
        const cityByName = cities.find((c) => c.name.toLowerCase() === cityParam.toLowerCase())
        if (cityByName) {
          setCityValue(cityByName.name)
          setSelectedCityId(cityByName.id)
        }
      }
    }
  }, [cityParam, cities])

  // Update city suggestions when cities are loaded
  useEffect(() => {
    setCitySuggestions(cities)
  }, [cities])

  const filterSuggestions = (term: string, data: string[]) => {
    if (!term.trim()) return data
    return data.filter((item) => item.toLowerCase().includes(term.toLowerCase()))
  }

  const filterCitySuggestions = (term: string, data: typeof cities) => {
    if (!term.trim()) return data
    return data.filter((city) => city.name.toLowerCase().includes(term.toLowerCase()))
  }

  const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value
    setSearchTerm(newSearchTerm)
    setSuggestions(filterSuggestions(newSearchTerm, cuisineDataSource))
  }

  const handleCityTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newCityTerm = event.target.value
    setCityTerm(newCityTerm)
    setCitySuggestions(filterCitySuggestions(newCityTerm, cities))
  }

  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => setIsFocused(false)
  const handleCityFocus = () => setIsCityFocused(true)
  const handleCityBlur = () => setIsCityFocused(false)

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion)
    setSearchValue(suggestion)
    setIsSearch(false)
    setIsFocused(false)
  }

  const handleCitySuggestionClick = (city: (typeof cities)[0]) => {
    setCityTerm(city.name)
    setCityValue(city.name)
    setSelectedCityId(city.id)
    setIsCity(false)
    setIsCityFocused(false)
  }

  // Close modals when clicking outside
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsCity(false)
        setIsSearch(false)
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [])

  return (
    <div className="p-4 sm:hidden relative bg-whitetheme dark:bg-bgdarktheme block rounded-2xl shadow-sm border border-softgreytheme dark:border-subblack transition-colors">
      {/* City Button */}
      <button
        onClick={() => setIsCity(true)}
        className="flex w-full items-center p-3 rounded-xl bg-whitetheme dark:bg-bgdarktheme2 text-blacktheme dark:text-textdarktheme border border-softgreytheme dark:border-subblack shadow-sm hover:border-greentheme/50 dark:hover:border-greentheme/30 transition-all duration-200 mb-3"
      >
        <span className="text-greentheme">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9 0C10.6569 0 12 1.34315 12 3L12.0001 4.17067C12.3128 4.06014 12.6494 4 13 4H17C18.6569 4 20 5.34315 20 7V17C20 18.6569 18.6569 20 17 20H3C1.34315 20 0 18.6569 0 17V3C0 1.34315 1.34315 0 3 0H9ZM9 2H3C2.44772 2 2 2.44772 2 3V17C2 17.5523 2.44772 18 3 18H10V3C10 2.44772 9.55229 2 9 2ZM17 6H13C12.4477 6 12 6.44772 12 7V18H17C17.5523 18 18 17.5523 18 17V7C18 6.44772 17.5523 6 17 6ZM7 12C7.55228 12 8 12.4477 8 13C8 13.5523 7.55228 14 7 14H5C4.44772 14 4 13.5523 4 13C4 12.4477 4.44772 12 5 12H7ZM16 12C16.5523 12 17 12.4477 17 13C17 13.5523 16.5523 14 16 14H14C13.4477 14 13 13.5523 13 13C13 12.4477 13.4477 12 14 12H16ZM7 8C7.55228 8 8 8.44771 8 9C8 9.55229 7.55228 10 7 10H5C4.44772 10 4 9.55229 4 9C4 8.44771 4.44772 8 5 8H7ZM16 8C16.5523 8 17 8.44771 17 9C17 9.55229 16.5523 10 16 10H14C13.4477 10 13 9.55229 13 9C13 8.44771 13.4477 8 14 8H16ZM7 4C7.55228 4 8 4.44772 8 5C8 5.55228 7.55228 6 7 6H5C4.44772 6 4 5.55228 4 5C4 4.44772 4.44772 4 5 4H7Z"
              fill="currentColor"
            />
          </svg>
        </span>
        <span className="ml-3 font-medium text-left flex-1">{cityValue}</span>
        <span className="text-greytheme dark:text-softwhitetheme">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 16L6 10H18L12 16Z" fill="currentColor" />
          </svg>
        </span>
      </button>

      {/* Search Button */}
      <button
        onClick={() => setIsSearch(true)}
        className="flex w-full items-center p-3 rounded-xl bg-whitetheme dark:bg-bgdarktheme2 text-blacktheme dark:text-textdarktheme border border-softgreytheme dark:border-subblack shadow-sm hover:border-greentheme/50 dark:hover:border-greentheme/30 transition-all duration-200 mb-3"
      >
        <span className="text-greentheme">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9.91669 0.166687C15.3015 0.166687 19.6667 4.53191 19.6667 9.91669C19.6667 12.2185 18.869 14.3341 17.535 16.002L21.5161 19.984C21.9391 20.4071 21.9391 21.093 21.5161 21.5161C21.1255 21.9066 20.511 21.9366 20.086 21.6062L19.984 21.5161L16.002 17.535C14.3341 18.869 12.2185 19.6667 9.91669 19.6667C4.53191 19.6667 0.166687 15.3015 0.166687 9.91669C0.166687 4.53191 4.53191 0.166687 9.91669 0.166687ZM9.91669 2.33335C5.72853 2.33335 2.33335 5.72853 2.33335 9.91669C2.33335 14.1048 5.72853 17.5 9.91669 17.5C14.1048 17.5 17.5 14.1048 17.5 9.91669C17.5 5.72853 14.1048 2.33335 9.91669 2.33335Z"
              fill="currentColor"
            />
          </svg>
        </span>
        <span className="ml-3 font-medium text-left flex-1">{searchValue}</span>
        <span className="text-greytheme dark:text-softwhitetheme">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 16L6 10H18L12 16Z" fill="currentColor" />
          </svg>
        </span>
      </button>

      {/* Search Action Button */}
      <Link href={`/search?city=${selectedCityId || cityValue}&term=${searchTerm}`}>
        <Button variant="primary" className="w-full">
          Search
        </Button>
      </Link>

      {/* City Modal */}
      {isCity && (
        <div className="relative">
          {/* Backdrop */}
          <div
            onClick={() => setIsCity(false)}
            className="fixed inset-0 bg-blacktheme/40 dark:bg-blacktheme/60 backdrop-blur-sm z-50 transition-opacity duration-300"
          />
          {/* Modal */}
          <div className="fixed inset-x-0 bottom-0 z-[60] rounded-t-3xl bg-whitetheme dark:bg-bgdarktheme shadow-2xl dark:shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.3)] max-h-[85vh] overflow-hidden transition-transform duration-300 transform border-t border-softgreytheme dark:border-subblack">
            {/* Modal Header */}
            <div className="sticky top-0 bg-whitetheme dark:bg-bgdarktheme z-10 px-5 py-4 border-b border-softgreytheme dark:border-subblack flex items-center justify-between">
              <h1 className="text-xl font-bold text-blacktheme dark:text-textdarktheme">Select City</h1>
              <button
                onClick={() => setIsCity(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-softgreytheme dark:bg-bgdarktheme2 text-greytheme dark:text-softwhitetheme hover:bg-softgreentheme dark:hover:bg-greentheme/20 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            {/* Modal Content */}
            <div className="p-5 overflow-y-auto max-h-[calc(85vh-70px)] bg-whitetheme dark:bg-bgdarktheme">
              {/* Search Input */}
              <div className="relative mb-4">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-greentheme">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M9 0C10.6569 0 12 1.34315 12 3L12.0001 4.17067C12.3128 4.06014 12.6494 4 13 4H17C18.6569 4 20 5.34315 20 7V17C20 18.6569 18.6569 20 17 20H3C1.34315 20 0 18.6569 0 17V3C0 1.34315 1.34315 0 3 0H9ZM9 2H3C2.44772 2 2 2.44772 2 3V17C2 17.5523 2.44772 18 3 18H10V3C10 2.44772 9.55229 2 9 2ZM17 6H13C12.4477 6 12 6.44772 12 7V18H17C17.5523 18 18 17.5523 18 17V7C18 6.44772 17.5523 6 17 6ZM7 12C7.55228 12 8 12.4477 8 13C8 13.5523 7.55228 14 7 14H5C4.44772 14 4 13.5523 4 13C4 12.4477 4.44772 12 5 12H7ZM16 12C16.5523 12 17 12.4477 17 13C17 13.5523 16.5523 14 16 14H14C13.4477 14 13 13.5523 13 13C13 12.4477 13.4477 12 14 12H16ZM7 8C7.55228 8 8 8.44771 8 9C8 9.55229 7.55228 10 7 10H5C4.44772 10 4 9.55229 4 9C4 8.44771 4.44772 8 5 8H7ZM16 8C16.5523 8 17 8.44771 17 9C17 9.55229 16.5523 10 16 10H14C13.4477 10 13 9.55229 13 9C13 8.44771 13.4477 8 14 8H16ZM7 4C7.55228 4 8 4.44772 8 5C8 5.55228 7.55228 6 7 6H5C4.44772 6 4 5.55228 4 5C4 4.44772 4.44772 4 5 4H7Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  ref={cityInputRef}
                  value={cityTerm}
                  onChange={handleCityTermChange}
                  placeholder={citiesLoading ? "Loading cities..." : "Search city..."}
                  onFocus={handleCityFocus}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-softgreytheme dark:border-subblack focus:border-greentheme focus:ring-2 focus:ring-softgreentheme outline-none transition-all bg-whitetheme dark:bg-bgdarktheme2 text-blacktheme dark:text-textdarktheme placeholder:text-greytheme dark:placeholder:text-softwhitetheme"
                />
              </div>
              {/* Suggestions List */}
              <div className="mt-2">
                <h3 className="font-semibold text-blacktheme dark:text-textdarktheme mb-2 px-1">
                  Cities {citiesLoading && <span className="text-sm text-greytheme">(Loading...)</span>}
                </h3>
                <ul className="space-y-1" role="listbox">
                  {citySuggestions.map((city) => (
                    <li
                      key={city.id}
                      className="px-3 py-3 hover:bg-softgreytheme dark:hover:bg-bgdarktheme2 flex items-center cursor-pointer rounded-xl transition-colors duration-150"
                      onMouseDown={() => handleCitySuggestionClick(city)}
                      role="option"
                      aria-selected={cityTerm === city.name}
                    >
                      <span className="text-greentheme mr-3 flex-shrink-0">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M9 0C10.6569 0 12 1.34315 12 3L12.0001 4.17067C12.3128 4.06014 12.6494 4 13 4H17C18.6569 4 20 5.34315 20 7V17C20 18.6569 18.6569 20 17 20H3C1.34315 20 0 18.6569 0 17V3C0 1.34315 1.34315 0 3 0H9ZM9 2H3C2.44772 2 2 2.44772 2 3V17C2 17.5523 2.44772 18 3 18H10V3C10 2.44772 9.55229 2 9 2ZM17 6H13C12.4477 6 12 6.44772 12 7V18H17C17.5523 18 18 17.5523 18 17V7C18 6.44772 17.5523 6 17 6ZM7 12C7.55228 12 8 12.4477 8 13C8 13.5523 7.55228 14 7 14H5C4.44772 14 4 13.5523 4 13C4 12.4477 4.44772 12 5 12H7ZM16 12C16.5523 12 17 12.4477 17 13C17 13.5523 16.5523 14 16 14H14C13.4477 14 13 13.5523 13 13C13 12.4477 13.4477 12 14 12H16ZM7 8C7.55228 8 8 8.44771 8 9C8 9.55229 7.55228 10 7 10H5C4.44772 10 4 9.55229 4 9C4 8.44771 4.44772 8 5 8H7ZM16 8C16.5523 8 17 8.44771 17 9C17 9.55229 16.5523 10 16 10H14C13.4477 10 13 9.55229 13 9C13 8.44771 13.4477 8 14 8H16ZM7 4C7.55228 4 8 4.44772 8 5C8 5.55228 7.55228 6 7 6H5C4.44772 6 4 5.55228 4 5C4 4.44772 4.44772 4 5 4H7Z"
                            fill="currentColor"
                          />
                        </svg>
                      </span>
                      <span className="font-medium text-blacktheme dark:text-textdarktheme">{city.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {isSearch && (
        <div className="relative">
          {/* Backdrop */}
          <div
            onClick={() => setIsSearch(false)}
            className="fixed inset-0 bg-blacktheme/40 dark:bg-blacktheme/60 backdrop-blur-sm z-50 transition-opacity duration-300"
          />
          {/* Modal */}
          <div className="fixed inset-x-0 bottom-0 z-[60] rounded-t-3xl bg-whitetheme dark:bg-bgdarktheme shadow-2xl dark:shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.3)] max-h-[85vh] overflow-hidden transition-transform duration-300 transform border-t border-softgreytheme dark:border-subblack">
            {/* Modal Header */}
            <div className="sticky top-0 bg-whitetheme dark:bg-bgdarktheme z-10 px-5 py-4 border-b border-softgreytheme dark:border-subblack flex items-center justify-between">
              <h1 className="text-xl font-bold text-blacktheme dark:text-textdarktheme">Search</h1>
              <button
                onClick={() => setIsSearch(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-softgreytheme dark:bg-bgdarktheme2 text-greytheme dark:text-softwhitetheme hover:bg-softgreentheme dark:hover:bg-greentheme/20 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            {/* Modal Content */}
            <div className="p-5 overflow-y-auto max-h-[calc(85vh-70px)] bg-whitetheme dark:bg-bgdarktheme">
              {/* Search Input */}
              <div className="relative mb-4">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-greentheme">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M9.91669 0.166687C15.3015 0.166687 19.6667 4.53191 19.6667 9.91669C19.6667 12.2185 18.869 14.3341 17.535 16.002L21.5161 19.984C21.9391 20.4071 21.9391 21.093 21.5161 21.5161C21.1255 21.9066 20.511 21.9366 20.086 21.6062L19.984 21.5161L16.002 17.535C14.3341 18.869 12.2185 19.6667 9.91669 19.6667C4.53191 19.6667 0.166687 15.3015 0.166687 9.91669C0.166687 4.53191 4.53191 0.166687 9.91669 0.166687ZM9.91669 2.33335C5.72853 2.33335 2.33335 5.72853 2.33335 9.91669C2.33335 14.1048 5.72853 17.5 9.91669 17.5C14.1048 17.5 17.5 14.1048 17.5 9.91669C17.5 5.72853 14.1048 2.33335 9.91669 2.33335Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  ref={searchInputRef}
                  value={searchTerm}
                  onChange={handleSearchTermChange}
                  placeholder="Search restaurants, cuisine..."
                  onFocus={handleFocus}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-softgreytheme dark:border-subblack focus:border-greentheme focus:ring-2 focus:ring-softgreentheme outline-none transition-all bg-whitetheme dark:bg-bgdarktheme2 text-blacktheme dark:text-textdarktheme placeholder:text-greytheme dark:placeholder:text-softwhitetheme"
                />
              </div>
              {/* Suggestions List */}
              <div className="mt-2">
                <h3 className="font-semibold text-blacktheme dark:text-textdarktheme mb-2 px-1">Suggestions</h3>
                <ul className="space-y-1" role="listbox">
                  {suggestions.map((suggestion) => (
                    <li
                      key={suggestion}
                      className="px-3 py-3 hover:bg-softgreytheme dark:hover:bg-bgdarktheme2 flex items-center cursor-pointer rounded-xl transition-colors duration-150"
                      onMouseDown={() => handleSuggestionClick(suggestion)}
                      role="option"
                      aria-selected={searchTerm === suggestion}
                    >
                      <span className="text-greentheme mr-3 flex-shrink-0">
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M9.91669 0.166687C15.3015 0.166687 19.6667 4.53191 19.6667 9.91669C19.6667 12.2185 18.869 14.3341 17.535 16.002L21.5161 19.984C21.9391 20.4071 21.9391 21.093 21.5161 21.5161C21.1255 21.9066 20.511 21.9366 20.086 21.6062L19.984 21.5161L16.002 17.535C14.3341 18.869 12.2185 19.6667 9.91669 19.6667C4.53191 19.6667 0.166687 15.3015 0.166687 9.91669C0.166687 4.53191 4.53191 0.166687 9.91669 0.166687ZM9.91669 2.33335C5.72853 2.33335 2.33335 5.72853 2.33335 9.91669C2.33335 14.1048 5.72853 17.5 9.91669 17.5C14.1048 17.5 17.5 14.1048 17.5 9.91669C17.5 5.72853 14.1048 2.33335 9.91669 2.33335Z"
                            fill="currentColor"
                          />
                        </svg>
                      </span>
                      <span className="font-medium text-blacktheme dark:text-textdarktheme">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchBarMobile
