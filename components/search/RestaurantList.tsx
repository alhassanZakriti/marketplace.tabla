"use client"
import type React from "react"
import { Star, Clock } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"
import PlaceHolder from "../../public/placeholder-300x200.png"
import { useTranslation } from "react-i18next"

interface Restaurant {
  id: string | number
  name: string
  address: string
  distance: number | null
  rating: number | null
  status: "Closed" | "Open"
  main_image: string | null
  location: [number, number] | null
  imageUrl?: string
  category?: string
  isOpen?: boolean
  priceRange?: string
  coordinates?: { lat: number; lng: number }
}

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

interface RestaurantListProps {
  restaurants: Restaurant[]
  onHover: (id: string) => void
  selectedRestaurantId?: string | null
  filtersChosen: FilterOptions
  availabilityData?: Record<string, any>
  availabilityLoading?: boolean
  isRestaurantAvailable?: (restaurantId: string | number, time?: string) => boolean
}

const RestaurantList: React.FC<RestaurantListProps> = ({ 
  restaurants, 
  filtersChosen, 
  onHover,
  selectedRestaurantId,
  availabilityData,
  availabilityLoading,
  isRestaurantAvailable
}) => {
  const { t } = useTranslation()

  // Helper functions for safe data access
  const getSafeRating = (rating: number | null): number => {
    return rating ?? 0
  }

  const getSafeDistance = (distance: number | null): string => {
    return distance ? distance.toFixed(1) : t("search.restaurantList.notAvailable")
  }

  const getSafeImageUrl = (imageUrl: string | null | undefined): string => {
    return imageUrl || PlaceHolder.src
  }

  const getSafeCategory = (category: string | undefined): string => {
    return category || t("search.restaurantList.defaultCategory")
  }

  const getSafePriceRange = (priceRange: string | undefined): string => {
    return priceRange || "$$"
  }

  const getIsOpen = (status: "Closed" | "Open", isOpen?: boolean): boolean => {
    return isOpen !== undefined ? isOpen : status === "Open"
  }

  const getCategoryLabel = (category: string) => {
    return t(`search.filters.categories.${category.toLowerCase()}`, { defaultValue: category })
  }

  // Enhanced filtering logic
  const filteredRestaurants = restaurants.filter((restaurant) => {
    // Category filter
    const restaurantCategory = getSafeCategory(restaurant.category)
    const matchesCategory =
      filtersChosen.categories.length === 0 || filtersChosen.categories.includes(restaurantCategory)

    // Price range filter
    const restaurantPriceRange = getSafePriceRange(restaurant.priceRange)
    const matchesPriceRange =
      filtersChosen.priceRanges.length === 0 || filtersChosen.priceRanges.includes(restaurantPriceRange)

    // Distance filter - check if restaurant distance is within specified range
    let matchesDistance = true
    if ((filtersChosen.distanceMin !== null || filtersChosen.distanceMax !== null) && restaurant.distance !== null) {
      if (filtersChosen.distanceMin !== null && restaurant.distance < filtersChosen.distanceMin) {
        matchesDistance = false
      }
      if (filtersChosen.distanceMax !== null && restaurant.distance > filtersChosen.distanceMax) {
        matchesDistance = false
      }
    }

    // Availability filter - check if restaurant is available for selected date/time
    let matchesAvailability = true
    if (filtersChosen.date && filtersChosen.time && filtersChosen.partySize && isRestaurantAvailable) {
      // Only filter by availability if we have all the required data and it's not loading
      if (!availabilityLoading) {
        matchesAvailability = isRestaurantAvailable(restaurant.id, filtersChosen.time)
      }
    }

    return matchesCategory && matchesPriceRange && matchesDistance && matchesAvailability
  })

  // Handle empty state
  if (filteredRestaurants.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-softgreytheme dark:bg-darkthemeitems border border-softgreytheme dark:border-subblack rounded-lg p-8">
          <p className="text-greytheme dark:text-softwhitetheme text-lg mb-2">
            {t("search.restaurantList.noMatchingRestaurants")}
          </p>
          <p className="text-greytheme dark:text-softwhitetheme text-sm">
            {t("search.restaurantList.adjustFilters")}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {filteredRestaurants.map((restaurant) => {
        const rating = getSafeRating(restaurant.rating)
        const distance = getSafeDistance(restaurant.distance)
        const imageUrl = getSafeImageUrl(restaurant.imageUrl || PlaceHolder.src)
        const category = getSafeCategory(restaurant.category)
        const priceRange = getSafePriceRange(restaurant.priceRange)
        const isOpen = getIsOpen(restaurant.status, restaurant.isOpen)
        const isSelected = selectedRestaurantId === String(restaurant.id)

        return (
          <div
            key={restaurant.id}
            className={`bg-whitetheme group dark:bg-darkthemeitems rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md dark:hover:shadow-[0_4px_6px_-1px_rgba(255,255,255,0.05)] ${
              isSelected 
                ? 'ring-2 ring-greentheme ring-opacity-70 shadow-lg border border-greentheme/20' 
                : ''
            }`}
            onMouseEnter={() => onHover(String(restaurant.id))}
          >
            <Link href={`/restaurant/${restaurant.id}`} target="_blank" className="flex flex-col sm:flex-row">
              {/* Restaurant Image */}
              <div className="w-full sm:w-1/3 overflow-hidden h-48 sm:h-auto relative">
                <Image
                  src={imageUrl || PlaceHolder.src}
                  alt={t("search.restaurantList.imageAlt", { name: restaurant.name })}
                  width={300}
                  height={200}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 rounded-t-xl sm:rounded-t-none sm:rounded-l-xl"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = PlaceHolder.src
                  }}
                />
                <div className="absolute top-2 left-2">
                  <span className="bg-whitetheme dark:bg-darkthemeitems text-greentheme text-xs font-medium px-2 py-1 rounded-full">
                    {getCategoryLabel(category)}
                  </span>
                </div>
              </div>

              {/* Restaurant Details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-blacktheme dark:text-textdarktheme">{restaurant.name}</h3>
                    <div className="flex items-center bg-softgreentheme dark:bg-greentheme/20 text-greentheme px-2 py-1 rounded text-sm">
                      <Star size={14} className="fill-yellowtheme text-yellowtheme mr-1" />
                      <span>
                        {rating > 0 ? rating.toFixed(1) : t("search.restaurantList.notAvailable")}
                      </span>
                    </div>
                  </div>
                  <p className="text-greytheme dark:text-textdarktheme/70 text-sm mb-3">{restaurant.address}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="bg-softgreytheme dark:bg-bgdarktheme2 text-greytheme dark:text-textdarktheme/70 text-xs px-2 py-1 rounded-full">
                      {priceRange}
                    </span>
                    <span className="bg-softgreytheme dark:bg-bgdarktheme2 text-greytheme dark:text-textdarktheme/70 text-xs px-2 py-1 rounded-full">
                      {distance === t("search.restaurantList.notAvailable") 
                        ? distance 
                        : t("search.restaurantList.distanceKm", { distance })}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-3">
                    {/* Operating Status */}
                    <div className="flex items-center">
                      <Clock size={16} className={isOpen ? "text-greentheme" : "text-redtheme"} />
                      <span className={`ml-1 text-sm ${isOpen ? "text-greentheme" : "text-redtheme"}`}>
                        {isOpen ? t("search.restaurantList.openNow") : t("search.restaurantList.closed")}
                      </span>
                    </div>
                    
                    {/* Availability Status */}
                    {(isRestaurantAvailable && (filtersChosen.date && filtersChosen.time && filtersChosen.partySize)) && (
                      <div className="flex items-center">
                        {availabilityLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-500 mr-1"></div>
                            <span className="text-xs text-blue-500">
                              {t("search.restaurantList.checkingAvailability", "Checking...")}
                            </span>
                          </>
                        ) : (
                          <>
                            <div className={`w-2 h-2 rounded-full mr-1 ${
                              isRestaurantAvailable(restaurant.id, filtersChosen.time) ? "bg-greentheme" : "bg-orange-500"
                            }`}></div>
                            <span className={`text-xs ${
                              isRestaurantAvailable(restaurant.id, filtersChosen.time) ? "text-greentheme" : "text-orange-500"
                            }`}>
                              {isRestaurantAvailable(restaurant.id, filtersChosen.time) 
                                ? t("search.restaurantList.available", "Available") 
                                : t("search.restaurantList.full", "Full")
                              }
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <button className="btn-primary text-sm py-1.5 px-3">
                    {t("search.restaurantList.bookNow")}
                  </button>
                </div>
              </div>
            </Link>
          </div>
        )
      })}
    </div>
  )
}

export default RestaurantList
