"use client"

import { useState, useEffect, useCallback } from "react"
import { Calendar, Clock, Users, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "../ui/Button"
import OurCalendar from "../calendar/OurCalendar"

type FilterData = {
  date: string
  time: string
  guests: number
}

interface BasicInfoFiltersProps {
  isOpen: boolean
  onClose: () => void
  onApplyFilters: (filters: FilterData | null) => void
  initialFilters?: FilterData | null
  startStep?: 'date' | 'time' | 'guests'
}

const BasicInfoFilters: React.FC<BasicInfoFiltersProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  initialFilters,
  startStep = 'date'
}) => {
  // Default value functions
  const getDefaultDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const getDefaultTime = () => {
    const now = new Date()
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000)
    return `${nextHour.getHours().toString().padStart(2, '0')}:00`
  }

  const getDefaultGuests = () => 2

  // State management
  const [selectedDate, setSelectedDate] = useState<string>(getDefaultDate())
  const [selectedTime, setSelectedTime] = useState<string>(getDefaultTime())
  const [selectedGuests, setSelectedGuests] = useState<number>(getDefaultGuests())
  const [currentStep, setCurrentStep] = useState<'date' | 'time' | 'guests'>(startStep)

  // Available time slots (24-hour format)
  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
    "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
    "21:00", "21:30", "22:00", "22:30", "23:00"
  ]

  // Guest options
  const guestOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  // Initialize with default values or provided initial filters
  useEffect(() => {
    if (initialFilters) {
      setSelectedDate(initialFilters.date)
      setSelectedTime(initialFilters.time)
      setSelectedGuests(initialFilters.guests)
    } else {
      setSelectedDate(getDefaultDate())
      setSelectedTime(getDefaultTime())
      setSelectedGuests(getDefaultGuests())
    }
    // Set the starting step when component opens
    setCurrentStep(startStep)
  }, [initialFilters, isOpen, startStep])

  // Handle date selection
  const handleDateClick = useCallback((date: Date | null) => {
    if (date && date >= new Date(new Date().setHours(0, 0, 0, 0))) {
      const dateString = date.toISOString().split('T')[0]
      setSelectedDate(dateString)
    }
  }, [])

  // Handle time selection
  const handleTimeClick = useCallback((time: string) => {
    if (timeSlots.includes(time)) {
      setSelectedTime(time)
    }
  }, [timeSlots])

  // Handle guest selection
  const handleGuestClick = useCallback((guests: number) => {
    if (guests >= 1 && guests <= 10) {
      setSelectedGuests(guests)
    }
  }, [])

  // Navigation functions
  const goToNextStep = () => {
    if (currentStep === 'date') setCurrentStep('time')
    else if (currentStep === 'time') setCurrentStep('guests')
  }

  const goToPrevStep = () => {
    if (currentStep === 'guests') setCurrentStep('time')
    else if (currentStep === 'time') setCurrentStep('date')
  }

  const goToStep = (step: 'date' | 'time' | 'guests') => {
    setCurrentStep(step)
  }

  // Apply filters
  const handleApplyFilters = () => {
    const filters: FilterData = {
      date: selectedDate,
      time: selectedTime,
      guests: selectedGuests
    }
    onApplyFilters(filters)
    onClose()
  }

  // Clear filters
  const handleClearFilters = () => {
    onApplyFilters(null)
    onClose()
  }

  // Reset to defaults
  const handleResetToDefaults = () => {
    setSelectedDate(getDefaultDate())
    setSelectedTime(getDefaultTime())
    setSelectedGuests(getDefaultGuests())
    setCurrentStep(startStep)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-blacktheme/40 dark:bg-blacktheme/60 backdrop-blur-sm z-40" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-whitetheme dark:bg-bgdarktheme rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-softgreytheme dark:border-subblack">
          
          {/* Header */}
          <div className="sticky top-0 bg-whitetheme dark:bg-bgdarktheme border-b border-softgreytheme dark:border-subblack p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-blacktheme dark:text-textdarktheme">
                Filter Reservations
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-softgreytheme dark:hover:bg-bgdarktheme2 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-greytheme dark:text-softwhitetheme" />
              </button>
            </div>
            
            {/* Step Navigation */}
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={goToPrevStep}
                disabled={currentStep === 'date'}
                className={`p-2 rounded-full transition-colors ${
                  currentStep === 'date' 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-softgreytheme dark:hover:bg-bgdarktheme2'
                }`}
              >
                <ChevronLeft className="w-5 h-5 text-greytheme dark:text-softwhitetheme" />
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => goToStep('date')}
                  className={`h-3 w-8 rounded-full transition-colors ${
                    currentStep === 'date' ? 'bg-greentheme' : 'bg-softgreytheme dark:bg-subblack hover:bg-greentheme/50'
                  }`}
                />
                <button
                  onClick={() => goToStep('time')}
                  className={`h-3 w-8 rounded-full transition-colors ${
                    currentStep === 'time' ? 'bg-greentheme' : 'bg-softgreytheme dark:bg-subblack hover:bg-greentheme/50'
                  }`}
                />
                <button
                  onClick={() => goToStep('guests')}
                  className={`h-3 w-8 rounded-full transition-colors ${
                    currentStep === 'guests' ? 'bg-greentheme' : 'bg-softgreytheme dark:bg-subblack hover:bg-greentheme/50'
                  }`}
                />
              </div>

              <button
                onClick={goToNextStep}
                disabled={currentStep === 'guests'}
                className={`p-2 rounded-full transition-colors ${
                  currentStep === 'guests' 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-softgreytheme dark:hover:bg-bgdarktheme2'
                }`}
              >
                <ChevronRight className="w-5 h-5 text-greytheme dark:text-softwhitetheme" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Date Selection */}
            {currentStep === 'date' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-greentheme" />
                  <h3 className="text-lg font-semibold text-blacktheme dark:text-textdarktheme">
                    Select Date
                  </h3>
                  <span className="text-sm text-greytheme dark:text-softwhitetheme">
                    {selectedDate === getDefaultDate() ? "(Today - selected by default)" : ""}
                  </span>
                </div>
                <OurCalendar onClick={handleDateClick} />
              </div>
            )}

            {/* Time Selection */}
            {currentStep === 'time' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-greentheme" />
                  <h3 className="text-lg font-semibold text-blacktheme dark:text-textdarktheme">
                    Select Time
                  </h3>
                  <span className="text-sm text-greytheme dark:text-softwhitetheme">
                    {selectedTime === getDefaultTime() ? "(Default next hour - selected automatically)" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleTimeClick(time)}
                      className={`p-3 rounded-xl border transition-all text-center ${
                        selectedTime === time
                          ? "border-greentheme bg-greentheme text-whitetheme"
                          : "border-softgreytheme dark:border-subblack hover:border-greentheme bg-whitetheme dark:bg-bgdarktheme2 text-blacktheme dark:text-textdarktheme"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Guest Selection */}
            {currentStep === 'guests' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-greentheme" />
                  <h3 className="text-lg font-semibold text-blacktheme dark:text-textdarktheme">
                    Number of Guests
                  </h3>
                  <span className="text-sm text-greytheme dark:text-softwhitetheme">
                    {selectedGuests === getDefaultGuests() ? "(Default selection)" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {guestOptions.map((guests) => (
                    <button
                      key={guests}
                      onClick={() => handleGuestClick(guests)}
                      className={`p-4 rounded-xl border transition-all text-center ${
                        selectedGuests === guests
                          ? "border-greentheme bg-greentheme text-whitetheme"
                          : "border-softgreytheme dark:border-subblack hover:border-greentheme bg-whitetheme dark:bg-bgdarktheme2 text-blacktheme dark:text-textdarktheme"
                      }`}
                    >
                      {guests}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selected filters summary */}
            <div className="mt-6 p-4 bg-softgreentheme dark:bg-greentheme/10 rounded-xl border border-greentheme/20">
              <h4 className="font-semibold text-blacktheme dark:text-textdarktheme mb-2">Current Selection:</h4>
              <div className="space-y-1 text-sm text-blacktheme dark:text-textdarktheme">
                <p><span className="font-medium">Date:</span> {new Date(selectedDate).toLocaleDateString()}</p>
                <p><span className="font-medium">Time:</span> {selectedTime}</p>
                <p><span className="font-medium">Guests:</span> {selectedGuests} {selectedGuests === 1 ? 'person' : 'people'}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-whitetheme dark:bg-bgdarktheme border-t border-softgreytheme dark:border-subblack p-6 rounded-b-2xl">
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handleClearFilters}
                className="flex-1"
              >
                Clear Filters
              </Button>
              <Button
                variant="outline"
                onClick={handleResetToDefaults}
                className="flex-1"
              >
                Reset
              </Button>
              <Button
                variant="primary"
                onClick={handleApplyFilters}
                className="flex-1"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default BasicInfoFilters
