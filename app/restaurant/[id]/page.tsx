"use client"

import { useEffect, useState } from "react"
import type React from "react"
import { useTranslation } from "react-i18next"
import { Star, ChevronRight, ChevronLeft, ChevronDown, PlusSquare, Clock, MapPin, Phone, Globe, Heart } from "lucide-react"
import ReservationProcess from "../../../components/restaurant/ReservationProcess"
import PhotoPopup from "../../../components/restaurant/PhotoPopup"
import ReviewForm, { type ReviewData } from "../../../components/restaurant/ReviewForm"
import { useParams } from "next/navigation"
import { useAuth } from "../../../components/auth/AuthProvider"
import {
  type Restaurant,
  type OfferType,
  type OpeningHour,
  type MenuCategory,
  type ExtraService,
  type Review,
  type GalleryItem,
} from "../../../lib/dataProvider"
import { MapComponent } from "@/components/search/MapSection"
import {
  useRestaurant,
  useRestaurantMenu,
  useRestaurantReviews,
  useRestaurantGallery,
  useRestaurantAvailability,
  useLikeRestaurant,
  useUnlikeRestaurant,
  useCreateRestaurantReview,
} from "@/hooks/api"

type SelectedData = {
  reserveDate: string
  time: string
  guests: number
  offer?: OfferType | null
}

const LoadingSkeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-softgreytheme dark:bg-bgdarktheme2 rounded ${className}`}></div>
)

export default function RestaurantPage() {
  const { t } = useTranslation()
  const params = useParams()
  const id = params.id as string
  const { isAuthenticated, ensureValidToken } = useAuth()

  // React Query hooks for data fetching
  const {
    data: restaurantInfo,
    isLoading: restaurantLoading,
    error: restaurantError,
  } = useRestaurant(id)

  const {
    data: openingHours = [],
    isLoading: openingHoursLoading,
    error: openingHoursError,
  } = useRestaurantAvailability(id)

  const {
    data: menu = [],
    isLoading: menuLoading,
    error: menuError,
  } = useRestaurantMenu(id)

  const {
    data: reviews = [],
    isLoading: reviewsLoading,
    error: reviewsError,
  } = useRestaurantReviews(id)

  const {
    data: gallery = [],
    isLoading: galleryLoading,
    error: galleryError,
  } = useRestaurantGallery(id)

  // Like/Unlike mutations
  const likeMutation = useLikeRestaurant()
  const unlikeMutation = useUnlikeRestaurant()
  
  // Create review mutation
  const createReviewMutation = useCreateRestaurantReview()

  // State for UI components
  const [extraServices, setExtraServices] = useState<ExtraService[]>([])
  const [extraServicesLoading, setExtraServicesLoading] = useState(true)
  const [extraServicesError, setExtraServicesError] = useState<string | null>(null)

  // Set document title when restaurant data is loaded
  useEffect(() => {
    const restaurantName = restaurantInfo?.name || t("restaurant.defaultName")
    document.title = `${restaurantName} - Tabla | ${t("restaurant.tasteMoroccoBest")}`
  }, [restaurantInfo, t])

  // Set like status and services from restaurant data
  const [isLiked, setIsLiked] = useState(false)
  const [isLikeLoading, setIsLikeLoading] = useState(false)

  useEffect(() => {
    if (restaurantInfo) {
      if (restaurantInfo.is_liked !== undefined) {
        setIsLiked(restaurantInfo.is_liked)
      } else {
        setIsLiked(false)
      }
      
      // Set services directly from restaurant data
      if (restaurantInfo.services) {
        setExtraServices(restaurantInfo.services)
        setExtraServicesLoading(false)
        setExtraServicesError(null)
      }
    }
  }, [restaurantInfo])

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showAllMenu, setShowAllMenu] = useState(false)
  const [showReservationProcess, setShowReservationProcess] = useState(false)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchEndX, setTouchEndX] = useState<number | null>(null)

  const mainImages =
    restaurantInfo?.gallery && restaurantInfo.gallery.length > 0
      ? restaurantInfo.gallery.map((img) => img.file)
      : [
          restaurantInfo?.image || "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png",
          "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png",
          "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png",
        ]

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % mainImages.length)
  }
  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + mainImages.length) % mainImages.length)
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.targetTouches[0].clientX)
  }
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchEndX(e.targetTouches[0].clientX)
  }
  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return
    const swipeDistance = touchStartX - touchEndX
    const swipeThreshold = 50
    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0) {
        nextImage()
      } else {
        prevImage()
      }
    }
    setTouchStartX(null)
    setTouchEndX(null)
  }

  const [bookingData, setBookingData] = useState<SelectedData | undefined>(undefined)
  const [shouldShowBook, setShouldShowBook] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShouldShowBook(true)
      } else {
        setShouldShowBook(false)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const offers: OfferType[] = restaurantInfo?.offers || []
  const [showPhotoPopup, setShowPhotoPopup] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState("")
  const [showWriteReview, setShowWriteReview] = useState(false)

  // Handle review submission
  const handleSubmitReview = async (reviewData: FormData) => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated) {
        alert(t("restaurant.loginRequired"))
        return
      }
      
      // Ensure we have a valid token
      const hasValidToken = await ensureValidToken()
      if (!hasValidToken) {
        alert(t("restaurant.loginRequired"))
        return
      }

      // Submit the review
      await createReviewMutation.mutateAsync({
        restaurantId: id,
        reviewData: reviewData
      })
      
      // Show success message and close form
      alert(t("restaurant.thankYouReview", "Thank you for your review!"))
      setShowWriteReview(false)
    } catch (error) {
      console.error("Failed to submit review:", error)
      const errorMessage = error instanceof Error ? error.message : t("restaurant.errorSubmitReview", "Failed to submit review")
      alert(errorMessage)
    }
  }

  // Handle like/unlike restaurant
  const handleLikeToggle = async () => {
    const isCurrentlyLikeLoading = likeMutation.isPending || unlikeMutation.isPending
    if (isCurrentlyLikeLoading) return

    // Check if user is authenticated
    if (!isAuthenticated) {
      alert(t("restaurant.loginRequired"))
      return
    }
    
    try {
      // Ensure we have a valid token before making the API call
      const hasValidToken = await ensureValidToken()
      if (!hasValidToken) {
        alert(t("restaurant.loginRequired"))
        return
      }

      const newLikedState = !isLiked
      
      if (newLikedState) {
        await likeMutation.mutateAsync(id)
      } else {
        await unlikeMutation.mutateAsync(id)
      }
      
      // The isLiked state is now updated automatically by the React Query cache
    } catch (error) {
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : t("restaurant.errorToggleLike")
      alert(errorMessage)
    }
  }

  const hasMenuItems = (menuCategories: MenuCategory[]): boolean => {
    return menuCategories.some((category) => category.menus?.some((menu) => menu.items && menu.items.length > 0))
  }

  const getTotalMenuCount = (menuCategories: MenuCategory[]): number => {
    return menuCategories.reduce((total, category) => {
      return total + (category.menus ? category.menus.length : 0)
    }, 0)
  }

  const labelReviews = (rating: number | null | undefined): string => {
    if (rating === undefined || rating === null || isNaN(rating)) {
      return t("restaurant.noRating")
    }
    if (rating < 2) {
      return t("restaurant.veryBad")
    } else if (rating >= 2 && rating < 3) {
      return t("restaurant.bad")
    } else if (rating >= 3 && rating < 4) {
      return t("restaurant.average")
    } else if (rating >= 4 && rating < 4.5) {
      return t("restaurant.good")
    } else {
      return t("restaurant.veryGood")
    }
  }

  const getCurrentStatus = (): { text: string; color: string } => {
    if (openingHoursLoading) return { text: t("restaurant.loading"), color: "text-subblack" }
    if (openingHoursError || !openingHours || openingHours.length === 0) {
      return { text: t("restaurant.hoursNA"), color: "text-subblack" }
    }
    const today = openingHours.find((day) => day.is_today)
    if (!today) return { text: t("restaurant.hoursNA"), color: "text-subblack" }
    if (today.is_closed) return { text: t("restaurant.closed"), color: "text-redtheme" }
    if (!today.opening_time || !today.closing_time) {
      return { text: t("restaurant.hoursNA"), color: "text-subblack" }
    }
    try {
      const [openHour, openMinute] = today.opening_time.split(":").map(Number)
      const [closeHour, closeMinute] = today.closing_time.split(":").map(Number)
      const now = new Date()
      const nowMinutes = now.getHours() * 60 + now.getMinutes()
      const openMinutes = openHour * 60 + openMinute
      const closeMinutes = closeHour * 60 + closeMinute

      const isOpen =
        closeMinutes > openMinutes
          ? nowMinutes >= openMinutes && nowMinutes < closeMinutes
          : nowMinutes >= openMinutes || nowMinutes < closeMinutes

      return {
        text: isOpen ? t("restaurant.openNow") : t("restaurant.closed"),
        color: isOpen ? "text-greentheme" : "text-redtheme",
      }
    } catch (error) {
      return { text: t("restaurant.hoursNA"), color: "text-subblack" }
    }
  }
  const currentStatus = getCurrentStatus()

  if (restaurantLoading) {
    return (
      <div className="min-h-screen dark:text-white bg-softgreytheme dark:bg-bgdarktheme transition-colors duration-200">
        <main className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="space-y-8">
            <LoadingSkeleton className="h-[400px] w-full rounded-xl" />
            <LoadingSkeleton className="h-12 w-64 mx-auto" />
            <div className="grid md:grid-cols-2 gap-6">
              <LoadingSkeleton className="h-64" />
              <LoadingSkeleton className="h-64" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (restaurantError) {
    return (
      <div className="min-h-screen dark:text-white bg-softgreytheme dark:bg-bgdarktheme transition-colors duration-200">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-redtheme mb-4">{t("restaurant.errorLoading")}</h1>
            <p className="text-subblack dark:text-textdarktheme/70 mb-6">
              {t("restaurant.couldNotLoadInfo")}
            </p>
            <button onClick={() => window.location.reload()} className="btn-primary">
              {t("restaurant.tryAgain")}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen dark:text-white bg-softgreytheme dark:bg-bgdarktheme transition-colors duration-200">
      {showReservationProcess && (
        <ReservationProcess
          getDateTime={setBookingData}
          offers={offers}
          noOffer={offers.length === 0}
          dateTime={bookingData}
          onClick={() => setShowReservationProcess(false)}
          restaurantId={parseInt(id)}
        />
      )}
      {showWriteReview && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-blacktheme/20 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowWriteReview(false)}
            aria-hidden="true"
          />
          <div className="mx-auto z-[400] max-w-2xl p-4 bg-whitetheme dark:bg-darkthemeitems rounded-lg shadow-lg transition-all duration-300 animate-in fade-in zoom-in-95">
            <h1 className="mb-6 text-2xl font-bold text-blacktheme dark:text-textdarktheme">{t("restaurant.writeReview")}</h1>
            <ReviewForm 
              restaurantId={id}
              onSubmit={handleSubmitReview}
              onCancel={() => setShowWriteReview(false)}
              isLoading={createReviewMutation.isPending}
            />
          </div>
        </div>
      )}
      {showPhotoPopup && (
        <PhotoPopup
          isOpen={showPhotoPopup}
          photoUrl={selectedPhoto}
          onClose={() => {
            setShowPhotoPopup(false)
            setSelectedPhoto("")
          }}
          altText={t("restaurant.galleryPhoto")}
        />
      )}
      {shouldShowBook && (
        <div className="relative flex justify-center mb-6">
          <button
            className="fixed z-[200] bottom-[40px] shadow-xl w-[20em] btn-special"
            onClick={() => setShowReservationProcess(true)}
          >
            {t("restaurant.bookYourTable")}
          </button>
        </div>
      )}
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Image Gallery */}
        <div className="relative mb-8 rounded-xl overflow-hidden">
          <div
            className="relative h-[400px] w-full"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={mainImages[currentImageIndex] || "/placeholder.svg"}
              alt={`${restaurantInfo?.name || t("restaurant.defaultName")} ${t("restaurant.interior")}`}
              className="object-cover w-full h-full"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg?height=400&width=800"
              }}
            />
            {mainImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-whitetheme/80 dark:bg-darkthemeitems/80 rounded-full p-2 shadow-md hover:bg-whitetheme dark:hover:bg-darkthemeitems transition-colors"
                  aria-label={t("restaurant.previousImage")}
                >
                  <ChevronLeft className="h-5 w-5 text-blacktheme dark:text-textdarktheme" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-whitetheme/80 dark:bg-darkthemeitems/80 rounded-full p-2 shadow-md hover:bg-whitetheme dark:hover:bg-darkthemeitems transition-colors"
                  aria-label={t("restaurant.nextImage")}
                >
                  <ChevronRight className="h-5 w-5 text-blacktheme dark:text-textdarktheme" />
                </button>
              </>
            )}
          </div>
          {mainImages.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 overflow-x-auto scrollbar-hide">
              <div className="flex justify-center gap-2 mx-auto px-4" style={{ width: "fit-content" }}>
                {mainImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 h-2 w-2 rounded-full ${
                      index === currentImageIndex ? "bg-whitetheme" : "bg-whitetheme/50"
                    }`}
                    aria-label={t("restaurant.viewImage", { number: index + 1 })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-center mb-6">
          <button className="btn-special w-[20em]" onClick={() => setShowReservationProcess(true)}>
            {t("restaurant.book")}
          </button>
        </div>
        {/* Restaurant Info */}
        <div className="mb-12">
          <div className="flex justify-between lt-sm:flex-col lt-sm:items-center lt-sm:gap-5 items-start mb-4">
            <div>
              <div className="flex items-center justify-start gap-4 mb-2">

                <h1 className="text-3xl font-bold text-blacktheme dark:text-textdarktheme mb-2 transition-colors">
                  {restaurantInfo?.name || t("restaurant.defaultName")}
                  {/* Like Button */}
                </h1>
                <button
                  onClick={handleLikeToggle}
                  disabled={likeMutation.isPending || unlikeMutation.isPending}
                  className={`cursor-pointer flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isLiked
                      ? "bg-redtheme/10 text-redtheme border border-redtheme/20 hover:bg-redtheme/20"
                      : "bg-whitetheme dark:bg-darkthemeitems border border-softgreytheme dark:border-textdarktheme/20 text-subblack dark:text-textdarktheme hover:border-redtheme/50 hover:text-redtheme"
                  } ${(likeMutation.isPending || unlikeMutation.isPending) ? "opacity-70 cursor-not-allowed" : ""}`}
                  aria-label={isLiked ? t("restaurant.removeFavorite") : t("restaurant.addFavorite")}
                >
                  <Heart
                    className={`h-4 w-4 transition-all duration-200 ${
                      isLiked ? "fill-redtheme text-redtheme scale-110" : "text-current"
                    } ${(likeMutation.isPending || unlikeMutation.isPending) ? "animate-pulse" : ""}`}
                  />
                  <span className="text-sm">
                    {(likeMutation.isPending || unlikeMutation.isPending)
                      ? t("restaurant.updating") 
                      : isLiked 
                      ? t("restaurant.liked") 
                      : t("restaurant.like")
                    }
                  </span>
                </button>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-subblack dark:text-textdarktheme/80 mb-2 transition-colors">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-greentheme rounded-full"></span>
                  {restaurantInfo?.category_name || t("restaurant.category")}
                </span>
                
                <span className={`flex items-center gap-1 ${currentStatus.color}`}>
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      currentStatus.color === "text-greentheme"
                        ? "bg-greentheme"
                        : currentStatus.color === "text-redtheme"
                          ? "bg-redtheme"
                          : "bg-subblack"
                    }`}
                  ></span>
                  {currentStatus.text}
                </span>
              </div>
              <p className="text-subblack dark:text-textdarktheme/70 text-sm max-w-2xl transition-colors">
                {restaurantInfo?.description || t("restaurant.welcome")}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-whitetheme dark:bg-darkthemeitems shadow-md rounded-lg p-3 text-center transition-colors">
                <div className="text-3xl font-bold text-yellowtheme">
                  {restaurantInfo?.rating ? restaurantInfo.rating.toFixed(1) : t("restaurant.na")}
                </div>
                <div className="flex justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(restaurantInfo?.rating ?? 0)
                          ? "text-yellowtheme fill-yellowtheme"
                          : "text-softgreytheme dark:text-textdarktheme/30"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-greentheme font-medium text-sm">{labelReviews(restaurantInfo?.rating)}</div>
                <div className="text-subblack dark:text-textdarktheme/70 text-xs transition-colors">
                  {t("restaurant.basedOnReviews", { count: Array.isArray(reviews) ? reviews.length : 0 })}
                </div>
              </div>
              
              
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="bg-whitetheme dark:bg-darkthemeitems shadow-sm rounded p-2 transition-colors">
                  <div className="text-yellowtheme font-bold">
                    {restaurantInfo?.food_rating ? restaurantInfo.food_rating.toFixed(1) : t("restaurant.na")}
                  </div>
                  <div className="text-xs text-subblack dark:text-textdarktheme/70 transition-colors">{t("restaurant.food")}</div>
                </div>
                <div className="bg-whitetheme dark:bg-darkthemeitems shadow-sm rounded p-2 transition-colors">
                  <div className="text-yellowtheme font-bold">
                    {restaurantInfo?.service_rating ? restaurantInfo.service_rating.toFixed(1) : t("restaurant.na")}
                  </div>
                  <div className="text-xs text-subblack dark:text-textdarktheme/70 transition-colors">{t("restaurant.service")}</div>
                </div>
                <div className="bg-whitetheme dark:bg-darkthemeitems shadow-sm rounded p-2 transition-colors">
                  <div className="text-yellowtheme font-bold">
                    {restaurantInfo?.ambience_rating ? restaurantInfo.ambience_rating.toFixed(1) : t("restaurant.na")}
                  </div>
                  <div className="text-xs text-subblack dark:text-textdarktheme/70 transition-colors">{t("restaurant.ambiance")}</div>
                </div>
              </div>
            </div>
          </div>
          {/* Offers Section */}
          {offers && offers.length > 0 && (
            <div className="bg-whitetheme dark:bg-darkthemeitems shadow-sm rounded-lg p-4 mb-8 transition-colors">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg dark:text-textdarktheme transition-colors">{t("restaurant.tablaOffers")}</h3>
              </div>
              <div className="space-y-4">
                {offers.map((offer, index) => (
                  <div
                    key={offer.title || index}
                    className="flex justify-between items-center text-sm bg-softgreentheme dark:bg-bgdarktheme p-3 rounded transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="dark:text-textdarktheme text-greentheme font-bold">
                        {offer.title || t("restaurant.specialOffer")}
                      </span>
                      <span className="text-sm dark:text-textdarktheme/70 text-subblack">
                        {offer.description || t("restaurant.limitedTimeOffer")}
                      </span>
                      <span className="text-xs dark:text-textdarktheme/50 text-subblack/70">
                        {offer.percentage ? t("restaurant.percentOff", { percent: offer.percentage }) : ""}
                      </span>
                    </div>
                    <button
                      className="btn-special animate-none"
                      onClick={() => {
                        setShowReservationProcess(true)
                        setBookingData((prev) => ({
                          reserveDate: prev?.reserveDate || "",
                          time: prev?.time || "",
                          guests: prev?.guests || 0,
                          offer: offer,
                        }))
                      }}
                    >
                      {t("restaurant.selectOffer")}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Menu Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-blacktheme dark:text-textdarktheme transition-colors">{t("restaurant.ourMenu")}</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm bg-softgreentheme dark:bg-greentheme/20 text-greentheme dark:text-white px-2 py-1 rounded transition-colors">
                {t("restaurant.averagePrice", { price: restaurantInfo?.average_price || 0 })}
              </span>
            </div>
          </div>
          <div className="bg-whitetheme dark:bg-darkthemeitems shadow-sm rounded-lg p-6 transition-colors">
            {menuLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-greentheme mx-auto"></div>
                <p className="mt-2 text-subblack dark:text-textdarktheme/70">{t("restaurant.loadingMenu")}</p>
              </div>
            ) : menuError ? (
              <div className="text-center py-8">
                <p className="text-redtheme">{t("restaurant.errorLoadingMenu")}</p>
              </div>
            ) : !menu || menu.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-subblack dark:text-textdarktheme/70">{t("restaurant.noMenuAvailable")}</p>
                <p className="text-xs text-subblack dark:text-textdarktheme/50 mt-2">
                  {t("restaurant.checkBackSoon")}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {menu.map((category, categoryIdx) => (
                  <div
                    key={categoryIdx}
                    className="border-b border-softgreytheme dark:border-textdarktheme/10 pb-4 last:border-b-0"
                  >
                    <h3 className="text-lg font-semibold text-blacktheme dark:text-textdarktheme mb-3 transition-colors">
                      {category.name || t("restaurant.categoryNumber", { number: categoryIdx + 1 })}
                    </h3>
                    {category.menus && category.menus.length > 0 ? (
                      <div className="space-y-4">
                        {category.menus.map((menu, menuIdx) => (
                          <div key={menuIdx} className="ml-4">
                            <h4 className="font-medium text-blacktheme dark:text-textdarktheme mb-2 transition-colors">
                              {menu.name || t("restaurant.menuNumber", { number: menuIdx + 1 })}
                            </h4>
                            {menu.items && menu.items.length > 0 ? (
                              <div className="space-y-2 ml-4">
                                {menu.items.map((item, itemIdx) => (
                                  <div key={itemIdx} className="flex justify-between items-center py-1">
                                    <span className="text-subblack dark:text-textdarktheme/80 transition-colors">
                                      {item.name || t("restaurant.itemNumber", { number: itemIdx + 1 })}
                                    </span>
                                    <span className="text-greentheme dark:text-white font-medium">
                                      {item.price
                                        ? typeof item.price === "number"
                                          ? t("restaurant.priceMAD", { price: item.price })
                                          : item.price
                                        : t("restaurant.priceNA")}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-subblack dark:text-textdarktheme/50 ml-4 italic">
                                {t("restaurant.menuItemsComingSoon")}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-subblack dark:text-textdarktheme/50 ml-4 italic">
                        {t("restaurant.menuDetailsComingSoon")}
                      </p>
                    )}
                  </div>
                ))}
                <div className="mt-6 pt-4 border-t border-softgreytheme dark:border-textdarktheme/10">
                  <div className="flex justify-between items-center text-sm text-subblack dark:text-textdarktheme/70">
                    <span>
                      {menu.length} {menu.length === 1 ? t("restaurant.category") : t("restaurant.categories")} • {getTotalMenuCount(menu)}{" "}
                      {getTotalMenuCount(menu) === 1 ? t("restaurant.menu") : t("restaurant.menus")}
                    </span>
                    {hasMenuItems(menu) && <span className="text-greentheme dark:text-white">{t("restaurant.itemsAvailable")}</span>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
        {/* Location & Hours */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-blacktheme dark:text-textdarktheme mb-4 transition-colors">
            {t("restaurant.locationAndHours")}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-whitetheme dark:bg-darkthemeitems shadow-sm rounded-lg overflow-hidden transition-colors">
              <div className="max-h-[250px] overflow-hidden bg-softgreytheme dark:bg-bgdarktheme2 relative transition-colors">
                <MapComponent 
                    restaurants={restaurantInfo ? [{
                      ...restaurantInfo,
                      main_image: restaurantInfo.image,
                      location: restaurantInfo.location?.length === 2 ? [restaurantInfo.location[0], restaurantInfo.location[1]] as [number, number] : null,
                      distance: null,
                      status: currentStatus.color === "text-greentheme" ? "Open" : "Closed" as "Closed" | "Open"
                    }] : []}
                    selectedRestaurantId={String(restaurantInfo?.id) ?? null}
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold mb-1 dark:text-textdarktheme transition-colors flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {restaurantInfo?.city_name || t("restaurant.location")}
                </h3>
                <p className="text-subblack dark:text-textdarktheme/70 mb-2 transition-colors">
                  {restaurantInfo?.address || t("restaurant.addressNotAvailable")}
                </p>
                <div className="space-y-1 text-sm">
                  {restaurantInfo?.website && (
                    <a
                      href={
                        restaurantInfo.website.startsWith("http")
                          ? restaurantInfo.website
                          : `https://${restaurantInfo.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-greentheme dark:text-white hover:underline flex items-center gap-2"
                    >
                      <Globe className="h-3 w-3" />
                      {restaurantInfo.website}
                    </a>
                  )}
                  {restaurantInfo?.phone && (
                    <a
                      href={`tel:${restaurantInfo.phone}`}
                      className="text-greentheme dark:text-white hover:underline flex items-center gap-2"
                    >
                      <Phone className="h-3 w-3" />
                      {restaurantInfo.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-whitetheme dark:bg-darkthemeitems shadow-sm rounded-lg p-4 transition-colors">
              <h3 className="font-bold mb-3 dark:text-textdarktheme transition-colors flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {t("restaurant.hoursOfOperation")}
              </h3>
              {openingHoursLoading ? (
                <div className="space-y-2">
                  {[...Array(7)].map((_, i) => (
                    <LoadingSkeleton key={i} className="h-6 w-full" />
                  ))}
                </div>
              ) : openingHoursError ? (
                <p className="text-redtheme text-sm">{t("restaurant.errorLoadingHours")}</p>
              ) : !openingHours || openingHours.length === 0 ? (
                <p className="text-subblack dark:text-textdarktheme/70 text-sm">{t("restaurant.hoursNotAvailable")}</p>
              ) : (
                <div className="space-y-2">
                  {openingHours.map((day, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span
                        className={`${
                          day.is_today ? "font-bold text-greentheme" : ""
                        } dark:text-textdarktheme transition-colors`}
                      >
                        {day.day_name  || t("restaurant.dayNumber", { number: index + 1 })}
                      </span>
                      <span
                        className={`${
                          day.is_closed ? "text-redtheme" : "dark:text-textdarktheme/70"
                        } transition-colors`}
                      >
                        {day.is_closed
                          ? t("restaurant.closed")
                          : day.opening_time && day.closing_time
                            ? `${day.opening_time} - ${day.closing_time}`
                            : t("restaurant.hoursNA")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
        {/* Extra Services */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-blacktheme dark:text-textdarktheme mb-4 transition-colors">
            {t("restaurant.extraServices")}
          </h2>
          {extraServicesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <LoadingSkeleton key={i} className="h-24" />
              ))}
            </div>
          ) : extraServicesError ? (
            <div className="text-center py-8">
              <p className="text-redtheme">{t("restaurant.errorLoadingServices")}</p>
            </div>
          ) : !extraServices || extraServices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-subblack dark:text-textdarktheme/70">{t("restaurant.noExtraServices")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {extraServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-whitetheme dark:bg-darkthemeitems shadow-sm rounded-lg p-4 flex items-center justify-center text-center flex-col transition-colors"
                >
                  <PlusSquare className="h-6 w-6 text-greentheme mb-2" />
                  <span className="text-sm font-medium dark:text-textdarktheme transition-colors">
                    {service.name || t("restaurant.service")}
                  </span>
                  {service.description && (
                    <span className="text-xs text-subblack dark:text-textdarktheme/70 mt-1">{service.description}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
        {/* User Photos */}
        {(gallery && gallery.length > 0) ? (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-blacktheme dark:text-textdarktheme mb-4 transition-colors">
              {t("restaurant.userPhotos", { count: gallery.length })}
            </h2>
            {galleryLoading ? (
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {[...Array(8)].map((_, i) => (
                  <LoadingSkeleton key={i} className="aspect-square" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {gallery.slice(0, 8).map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-md overflow-hidden cursor-pointer">
                    <img
                      src={photo.file || "/placeholder.svg?height=100&width=100"}
                      alt={t("restaurant.userPhotoNumber", { number: index + 1 })}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                      onClick={() => {
                        setSelectedPhoto(photo.file)
                        setShowPhotoPopup(true)
                      }}
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=100&width=100"
                      }}
                    />
                    {gallery.length > 8 && index === 7 && (
                      <div className="absolute inset-0 bg-blacktheme/60 flex items-center justify-center">
                        <span className="text-whitetheme font-bold text-xs">{t("restaurant.morePhotos", { count: gallery.length - 8 })}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        ):
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-blacktheme dark:text-textdarktheme mb-4 transition-colors">
              {t("restaurant.userPhotos", { count: 0 })}
            </h2>
            <div className="text-center py-8">
              <p className="text-subblack dark:text-textdarktheme/70">{t("restaurant.noUserPhotos")}</p>
            </div>
          </section>
        }
        {/* Reviews */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-blacktheme dark:text-textdarktheme transition-colors">
              {t("restaurant.reviews")} {Array.isArray(reviews) && reviews.length > 0 && `(${reviews.length})`}
            </h2>
            <button className="border border-softgreytheme dark:border-textdarktheme/20 rounded px-3 py-1 text-sm flex items-center gap-1 dark:text-textdarktheme transition-colors">
              {t("restaurant.sortBy")} <ChevronDown className="h-4 w-4" />
            </button>
          </div>
          {reviewsLoading ? (
            <div className="space-y-4 mb-6">
              {[...Array(3)].map((_, i) => (
                <LoadingSkeleton key={i} className="h-24" />
              ))}
            </div>
          ) : reviewsError ? (
            <div className="text-center py-8 mb-6">
              <p className="text-redtheme">{t("restaurant.errorLoadingReviews")}</p>
            </div>
          ) : !reviews || !Array.isArray(reviews) || reviews.length === 0 ? (
            <div className="text-center py-8 mb-6">
              <p className="text-subblack dark:text-textdarktheme/70">{t("restaurant.noReviewsYet")}</p>
              <p className="text-xs text-subblack dark:text-textdarktheme/50 mt-2">
                {t("restaurant.beFirstShare")}
              </p>
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              {Array.isArray(reviews) &&
                reviews.slice(0, 5).map((review, index) => {
                  const food = Number(review.food_rating) || 0
                  const service = Number(review.service_rating) || 0
                  const ambience = Number(review.ambience_rating) || 0
                  const value = Number(review.value_for_money) || 0
                  const avgRating = Math.round((food + service + ambience + value) / 4) || 0
                  return (
                    <div
                      key={review.id || index}
                      className="bg-whitetheme dark:bg-darkthemeitems shadow-sm rounded-lg p-4 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-softgreytheme dark:bg-bgdarktheme2 flex items-center justify-center">
                          <span className="text-xs font-medium text-blacktheme dark:text-textdarktheme">
                            {review.customer ? t("restaurant.userShort", { id: review.customer }) : t("restaurant.user")}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium dark:text-textdarktheme transition-colors">
                              {review.customer ? t("restaurant.userLong", { id: review.customer }) : t("restaurant.anonymousUser")}
                            </h4>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3 w-3 ${
                                    star <= avgRating
                                      ? "text-yellowtheme fill-yellowtheme"
                                      : "text-softgreytheme dark:text-textdarktheme/30"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-subblack dark:text-textdarktheme/70 text-sm transition-colors">
                            {review.description || t("restaurant.noCommentProvided")}
                          </p>
                          {review.created_at && (
                            <p className="text-xs text-subblack dark:text-textdarktheme/50 mt-1">
                              {new Date(review.created_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
          <button className="btn-primary" onClick={() => setShowWriteReview(true)}>
            {t("restaurant.submitReview")}
          </button>
        </section>
      </div>
    </div>
  )
}
