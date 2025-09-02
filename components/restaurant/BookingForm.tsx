"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, User, Mail, Phone, Calendar, Clock, Users, MessageSquare, Heart, Utensils } from "lucide-react"
import { useCreateBooking, useOffers } from "@/hooks/api/useReservations"
import { useAuth } from "../auth/AuthProvider"
import { dataProvider, type BookingRequest, type User as UserType } from "@/lib/dataProvider"

interface BookingFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (data: any) => void
  restaurantId: number
  bookingData?: {
    reserveDate: string
    time: string
    guests: number
    offer_id?: number | null
  }
  continueAsGuest?: boolean
}

export default function BookingForm({ isOpen, onClose, onSuccess, restaurantId, bookingData, continueAsGuest = false }: BookingFormProps) {
  const { isAuthenticated, user } = useAuth()
  const createBookingMutation = useCreateBooking()
  
  // Get restaurant offers to display selected offer details
  const { data: offers } = useOffers(restaurantId, !!restaurantId)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<UserType | null>(null)

  // Form state
  const [formData, setFormData] = useState<BookingRequest>(() => {
    const baseData: BookingRequest = {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      title: "mr",
      number_of_guests: bookingData?.guests || 2,
      date: bookingData?.reserveDate || "",
      time: bookingData?.time || "",
      restaurant: restaurantId,
      commenter: "",
      internal_note: "",
      allergies: "",
      preferences: "",
      occasion: undefined,
      area: undefined,
    }

    // Only include offer_id if there's actually an offer selected
    if (bookingData?.offer_id && bookingData.offer_id > 0) {
      baseData.offer_id = [bookingData.offer_id]
    }

    return baseData
  })

  // Load user profile data when component mounts
  useEffect(() => {
    const loadUserProfile = async () => {
      if (isAuthenticated) {
        try {
          const profile = await dataProvider.auth.getProfile()
          setUserProfile(profile)
          
          // Pre-fill form with user data
          setFormData(prev => ({
            ...prev,
            first_name: profile.first_name || "",
            last_name: profile.last_name || "",
            email: profile.email || "",
            phone: profile.phone || "",
          }))
        } catch (error) {
          console.error("Failed to load user profile:", error)
        }
      }
    }

    if (isOpen) {
      loadUserProfile()
    }
  }, [isOpen, isAuthenticated])

  // Update form data when booking data changes
  useEffect(() => {
    if (bookingData) {
      setFormData(prev => {
        const updatedData: BookingRequest = {
          ...prev,
          number_of_guests: bookingData.guests,
          date: bookingData.reserveDate,
          time: bookingData.time,
        }

        // Only include offer_id if there's actually an offer selected
        if (bookingData.offer_id && bookingData.offer_id > 0) {
          updatedData.offer_id = [bookingData.offer_id]
        } else {
          // Remove offer_id from the form data if no offer is selected
          delete updatedData.offer_id
        }

        return updatedData
      })
    }
  }, [bookingData])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Format the time properly - ensure it's in HH:MM:SS format
      let formattedTime = formData.time
      if (formattedTime && !formattedTime.includes(":")) {
        // If time is like "1930", convert to "19:30:00"
        if (formattedTime.length === 4) {
          formattedTime = `${formattedTime.slice(0, 2)}:${formattedTime.slice(2)}:00`
        }
      } else if (formattedTime && formattedTime.split(":").length === 2) {
        // If time is like "19:30", add seconds
        formattedTime = `${formattedTime}:00`
      }

      const bookingRequest: BookingRequest = {
        ...formData,
        time: formattedTime,
        restaurant: restaurantId,
      }

      // Only include offer_id if there's actually an offer selected
      if (formData.offer_id && formData.offer_id.length > 0) {
        bookingRequest.offer_id = formData.offer_id
      } else {
        // Explicitly remove offer_id from the request if no offer is selected
        delete bookingRequest.offer_id
      }

      const result = await createBookingMutation.mutateAsync(bookingRequest)
      setSuccess("Booking created successfully!")
      onSuccess(result)
      
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Failed to create booking. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-blacktheme/20 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl mx-4 bg-whitetheme dark:bg-darkthemeitems rounded-xl shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-softgreytheme dark:border-subblack sticky top-0 bg-whitetheme dark:bg-darkthemeitems">
          <h2 className="text-xl font-bold text-blacktheme dark:text-textdarktheme">
            {continueAsGuest ? "Complete Your Reservation as Guest" : "Complete Your Reservation"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-softgreytheme dark:hover:bg-bgdarktheme2 transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-greytheme dark:text-textdarktheme/70" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-softredtheme dark:bg-redtheme/20 border border-redtheme/20 dark:border-redtheme/40 rounded-lg">
              <p className="text-redtheme text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-softgreentheme dark:bg-greentheme/20 border border-greentheme/20 dark:border-greentheme/40 rounded-lg">
              <p className="text-greentheme text-sm">{success}</p>
            </div>
          )}

          {/* Booking Summary */}
          {bookingData && (
            <div className="mb-6 p-4 bg-softgreytheme dark:bg-bgdarktheme2 rounded-lg">
              <h3 className="text-lg font-semibold text-blacktheme dark:text-textdarktheme mb-3">Reservation Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-greentheme mr-2" />
                  <span className="text-blacktheme dark:text-textdarktheme">{bookingData.reserveDate}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-greentheme mr-2" />
                  <span className="text-blacktheme dark:text-textdarktheme">{bookingData.time}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-greentheme mr-2" />
                  <span className="text-blacktheme dark:text-textdarktheme">{bookingData.guests} guests</span>
                </div>
              </div>
              {/* {bookingData.offer_id && bookingData.offer_id > 0 && offers && (
                <div className="mt-3 p-2 bg-warning-soft rounded-lg">
                  <div className="flex items-center">
                    <span className="bg-orangetheme text-white px-2 py-1 rounded-full text-xs font-bold mr-2">
                      {offers.find(offer => offer.id === bookingData.offer_id)?.percentage}% OFF
                    </span>
                    <span className="text-sm text-blacktheme dark:text-textdarktheme">{offers.find(offer => offer.id === bookingData.offer_id)?.title}</span>
                  </div>
                </div>
              )} */}
            </div>
          )}

          {/* Booking Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-blacktheme dark:text-textdarktheme mb-3">Personal Information</h3>
              {isAuthenticated && (
                <div className="mb-4 p-3 bg-softgreentheme dark:bg-greentheme/20 border border-greentheme/20 dark:border-greentheme/40 rounded-lg">
                  <p className="text-greentheme text-sm flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Your personal information has been automatically filled from your profile.
                  </p>
                </div>
              )}
              {continueAsGuest && !isAuthenticated && (
                <div className="mb-4 p-3 bg-softgreytheme dark:bg-bgdarktheme2 border border-softgreytheme dark:border-subblack rounded-lg">
                  <p className="text-greytheme dark:text-textdarktheme text-sm flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Please fill in your personal information to complete the reservation as a guest.
                  </p>
                </div>
              )}
              
              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-blacktheme dark:text-textdarktheme mb-1">
                  Title *
                </label>
                <select
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value as "mr" | "mrs" | "ms" })}
                  className="w-full px-3 py-3 border border-softgreytheme dark:border-subblack rounded-lg bg-whitetheme dark:bg-bgdarktheme2 text-blacktheme dark:text-textdarktheme focus:border-greentheme focus:ring-2 focus:ring-softgreentheme outline-none transition-colors"
                >
                  <option value="mr">Mr.</option>
                  <option value="mrs">Mrs.</option>
                  <option value="ms">Ms.</option>
                </select>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blacktheme dark:text-textdarktheme mb-1">
                    First Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-greytheme dark:text-textdarktheme/70" />
                    <input
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      readOnly={isAuthenticated}
                      disabled={isAuthenticated}
                      className={`w-full pl-10 pr-4 py-3 border border-softgreytheme dark:border-subblack rounded-lg text-blacktheme dark:text-textdarktheme placeholder:text-greytheme dark:placeholder:text-textdarktheme/50 outline-none transition-colors ${
                        isAuthenticated 
                          ? 'bg-softgreytheme dark:bg-subblack cursor-not-allowed opacity-70' 
                          : 'bg-whitetheme dark:bg-bgdarktheme2 focus:border-greentheme focus:ring-2 focus:ring-softgreentheme'
                      }`}
                      placeholder="Enter your first name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blacktheme dark:text-textdarktheme mb-1">
                    Last Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-greytheme dark:text-textdarktheme/70" />
                    <input
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      readOnly={isAuthenticated}
                      disabled={isAuthenticated}
                      className={`w-full pl-10 pr-4 py-3 border border-softgreytheme dark:border-subblack rounded-lg text-blacktheme dark:text-textdarktheme placeholder:text-greytheme dark:placeholder:text-textdarktheme/50 outline-none transition-colors ${
                        isAuthenticated 
                          ? 'bg-softgreytheme dark:bg-subblack cursor-not-allowed opacity-70' 
                          : 'bg-whitetheme dark:bg-bgdarktheme2 focus:border-greentheme focus:ring-2 focus:ring-softgreentheme'
                      }`}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-blacktheme dark:text-textdarktheme mb-1">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-greytheme dark:text-textdarktheme/70" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      readOnly={isAuthenticated}
                      disabled={isAuthenticated}
                      className={`w-full pl-10 pr-4 py-3 border border-softgreytheme dark:border-subblack rounded-lg text-blacktheme dark:text-textdarktheme placeholder:text-greytheme dark:placeholder:text-textdarktheme/50 outline-none transition-colors ${
                        isAuthenticated 
                          ? 'bg-softgreytheme dark:bg-subblack cursor-not-allowed opacity-70' 
                          : 'bg-whitetheme dark:bg-bgdarktheme2 focus:border-greentheme focus:ring-2 focus:ring-softgreentheme'
                      }`}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blacktheme dark:text-textdarktheme mb-1">
                    Phone *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-greytheme dark:text-textdarktheme/70" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      readOnly={isAuthenticated}
                      disabled={isAuthenticated}
                      className={`w-full pl-10 pr-4 py-3 border border-softgreytheme dark:border-subblack rounded-lg text-blacktheme dark:text-textdarktheme placeholder:text-greytheme dark:placeholder:text-textdarktheme/50 outline-none transition-colors ${
                        isAuthenticated 
                          ? 'bg-softgreytheme dark:bg-subblack cursor-not-allowed opacity-70' 
                          : 'bg-whitetheme dark:bg-bgdarktheme2 focus:border-greentheme focus:ring-2 focus:ring-softgreentheme'
                      }`}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <h3 className="text-lg font-semibold text-blacktheme dark:text-textdarktheme mb-3">Special Requests</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blacktheme dark:text-textdarktheme mb-1">
                    Special Comments
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-greytheme dark:text-textdarktheme/70" />
                    <textarea
                      value={formData.commenter || ""}
                      onChange={(e) => setFormData({ ...formData, commenter: e.target.value })}
                      rows={3}
                      className="w-full pl-10 pr-4 py-3 border border-softgreytheme dark:border-subblack rounded-lg bg-whitetheme dark:bg-bgdarktheme2 text-blacktheme dark:text-textdarktheme placeholder:text-greytheme dark:placeholder:text-textdarktheme/50 focus:border-greentheme focus:ring-2 focus:ring-softgreentheme outline-none transition-colors resize-none"
                      placeholder="Any special requests or comments..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blacktheme dark:text-textdarktheme mb-1">
                    Allergies & Dietary Restrictions
                  </label>
                  <div className="relative">
                    <Heart className="absolute left-3 top-3 h-4 w-4 text-greytheme dark:text-textdarktheme/70" />
                    <textarea
                      value={formData.allergies || ""}
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                      rows={2}
                      className="w-full pl-10 pr-4 py-3 border border-softgreytheme dark:border-subblack rounded-lg bg-whitetheme dark:bg-bgdarktheme2 text-blacktheme dark:text-textdarktheme placeholder:text-greytheme dark:placeholder:text-textdarktheme/50 focus:border-greentheme focus:ring-2 focus:ring-softgreentheme outline-none transition-colors resize-none"
                      placeholder="Please list any allergies or dietary restrictions..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blacktheme dark:text-textdarktheme mb-1">
                    Food Preferences
                  </label>
                  <div className="relative">
                    <Utensils className="absolute left-3 top-3 h-4 w-4 text-greytheme dark:text-textdarktheme/70" />
                    <textarea
                      value={formData.preferences || ""}
                      onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                      rows={2}
                      className="w-full pl-10 pr-4 py-3 border border-softgreytheme dark:border-subblack rounded-lg bg-whitetheme dark:bg-bgdarktheme2 text-blacktheme dark:text-textdarktheme placeholder:text-greytheme dark:placeholder:text-textdarktheme/50 focus:border-greentheme focus:ring-2 focus:ring-softgreentheme outline-none transition-colors resize-none"
                      placeholder="Any food preferences or special requests..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 border border-softgreytheme dark:border-subblack rounded-lg text-blacktheme dark:text-textdarktheme hover:bg-softgreytheme dark:hover:bg-bgdarktheme2 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 bg-greentheme text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Reservation..." : "Confirm Reservation"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
