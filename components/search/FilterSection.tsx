"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { ChevronDown, X, MapPin, Calendar, Clock, Users } from "lucide-react"
import { useTranslation } from "react-i18next"
import useGeolocation from "@/hooks/useGeolocation"

export interface FilterOptions {
  categories: string[]
  priceRanges: string[]
  distanceMin: number | null
  distanceMax: number | null
  date: string | null
  time: string | null
  partySize: number | null
  ordering: string
}

interface FiltersSectionProps {
  onFiltersChange: (filters: FilterOptions) => void
  className?: string
  availabilityData?: {
    date: string
    time: string
    guests: number
  }
}

const FiltersSection: React.FC<FiltersSectionProps> = ({ 
  onFiltersChange, 
  className = "",
  availabilityData 
}) => {
  const { t } = useTranslation()
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [distanceMin, setDistanceMin] = useState<number | null>(null)
  const [distanceMax, setDistanceMax] = useState<number | null>(null)
  const [ordering, setOrdering] = useState<string>("distance")

  // Get user location for distance-based filtering
  const { coords } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 300000,
    autoRequest: true,
    storageKey: "tabla_user_location"
  })

  const categories = [
    "Italian",
    "Japanese", 
    "Mexican",
    "Chinese",
    "American",
    "Indian",
    "Thai",
    "Mediterranean",
    "French",
    "Vegetarian",
    "Moroccan",
    "Arabic",
    "European",
    "Asian",
    "Seafood",
    "Steakhouse"
  ]

  const priceRanges = ["$", "$$", "$$$", "$$$$"]

  const orderingOptions = [
    { value: "distance", label: t("search.filters.ordering.distance", "Distance") },
    { value: "rating", label: t("search.filters.ordering.rating", "Rating") },
    { value: "price_asc", label: t("search.filters.ordering.priceLowToHigh", "Price: Low to High") },
    { value: "price_desc", label: t("search.filters.ordering.priceHighToLow", "Price: High to Low") },
    { value: "name", label: t("search.filters.ordering.name", "Name") },
  ]

  const getCategoryLabel = (category: string) => {
    return t(`search.filters.categories.${category.toLowerCase()}`, { defaultValue: category })
  }

  const displayedCategories = showAllCategories ? categories : categories.slice(0, 6)

  // Send filter changes to parent component
  useEffect(() => {
    const categoryFilters = activeFilters.filter((filter) => categories.includes(filter))
    const priceFilters = activeFilters.filter((filter) => priceRanges.includes(filter))
    const filters: FilterOptions = {
      categories: categoryFilters,
      priceRanges: priceFilters,
      distanceMin,
      distanceMax,
      date: availabilityData?.date || null,
      time: availabilityData?.time || null,
      partySize: availabilityData?.guests || null,
      ordering,
    }
    onFiltersChange(filters)
  }, [activeFilters, distanceMin, distanceMax, ordering, availabilityData, categories, priceRanges, onFiltersChange])

  const toggleFilter = (filter: string) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter((f) => f !== filter))
    } else {
      setActiveFilters([...activeFilters, filter])
    }
  }

  const clearFilters = () => {
    setActiveFilters([])
    setDistanceMin(null)
    setDistanceMax(null)
    setOrdering("distance")
  }

  const handleDistanceMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setDistanceMin(value ? parseFloat(value) : null)
  }

  const handleDistanceMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setDistanceMax(value ? parseFloat(value) : null)
  }

  const handleOrderingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOrdering(e.target.value)
  }

  // Get all active filters for display
  const getAllActiveFilters = () => {
    const filters = [...activeFilters]
    if (distanceMin !== null || distanceMax !== null) {
      const distanceLabel = distanceMin !== null && distanceMax !== null 
        ? `${distanceMin}-${distanceMax} km`
        : distanceMin !== null 
        ? `>${distanceMin} km`
        : `<${distanceMax} km`
      filters.push(distanceLabel)
    }
    if (availabilityData?.date) {
      filters.push(`${availabilityData.date}`)
    }
    if (availabilityData?.time) {
      filters.push(`${availabilityData.time}`)
    }
    if (availabilityData?.guests) {
      filters.push(`${availabilityData.guests} guests`)
    }
    return filters
  }

  const allActiveFilters = getAllActiveFilters()

  return (
    <div className={`bg-whitetheme dark:bg-darkthemeitems rounded-xl shadow-sm p-4 transition-colors ${className}`}>
      <div className="flex flex-wrap items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-blacktheme dark:text-textdarktheme mb-2 sm:mb-0">
          {t("search.filters.title")}
        </h3>
        {allActiveFilters.length > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-redtheme hover:underline flex items-center"
            aria-label={t("search.filters.clearAllFilters")}
          >
            <X size={16} className="mr-1" />
            {t("search.filters.clearAllFilters")}
          </button>
        )}
      </div>

      {/* Active Filters */}
      {allActiveFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {allActiveFilters.map((filter, index) => (
            <div
              key={`${filter}-${index}`}
              className="bg-greentheme dark:bg-greentheme text-whitetheme px-3 py-1 rounded-full text-sm flex items-center"
            >
              {categories.includes(filter) ? getCategoryLabel(filter) : filter}
              <button
                onClick={() => {
                  if (filter.includes('km')) {
                    setDistanceMin(null)
                    setDistanceMax(null)
                  } else if (filter.includes('guests') || filter.includes('-') || filter.includes(':')) {
                    // These are availability filters, can't be individually removed
                  } else {
                    toggleFilter(filter)
                  }
                }}
                className="ml-2"
                aria-label={t("search.filters.removeFilter", { filter: filter })}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Availability Display */}
      {(availabilityData?.date || availabilityData?.time || availabilityData?.guests) && (
        <div className="mb-4 p-3 bg-softgreytheme dark:bg-bgdarktheme2 rounded-lg">
          <h4 className="font-medium text-blacktheme dark:text-textdarktheme mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            {t("search.filters.availability", "Availability")}
          </h4>
          <div className="flex flex-wrap gap-4 text-sm text-greytheme dark:text-textdarktheme/70">
            {availabilityData.date && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {availabilityData.date}
              </div>
            )}
            {availabilityData.time && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {availabilityData.time}
              </div>
            )}
            {availabilityData.guests && (
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {availabilityData.guests} {t("common.guests", "guests")}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Categories */}
        <div>
          <h4 className="font-medium text-blacktheme dark:text-textdarktheme mb-2">
            {t("search.filters.categories.title")}
          </h4>
          <div className="flex flex-wrap gap-2">
            {displayedCategories.map((category) => (
              <button
                key={category}
                onClick={() => toggleFilter(category)}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeFilters.includes(category)
                    ? "bg-greentheme text-white"
                    : "bg-softgreytheme dark:bg-bgdarktheme2 text-greytheme dark:text-textdarktheme/70 hover:bg-softgreytheme dark:hover:bg-bgdarktheme"
                }`}
                aria-pressed={activeFilters.includes(category)}
              >
                {getCategoryLabel(category)}
              </button>
            ))}
            {categories.length > 6 && (
              <button
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="text-sm text-greentheme hover:underline"
                aria-expanded={showAllCategories}
              >
                {showAllCategories ? t("search.filters.showLess") : t("search.filters.showMore")}
              </button>
            )}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h4 className="font-medium text-blacktheme dark:text-textdarktheme mb-2">{t("search.filters.priceRange")}</h4>
          <div className="flex gap-2">
            {priceRanges.map((price) => (
              <button
                key={price}
                onClick={() => toggleFilter(price)}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeFilters.includes(price)
                    ? "bg-greentheme text-white"
                    : "bg-softgreytheme dark:bg-bgdarktheme2 text-greytheme dark:text-textdarktheme/70 hover:bg-softgreytheme dark:hover:bg-bgdarktheme"
                }`}
                aria-pressed={activeFilters.includes(price)}
              >
                {price}
              </button>
            ))}
          </div>
        </div>

        {/* Distance */}
        <div>
          <h4 className="font-medium text-blacktheme dark:text-textdarktheme mb-2 flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {t("search.filters.distance.title", "Distance")}
          </h4>
          {coords ? (
            <div className="space-y-2">
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  value={distanceMin || ""}
                  onChange={handleDistanceMinChange}
                  className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-bgdarktheme2 text-blacktheme dark:text-textdarktheme"
                  min="0"
                  step="0.5"
                />
                <span className="text-sm text-greytheme dark:text-textdarktheme/70">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={distanceMax || ""}
                  onChange={handleDistanceMaxChange}
                  className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-bgdarktheme2 text-blacktheme dark:text-textdarktheme"
                  min="0"
                  step="0.5"
                />
                <span className="text-sm text-greytheme dark:text-textdarktheme/70">km</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-greytheme dark:text-textdarktheme/70">
              {t("search.filters.distance.enableLocation", "Enable location to filter by distance")}
            </p>
          )}
        </div>

        {/* Ordering */}
        <div>
          <h4 className="font-medium text-blacktheme dark:text-textdarktheme mb-2">
            {t("search.filters.ordering.title", "Sort By")}
          </h4>
          <select
            value={ordering}
            onChange={handleOrderingChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-bgdarktheme2 text-blacktheme dark:text-textdarktheme focus:outline-none focus:ring-2 focus:ring-greentheme"
          >
            {orderingOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* More Filters (Mobile Accordion) */}
      <div className="mt-4 md:hidden">
        <button
          className="flex items-center justify-between w-full p-2 bg-softgreytheme dark:bg-bgdarktheme2 rounded-lg text-greytheme dark:text-textdarktheme/70"
          aria-expanded="false"
        >
          <span>{t("search.filters.moreFilters")}</span>
          <ChevronDown size={16} />
        </button>
      </div>
    </div>
  )
}

export default FiltersSection
