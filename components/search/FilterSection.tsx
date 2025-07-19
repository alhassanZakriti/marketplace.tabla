"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { ChevronDown, X } from "lucide-react"
import { useTranslation } from "react-i18next"

export interface FilterOptions {
  categories: string[]
  priceRanges: string[]
  distance: string | null
}

interface FiltersSectionProps {
  onFiltersChange: (filters: FilterOptions) => void
  className?: string
}

const FiltersSection: React.FC<FiltersSectionProps> = ({ onFiltersChange, className = "" }) => {
  const { t } = useTranslation()
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [selectedDistance, setSelectedDistance] = useState<string | null>(null)

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
  ]

  const priceRanges = ["$", "$$", "$$$", "$$$$"]

  const distanceOptions = [
    { value: "Less than 1 Km", label: t("search.filters.distance.lessThan1Km") },
    { value: "1-3 Km", label: t("search.filters.distance.oneToThreeKm") },
    { value: "3-5 Km", label: t("search.filters.distance.threeToFiveKm") },
    { value: "5+ Km", label: t("search.filters.distance.moreThanFiveKm") },
  ]

  const getCategoryLabel = (category: string) => {
    return t(`search.filters.categories.${category.toLowerCase()}`, { defaultValue: category })
  }

  const getDistanceLabel = (distance: string) => {
    const option = distanceOptions.find((opt) => opt.value === distance)
    return option ? option.label : distance
  }

  const displayedCategories = showAllCategories ? categories : categories.slice(0, 6)

  // Send filter changes to parent component
  useEffect(() => {
    const categoryFilters = activeFilters.filter((filter) => categories.includes(filter))
    const priceFilters = activeFilters.filter((filter) => priceRanges.includes(filter))
    const filters: FilterOptions = {
      categories: categoryFilters,
      priceRanges: priceFilters,
      distance: selectedDistance,
    }
    onFiltersChange(filters)
  }, [activeFilters, selectedDistance, categories, priceRanges, onFiltersChange])

  const toggleFilter = (filter: string) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter((f) => f !== filter))
    } else {
      setActiveFilters([...activeFilters, filter])
    }
  }

  const clearFilters = () => {
    setActiveFilters([])
    setSelectedDistance(null)
  }

  const handleDistanceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setSelectedDistance(value === t("search.filters.selectDistance") ? null : value)
  }

  // Get all active filters for display
  const getAllActiveFilters = () => {
    const filters = [...activeFilters]
    if (selectedDistance) filters.push(selectedDistance)
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
          {allActiveFilters.map((filter) => (
            <div
              key={filter}
              className="bg-greentheme dark:bg-greentheme text-whitetheme px-3 py-1 rounded-full text-sm flex items-center"
            >
              {categories.includes(filter)
                ? getCategoryLabel(filter)
                : distanceOptions.some((opt) => opt.value === filter)
                  ? getDistanceLabel(filter)
                  : filter}
              <button
                onClick={() => {
                  if (distanceOptions.some((opt) => opt.value === filter)) {
                    setSelectedDistance(null)
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

      {/* Filter Groups */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <h4 className="font-medium text-blacktheme dark:text-textdarktheme mb-2">
            {t("search.filters.distance.title")}
          </h4>
          <div className="relative">
            <select
              value={selectedDistance || t("search.filters.selectDistance")}
              onChange={handleDistanceChange}
              className="w-full p-2 bg-softgreytheme dark:bg-bgdarktheme2 rounded-lg border-0 text-greytheme dark:text-textdarktheme/70 appearance-none pr-8"
            >
              <option disabled>{t("search.filters.selectDistance")}</option>
              {distanceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-greytheme dark:text-textdarktheme/50 pointer-events-none"
            />
          </div>
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
