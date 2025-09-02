"use client"

import type React from "react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Star, Clock, Tag, Heart, Percent } from "lucide-react"
import Link from "next/link"
import { useLikeRestaurant, useUnlikeRestaurant, useManualInvalidation } from "@/hooks/api"

interface OfferType {
  id: number
  title: string
  description: string
  percentage: number
  valid_from_date: string
  valid_to_date: string
  time_range_from: string
  time_range_to: string
}

interface RestaurantCardProps {
  id: number
  name: string
  address: string
  rating: number
  category: string
  isOpen: boolean
  imageUrl: string
  favorite?: boolean
  onToggleFavorite?: (id: number, isFavorite: boolean) => void
  isAvailable?: boolean
  availabilityLoading?: boolean
  offers?: OfferType[]
}

export default function RestaurantCard({
  id,
  name,
  address,
  rating,
  category,
  isOpen,
  imageUrl,
  favorite = false,
  onToggleFavorite,
  isAvailable,
  availabilityLoading,
  offers,
}: RestaurantCardProps) {
  const { t } = useTranslation()
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [isFavorite, setIsFavorite] = useState(favorite)
  
  // React Query mutations for like/unlike
  const likeRestaurantMutation = useLikeRestaurant()
  const unlikeRestaurantMutation = useUnlikeRestaurant()
  const { onRestaurantInteraction } = useManualInvalidation()
  
  const isToggling = likeRestaurantMutation.isPending || unlikeRestaurantMutation.isPending

  // Helper function to get offers information
  const getOffersInfo = (offers?: OfferType[]) => {
    if (!offers || offers.length === 0) {
      return { hasOffers: false, topOffer: null, totalOffers: 0 }
    }

    // Filter valid offers (current date within valid range)
    const currentDate = new Date()
    const validOffers = offers.filter(offer => {
      const validFrom = new Date(offer.valid_from_date)
      const validTo = new Date(offer.valid_to_date)
      return currentDate >= validFrom && currentDate <= validTo
    })

    if (validOffers.length === 0) {
      return { hasOffers: false, topOffer: null, totalOffers: 0 }
    }

    // Get the offer with the highest percentage
    const topOffer = validOffers.reduce((max, offer) => 
      offer.percentage > max.percentage ? offer : max
    )

    return { hasOffers: true, topOffer, totalOffers: validOffers.length }
  }

  const offersInfo = getOffersInfo(offers)

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent the Link navigation
    e.stopPropagation() // Prevent event bubbling

    if (isToggling) return // Prevent multiple clicks

    try {
      const newFavoriteState = !isFavorite

      if (newFavoriteState) {
        // Like the restaurant
        await likeRestaurantMutation.mutateAsync(id)
        console.log(`Restaurant ${id} liked successfully`)
      } else {
        // Unlike the restaurant
        await unlikeRestaurantMutation.mutateAsync(id)
        console.log(`Restaurant ${id} unliked successfully`)
      }

      // Update local state
      setIsFavorite(newFavoriteState)

      // Trigger additional invalidations for immediate UI updates
      onRestaurantInteraction(id)

      // Call the parent component's handler if provided
      if (onToggleFavorite) {
        onToggleFavorite(id, newFavoriteState)
      }

    } catch (error) {
      console.error(`Failed to ${isFavorite ? 'unlike' : 'like'} restaurant:`, error)
      
      // Show error message to user (you could use a toast notification here)
      const action = isFavorite ? 'remove from favorites' : 'add to favorites'
      alert(`Failed to ${action}. Please try again.`)
      
    }
  }

  return (
    <Link href={`/restaurant/${id}`} target="_blank">
      <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-bgdarktheme2 shadow-md transition-all duration-300 hover:shadow-xl">
        {/* Image Container */}
        <div className="relative h-48 w-full overflow-hidden">
          <div
            className={`absolute inset-0 bg-gray-200 dark:bg-darkthemeitems ${
              isImageLoaded ? "opacity-0" : "opacity-100"
            } transition-opacity`}
          />
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={name}
            className={`h-full w-full object-cover transition-all duration-500 ${
              isImageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
            } group-hover:scale-110`}
            onLoad={() => setIsImageLoaded(true)}
          />

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            disabled={isToggling}
            className="absolute left-3 top-3 z-10 rounded-full bg-white/90 p-2 shadow-md transition-all duration-200 hover:bg-white dark:bg-darkthemeitems/90 dark:hover:bg-darkthemeitems disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={isFavorite ? t("restaurant.removeFromFavorites", "Remove from favorites") : t("restaurant.addToFavorites", "Add to favorites")}
          >
            {isToggling ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-redtheme" />
            ) : (
              <Heart
                className={`h-5 w-5 transition-colors ${
                  isFavorite ? "fill-redtheme text-redtheme" : "text-gray-500 hover:text-redtheme dark:text-gray-300"
                }`}
              />
            )}
          </button>

          {/* Status Badge */}
          <div className="absolute right-3 top-3 flex flex-col gap-1">
            {/* Offers Status */}
            <div
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                offersInfo.hasOffers ? "bg-greentheme/90 text-white" : "bg-greytheme/90 text-white"
              }`}
            >
              {offersInfo.hasOffers ? (
                <>
                  <Percent className="h-3 w-3" />
                  <span>{offersInfo.topOffer!.percentage}% OFF</span>
                  {offersInfo.totalOffers > 1 && (
                    <span className="opacity-80">+{offersInfo.totalOffers - 1}</span>
                  )}
                </>
              ) : (
                <>
                  <Tag className="h-3 w-3" />
                  <span>{t("restaurant.offers.none", "No offers")}</span>
                </>
              )}
            </div>
            
            {/* Availability Status */}
            {(isAvailable !== undefined || availabilityLoading) && (
              <div
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                  availabilityLoading 
                    ? "bg-blue-500/90 text-white" 
                    : isAvailable 
                    ? "bg-greentheme/90 text-white" 
                    : "bg-orange-500/90 text-white"
                }`}
              >
                {availabilityLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-2 w-2 border-b border-white"></div>
                    <span>{t("restaurant.availability.checking", "Checking...")}</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3" />
                    <span>
                      {isAvailable 
                        ? t("restaurant.availability.available", "Available") 
                        : t("restaurant.availability.unavailable", "Full")
                      }
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Restaurant Name */}
          <h3 className="mb-1 text-lg font-bold text-gray-900 dark:text-white transition-colors group-hover:text-greentheme dark:group-hover:text-textdarktheme">
            {name}
          </h3>

          {/* Address */}
          <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">{address}</p>

          {/* Rating and Category */}
          <div className="flex items-center justify-between">
            {/* Rating */}
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellowtheme text-yellowtheme" />
              <span className="font-medium text-yellowtheme">{rating.toFixed(1)}</span>
            </div>

            {/* Category */}
            <div className="flex items-center gap-1 text-sm text-greentheme dark:text-white">
              <Tag className="h-3.5 w-3.5" />
              <span>{category}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
