"use client"
import { useTranslation } from "react-i18next"
import { useRestaurants } from "../../hooks/UseRestaurants"
import RestaurantCard from "../restaurant/RestaurantCard"
import Link from "next/link"

const BestInSection = () => {
  const { t } = useTranslation()
  // Use our custom hook to fetch restaurants for Marrakech (city ID 5)
  const { restaurants, loading, error, totalCount, retry, isRetrying, retryCount } = useRestaurants(
    { city: "5", limit: 6 }, // Marrakech city ID and limit to 6 restaurants
    { autoFetch: true },
  )

  const MAX_RETRIES = 3
  const hasMaxRetriesError = error && retryCount >= MAX_RETRIES
  const canRetry = error && retryCount < MAX_RETRIES

  // Helper function to get safe rating value
  const getSafeRating = (rating: number | null): number => {
    return rating ?? 0
  }

  // Helper function to get safe image URL
  const getSafeImageUrl = (imageUrl: string | null | undefined): string => {
    return imageUrl || "/placeholder.svg?height=300&width=400"
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-blacktheme dark:text-textdarktheme mb-4">
          {t("bestInSection.title", "Best Restaurants in Marrakech")}
        </h1>
        <p className="text-lg text-greytheme dark:text-softwhitetheme max-w-2xl mx-auto">
          {t(
            "bestInSection.description",
            "Discover the top-rated restaurants in Marrakech, offering a variety of cuisines and exceptional dining experiences. Whether you're craving Italian, Chinese, or Japanese, we've got you covered!"
          )}
        </p>
        {totalCount > 0 && (
          <p className="text-sm text-greytheme dark:text-softwhitetheme mt-2">
            {t("bestInSection.showingCount", "Showing {{count}} of {{total}} restaurants", {
              count: restaurants.length,
              total: totalCount,
            })}
          </p>
        )}
      </div>

      {/* Mobile horizontal scroll view */}
      <div className="relative mb-6 sm:hidden">
        <div className="flex overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar -mx-4 px-4">
          {loading && retryCount === 0 ? (
            // Loading skeleton for mobile
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex-none w-[85%] mr-4 snap-start">
                <div className="bg-softgreytheme dark:bg-darkthemeitems rounded-lg h-64 animate-pulse"></div>
              </div>
            ))
          ) : restaurants.length > 0 ? (
            restaurants.map((restaurant) => (
              <div key={restaurant.id} className="flex-none w-[85%] mr-4 snap-start">
                <RestaurantCard
                  id={Number(restaurant.id)}
                  name={restaurant.name}
                  address={restaurant.address}
                  rating={getSafeRating(restaurant.rating)}
                  category={restaurant.category_name || t("bestInSection.unknownCategory", "Unknown")}
                  isOpen={restaurant.status === "Open"}
                  imageUrl={getSafeImageUrl(restaurant.main_image)}
                />
              </div>
            ))
          ) : (
            <div className="flex-none w-full text-center py-8">
              <p className="text-greytheme dark:text-softwhitetheme">
                {t("bestInSection.noRestaurantsFound", "No restaurants found")}
              </p>
            </div>
          )}
        </div>
        {/* Scroll indicator dots */}
        {restaurants.length > 0 && (
          <div className="flex justify-center mt-4 space-x-2">
            {restaurants.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === 0 ? "bg-greentheme" : "bg-softgreytheme dark:bg-subblack"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop grid view */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading && retryCount === 0 ? (
          <div className="col-span-3 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-greentheme"></div>
              <p className="text-greytheme dark:text-softwhitetheme">
                {t("bestInSection.loading", "Loading best restaurants...")}
              </p>
            </div>
          </div>
        ) : isRetrying ? (
          <div className="col-span-3 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellowtheme"></div>
              <p className="text-yellowtheme">
                {t("bestInSection.retrying", "Retrying... Attempt {{current}}/{{max}}", {
                  current: retryCount,
                  max: MAX_RETRIES,
                })}
              </p>
            </div>
          </div>
        ) : hasMaxRetriesError ? (
          <div className="col-span-3 text-center">
            <div className="bg-softredtheme dark:bg-redtheme/20 border border-redtheme/20 dark:border-redtheme/40 rounded-lg p-6">
              <p className="text-redtheme dark:text-redtheme mb-4">
                {t("bestInSection.maxRetriesError", "Failed to load restaurants after {{max}} attempts.", {
                  max: MAX_RETRIES,
                })}
              </p>
              <button
                onClick={retry}
                className="px-4 py-2 bg-redtheme text-whitetheme rounded-lg hover:opacity-90 transition-colors"
              >
                {t("bestInSection.tryAgain", "Try Again")}
              </button>
            </div>
          </div>
        ) : canRetry ? (
          <div className="col-span-3 text-center">
            <div className="bg-softyellowtheme dark:bg-yellowtheme/20 border border-yellowtheme/20 dark:border-yellowtheme/40 rounded-lg p-6">
              <p className="text-yellowtheme dark:text-yellowtheme mb-4">
                {t("bestInSection.errorLoading", "Error loading restaurants. Attempt {{current}}/{{max}}", {
                  current: retryCount,
                  max: MAX_RETRIES,
                })}
              </p>
              <button
                onClick={retry}
                className="px-4 py-2 bg-yellowtheme text-whitetheme rounded-lg hover:opacity-90 transition-colors"
              >
                {t("bestInSection.retryNow", "Retry Now")}
              </button>
            </div>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="col-span-3 text-center">
            <div className="bg-softgreytheme dark:bg-darkthemeitems border border-softgreytheme dark:border-subblack rounded-lg p-6">
              <p className="text-greytheme dark:text-softwhitetheme">
                {t("bestInSection.noRestaurantsInCity", "No restaurants found in Marrakech.")}
              </p>
            </div>
          </div>
        ) : (
          restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              id={Number(restaurant.id)}
              name={restaurant.name}
              address={restaurant.address}
              rating={getSafeRating(restaurant.rating)}
              category={restaurant.category_name || t("bestInSection.unknownCategory", "Unknown")}
              isOpen={restaurant.status === "Open"}
              imageUrl={getSafeImageUrl(restaurant.main_image)}
            />
          ))
        )}
      </div>

      <div className="text-center mt-12">
        <Link
          href="/search?city=5"
          className="bg-greentheme text-whitetheme px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all inline-block"
        >
          {t("bestInSection.viewAll", "View All Restaurants")}
        </Link>
      </div>
    </div>
  )
}

export default BestInSection
