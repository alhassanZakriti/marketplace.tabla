"use client"
import { motion, AnimatePresence } from "framer-motion"
import type React from "react"
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import SearchBar from "../search/SearchBar"
import SearchBarMobile from "../search/SearchBarMobile"
import heroImage from "../../public/hero4.jpg"
import locationIcon from "../../public/location.svg"
import { ChevronDown } from "lucide-react"
import Image from "next/image"

function HomeHero() {
  const { t } = useTranslation()
  const [showScrollButton, setShowScrollButton] = useState(true)

  useEffect(() => {
    // Function to handle scroll events
    const handleScroll = () => {
      // Show button only when at the top of the page (within first viewport)
      // Hide when scrolled down
      if (window.scrollY > window.innerHeight * 0.5) {
        setShowScrollButton(false)
      } else {
        setShowScrollButton(true)
      }
    }

    // Initial check
    handleScroll()

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll)

    // Clean up
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const scrollToPopular = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const popularSection = document.getElementById("popular")
    if (popularSection) {
      popularSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }

  return (
    <section className="relative min-h-screen md:h-[90vh] mt-[-3em] w-full overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute p-0 inset-0 z-0">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <img
          src={heroImage.src || "/placeholder.svg"}
          className="w-full h-full object-cover object-center"
          alt={t("hero.backgroundAlt", "Restaurant background")}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col md:mt-[-20vh] items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl mx-auto text-center">
          {/* Hero Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 md:mb-12"
          >
            {/* Location Badge */}
            <div className="mt-[20vh] inline-flex items-center gap-2 px-4] py-1.5 px-2 lt-md:mt-20 bg-white/10 backdrop-blur-sm rounded-full mb-4">
              <Image
                src={locationIcon}
                className="w-4 h-4"
                width={20}
                height={20}
                
                alt={t("hero.locationIconAlt", "Location icon")}
              />
              <span className="text-white font-medium text-sm ">{t("hero.locationBadge", "at Tabla.ma")}</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-6 max-w-4xl mx-auto">
              {t("hero.mainHeading", "Discover Your Next Table")}
            </h1>
          </motion.div>

          {/* Search Components */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-4xl mx-auto"
          >
            {/* Desktop Search */}
            <div className="hidden sm:block">
              <SearchBar />
            </div>
            {/* Mobile Search */}
            <div className="sm:hidden">
              <SearchBarMobile />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Button - Using AnimatePresence for smooth transitions */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.div
            className="absolute bottom-16 left-0 right-0 flex justify-center z-[0]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            <a
              href="#popular"
              onClick={scrollToPopular}
              className="flex flex-col items-center gap-2 cursor-pointer group"
              aria-label={t("hero.scrollAriaLabel", "Scroll to popular restaurants")}
            >
              <span className="text-white text-sm font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                {t("hero.exploreMore", "Explore More")}
              </span>
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full group-hover:bg-white/30 transition-all duration-300 shadow-lg">
                <ChevronDown size={24} className="text-white animate-bounce" />
              </div>
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Curve */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-white dark:bg-bgdarktheme rounded-t-[2rem] z-10"></div>
    </section>
  )
}

export default HomeHero
