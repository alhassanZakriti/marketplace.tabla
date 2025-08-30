"use client"
import { useState, useEffect, Suspense } from "react"
import SearchBar from "../../components/search/SearchBar"
import SearchBarMobile from "../../components/search/SearchBarMobile"
import FiltersSection, { type FilterOptions } from "../../components/search/FilterSection"
import RestaurantList from "../../components/search/RestaurantList"
import { MapComponent } from "../../components/search/MapSection"
import Pagination from "../../components/search/Pagination"
import { Calendar, Clock, Filter, MapPin, Users } from "lucide-react"
import ReservationProcess from "../../components/restaurant/ReservationProcess"
import { useSearchParams } from "next/navigation"
import { useCities, useRestaurants } from "@/hooks/api"
import useRestaurantAvailability from "@/hooks/useRestaurantAvailability"
import { MapProvider } from "@/providers/map-provider"
import { useTranslation } from "react-i18next"

function SearchContent() {
  const { t } = useTranslation()

  useEffect(() => {
    document.title = t("search.pageTitle", { defaultValue: "Search - Tabla | Taste Morocco's Best" })
  }, [t])

  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [shownFilters, setShownFilters] = useState(false)
  const [showReservationProcess, setShowReservationProcess] = useState(false)

  type SelectedData = {
    reserveDate: string
    time: string
    guests: number
  }

  const [data, setData] = useState<SelectedData>({
    reserveDate: "----/--/--",
    time: "--:--",
    guests: 0,
  })

  const searchParams = useSearchParams()
  const cityParam = searchParams.get("city") || ""
  const searchTermParam = searchParams.get("term") || ""

  // Filter state - needs to be defined before API calls
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    priceRanges: [],
    distanceMin: null,
    distanceMax: null,
    date: null,
    time: null,
    partySize: null,
    ordering: "distance",
  })

  // React Query hooks
  const {
    data: citiesData,
    isLoading: citiesLoading,
    error: citiesError,
    refetch: refetchCities,
  } = useCities()

  const {
    data: restaurantsData,
    isLoading: restaurantsLoading,
    error: restaurantsError,
    refetch: refetchRestaurants,
  } = useRestaurants({
    city: cityParam,
    term: searchTermParam,
    page: currentPage,
    limit: 10,
    category: filters.categories.length > 0 ? filters.categories.join(',') : undefined,
    // Note: price filtering might need to be implemented in the API
    distance_min: filters.distanceMin || undefined,
    distance_max: filters.distanceMax || undefined,
    date: filters.date || undefined,
    time: filters.time || undefined,
    party_size: filters.partySize || undefined,
    ordering: filters.ordering,
  })

  // Availability checking hook
  const {
    availabilityData,
    loading: availabilityLoading,
    error: availabilityError,
    checkAvailability,
    isRestaurantAvailable,
    refetch: refetchAvailability,
  } = useRestaurantAvailability()

  // Extract data from API responses
  const cities = citiesData?.results || []
  const rawRestaurants = restaurantsData?.results || []
  const restaurants = rawRestaurants.map(restaurant => ({
    ...restaurant,
    distance: restaurant.distance ?? null, // Transform undefined to null
    status: (restaurant.status || "Closed") as "Closed" | "Open", // Ensure status is defined
    main_image: restaurant.main_image ?? null, // Transform undefined to null
    location: (restaurant.location && restaurant.location.length >= 2 
      ? [restaurant.location[0], restaurant.location[1]] 
      : null) as [number, number] | null, // Transform to tuple or null
  }))
  const totalCount = restaurantsData?.count || 0
  const totalPages = Math.ceil(totalCount / 10)

  const getCityDisplayName = () => {
    if (!cityParam) return ""
    const cityById = cities.find((c) => String(c.id) === String(cityParam))
    if (cityById) return cityById.name
    const cityByName = cities.find((c) => c.name.toLowerCase() === cityParam.toLowerCase())
    if (cityByName) return cityByName.name
    return cityParam
  }

  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)
    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Refetch restaurants when search params or current page change
  useEffect(() => {
    setCurrentPage(1)
    // Clear selected restaurant when search parameters change
    setSelectedRestaurant(null)
  }, [cityParam, searchTermParam])

  // Clear selected restaurant when filters change significantly
  useEffect(() => {
    setSelectedRestaurant(null)
  }, [filters.categories, filters.priceRanges, filters.date, filters.time, filters.partySize])

  // Check availability when filters or restaurant data changes
  useEffect(() => {
    // Only check availability if we have valid date, time, and guests
    if (
      filters.date && 
      filters.date !== "----/--/--" && 
      filters.time && 
      filters.time !== "--:--" && 
      filters.partySize && 
      filters.partySize > 0 &&
      rawRestaurants.length > 0
    ) {
      // Convert date format if needed (assumes filters.date is in a valid format)
      const availabilityRequest = {
        date: filters.date,
        party_size: filters.partySize,
      }
      
      checkAvailability(rawRestaurants, availabilityRequest)
    }
  }, [filters.date, filters.time, filters.partySize, rawRestaurants, checkAvailability])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleRestaurantHover = (id: string) => {
    setSelectedRestaurant(id)
  }

  const handleFiltersChange = (newFilters: FilterOptions) => {
    console.log("Filters changed:", newFilters)
    setFilters(newFilters)
  }

  const cityDisplayName = getCityDisplayName()

  return (
    <MapProvider>
      <div className="bg-softgreytheme dark:bg-bgdarktheme dark:text-white transition-colors duration-200">
        {showReservationProcess && (
          <ReservationProcess getDateTime={setData} onClick={() => setShowReservationProcess(false)} />
        )}
        <div className="container mx-auto px-4 py-6">
          <div className="min-h-screen max-w-[1200px] mx-auto">

            {/* Search Bar */}
            <div className="mb-6">
              <div className="hidden sm:block">
                <SearchBar />
              </div>
              <div className="sm:hidden">
                <SearchBarMobile />
              </div>
            </div>
              
              <div className="flex sm:flex-row flex-col justify-start items-center ">
                <div className="bg-whitetheme lg:w-[40vw] w-full sm:mr-10  dark:bg-darkthemeitems rounded-lg mb-3 shadow-sm">
                  <div
                    onClick={() => setShowReservationProcess(true)}
                    className="flex justify-around items-center cursor-pointer p-1 h-[4em] hover:border-softgreentheme border-2 border-[#00000000] hover:bg-softgreytheme dark:hover:bg-bgdarktheme2 rounded-md transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-[600] dark:text-white mr-2 text-blacktheme">
                        <Calendar size={27} className="rounded-[100%] w-8 h-8 btn-secondary p-2 m-0 text-yellowtheme" />
                      </span>
                      <span className="font-medium text-blacktheme dark:text-white">
                        {data.reserveDate || "----/--/--"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-[600] dark:text-white mr-2 text-blacktheme">
                        <Clock size={27} className="rounded-[100%] w-8 h-8 btn-secondary p-2 m-0 text-yellowtheme" />
                      </span>
                      <span className="font-medium text-blacktheme dark:text-white">{data.time || "--:--"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-[600] dark:text-white mr-2 text-blacktheme">
                        <Users size={27} className="rounded-[100%] w-8 h-8 btn-secondary p-2 m-0 text-yellowtheme" />
                      </span>
                      <span className="font-medium text-blacktheme dark:text-white">{data.guests || "--"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center  sm:flex-nowrap flex-wrap justify-start sm:justify-between mb-2 gap-2 overflow-x-scroll no-scrollbar">
                  <button className="btn-secondary min-w-[10em]">Less than 5Km</button>
                  <button className="btn-secondary min-w-[10em]">Less than 10Km</button>
                  <button className="btn-secondary min-w-[10em]">Less than 20Km</button>
                  <button className="btn-secondary min-w-[10em]">Less than 30Km</button>
                </div>
              </div>

            {/* Current Location */}
            <div className={`${cityParam ? "justify-between" : "justify-end"} flex`}>
              <div
                className={`flex items-center mb-6 text-sm text-greytheme dark:text-textdarktheme/70 ${
                  cityParam ? "" : "hidden"
                }`}
              >
                <MapPin size={16} className="mr-1 text-greentheme" />
                <span>
                  {t("search.showingResultsNear")}{" "}
                  {citiesLoading ? (
                    <span className="inline-flex items-center">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-greentheme mr-1"></div>
                      {t("search.loading")}
                    </span>
                  ) : citiesError ? (
                    <span className="text-redtheme">{t("search.errorLoadingCities")}</span>
                  ) : (
                    cityDisplayName || t("search.unknownLocation")
                  )}
                </span>
              </div>
              {/* <button
                className={`flex gap-2 text-[.9rem] items-center ${
                  shownFilters ? "btn-primary p-3 mb-2" : "btn-secondary p-3 mb-2"
                }`}
                onClick={() => {
                  setShownFilters(!shownFilters)
                }}
              >
                {t("search.filters.title")} <Filter size={14} />
              </button> */}
            </div>
            

            {/* Filters */}
            {shownFilters && (
              <FiltersSection 
                onFiltersChange={handleFiltersChange} 
                availabilityData={{
                  date: data.reserveDate !== "----/--/--" ? data.reserveDate : "",
                  time: data.time !== "--:--" ? data.time : "",
                  guests: data.guests > 0 ? data.guests : 0
                }}
              />
            )}

            {/* Loading State */}
            {restaurantsLoading && (
              <div className="text-center py-12">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-greentheme"></div>
                  <p className="text-greytheme dark:text-softwhitetheme">{t("search.loadingRestaurants")}</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {restaurantsError && !restaurantsLoading && (
              <div className="text-center py-8">
                <div className="bg-softredtheme dark:bg-redtheme/20 border border-redtheme/20 dark:border-redtheme/40 rounded-lg p-6 max-w-md mx-auto">
                  <p className="text-redtheme dark:text-redtheme mb-4">
                    {t("search.errorLoadingRestaurants")}
                  </p>
                  <button
                    onClick={() => refetchRestaurants()}
                    className="px-4 py-2 bg-redtheme text-whitetheme rounded-lg hover:opacity-90 transition-colors"
                  >
                    {t("search.tryAgain")}
                  </button>
                </div>
              </div>
            )}

            {/* Main Content */}
            {!restaurantsLoading && !restaurantsError && (
              <div className="flex flex-col lg:flex-row gap-6 mt-8">
                {/* Restaurant List */}
                <div className="w-full lg:w-2/3">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-blacktheme dark:text-textdarktheme">
                      {t("search.restaurantsFound", { count: totalCount })}
                      {searchTermParam && (
                        <span className="text-sm font-normal text-greytheme dark:text-textdarktheme/70 ml-2">
                          {t("search.forSearchTerm", { term: searchTermParam })}
                        </span>
                      )}
                      {cityDisplayName && (
                        <span className="text-sm font-normal text-greytheme dark:text-textdarktheme/70 ml-2">
                          {t("search.inLocation", { location: cityDisplayName })}
                        </span>
                      )}
                    </h2>
                  </div>
                  {restaurants.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-softgreytheme dark:bg-darkthemeitems border border-softgreytheme dark:border-subblack rounded-lg p-8">
                        <p className="text-greytheme dark:text-softwhitetheme text-lg mb-2">
                          {t("search.noRestaurantsFound")}
                        </p>
                        <p className="text-greytheme dark:text-softwhitetheme text-sm">
                          {t("search.tryAdjustingCriteria")}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <RestaurantList
                        restaurants={restaurants}
                        onHover={handleRestaurantHover}
                        selectedRestaurantId={selectedRestaurant}
                        filtersChosen={filters}
                        availabilityData={availabilityData}
                        availabilityLoading={availabilityLoading}
                        isRestaurantAvailable={isRestaurantAvailable}
                      />
                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="mt-8">
                          <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
                {/* Map - Button on mobile, embedded sticky map on desktop */}
                <div className="w-full lg:w-2/3">
                  <MapComponent 
                    restaurants={restaurants} 
                    selectedRestaurantId={selectedRestaurant}
                    onRestaurantSelect={setSelectedRestaurant}
                    isSticky={true}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MapProvider>
  )
}

const SearchPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  )
}

export default SearchPage
