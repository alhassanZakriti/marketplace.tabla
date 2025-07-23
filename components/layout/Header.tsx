"use client"

import { useState, useEffect, useRef } from "react"
import { Download, Moon, Sun, User } from "lucide-react"
import Logo from "./Logo"
import SearchBar from "../search/SearchBar"
import AuthPopup from "../auth/AuthPopup"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "../auth/AuthProvider"
import { useClientTranslation } from "@/hooks/useClientTranslation"
import { useTranslation } from "react-i18next"
import english from "../../public/english.png"
import french from "../../public/french.png"
import Image from "next/image"

const Header = () => {
  const { i18n, isClient } = useClientTranslation()
  const { t } = useTranslation()
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [shouldShowSearchBar, setShouldShowSearchBar] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("tabla-dark-mode")
      if (savedMode !== null) {
        return savedMode === "true"
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches
    }
    return false
  })


  const languages = [
    { code: "en", name: "English", flag: english },
    { code: "fr", name: "Français", flag: french },
  ]

  const currentLanguage = languages.find((lang) => lang.code === i18n?.language) || languages[0]
  
  const changeLanguage = (languageCode: string) => {
    if (isClient && i18n?.changeLanguage) {
      i18n.changeLanguage(languageCode)
      setShowLanguageDropdown(false)
      // Save language preference to localStorage
      localStorage.setItem("language", languageCode)
    }
  }

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode)
    if (typeof window !== "undefined") {
      localStorage.setItem("tabla-dark-mode", darkMode.toString())
    }
  }, [darkMode])
  
  const pathname = usePathname()
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500 || (pathname.includes("search") && window.scrollY > 180)) {
        setShouldShowSearchBar(true)
      } else {
        setShouldShowSearchBar(false)
      }
    }
    
    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [pathname])
  
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const userDropdownRef = useRef<HTMLDivElement>(null)
  const languageDropdownRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if(user) {
      console.log("User authenticated:", user)
    }
  }, [user])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSuccess = (data: any) => {
    console.log("Authentication successful:", data)
  }

  return (
    <header className="z-[50] sticky top-0 p-2 items-center flex justify-between gap-1 px-6 lt-sm:px-2 shadow-lg shadow-[#00000007] bg-whitetheme dark:bg-bgdarktheme dark:shadow-[#ffffff07] transition-colors duration-200">
      <AuthPopup isOpen={isOpen} onClose={() => setIsOpen(false)} onSuccess={handleSuccess} />

      <Logo className="horizontal" />

      <div className="lt-lg:hidden">{shouldShowSearchBar && <SearchBar />}</div>

      <div className="flex flex-col justify-center items-end gap-2">
        <div className="flex items-center gap-2 text-greentheme text-sm font-semibold">
          <a
            href="https://restaurant.tabla.ma/"
            target="_blank"
            className="hover:underline dark:text-whitetheme transition-colors"
            rel="noreferrer"
          >
            {t("header.forBusiness", "For Business")}
          </a>
          <p className="text-[#00000099] dark:text-[#ffffff99]">|</p>
          <Link href="/contact" className="hover:underline dark:text-whitetheme transition-colors">
            {t("header.contactUs", "Contact Us")}
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn flex gap-2 bg-softgreytheme dark:bg-darkthemeitems text-blacktheme dark:text-textdarktheme hover:bg-softgreentheme dark:hover:bg-greentheme/20 transition-colors px-3 py-2 rounded-lg font-medium">
            <span className="hidden md:block">{t("header.getApp", "Get our app")}</span>
            <Download size={20} />
          </button>

          {isAuthenticated && user ? (
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="btn flex items-center gap-2 bg-softgreytheme dark:bg-darkthemeitems text-blacktheme dark:text-textdarktheme hover:bg-softgreentheme dark:hover:bg-greentheme/20 transition-colors px-3 py-2 rounded-lg font-medium"
                aria-label={t("header.userMenu", "User menu")}
              >
                <User size={20} />
                <span className="hidden md:block">{user.username || user.first_name || "User"}</span>
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-darkthemeitems border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1 min-w-[200px] z-50">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                    <p className="text-sm font-medium text-blacktheme dark:text-textdarktheme">
                      {user.first_name && user.last_name 
                        ? `${user.first_name} ${user.last_name}` 
                        : user.username || "User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                  
                  <Link
                    href={`/profile`}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-blacktheme dark:text-textdarktheme"
                    onClick={() => setShowUserDropdown(false)}
                  >
                    <User size={16} />
                    <span>{t("header.profile", "Profile")}</span>
                  </Link>
                  
                  <button
                    onClick={() => {
                      logout()
                      setShowUserDropdown(false)
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-redtheme hover:text-red-600"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{t("header.logout", "Logout")}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="btn-primary bg-greentheme text-whitetheme hover:opacity-90 transition-all px-4 py-2 rounded-lg font-semibold"
              onClick={() => setIsOpen(true)}
            >
              <span className="hidden md:block">{t("header.login", "Login")}</span>
              <User size={20} className="md:hidden block" />
            </button>
          )}

         {/* Language Switcher */}
          <div className="language-switcher relative" ref={languageDropdownRef}>
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="btn flex items-center gap-2 bg-softgreytheme dark:bg-darkthemeitems text-blacktheme dark:text-textdarktheme hover:bg-softgreentheme dark:hover:bg-greentheme/20 transition-colors px-3 py-2 rounded-lg font-medium"
              aria-label={String(t("header.changeLanguage", "Change language"))}
            >
              <Image src={currentLanguage.flag} alt={currentLanguage.name} width={20} height={20} />
            </button>

            {showLanguageDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-darkthemeitems border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1 min-w-[160px] z-50">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => changeLanguage(language.code)}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 ${
                      i18n?.language === language.code
                        ? "bg-softgreentheme dark:bg-greentheme/20 text-greentheme dark:text-greentheme"
                        : "text-blacktheme dark:text-textdarktheme"
                    }`}
                  >
                    <Image src={language.flag} alt={language.name} width={20} height={20} />
                    <span className="font-medium">{language.name}</span>
                    {i18n?.language === language.code && <span className="ml-auto text-greentheme">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setDarkMode((prevMode) => !prevMode)}
            className="p-2 rounded-full bg-softgreytheme dark:bg-darkthemeitems text-blacktheme dark:text-textdarktheme hover:bg-softgreentheme dark:hover:bg-greentheme/20 transition-colors"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun size={20} className="text-yellowtheme" /> : <Moon size={20} className="text-greentheme" />}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
