"use client";
import type React from "react"
import RestaurantCard from "../restaurant/RestaurantCard";
import { useTranslation } from "next-i18next";
import { useLikedRestaurants } from "@/hooks/api/useRestaurants";
import { useAuth } from "../auth/AuthProvider";

interface Restaurant {
    id: number;
    name: string;
    address: string;
    distance: number | null;
    rating: number | null;
    status: string;
    main_image: string | null;
    location: [number, number]; // Array containing latitude and longitude
    is_liked: boolean;
}

export const MyFavorites: React.FC = () => {
    const { t } = useTranslation();
    const { isAuthenticated, user } = useAuth();
    
    // Fetch liked restaurants using React Query
    const { data: likedRestaurants, isLoading, error } = useLikedRestaurants();

    console.log("test", likedRestaurants)
    // Debug logging
    console.log('MyFavorites Debug:', {
        isAuthenticated,
        likedRestaurants,
        isLoading,
        error: error?.message || error,
        hasResults: likedRestaurants?.length,
    });

    // If user is not authenticated, show login message
    if (!isAuthenticated) {
        return (
            <div className="space-y-6">
                <h2 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme">
                    {t("profile.myFavorites.title", "My Favorite Restaurants")}
                </h2>
                <div className="text-center py-8">
                    <div className="text-greytheme dark:text-textdarktheme mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="64"
                            height="64"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mx-auto mb-4 opacity-50"
                        >
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                    </div>
                    <p className="text-greytheme dark:text-textdarktheme text-lg">
                        {t("profile.myFavorites.notLoggedIn", "Please log in to see your favorite restaurants.")}
                    </p>
                    <button className="mt-4 px-6 py-2 bg-greentheme text-white rounded-lg hover:bg-opacity-90 transition-colors">
                        {t("auth.login", "Log In")}
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <h2 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme">
                    {t("profile.myFavorites.title", "My Favorite Restaurants")}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Loading skeleton */}
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className="bg-whitetheme dark:bg-bgdarktheme2 rounded-lg overflow-hidden shadow-md border border-softgreytheme dark:border-darkthemeitems animate-pulse">
                            <div className="h-48 bg-softgreytheme dark:bg-darkthemeitems"></div>
                            <div className="p-4 space-y-3">
                                <div className="h-6 bg-softgreytheme dark:bg-darkthemeitems rounded"></div>
                                <div className="h-4 bg-softgreytheme dark:bg-darkthemeitems rounded w-3/4"></div>
                                <div className="h-4 bg-softgreytheme dark:bg-darkthemeitems rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <h2 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme">
                    {t("profile.myFavorites.title", "My Favorite Restaurants")}
                </h2>
                <div className="text-center py-8">
                    <div className="text-greytheme dark:text-textdarktheme mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="64"
                            height="64"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mx-auto mb-4 opacity-50"
                        >
                            <path d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"></path>
                        </svg>
                    </div>
                    <p className="text-greytheme dark:text-textdarktheme text-lg">
                        {t("profile.myFavorites.error", "Failed to load your favorite restaurants.")}
                    </p>
                    <p className="text-greytheme dark:text-textdarktheme text-sm mt-2">
                        Error: {error?.message || "Unknown error occurred"}
                    </p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-6 py-2 bg-greentheme text-white rounded-lg hover:bg-opacity-90 transition-colors"
                    >
                        {t("common.retry", "Try Again")}
                    </button>
                </div>
            </div>
        );
    }

    const restaurants = likedRestaurants || [];

    if (restaurants.length === 0 && !isLoading) {
        return (
            <div className="space-y-6">
                <h2 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme">
                    {t("profile.myFavorites.title", "My Favorite Restaurants")}
                </h2>
                <div className="text-center py-8">
                    <div className="text-greytheme dark:text-textdarktheme mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="64"
                            height="64"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mx-auto mb-4 opacity-50"
                        >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </div>
                    <p className="text-greytheme dark:text-textdarktheme text-lg">
                        {t("profile.myFavorites.empty", "You haven't added any restaurants to your favorites yet.")}
                    </p>
                    <p className="text-greytheme dark:text-textdarktheme text-sm mt-2">
                        {t("profile.myFavorites.emptyHint", "Browse restaurants and click the heart icon to add them to your favorites.")}
                    </p>
                </div>
            </div>
        );
    }



  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme">{t("profile.myFavorites.title", "My Favorite Restaurants")}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* {favorites.map((favorite) => (
          <div
            key={favorite.id}
            className="bg-whitetheme dark:bg-bgdarktheme2 rounded-lg overflow-hidden shadow-md border border-softgreytheme dark:border-darkthemeitems transition-colors duration-200"
          >
            <div className="relative h-48 bg-softgreytheme dark:bg-darkthemeitems">
              <img
                src={favorite.image || "/placeholder.svg"}
                alt={favorite.name}
                className="w-full h-full object-cover"
              />
              <button className="absolute top-3 right-3 p-2 bg-whitetheme dark:bg-darkthemeitems rounded-full text-redtheme">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </div>

            <div className="p-4">
              <h3 className="text-lg font-semibold text-blacktheme dark:text-textdarktheme">{favorite.name}</h3>

              <div className="flex items-center mt-1 text-sm text-greytheme dark:text-textdarktheme">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                {favorite.location}
              </div>

              <div className="flex items-center mt-1 text-sm text-greytheme dark:text-textdarktheme">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="M3 3h18v18H3zM12 8v8M8 12h8"></path>
                </svg>
                {favorite.cuisine}
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="text-greentheme font-semibold">{favorite.priceRange}</div>

                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-yellowtheme mr-1"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  <span className="text-sm text-greytheme dark:text-textdarktheme">{favorite.rating}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button className="flex-1 py-2 bg-greentheme text-whitetheme rounded-lg hover:bg-opacity-90 transition-colors duration-200">
                  Book Table
                </button>
                <button className="flex-1 py-2 bg-softgreytheme dark:bg-darkthemeitems text-blacktheme dark:text-textdarktheme rounded-lg hover:bg-opacity-90 transition-colors duration-200">
                  View Menu
                </button>
              </div>
            </div>
          </div>
        ))} */}
        {restaurants.map((restaurant) => (
            <RestaurantCard
                key={restaurant.id}
                id={restaurant.id}
                name={restaurant.name}
                address={restaurant.address}
                rating={restaurant.rating || 0}
                category="Restaurant" // RestaurantFavorite doesn't have category_name
                isOpen={restaurant.status === "Open"}
                imageUrl={restaurant.main_image || "/placeholder.svg"}
                favorite={true}
            />
        ))}
      </div>
    </div>
  )
}
