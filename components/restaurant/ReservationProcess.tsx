"use client"

import type React from "react"
import { useState } from "react"
import { format } from "date-fns"
import OurCalendar from "../calendar/OurCalendar"

type SelectedData = {
  reserveDate: string
  time: string
  guests: number
  offer?: Offer | null
}

// Updated Offer type to match your API structure
type Offer = {
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
  noOffer?: boolean
  maxGuests?: number
  minGuests?: number
  offers?: Offer[]
  dateTime?: SelectedData
}

const ReservationProcess: React.FC<ReservationProcessProps> = (props) => {
  const [activeTab, setActiveTab] = useState<"date" | "time" | "guest" | "offers" | "confirm" | null>("date")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedGuests, setSelectedGuests] = useState<number | null>(null)
  // Updated to use title as identifier since there's no id field
  const [selectedOffer, setSelectedOffer] = useState<string | null>(props.dateTime?.offer?.title || null)
  const [selectedData, setSelectedData] = useState<SelectedData>(
    props.dateTime || {
      reserveDate: "",
      time: "",
      guests: 0,
      offer: null,
    },
  )

  const handleDateClick = (day: Date) => {
    setSelectedDate(day)
    const formattedDate = format(day, "yyyy-MM-dd")
    setSelectedData((prevData) => ({ ...prevData, reserveDate: formattedDate.toString() }))
    setActiveTab("time")
  }

  const handleTimeClick = (time: string) => {
    setSelectedTime(time)
    setSelectedData((prevData) => ({ ...prevData, time }))
    setActiveTab("guest")
  }

  const handleGuestClick = (guest: number) => {
    setSelectedGuests(guest)
    setSelectedData((prevData) => ({ ...prevData, guests: guest }))
    if (props.noOffer || !props.offers || props.offers.length === 0) {
      setActiveTab("confirm")
    } else {
      setActiveTab("offers")
    }
  }

  // Updated to use title as identifier and check if offer is valid for selected date/time
  const handleOfferClick = (offerTitle: string) => {
    setSelectedOffer(offerTitle)
    const selectedOfferObject = props.offers?.find((offer) => offer.title === offerTitle) || null
    setSelectedData((prevData) => ({ ...prevData, offer: selectedOfferObject }))
  }

  const handleSkipOffers = () => {
    setSelectedOffer(null)
    setSelectedData((prevData) => ({ ...prevData, offer: null }))
    setActiveTab("confirm")
  }

  const handleContinueWithOffer = () => {
    setActiveTab("confirm")
  }

  const handleConfirmClick = () => {
    props.getDateTime(selectedData)
    props.onClick()
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

  // Helper function to format percentage
  const formatPercentage = (percentage: number): string => {
    return `${percentage}% OFF`
  }

  // Filter valid offers
  const validOffers = props.offers?.filter(isOfferValid) || []

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
            className={activeTab === "time" ? "activetabb" : "p-[10px]"}
            onClick={() => setActiveTab("time")}
            id="time"
          >
            Time
          </span>
          <span
            className={activeTab === "guest" ? "activetabb" : "p-[10px]"}
            onClick={() => setActiveTab("guest")}
            id="guest"
          >
            Guest
          </span>
          {!props.noOffer && validOffers.length > 0 && (
            <span
              className={activeTab === "offers" ? "activetabb" : "p-[10px]"}
              onClick={() => setActiveTab("offers")}
              id="offers"
            >
              Offers
            </span>
          )}
        </div>
        {activeTab === "date" && (
          <div className="content">
            <div className="text-[20px] text-left mx-[30px] mt-[1em] mb-[.5em] font-bold text-blacktheme dark:text-textdarktheme">
              {selectedDate ? (
                <>
                  {format(selectedDate, "dd MMMM yyyy")} <span className="font-semibold">has been selected</span>
                </>
              ) : (
                <span className="font-semibold">Select a date</span>
              )}
            </div>
            <OurCalendar forbidden={true} onClick={handleDateClick} />
          </div>
        )}
        {activeTab === "time" && (
          <div className="content">
            <div className="text-[20px] text-left mx-[30px] mt-[1em] mb-[.5em] font-bold text-blacktheme dark:text-textdarktheme">
              {selectedTime ? (
                <>
                  {selectedTime} <span className="font-semibold">has been selected</span>
                </>
              ) : (
                <span className="font-semibold">Select a time</span>
              )}
            </div>
            <div className="flex flex-wrap h-[284px] overflow-y-auto justify-center gap-[10px] p-[20px] rounded-[3px]">
              {[...Array(48)].map((_, index) => {
                const hour = Math.floor(index / 2)
                const minute = index % 2 === 0 ? "00" : "30"
                const timeString = `${hour < 10 ? "0" + hour : hour}:${minute}`
                const now = new Date()
                const isToday = selectedDate && format(selectedDate, "yyyy-MM-dd") === format(now, "yyyy-MM-dd")
                const isPastTime =
                  isToday &&
                  (hour < now.getHours() || (hour === now.getHours() && minute === "00" && now.getMinutes() >= 30))
                return (
                  <button
                    onClick={() => !isPastTime && handleTimeClick(timeString)}
                    className={`text-15 ${
                      isPastTime
                        ? "bg-softwhitetheme text-subblack cursor-not-allowed"
                        : "hover:bg-greentheme hover:text-white"
                    } font-bold h-[65px] w-[65px] flex items-center justify-center border-solid border-[1px] border-greentheme text-blacktheme dark:text-white ${
                      selectedTime === timeString ? "bg-greentheme text-white" : ""
                    }`}
                    key={index}
                    disabled={!!isPastTime}
                  >
                    {timeString}
                  </button>
                )
              })}
            </div>
          </div>
        )}
        {activeTab === "guest" && (
          <div className="content">
            <div className="text-[20px] text-left mx-[30px] mt-[1em] mb-[.5em] font-bold text-blacktheme dark:text-textdarktheme">
              {selectedGuests ? (
                <>
                  {selectedGuests} <span className="font-semibold">guests have been selected</span>
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
            <div className="h-[284px] overflow-y-auto px-[20px] py-[10px]">
              <div className="space-y-3">
                {validOffers.length === 0 ? (
                  <div className="text-center text-greytheme dark:text-textdarktheme/70 py-8">
                    {props.offers && props.offers.length > 0
                      ? "No offers available for selected date/time"
                      : "No offers available"}
                  </div>
                ) : (
                  validOffers.map((offer, index) => (
                    <div
                      key={`${offer.title}-${index}`}
                      onClick={() => handleOfferClick(offer.title)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedOffer === offer.title
                          ? "border-greentheme bg-softgreentheme dark:bg-greentheme/20"
                          : "border-softgreytheme dark:border-darkthemeitems hover:border-greentheme/50 dark:hover:border-greentheme/30"
                      } bg-whitetheme dark:bg-darkthemeitems`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3
                              className={`font-bold ${
                                selectedOffer === offer.title ? "text-greentheme" : "text-blacktheme dark:text-white"
                              }`}
                            >
                              {offer.title}
                            </h3>
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-bold ${
                                selectedOffer === offer.title
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
                            selectedOffer === offer.title
                              ? "border-greentheme bg-greentheme"
                              : "border-softgreytheme dark:border-subblack"
                          }`}
                        >
                          {selectedOffer === offer.title && (
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
            {selectedOffer && (
              <div className={`mx-[30px] mt-3 p-3 rounded-lg bg-softgreentheme/20 dark:bg-darkthemeitems`}>
                <div className="font-medium text-greentheme">Selected Offer:</div>
                <div className={`font-semibold text-blacktheme dark:text-white`}>
                  {validOffers.find((o) => o.title === selectedOffer)?.title}
                </div>
                <div className="text-sm mt-1">
                  <span className="bg-warning-soft text-orangetheme dark:bg-orangetheme/20 dark:text-orangetheme px-2 py-1 rounded-full text-xs font-bold">
                    {validOffers.find((o) => o.title === selectedOffer)?.percentage}% OFF
                  </span>
                </div>
                <div className="text-xs mt-2 text-greytheme dark:text-textdarktheme/70">
                  {validOffers.find((o) => o.title === selectedOffer)?.description}
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
    </div>
  )
}

export default ReservationProcess
