"use client"

import type React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { format } from "date-fns"
import OurCalendar from "../calendar/OurCalendar"
import BookingForm from "./BookingForm"
import { useRestaurantAvailability } from "@/hooks/api/useRestaurants"
import { useReservationAvailability, useTimeSlots, useMonthlyAvailability, useOffers } from "@/hooks/api/useReservations"
import { useManualInvalidation } from "@/hooks/api"
import type { MonthlyDayAvailability } from "@/lib/dataProvider"
import AuthPopup from "../auth/AuthPopup"
import { useAuth } from "../auth/AuthProvider"

type SelectedData = {
  reserveDate: string
  time: string
  guests: number
  offer_id?: number
}

// Updated Offer type to match your API structure
type Offer = {
  id: number
  title: string
  description: string
  percentage: number
  valid_from_date: string
  valid_to_date: string
  time_range_from: string
  time_range_to: string
}

type ReservationProcessProps = {
  onClick: () => void
  getDateTime: (data: SelectedData) => void
  maxGuests?: number
  minGuests?: number
  dateTime?: SelectedData
  restaurantId?: number
}

const ReservationProcess: React.FC<ReservationProcessProps> = (props) => {
  const { isAuthenticated } = useAuth()
  
  // Validate required props
  if (!props.onClick || !props.getDateTime) {
    console.error("ReservationProcess: Missing required props onClick or getDateTime")
    return null
  }
  
  // Helper function to get default date (today)
  const getDefaultDate = () => {
    return new Date()
  }
  
  // Helper function to get default time (next available hour, rounded up)
  const getDefaultTime = () => {
    const now = new Date()
    const nextHour = new Date(now)
    let targetHour = now.getHours() + 1
    
    // Handle edge case where next hour would be 24 (midnight next day)
    if (targetHour >= 24) {
      targetHour = 23 // Set to 11 PM as latest default time
    }
    
    nextHour.setHours(targetHour, 0, 0, 0) // Next hour, rounded to :00
    return format(nextHour, "HH:mm")
  }
  
  // Helper function to get default guests
  const getDefaultGuests = () => {
    return 2
  }

  const [activeTab, setActiveTab] = useState<"date" | "time" | "guest" | "offers" | "confirm" | null>("date")
  
  // Initialize with default values if not provided in props
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    try {
      return props.dateTime?.reserveDate 
        ? new Date(props.dateTime.reserveDate) 
        : getDefaultDate()
    } catch (error) {
      console.error("Invalid date in props.dateTime.reserveDate:", error)
      return getDefaultDate()
    }
  })
  
  const [selectedTime, setSelectedTime] = useState<string | null>(
    props.dateTime?.time || getDefaultTime()
  )
  
  const [selectedGuests, setSelectedGuests] = useState<number | null>(
    props.dateTime?.guests || getDefaultGuests()
  )
  
  // Updated to use id as identifier instead of title
  const [selectedOffer, setSelectedOffer] = useState<number | undefined>(props.dateTime?.offer_id || undefined)
  
  const [selectedData, setSelectedData] = useState<SelectedData>(
    props.dateTime || {
      reserveDate: format(getDefaultDate(), "yyyy-MM-dd"),
      time: getDefaultTime(),
      guests: getDefaultGuests(),
      offer_id: undefined,
    },
  )
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [showAuthPopup, setShowAuthPopup] = useState(false)

  // Hooks for data management
  const { onReservationChange } = useManualInvalidation()

  // Get restaurant availability (opening days/hours) - same as restaurant profile
  const { data: restaurantAvailability, isLoading: isLoadingAvailability } = useRestaurantAvailability(
    props.restaurantId || 0,
    !!props.restaurantId
  )

  // Get restaurant offers
  const { data: offers, isLoading: isLoadingOffers } = useOffers(
    props.restaurantId,
    !!props.restaurantId
  )

  // Get available time slots for selected date and guest count
  const timeSlotsRequest = useMemo(() => {
    return selectedDate && selectedGuests ? {
      date: format(selectedDate, "yyyy-MM-dd"),
      number_of_guests: selectedGuests
    } : undefined
  }, [selectedDate, selectedGuests])

  const { data: timeSlotsData, isLoading: isLoadingTimeSlots, error: timeSlotsError } = useTimeSlots(
    props.restaurantId,
    timeSlotsRequest,
    !!props.restaurantId && !!selectedDate && !!selectedGuests
  )

  // Get monthly availability for current month to filter available dates
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1 // getMonth() returns 0-11, we need 1-12
  
  const { data: currentMonthAvailability, isLoading: isLoadingCurrentMonth } = useMonthlyAvailability(
    props.restaurantId,
    currentYear,
    currentMonth,
    !!props.restaurantId
  )
  
  // Also get next month availability for calendar that might show next month dates
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1
  const nextMonthYear = currentMonth === 12 ? currentYear + 1 : currentYear
  
  const { data: nextMonthAvailability, isLoading: isLoadingNextMonth } = useMonthlyAvailability(
    props.restaurantId,
    nextMonthYear,
    nextMonth,
    !!props.restaurantId
  )
  
  // Also get previous month availability for calendar that might show previous month dates
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1
  const prevMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear
  
  const { data: prevMonthAvailability, isLoading: isLoadingPrevMonth } = useMonthlyAvailability(
    props.restaurantId,
    prevMonthYear,
    prevMonth,
    !!props.restaurantId
  )
  
  const isLoadingMonthlyAvailability = isLoadingCurrentMonth || isLoadingNextMonth || isLoadingPrevMonth

  // Helper function to get available time slots for a specific date
  const getAvailableTimeSlotsForDate = useMemo(() => {
    return (date: Date): string[] => {
      if (!props.restaurantId || !restaurantAvailability) return []
      
      const dayName = format(date, 'EEEE').toLowerCase() // Get day name (e.g., 'monday')
      const dayAvailability = restaurantAvailability.find(day => 
        day.day_name.toLowerCase() === dayName
      )
      
      if (!dayAvailability || dayAvailability.is_closed) return []
      
      // Generate time slots between opening and closing times
      const openTime = dayAvailability.opening_time
      const closeTime = dayAvailability.closing_time
      
      if (!openTime || !closeTime) return []
      
      const slots: string[] = []
      const [openHour, openMinute] = openTime.split(':').map(Number)
      const [closeHour, closeMinute] = closeTime.split(':').map(Number)
      
      let currentHour = openHour
      let currentMinute = openMinute
      
      while (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute)) {
        const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
        slots.push(timeString)
        
        // Increment by 30 minutes
        currentMinute += 30
        if (currentMinute >= 60) {
          currentMinute = 0
          currentHour += 1
        }
      }
      
      return slots
    }
  }, [props.restaurantId, restaurantAvailability])

  // Helper function to check if a date is available based on monthly availability API and restaurant availability
  const isDateAvailable = useMemo(() => {
    return (date: Date): boolean => {
      if (!props.restaurantId) return true // Allow all dates if no restaurant ID
      
      const day = date.getDate() // Get day of month (1-31)
      
      // Check all monthly availability data
      const allAvailabilityData = [
        ...(prevMonthAvailability || []),
        ...(currentMonthAvailability || []),
        ...(nextMonthAvailability || [])
      ]
      
      // First check monthly availability API data
      if (allAvailabilityData.length > 0) {
        // Check if this date is in the right month range
        const dateYear = date.getFullYear()
        const dateMonth = date.getMonth() + 1 // getMonth() returns 0-11, we need 1-12
        
        let relevantAvailability: MonthlyDayAvailability[] | undefined
        
        if (dateYear === currentYear && dateMonth === currentMonth) {
          relevantAvailability = currentMonthAvailability
        } else if (dateYear === nextMonthYear && dateMonth === nextMonth) {
          relevantAvailability = nextMonthAvailability
        } else if (dateYear === prevMonthYear && dateMonth === prevMonth) {
          relevantAvailability = prevMonthAvailability
        }
        
        if (relevantAvailability) {
          const dayAvailability = relevantAvailability.find((dayData: MonthlyDayAvailability) => dayData.day === day)
          if (dayAvailability) {
            return dayAvailability.isAvailable
          }
        }
      }
      
      // Fallback to restaurant opening hours if no API data
      if (!restaurantAvailability) return true
      
      const dayName = format(date, 'EEEE').toLowerCase() // Get day name (e.g., 'monday')
      const dayAvailability = restaurantAvailability.find((day: any) => 
        day.day_name.toLowerCase() === dayName
      )
      
      // Check if the day is open and not closed
      return dayAvailability ? !dayAvailability.is_closed : false
    }
  }, [props.restaurantId, prevMonthAvailability, currentMonthAvailability, nextMonthAvailability, restaurantAvailability, currentYear, currentMonth, nextMonthYear, nextMonth, prevMonthYear, prevMonth])

  // Memoize available slots for the selected date to avoid recalculating on every render
  const availableSlotsForSelectedDate = useMemo(() => {
    return selectedDate ? getAvailableTimeSlotsForDate(selectedDate) : []
  }, [selectedDate, getAvailableTimeSlotsForDate])

  const handleDateClick = useCallback((day: Date) => {
    // Validate the selected date
    if (!day || !(day instanceof Date) || isNaN(day.getTime())) {
      console.error("Invalid date selected")
      return
    }
    
    // Check if date is in the past (for forbidden dates)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    day.setHours(0, 0, 0, 0)
    
    if (day < today && props.restaurantId) {
      console.warn("Cannot select past date")
      return
    }
    
    setSelectedDate(day)
    const formattedDate = format(day, "yyyy-MM-dd")
    setSelectedData((prevData) => ({ ...prevData, reserveDate: formattedDate }))
    
    // Reset selected time when date changes as availability may change
    if (selectedTime) {
      setSelectedTime(null)
      setSelectedData((prevData) => ({ ...prevData, time: "" }))
    }
    setActiveTab("guest") // Go to guest selection first to get guest count for time slots
  }, [props.restaurantId, selectedTime])

  const handleTimeClick = useCallback(async (time: string) => {
    // Validate time format
    if (!time || typeof time !== 'string' || !time.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      console.error("Invalid time format:", time)
      return
    }
    
    // Always allow time selection first, then check availability later if needed
    setSelectedTime(time)
    setSelectedData((prevData) => ({ ...prevData, time }))
    // Always proceed to offers step
    setActiveTab("offers")
  }, [])

  const handleGuestClick = useCallback(async (guest: number) => {
    // Validate guest count
    if (guest < (props.minGuests || 1)) {
      console.warn(`Guest count ${guest} is below minimum ${props.minGuests || 1}`)
      return
    }
    
    if (props.maxGuests && guest > props.maxGuests) {
      console.warn(`Guest count ${guest} exceeds maximum ${props.maxGuests}`)
      return
    }
    
    // Always set the guest count first
    setSelectedGuests(guest)
    setSelectedData((prevData) => ({ ...prevData, guests: guest }))
    
    setActiveTab("time")
  }, [props.minGuests, props.maxGuests])

  // Updated to use id as identifier and check if offer is valid for selected date/time
  const handleOfferClick = (offerId: number) => {
    // Validate offer ID
    if (!offerId || typeof offerId !== 'number' || offerId <= 0) {
      console.warn("Invalid offer ID:", offerId)
      return
    }
    
    setSelectedOffer(offerId)
    setSelectedData((prevData) => ({ ...prevData, offer_id: offerId }))
  }

  const handleSkipOffers = () => {
    setSelectedOffer(undefined)
    setSelectedData((prevData) => ({ ...prevData, offer_id: undefined }))
    setActiveTab("confirm")
  }

  const handleContinueWithOffer = () => {
    setActiveTab("confirm")
  }

  const handleConfirmClick = () => {
    // Check if user is authenticated before proceeding
    if (!isAuthenticated) {
      setShowAuthPopup(true)
      return
    }
    
    // If user is authenticated, proceed with booking
    proceedWithBooking()
  }

  const proceedWithBooking = () => {
    props.getDateTime(selectedData)
    onReservationChange()
    if (props.restaurantId) {
      setShowBookingForm(true)
    } else {
      props.onClick() // Fallback to original behavior for search page
    }
  }

  const handleAuthSuccess = () => {
    setShowAuthPopup(false)
    // Refresh data after successful authentication
    onReservationChange()
    // After successful authentication, proceed with booking
    proceedWithBooking()
  }

  // Helper function to check if an offer is valid for the selected date and time
  const isOfferValid = (offer: Offer): boolean => {
    if (!selectedDate || !selectedTime) return true // Show all offers if date/time not selected
    try {
      const selectedDateStr = format(selectedDate, "yyyy-MM-dd")
      const validFrom = new Date(offer.valid_from_date)
      const validTo = new Date(offer.valid_to_date)
      const selectedDateObj = new Date(selectedDateStr)

      // Check if date is within valid range
      const isDateValid = selectedDateObj >= validFrom && selectedDateObj <= validTo

      // Check if time is within valid range
      const selectedTimeMinutes = timeToMinutes(selectedTime)
      const fromTimeMinutes = timeToMinutes(offer.time_range_from)
      const toTimeMinutes = timeToMinutes(offer.time_range_to)
      const isTimeValid = selectedTimeMinutes >= fromTimeMinutes && selectedTimeMinutes <= toTimeMinutes

      return isDateValid && isTimeValid
    } catch (error) {
      console.error("Error validating offer:", error)
      return true // Show offer if validation fails
    }
  }

  // Helper function to convert time string to minutes
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(":").map(Number)
    return hours * 60 + minutes
  }

  // Booking form handlers
  const handleBookingSuccess = (bookingData: any) => {
    console.log("Booking created successfully:", bookingData)
    
    // Trigger invalidation for reservation-related data
    onReservationChange(props.restaurantId)
    
    setShowBookingForm(false)
    props.onClick() // Call the original onClick to close the reservation process
  }

  const handleBookingFormClose = () => {
    setShowBookingForm(false)
  }

  // Helper function to format percentage
  const formatPercentage = (percentage: number): string => {
    return `${percentage}% OFF`
  }

  // Filter valid offers
  const validOffers = offers?.filter(isOfferValid) || []

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-blacktheme/20 h-full backdrop-blur-sm transition-opacity duration-300"
        onClick={props.onClick}
      ></div>
      <div
        className={`popup z-[360] lt-sm:h-[70vh] sm:w-[30em] lt-sm:bottom-0 lt-sm:w-full rounded-[10px] bg-whitetheme dark:bg-bgdarktheme`}
      >
        <div className="flex justify-center gap-3 mt-[1em] px-2">
          <span
            className={activeTab === "date" ? "activetabb" : "p-[10px]"}
            onClick={() => setActiveTab("date")}
            id="date"
          >
            Date
          </span>
          <span
            className={activeTab === "guest" ? "activetabb" : "p-[10px]"}
            onClick={() => setActiveTab("guest")}
            id="guest"
          >
            Guest
          </span>
          <span
            className={activeTab === "time" ? "activetabb" : "p-[10px]"}
            onClick={() => setActiveTab("time")}
            id="time"
          >
            Time
          </span>
          <span
            className={activeTab === "offers" ? "activetabb" : "p-[10px]"}
            onClick={() => setActiveTab("offers")}
            id="offers"
          >
            Offers
          </span>
        </div>
        {activeTab === "date" && (
          <div className="content">
            <div className="text-[20px] text-left mx-[30px] mt-[1em] mb-[.5em] font-bold text-blacktheme dark:text-textdarktheme">
              {selectedDate ? (
                <>
                  {format(selectedDate, "dd MMMM yyyy")} <span className="font-semibold">
                    {format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") 
                      ? "(Today - selected by default)" 
                      : "has been selected"
                    }
                  </span>
                </>
              ) : (
                <span className="font-semibold">Select a date</span>
              )}
            </div>
            {(isLoadingAvailability || isLoadingMonthlyAvailability) && props.restaurantId && (
              <div className="text-center py-4">
                <div className="text-greytheme dark:text-textdarktheme">Loading availability...</div>
              </div>
            )}
            <OurCalendar 
              forbidden={true} 
              onClick={handleDateClick} 
              isDateAvailable={isDateAvailable}
            />
          </div>
        )}
        {activeTab === "time" && (
          <div className="content">
            <div className="text-[20px] text-left mx-[30px] mt-[1em] mb-[.5em] font-bold text-blacktheme dark:text-textdarktheme">
              {selectedTime ? (
                <>
                  {selectedTime} <span className="font-semibold">
                    {selectedTime === getDefaultTime() && !props.dateTime?.time
                      ? "(Default next shift - selected automatically)"
                      : "has been selected"
                    }
                  </span>
                </>
              ) : (
                <span className="font-semibold">Select a time</span>
              )}
            </div>
            {isLoadingTimeSlots && props.restaurantId && selectedDate && selectedGuests && (
              <div className="text-center py-4">
                <div className="text-greytheme dark:text-textdarktheme">Loading available time slots...</div>
              </div>
            )}
            {timeSlotsError && props.restaurantId && selectedDate && selectedGuests && (
              <div className="text-center py-8">
                <div className="text-red-500 dark:text-red-400 mb-2">
                  Error loading time slots
                </div>
                <div className="text-sm text-greytheme dark:text-textdarktheme">
                  Using restaurant opening hours instead.
                </div>
              </div>
            )}
            {!isLoadingTimeSlots && props.restaurantId && selectedDate && selectedGuests && timeSlotsData && timeSlotsData.available_slots && timeSlotsData.available_slots.length === 0 && (
              <div className="text-center py-8">
                <div className="text-greytheme dark:text-textdarktheme mb-2">
                  No available time slots for {selectedGuests} guests on {format(selectedDate, "MMMM dd, yyyy")}
                </div>
                <div className="text-sm text-greytheme dark:text-textdarktheme">
                  Please try a different date or number of guests.
                </div>
              </div>
            )}
            <div className="flex flex-wrap h-[284px] overflow-y-auto justify-center gap-[10px] p-[20px] rounded-[3px]">
              {props.restaurantId && selectedDate && selectedGuests && !isLoadingTimeSlots && timeSlotsData?.available_slots && Array.isArray(timeSlotsData.available_slots) && timeSlotsData.available_slots.length > 0 ? (
                // Use API time slots data - this takes priority
                timeSlotsData.available_slots.map((slot, index) => {
                  if (!slot || typeof slot.time !== 'string') {
                    return null
                  }
                  
                  const now = new Date()
                  const isToday = selectedDate && format(selectedDate, "yyyy-MM-dd") === format(now, "yyyy-MM-dd")
                  const [hour, minute] = slot.time.split(':').map(Number)
                  const isPastTime = isToday && (hour < now.getHours() || (hour === now.getHours() && minute < now.getMinutes()))
                  const isDisabled = isPastTime || !slot.available
                  
                  return (
                    <button
                      onClick={() => !isDisabled && handleTimeClick(slot.time)}
                      className={`text-15 font-bold h-[65px] w-[65px] flex items-center justify-center border-solid border-[1px] text-blacktheme dark:text-white ${
                        isDisabled
                          ? "bg-softgreytheme text-greytheme cursor-not-allowed border-greytheme dark:bg-darkthemeitems dark:text-greytheme"
                          : selectedTime === slot.time
                          ? "bg-greentheme text-white border-greentheme"
                          : "border-greentheme hover:bg-greentheme hover:text-white"
                      }`}
                      key={`slot-${index}`}
                      disabled={!!isDisabled}
                      title={
                        isPastTime 
                          ? "Time has passed" 
                          : !slot.available
                          ? "Time slot not available"
                          : ""
                      }
                    >
                      {slot.time}
                    </button>
                  )
                }).filter(Boolean) // Remove null entries
              ) : !props.restaurantId || !selectedDate || !selectedGuests || isLoadingTimeSlots ? (
                // Show fallback only when no restaurant ID, date, or guests selected, or when loading
                [...Array(48)].map((_, index) => {
                  const hour = Math.floor(index / 2)
                  const minute = index % 2 === 0 ? "00" : "30"
                  const timeString = `${hour < 10 ? "0" + hour : hour}:${minute}`
                  const now = new Date()
                  const isToday = selectedDate && format(selectedDate, "yyyy-MM-dd") === format(now, "yyyy-MM-dd")
                  const isPastTime =
                    isToday &&
                    (hour < now.getHours() || (hour === now.getHours() && minute === "00" && now.getMinutes() >= 30))
                  
                  // Use memoized available slots to avoid recalculation
                  const isAvailable = props.restaurantId ? availableSlotsForSelectedDate.includes(timeString) : true
                  const isDisabled = isPastTime || (props.restaurantId && !isAvailable && !isLoadingAvailability)
                  
                  return (
                    <button
                      onClick={() => !isDisabled && handleTimeClick(timeString)}
                      className={`text-15 font-bold h-[65px] w-[65px] flex items-center justify-center border-solid border-[1px] text-blacktheme dark:text-white ${
                        isDisabled
                          ? "bg-softgreytheme text-greytheme cursor-not-allowed border-greytheme dark:bg-darkthemeitems dark:text-greytheme"
                          : selectedTime === timeString
                          ? "bg-greentheme text-white border-greentheme"
                          : "border-greentheme hover:bg-greentheme hover:text-white"
                      }`}
                      key={index}
                      disabled={!!isDisabled}
                      title={
                        isPastTime 
                          ? "Time has passed" 
                          : !isAvailable && props.restaurantId 
                          ? "Restaurant is closed at this time" 
                          : ""
                      }
                    >
                      {timeString}
                    </button>
                  )
                })
              ) : null}
            </div>
          </div>
        )}
        {activeTab === "guest" && (
          <div className="content">
            <div className="text-[20px] text-left mx-[30px] mt-[1em] mb-[.5em] font-bold text-blacktheme dark:text-textdarktheme">
              {selectedGuests ? (
                <>
                  {selectedGuests} <span className="font-semibold">
                    {selectedGuests === getDefaultGuests() && !props.dateTime?.guests
                      ? "guests (Default selection)"
                      : "guests have been selected"
                    }
                  </span>
                </>
              ) : (
                <span className="font-semibold">Select number of guests</span>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-[10px] p-[20px] rounded-[3px]">
              {[...Array(props.maxGuests ? props.maxGuests : 15)].map((_, index) => (
                <button
                  className={`text-15 hover:bg-greentheme hover:text-white font-bold h-[65px] w-[65px] flex items-center justify-center border-solid border-[1px] border-greentheme text-blacktheme dark:text-white ${
                    selectedGuests === index + 1 ? "bg-greentheme text-white" : ""
                  }`}
                  key={index}
                  onClick={() => handleGuestClick(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
              {!props.maxGuests && (
                <>
                  <div className="text-center w-full my-2 text-blacktheme dark:text-textdarktheme">
                    {" "}
                    Or Enter number of guests{" "}
                  </div>
                  <div>
                    <div className="flex rounded-lg">
                      <input
                        type="number"
                        min={props.minGuests || 1}
                        name="note"
                        placeholder="Enter number of guests"
                        value={selectedGuests || ""}
                        className="w-full p-3 border border-softgreytheme dark:border-darkthemeitems rounded-s-lg bg-whitetheme dark:bg-darkthemeitems text-blacktheme dark:text-white"
                        onChange={(e) => setSelectedGuests(Number(e.target.value) || null)}
                      />
                      <button
                        type="button"
                        onClick={() => selectedGuests && handleGuestClick(selectedGuests)}
                        className="btn-primary rounded-none rounded-e-lg"
                        disabled={!selectedGuests || selectedGuests < (props.minGuests || 1)}
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        {activeTab === "offers" && (
          <div className="content">
            <div className="text-[20px] text-left mx-[30px] mt-[1em] mb-[.5em] font-bold text-blacktheme dark:text-textdarktheme">
              <span className="font-semibold">Select an offer (optional)</span>
            </div>
            {isLoadingOffers && props.restaurantId && (
              <div className="text-center py-4">
                <div className="text-greytheme dark:text-textdarktheme">Loading offers...</div>
              </div>
            )}
            <div className="h-[284px] overflow-y-auto px-[20px] py-[10px]">
              <div className="space-y-3">
                {!isLoadingOffers && validOffers.length === 0 ? (
                  <div className="text-center text-greytheme dark:text-textdarktheme/70 py-8">
                    {offers && offers.length > 0
                      ? "No offers available for selected date/time"
                      : "No offers available"}
                  </div>
                ) : (
                  validOffers.map((offer, index) => (
                    <div
                      key={`${offer.title}-${index}`}
                      onClick={() => handleOfferClick(offer.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedOffer === offer.id
                          ? "border-greentheme bg-softgreentheme dark:bg-greentheme/20"
                          : "border-softgreytheme dark:border-darkthemeitems hover:border-greentheme/50 dark:hover:border-greentheme/30"
                      } bg-whitetheme dark:bg-darkthemeitems`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3
                              className={`font-bold ${
                                selectedOffer === offer.id ? "text-greentheme" : "text-blacktheme dark:text-white"
                              }`}
                            >
                              {offer.title}
                            </h3>
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-bold ${
                                selectedOffer === offer.id
                                  ? "bg-greentheme text-white"
                                  : "bg-warning-soft text-orangetheme dark:bg-orangetheme/20 dark:text-orangetheme"
                              }`}
                            >
                              {formatPercentage(offer.percentage)}
                            </span>
                          </div>
                          <p className={`text-sm mt-1 text-greytheme dark:text-textdarktheme/70`}>
                            {offer.description}
                          </p>
                          <div className="mt-2 text-xs space-y-1">
                            <div className={`text-greytheme dark:text-textdarktheme/60`}>
                              Valid: {new Date(offer.valid_from_date).toLocaleDateString()} -{" "}
                              {new Date(offer.valid_to_date).toLocaleDateString()}
                            </div>
                            <div className={`text-greytheme dark:text-textdarktheme/60`}>
                              Time: {offer.time_range_from} - {offer.time_range_to}
                            </div>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex-shrink-0 ml-3 ${
                            selectedOffer === offer.id
                              ? "border-greentheme bg-greentheme"
                              : "border-softgreytheme dark:border-subblack"
                          }`}
                        >
                          {selectedOffer === offer.id && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="white"
                              className="w-5 h-5"
                            >
                              <path
                                fillRule="evenodd"
                                d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="flex justify-center gap-3 p-4">
              <button
                onClick={handleSkipOffers}
                className={`px-6 py-2 rounded-lg border border-softgreytheme text-greytheme hover:bg-softgreytheme dark:border-textdarktheme/20 dark:text-textdarktheme dark:hover:bg-darkthemeitems`}
              >
                Skip
              </button>
              <button onClick={handleContinueWithOffer} className="btn-primary" disabled={!selectedOffer}>
                Continue
              </button>
            </div>
          </div>
        )}
        {activeTab === "confirm" && (
          <div className="content">
            <div className="text-[20px] text-left mx-[30px] mt-[1em] mb-[.5em] font-bold text-blacktheme dark:text-textdarktheme">
              <span className="font-[500] mr-2">Your reservation is set for</span>{" "}
              {selectedDate && format(selectedDate, "dd MMMM yyyy")} <span className="font-semibold mx-2">at</span>
              {selectedTime} <span className="font-semibold mx-2">for</span>
              {selectedGuests} <span className="font-semibold">guests</span>
            </div>
            {selectedOffer && validOffers.find((o) => o.id === selectedOffer) && (
              <div className={`mx-[30px] mt-3 p-3 rounded-lg bg-softgreentheme/20 dark:bg-darkthemeitems`}>
                <div className="font-medium text-greentheme">Selected Offer:</div>
                <div className={`font-semibold text-blacktheme dark:text-white`}>
                  {validOffers.find((o) => o.id === selectedOffer)?.title}
                </div>
                <div className="text-sm mt-1">
                  <span className="bg-warning-soft text-orangetheme dark:bg-orangetheme/20 dark:text-orangetheme px-2 py-1 rounded-full text-xs font-bold">
                    {validOffers.find((o) => o.id === selectedOffer)?.percentage}% OFF
                  </span>
                </div>
                <div className="text-xs mt-2 text-greytheme dark:text-textdarktheme/70">
                  {validOffers.find((o) => o.id === selectedOffer)?.description}
                </div>
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-[10px] p-[20px] rounded-[3px]">
              <button onClick={handleConfirmClick} className="btn-primary">
                Confirm Reservation
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Auth Popup Modal */}
      {showAuthPopup && (
        <AuthPopup
          isOpen={showAuthPopup}
          onClose={() => setShowAuthPopup(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* Booking Form */}
      {props.restaurantId && (
        <BookingForm
          isOpen={showBookingForm}
          onClose={handleBookingFormClose}
          onSuccess={handleBookingSuccess}
          restaurantId={props.restaurantId}
          bookingData={selectedData}
        />
      )}
    </div>
  )
}

export default ReservationProcess
