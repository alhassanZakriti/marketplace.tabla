"use client"

import type React from "react"
import { useTranslation } from "react-i18next"
import { Star } from "lucide-react"

type ActiveSection = "information" | "reservations" | "favorites" | "reviews"

interface SidebarProps {
  activeSection: ActiveSection
  setActiveSection: (section: ActiveSection) => void
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
  const handleLogout = () => {
    // Implement logout functionality
    console.log("Logging out...")
  }

  const {t} = useTranslation()

  const menuItems = [
    {
      id: "information",
      label: t("profile.myInformation.title", "My Information"),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      ),
    },
    {
      id: "reservations",
      label: t("profile.myReservations.title", "My Reservations"),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      ),
    },
    {
      id: "favorites",
      label: t("profile.myFavorites.title", "My Favorites"),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      ),
    },
    {
      id: "reviews",
      label: t("profile.myReviews.title", "My Reviews"),
      icon: (
        <Star />
      ),
    }
  ]

  return (
    <>
      {/* Mobile Navigation (Top) */}
      <nav className="md:hidden flex justify-around  items-center w-full bg-whitetheme dark:bg-darkthemeitems p-4 shadow-md sticky top-0 z-10">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id as ActiveSection)}
            className={`p-3 rounded-full cursor-pointer ${
              activeSection === item.id ? "bg-greentheme text-whitetheme" : "text-blacktheme dark:text-textdarktheme"
            }`}
            aria-label={item.label}
          >
            {item.icon}
          </button>
        ))}
        <button onClick={handleLogout} className="p-3 cursor-pointer rounded-full text-redtheme" aria-label="Log Out">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </nav>

      {/* Desktop Sidebar (Left) */}
      <aside className="hidden h-fit rounded-xl  md:flex flex-col w-64 bg-whitetheme dark:bg-darkthemeitems shadow-md p-6 transition-colors duration-200">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-bgdarktheme dark:text-white">{t("profile.title")}</h2>
        </div>

        <nav className="flex-1">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id as ActiveSection)}
                  className={`flex items-center cursor-pointer w-full p-3 rounded-lg transition-colors duration-200 ${
                    activeSection === item.id
                      ? "bg-softgreentheme text-greentheme dark:bg-greentheme dark:text-whitetheme"
                      : "text-blacktheme dark:text-textdarktheme hover:bg-softgreentheme hover:text-greentheme dark:hover:bg-greentheme dark:hover:text-whitetheme"
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <button
          onClick={handleLogout}
          className="flex mt-10 items-center cursor-pointer w-full p-3 rounded-lg text-redtheme hover:bg-softredtheme transition-colors duration-200"
        >
          <span className="mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </span>
          <span >{t("profile.logout")}</span>
        </button>
      </aside>
    </>
  )
}
