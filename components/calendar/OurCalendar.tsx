"use client"

import { useState } from "react"
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isEqual,
  isSameMonth,
  isToday,
  parse,
  startOfToday,
  add,
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react" // Import Lucide icons

const colStartClasses = ["", "col-start-2", "col-start-3", "col-start-4", "col-start-5", "col-start-6", "col-start-7"]

const OurCalendar = (props: { 
  onClick?: (day: Date) => void; 
  forbidden?: boolean; 
  isDateAvailable?: (date: Date) => boolean 
}) => {
  const today = startOfToday()
  function classNames(...classes: (string | boolean | undefined | null)[]) {
    return classes.filter(Boolean).join(" ")
  }

  const [selectedDay, setSelectedDay] = useState(today)
  const [currentMonth, setCurrentMonth] = useState(format(today, "MMM-yyyy"))
  const firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date())

  const days = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: endOfMonth(firstDayCurrentMonth),
  })

  function previousMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 })
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"))
  }

  function nextMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 })
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"))
  }

  function selectingDate(day: Date) {
    setSelectedDay(day)
    if (props.onClick) {
      props.onClick(day) // Call the onClick function and pass the day as an argument
    }
  }

  return (
    <div className="p-[1em] w-full h-full mx-auto">
      <div className="text-[20px] items-center mb-2 flex justify-between text-blacktheme dark:text-textdarktheme">
        <div className="font-bold">{format(firstDayCurrentMonth, "MMMM yyyy")}</div>
        <div className="flex">
          <button
            onClick={previousMonth}
            className="hover:bg-softgreytheme dark:hover:bg-darkthemeitems transition duration-500 w-[35px] h-[35px] flex justify-center items-center rounded-[100%] text-blacktheme dark:text-textdarktheme"
            aria-label="Previous month"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextMonth}
            className="hover:bg-softgreytheme dark:hover:bg-darkthemeitems transition duration-500 w-[35px] h-[35px] flex justify-center items-center rounded-[100%] text-blacktheme dark:text-textdarktheme"
            aria-label="Next month"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <div className="mx-auto">
        <div className="grid mx-auto grid-cols-7">
          {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
            <button
              key={index}
              className="font-bold w-[30px] cursor-default rounded-[6px] h-[30px] text-blacktheme dark:text-textdarktheme"
            >
              {day}
            </button>
          ))}
        </div>
        <div className="mx-auto grid grid-cols-7 justify-around">
          {days.map((day, dayIdx) => {
            const isPastDate = props.forbidden && day < today
            const isDateUnavailable = props.isDateAvailable && !props.isDateAvailable(day)
            const isDisabled = isPastDate || isDateUnavailable
            
            return (
              <div key={day.toString()} className={classNames(dayIdx === 0 && colStartClasses[getDay(day)], "py-1.5")}>
                <button
                  type="button"
                  onClick={() => !isDisabled && selectingDate(day)}
                  disabled={isDisabled}
                  className={classNames(
                    isEqual(day, selectedDay) && !isDisabled && "text-whitetheme", // Selected day text color
                    !isEqual(day, selectedDay) && isToday(day) && !isDisabled && "text-greentheme font-bold", // Today, not selected
                    !isEqual(day, selectedDay) &&
                      !isToday(day) &&
                      isSameMonth(day, firstDayCurrentMonth) &&
                      !isDisabled &&
                      "text-blacktheme dark:text-textdarktheme", // Same month, not selected/today
                    !isEqual(day, selectedDay) &&
                      !isToday(day) &&
                      !isSameMonth(day, firstDayCurrentMonth) &&
                      "text-greytheme", // Different month
                    isEqual(day, selectedDay) && isToday(day) && !isDisabled && "bg-greentheme font-bold", // Selected and today background
                    isEqual(day, selectedDay) && !isToday(day) && !isDisabled && "bg-blacktheme font-bold", // Selected but not today background
                    !isEqual(day, selectedDay) && !isDisabled && "hover:bg-softgreentheme dark:hover:bg-greentheme/20", // Hover effect
                    (isEqual(day, selectedDay) || isToday(day)) && !isDisabled && "font-semibold", // Font weight for selected or today
                    isDisabled && "opacity-30 cursor-not-allowed", // Disabled styling
                    "mx-auto flex h-8 w-8 items-center justify-center rounded-full", // Base styles
                  )}
                  title={
                    isPastDate 
                      ? "Date has passed" 
                      : isDateUnavailable 
                      ? "Restaurant is closed on this day" 
                      : ""
                  }
                >
                  <time
                    dateTime={format(day, "yyyy-MM-dd")}
                    className={isDisabled ? "opacity-50" : ""}
                  >
                    {format(day, "d")}
                  </time>
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default OurCalendar
