"use client"

import { useEffect, useState } from "react"
import type React from "react"
import { Star, ChevronRight, ChevronLeft, ChevronDown, PlusSquare, Clock, MapPin, Phone, Globe } from "lucide-react"
import ReservationProcess from "../../../components/restaurant/ReservationProcess"
import PhotoPopup from "../../../components/restaurant/PhotoPopup"
import ReviewForm, { type ReviewData } from "../../../components/restaurant/ReviewForm"
import { useParams } from "next/navigation" // Changed from react-router
import {
  dataProvider,
  type Restaurant,
  type OfferType,
  type OpeningHour,
  type MenuCategory,
  type ExtraService,
  type Review,
  type GalleryItem,
} from "../../../lib/dataProvider" // Using custom dataProvider
import { MapComponent } from "@/components/search/MapSection"

// Update SelectedData to match the ReservationProcess component expectations
type SelectedData = {
  reserveDate: string
  time: string
  guests: number
  offer?: OfferType | null
}

// Loading skeleton component
const LoadingSkeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-softgreytheme dark:bg-bgdarktheme2 rounded ${className}`}></div>
)

export default function RestaurantPage() {
  const params = useParams()
  const id = params.id as string // Get ID from Next.js useParams

  const [restaurantInfo, setRestaurantInfo] = useState<Restaurant | null>(null)
  const [restaurantLoading, setRestaurantLoading] = useState(true)
  const [restaurantError, setRestaurantError] = useState<string | null>(null)

  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([])
  const [openingHoursLoading, setOpeningHoursLoading] = useState(true)
  const [openingHoursError, setOpeningHoursError] = useState<string | null>(null)

  const [menu, setMenu] = useState<MenuCategory[]>([])
  const [menuLoading, setMenuLoading] = useState(true)
  const [menuError, setMenuError] = useState<string | null>(null)

  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewsError, setReviewsError] = useState<string | null>(null)

  const [extraServices, setExtraServices] = useState<ExtraService[]>([])
  const [extraServicesLoading, setExtraServicesLoading] = useState(true)
  const [extraServicesError, setExtraServicesError] = useState<string | null>(null)

  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [galleryLoading, setGalleryLoading] = useState(true)
  const [galleryError, setGalleryError] = useState<string | null>(null)

  // Fetch all data concurrently
  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      // Fetch Restaurant Info
      setRestaurantLoading(true)
      try {
        const data = await dataProvider.restaurants.getRestaurant(id)
        setRestaurantInfo(data)
        setRestaurantError(null)
      } catch (err: any) {
        setRestaurantError(err.message || "Failed to fetch restaurant info")
      } finally {
        setRestaurantLoading(false)
      }

      // Fetch Opening Hours
      setOpeningHoursLoading(true)
      try {
        const data = await dataProvider.restaurants.getRestaurantAvailability(id)
        setOpeningHours(data)
        setOpeningHoursError(null)
      } catch (err: any) {
        setOpeningHoursError(err.message || "Failed to fetch opening hours")
      } finally {
        setOpeningHoursLoading(false)
      }

      // Fetch Menu
      setMenuLoading(true)
      try {
        const data = await dataProvider.restaurants.getRestaurantMenu(id)
        setMenu(data)
        setMenuError(null)
      } catch (err: any) {
        setMenuError(err.message || "Failed to fetch menu")
      } finally {
        setMenuLoading(false)
      }

      // Fetch Reviews
      setReviewsLoading(true)
      try {
        const data = await dataProvider.restaurants.getRestaurantReviews(id)
        setReviews(data)
        setReviewsError(null)
      } catch (err: any) {
        setReviewsError(err.message || "Failed to fetch reviews")
      } finally {
        setReviewsLoading(false)
      }

      // Fetch Extra Services
      setExtraServicesLoading(true)
      try {
        const data = await dataProvider.restaurants.getRestaurantServices(id)
        setExtraServices(data)
        setExtraServicesError(null)
      } catch (err: any) {
        setExtraServicesError(err.message || "Failed to fetch extra services")
      } finally {
        setExtraServicesLoading(false)
      }

      // Fetch Gallery
      setGalleryLoading(true)
      try {
        const data = await dataProvider.restaurants.getRestaurantGallery(id)
        setGallery(data)
        setGalleryError(null)
      } catch (err: any) {
        setGalleryError(err.message || "Failed to fetch gallery")
      } finally {
        setGalleryLoading(false)
      }
    }

    fetchData()
  }, [id])

  useEffect(() => {
    const restaurantName = restaurantInfo?.name || "Restaurant"
    document.title = `${restaurantName} - Tabla | Taste Morocco's Best`
  }, [restaurantInfo])

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showAllMenu, setShowAllMenu] = useState(false) // This state is not used in the provided code, keeping for consistency
  const [showReservationProcess, setShowReservationProcess] = useState(false)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchEndX, setTouchEndX] = useState<number | null>(null)

  // Use restaurant gallery images if available, otherwise fallback to placeholder images
  const mainImages =
    restaurantInfo?.gallery && restaurantInfo.gallery.length > 0
      ? restaurantInfo.gallery.map((img) => img.file)
      : [
          "/placeholder.svg?height=400&width=800",
          "/placeholder.svg?height=400&width=800",
          "/placeholder.svg?height=400&width=800",
        ]

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % mainImages.length)
  }
  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + mainImages.length) % mainImages.length)
  }

  // Swipe event handlers for the image gallery
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

  const handleSubmitReview = (reviewData: ReviewData) => {
    console.log("Review submitted:", reviewData)
    alert("Thank you for your review!") // Placeholder for actual submission logic
    setShowWriteReview(false)
  }

  // Helper function to check if menu has any items
  const hasMenuItems = (menuCategories: MenuCategory[]): boolean => {
    return menuCategories.some((category) => category.menus?.some((menu) => menu.items && menu.items.length > 0))
  }

  // Get total number of categories and menus for display
  const getTotalMenuCount = (menuCategories: MenuCategory[]): number => {
    return menuCategories.reduce((total, category) => {
      return total + (category.menus ? category.menus.length : 0)
    }, 0)
  }

  const labelReviews = (rating: number | null | undefined): string => {
    if (rating === undefined || rating === null || isNaN(rating)) {
      return "No Rating"
    }
    if (rating < 2) {
      return "Very Bad"
    } else if (rating >= 2 && rating < 3) {
      return "Bad"
    } else if (rating >= 3 && rating < 4) {
      return "Average"
    } else if (rating >= 4 && rating < 4.5) {
      return "Good"
    } else {
      return "Very Good"
    }
  }

  // Helper function to get current status
  const getCurrentStatus = (): { text: string; color: string } => {
    if (openingHoursLoading) return { text: "Loading...", color: "text-subblack" }
    if (openingHoursError || !openingHours || openingHours.length === 0) {
      return { text: "Hours N/A", color: "text-subblack" }
    }
    const today = openingHours.find((day) => day.is_today)
    if (!today) return { text: "Hours N/A", color: "text-subblack" }
    if (today.is_closed) return { text: "Closed", color: "text-redtheme" }
    if (!today.opening_time || !today.closing_time) {
      return { text: "Hours N/A", color: "text-subblack" }
    }
    try {
      const [openHour, openMinute] = today.opening_time.split(":").map(Number)
      const [closeHour, closeMinute] = today.closing_time.split(":").map(Number)
      const now = new Date()
      const nowMinutes = now.getHours() * 60 + now.getMinutes()
      const openMinutes = openHour * 60 + openMinute
      const closeMinutes = closeHour * 60 + closeMinute

      // Handle overnight closing times (e.g., 22:00 - 02:00)
      const isOpen =
        closeMinutes > openMinutes
          ? nowMinutes >= openMinutes && nowMinutes < closeMinutes
          : nowMinutes >= openMinutes || nowMinutes < closeMinutes

      return {
        text: isOpen ? "Open Now" : "Closed",
        color: isOpen ? "text-greentheme" : "text-redtheme",
      }
    } catch (error) {
      return { text: "Hours N/A", color: "text-subblack" }
    }
  }
  const currentStatus = getCurrentStatus()

  // Show main loading state if restaurant data is loading
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

  // Show error state if restaurant data failed to load
  if (restaurantError) {
    return (
      <div className="min-h-screen dark:text-white bg-softgreytheme dark:bg-bgdarktheme transition-colors duration-200">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-redtheme mb-4">Error Loading Restaurant</h1>
            <p className="text-subblack dark:text-textdarktheme/70 mb-6">
              We couldn't load the restaurant information. Please try again later.
            </p>
            <button onClick={() => window.location.reload()} className="btn-primary">
              Try Again
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
            <h1 className="mb-6 text-2xl font-bold text-blacktheme dark:text-textdarktheme">Write a Review</h1>
            <ReviewForm onSubmit={handleSubmitReview} />
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
          altText="Gallery photo"
        />
      )}
      {shouldShowBook && (
        <div className="relative flex justify-center mb-6">
          <button
            className="fixed z-[200] bottom-[40px] shadow-xl w-[20em] btn-special"
            onClick={() => setShowReservationProcess(true)}
          >
            Book Your Table
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
              alt={`${restaurantInfo?.name || "Restaurant"} interior`}
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
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5 text-blacktheme dark:text-textdarktheme" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-whitetheme/80 dark:bg-darkthemeitems/80 rounded-full p-2 shadow-md hover:bg-whitetheme dark:hover:bg-darkthemeitems transition-colors"
                  aria-label="Next image"
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
                    aria-label={`View image ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-center mb-6">
          <button className="btn-special w-[20em]" onClick={() => setShowReservationProcess(true)}>
            Book
          </button>
        </div>
        {/* Restaurant Info */}
        <div className="mb-12">
          <div className="flex justify-between lt-sm:flex-col lt-sm:items-center lt-sm:gap-5 items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-blacktheme dark:text-textdarktheme mb-2 transition-colors">
                {restaurantInfo?.name || "Restaurant Name"}
              </h1>
              <div className="flex items-center gap-4 text-sm text-subblack dark:text-textdarktheme/80 mb-2 transition-colors">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-greentheme rounded-full"></span>
                  {restaurantInfo?.category_name || "Category"}
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
                {restaurantInfo?.description || "Welcome to our restaurant. We look forward to serving you!"}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-whitetheme dark:bg-darkthemeitems shadow-md rounded-lg p-3 text-center transition-colors">
                <div className="text-3xl font-bold text-yellowtheme">
                  {restaurantInfo?.rating ? restaurantInfo.rating.toFixed(1) : "N/A"}
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
                  Based on {Array.isArray(reviews) ? reviews.length : 0} reviews
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="bg-whitetheme dark:bg-darkthemeitems shadow-sm rounded p-2 transition-colors">
                  <div className="text-yellowtheme font-bold">
                    {restaurantInfo?.food_rating ? restaurantInfo.food_rating.toFixed(1) : "N/A"}
                  </div>
                  <div className="text-xs text-subblack dark:text-textdarktheme/70 transition-colors">Food</div>
                </div>
                <div className="bg-whitetheme dark:bg-darkthemeitems shadow-sm rounded p-2 transition-colors">
                  <div className="text-yellowtheme font-bold">
                    {restaurantInfo?.service_rating ? restaurantInfo.service_rating.toFixed(1) : "N/A"}
                  </div>
                  <div className="text-xs text-subblack dark:text-textdarktheme/70 transition-colors">Service</div>
                </div>
                <div className="bg-whitetheme dark:bg-darkthemeitems shadow-sm rounded p-2 transition-colors">
                  <div className="text-yellowtheme font-bold">
                    {restaurantInfo?.ambience_rating ? restaurantInfo.ambience_rating.toFixed(1) : "N/A"}
                  </div>
                  <div className="text-xs text-subblack dark:text-textdarktheme/70 transition-colors">Ambiance</div>
                </div>
              </div>
            </div>
          </div>
          {/* Offers Section */}
          {offers && offers.length > 0 && (
            <div className="bg-whitetheme dark:bg-darkthemeitems shadow-sm rounded-lg p-4 mb-8 transition-colors">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg dark:text-textdarktheme transition-colors">Tabla Offers</h3>
              </div>
              <div className="space-y-4">
                {offers.map((offer, index) => (
                  <div
                    key={offer.title || index}
                    className="flex justify-between items-center text-sm bg-softgreentheme dark:bg-bgdarktheme p-3 rounded transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="dark:text-textdarktheme text-greentheme font-bold">
                        {offer.title || "Special Offer"}
                      </span>
                      <span className="text-sm dark:text-textdarktheme/70 text-subblack">
                        {offer.description || "Limited time offer"}
                      </span>
                      <span className="text-xs dark:text-textdarktheme/50 text-subblack/70">
                        {offer.percentage ? `${offer.percentage}% off` : ""}
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
                      Select Offer
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
            <h2 className="text-2xl font-bold text-blacktheme dark:text-textdarktheme transition-colors">Our menu</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm bg-softgreentheme dark:bg-greentheme/20 text-greentheme dark:text-white px-2 py-1 rounded transition-colors">
                Average Price {restaurantInfo?.average_price || 0} MAD
              </span>
            </div>
          </div>
          <div className="bg-whitetheme dark:bg-darkthemeitems shadow-sm rounded-lg p-6 transition-colors">
            {menuLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-greentheme mx-auto"></div>
                <p className="mt-2 text-subblack dark:text-textdarktheme/70">Loading menu...</p>
              </div>
            ) : menuError ? (
              <div className="text-center py-8">
                <p className="text-redtheme">Error loading menu. Please try again later.</p>
              </div>
            ) : !menu || menu.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-subblack dark:text-textdarktheme/70">No menu available at the moment.</p>
                <p className="text-xs text-subblack dark:text-textdarktheme/50 mt-2">
                  Check back soon for our delicious offerings!
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
                      {category.name || `Category ${categoryIdx + 1}`}
                    </h3>
                    {category.menus && category.menus.length > 0 ? (
                      <div className="space-y-4">
                        {category.menus.map((menu, menuIdx) => (
                          <div key={menuIdx} className="ml-4">
                            <h4 className="font-medium text-blacktheme dark:text-textdarktheme mb-2 transition-colors">
                              {menu.name || `Menu ${menuIdx + 1}`}
                            </h4>
                            {menu.items && menu.items.length > 0 ? (
                              <div className="space-y-2 ml-4">
                                {menu.items.map((item, itemIdx) => (
                                  <div key={itemIdx} className="flex justify-between items-center py-1">
                                    <span className="text-subblack dark:text-textdarktheme/80 transition-colors">
                                      {item.name || `Item ${itemIdx + 1}`}
                                    </span>
                                    <span className="text-greentheme dark:text-white font-medium">
                                      {item.price
                                        ? typeof item.price === "number"
                                          ? `${item.price} MAD`
                                          : item.price
                                        : "Price N/A"}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-subblack dark:text-textdarktheme/50 ml-4 italic">
                                Menu items coming soon...
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-subblack dark:text-textdarktheme/50 ml-4 italic">
                        Menu details coming soon...
                      </p>
                    )}
                  </div>
                ))}
                <div className="mt-6 pt-4 border-t border-softgreytheme dark:border-textdarktheme/10">
                  <div className="flex justify-between items-center text-sm text-subblack dark:text-textdarktheme/70">
                    <span>
                      {menu.length} {menu.length === 1 ? "category" : "categories"} • {getTotalMenuCount(menu)}{" "}
                      {getTotalMenuCount(menu) === 1 ? "menu" : "menus"}
                    </span>
                    {hasMenuItems(menu) && <span className="text-greentheme dark:text-white">Items available</span>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
        {/* Location & Hours */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-blacktheme dark:text-textdarktheme mb-4 transition-colors">
            Location & Hours Of Work
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-whitetheme dark:bg-darkthemeitems shadow-sm rounded-lg overflow-hidden transition-colors">
              <div className="max-h-[250px] overflow-hidden bg-softgreytheme dark:bg-bgdarktheme2 relative transition-colors">
                <MapComponent 
                    restaurants={restaurantInfo ? [restaurantInfo] : []}
                    selectedRestaurantId={String(restaurantInfo?.id) ?? null}
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold mb-1 dark:text-textdarktheme transition-colors flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {restaurantInfo?.city_name || "Location"}
                </h3>
                <p className="text-subblack dark:text-textdarktheme/70 mb-2 transition-colors">
                  {restaurantInfo?.address || "Address not available"}
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
                      className="text-greentheme dark:text-white hover:underline block flex items-center gap-2"
                    >
                      <Globe className="h-3 w-3" />
                      {restaurantInfo.website}
                    </a>
                  )}
                  {restaurantInfo?.phone && (
                    <a
                      href={`tel:${restaurantInfo.phone}`}
                      className="text-greentheme dark:text-white hover:underline block flex items-center gap-2"
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
                Hours of Operation
              </h3>
              {openingHoursLoading ? (
                <div className="space-y-2">
                  {[...Array(7)].map((_, i) => (
                    <LoadingSkeleton key={i} className="h-6 w-full" />
                  ))}
                </div>
              ) : openingHoursError ? (
                <p className="text-redtheme text-sm">Error loading hours. Please try again later.</p>
              ) : !openingHours || openingHours.length === 0 ? (
                <p className="text-subblack dark:text-textdarktheme/70 text-sm">Hours not available</p>
              ) : (
                <div className="space-y-2">
                  {openingHours.map((day, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span
                        className={`${
                          day.is_today ? "font-bold text-greentheme" : ""
                        } dark:text-textdarktheme transition-colors`}
                      >
                        {day.day_name || `Day ${index + 1}`}
                      </span>
                      <span
                        className={`${
                          day.is_closed ? "text-redtheme" : "dark:text-textdarktheme/70"
                        } transition-colors`}
                      >
                        {day.is_closed
                          ? "Closed"
                          : day.opening_time && day.closing_time
                            ? `${day.opening_time} - ${day.closing_time}`
                            : "Hours N/A"}
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
            Extra Services
          </h2>
          {extraServicesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <LoadingSkeleton key={i} className="h-24" />
              ))}
            </div>
          ) : extraServicesError ? (
            <div className="text-center py-8">
              <p className="text-redtheme">Error loading services. Please try again later.</p>
            </div>
          ) : !extraServices || extraServices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-subblack dark:text-textdarktheme/70">No extra services available at the moment.</p>
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
                    {service.name || "Service"}
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
        {gallery && gallery.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-blacktheme dark:text-textdarktheme mb-4 transition-colors">
              User Photos ({gallery.length})
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
                      alt={`User photo ${index + 1}`}
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
                        <span className="text-whitetheme font-bold text-xs">+{gallery.length - 8} more</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
        {/* Reviews */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-blacktheme dark:text-textdarktheme transition-colors">
              Reviews {Array.isArray(reviews) && reviews.length > 0 && `(${reviews.length})`}
            </h2>
            <button className="border border-softgreytheme dark:border-textdarktheme/20 rounded px-3 py-1 text-sm flex items-center gap-1 dark:text-textdarktheme transition-colors">
              Sort by <ChevronDown className="h-4 w-4" />
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
              <p className="text-redtheme">Error loading reviews. Please try again later.</p>
            </div>
          ) : !reviews || !Array.isArray(reviews) || reviews.length === 0 ? (
            <div className="text-center py-8 mb-6">
              <p className="text-subblack dark:text-textdarktheme/70">No reviews yet.</p>
              <p className="text-xs text-subblack dark:text-textdarktheme/50 mt-2">
                Be the first to share your experience!
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
                            {review.customer ? `U${review.customer}` : "User"}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium dark:text-textdarktheme transition-colors">
                              {review.customer ? `User #${review.customer}` : "Anonymous User"}
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
                            {review.description || "No comment provided"}
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
            Submit a Review
          </button>
        </section>
      </div>
    </div>
  )
}
