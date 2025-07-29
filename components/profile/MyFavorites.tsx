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
