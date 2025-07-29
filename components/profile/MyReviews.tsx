"use client"

import { Heart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import StarRating from "./StarRating"
import placeholder from "@/public/ImagePlaceholder.webp"
import { useUserReviews, useLikeRestaurant, useUnlikeRestaurant, useManualInvalidation, useRestaurant } from "@/hooks/api"

const MyReviews = () => {
  const { t } = useTranslation()
  
  // Fetch user reviews from API
  const { data: reviewsData, isLoading, error } = useUserReviews()
  
  // Ensure reviews is always an array and handle different API response structures
  const reviews = Array.isArray(reviewsData) 
    ? reviewsData 
    : (reviewsData as any)?.results && Array.isArray((reviewsData as any).results)
    ? (reviewsData as any).results
    : (reviewsData as any)?.data && Array.isArray((reviewsData as any).data)
    ? (reviewsData as any).data
    : []
    
  // Debug log to understand the data structure
  console.log('👤 MyReviews - reviewsData:', reviewsData)
  console.log('👤 MyReviews - processed reviews:', reviews)
  
  // Like/Unlike mutations
  const likeRestaurantMutation = useLikeRestaurant()
  const unlikeRestaurantMutation = useUnlikeRestaurant()
  const { onRestaurantInteraction } = useManualInvalidation()
  
  // Local state for optimistic updates
  const [localFavorites, setLocalFavorites] = useState<Record<number, boolean>>({})

  const toggleFavorite = async (restaurantId: number) => {
    const currentlyLiked = localFavorites[restaurantId] ?? false
    const newLikedState = !currentlyLiked
    
    // Optimistic update
    setLocalFavorites(prev => ({ ...prev, [restaurantId]: newLikedState }))
    
    try {
      if (newLikedState) {
        await likeRestaurantMutation.mutateAsync(restaurantId)
      } else {
        await unlikeRestaurantMutation.mutateAsync(restaurantId)
      }
      
      // Trigger additional invalidations
      onRestaurantInteraction(restaurantId)
    } catch (error) {
      // Revert optimistic update on error
      setLocalFavorites(prev => ({ ...prev, [restaurantId]: currentlyLiked }))
      console.error('Failed to toggle favorite:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const calculateAverageRating = (review: any) => {
    const ratings = [
      parseFloat(review.food_rating || '0'),
      parseFloat(review.service_rating || '0'),
      parseFloat(review.ambience_rating || '0'),
      parseFloat(review.value_for_money || '0')
    ].filter(rating => rating > 0)
    
    return ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0
  }

  // Component for individual review card with restaurant data
  const ReviewCard = ({ review }: { review: any }) => {
    const restaurantId = review.restaurant_data?.id || review.restaurant
    const [imageError, setImageError] = useState(false)
    
    // Fetch restaurant details using the API
    const { data: restaurantData, isLoading: restaurantLoading } = useRestaurant(
      restaurantId, 
      !!restaurantId // Only fetch if we have a restaurant ID
    )
    
    const averageRating = calculateAverageRating(review)
    const restaurantName = restaurantData?.name || review.restaurant_data?.name || `Restaurant #${review.restaurant}`
    const restaurantImage = !imageError && (restaurantData?.image || review.restaurant_data?.image) ? 
      (restaurantData?.image || review.restaurant_data?.image) : placeholder
    const isLiked = localFavorites[restaurantId] ?? restaurantData?.is_liked ?? false
    
    return (
      <div
        key={review.id}
        className="bg-whitetheme dark:bg-darkthemeitems rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300"
      >
        {/* Restaurant Info Section */}
        <div className="flex flex-col lg:flex-row">
          {/* Restaurant Image */}
          <div className="lg:w-60 h-30 lg:h-44 relative flex-shrink-0">
            {restaurantLoading ? (
              <div className="w-full h-full bg-softgreytheme dark:bg-bgdarktheme animate-pulse" />
            ) : (
              <Image
                src={restaurantImage}
                alt={restaurantName}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
            )}
          </div>

          {/* Restaurant Details */}
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                {restaurantLoading ? (
                  <>
                    <div className="h-6 bg-softgreytheme dark:bg-bgdarktheme rounded animate-pulse mb-2" />
                    <div className="h-4 bg-softgreytheme dark:bg-bgdarktheme rounded animate-pulse w-3/4 mb-4" />
                    <div className="h-10 bg-softgreytheme dark:bg-bgdarktheme rounded animate-pulse w-1/3" />
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-blacktheme dark:text-textdarktheme mb-2">
                      {restaurantName}
                    </h3>
                    <div className="flex items-center gap-4 mb-4">
                      <StarRating rating={averageRating} size="lg" showValue={true} />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Reviewed on {formatDate(review.created_at)}
                      </span>
                    </div>

                    {/* Restaurant Profile Button */}
                    <Link href={`/restaurant/${restaurantId}`}>
                      <button className="inline-flex items-center px-4 py-2 bg-greentheme hover:bg-greentheme/80 cursor-pointer text-white text-sm font-medium rounded-lg transition-colors duration-200">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        View Restaurant
                      </button>
                    </Link>
                  </>
                )}
              </div>
              <button
                onClick={() => toggleFavorite(restaurantId)}
                disabled={likeRestaurantMutation.isPending || unlikeRestaurantMutation.isPending || restaurantLoading}
                className={`p-3 rounded-full transition-all duration-200 ${
                  isLiked
                    ? "text-red-500 bg-red-50 dark:bg-red-900/20"
                    : "text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                } ${(likeRestaurantMutation.isPending || unlikeRestaurantMutation.isPending || restaurantLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Review Section */}
        <div className="border-t border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-greentheme rounded-full flex items-center justify-center text-white font-bold">
              {/* User initials or default avatar */}
                {(() => {
                  const userStr = localStorage.getItem('user');
                  if (!userStr) return 'U';
                  try {
                    const user = JSON.parse(userStr);
                    return user.first_name ? user.first_name[0].toUpperCase() : 'U';
                  } catch {
                    return 'U';
                  }
                })()}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold flex items-center text-blacktheme dark:text-textdarktheme mb-1">
                {(() => {
                  const userStr = localStorage.getItem('user');
                  if (!userStr) return 'U';
                  try {
                    const user = JSON.parse(userStr);
                    return user.first_name ? user.first_name : 'User';
                  } catch {
                    return 'User';
                  }
                })()}
                <span className="text-gray-500 ml-1 text-sm dark:text-gray-400">{' (You)'}</span>
              </h4>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{review.description}</p>

              {/* Rating Breakdown in Review Section */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
                <h5 className="text-sm font-semibold text-blacktheme dark:text-textdarktheme mb-3">My Ratings</h5>
                <div className="grid grid-cols-2 gap-3">
                  {review.food_rating && parseFloat(review.food_rating) > 0 && (
                    <StarRating 
                      rating={parseFloat(review.food_rating)} 
                      label="Food" 
                      size="sm" 
                      showValue={true} 
                    />
                  )}
                  {review.service_rating && parseFloat(review.service_rating) > 0 && (
                    <StarRating
                      rating={parseFloat(review.service_rating)}
                      label="Service"
                      size="sm"
                      showValue={true}
                    />
                  )}
                  {review.ambience_rating && parseFloat(review.ambience_rating) > 0 && (
                    <StarRating
                      rating={parseFloat(review.ambience_rating)}
                      label="Ambience"
                      size="sm"
                      showValue={true}
                    />
                  )}
                  {review.value_for_money && parseFloat(review.value_for_money) > 0 && (
                    <StarRating
                      rating={parseFloat(review.value_for_money)}
                      label="Value"
                      size="sm"
                      showValue={true}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-blacktheme dark:text-textdarktheme">
            {t("profile.myReviews.title", "My Reviews")}
          </h2>
        </div>
        <div className="space-y-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-whitetheme dark:bg-darkthemeitems rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-80 h-48 lg:h-64 bg-softgreytheme dark:bg-bgdarktheme animate-pulse"></div>
                <div className="flex-1 p-6">
                  <div className="space-y-4">
                    <div className="h-6 bg-softgreytheme dark:bg-bgdarktheme rounded animate-pulse"></div>
                    <div className="h-4 bg-softgreytheme dark:bg-bgdarktheme rounded animate-pulse w-3/4"></div>
                    <div className="h-10 bg-softgreytheme dark:bg-bgdarktheme rounded animate-pulse w-1/3"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-blacktheme dark:text-textdarktheme">
            {t("profile.myReviews.title", "My Reviews")}
          </h2>
        </div>
        <div className="text-center py-12">
          <div className="text-red-400 dark:text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Failed to load reviews</h3>
          <p className="text-gray-500 dark:text-gray-400">Please try again later</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-blacktheme dark:text-textdarktheme">
          {t("profile.myReviews.title", "My Reviews")}
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
        </span>
      </div>

      <div className="space-y-6">
        {reviews.map((review: any) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {reviews.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No reviews yet</h3>
          <p className="text-gray-500 dark:text-gray-400">Start reviewing restaurants to see them here!</p>
        </div>
      )}
    </div>
  )
}

export default MyReviews
