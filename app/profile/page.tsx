"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LogIn, Home, AlertTriangle } from "lucide-react"
import { useAuth } from "../../components/auth/AuthProvider"
import { Sidebar } from "../../components/profile/SideBar"
import { MyInformation } from "../../components/profile/MyInformation"
import { MyReservations } from "../../components/profile/MyReservations"
import { MyFavorites } from "../../components/profile/MyFavorites"
import MyReviews from "@/components/profile/MyReviews"

type ActiveSection = "information" | "reservations" | "favorites" | "reviews"

const ProfilePage: React.FC = () => {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()

  useEffect(() => {
    document.title = "Profile - Tabla | Taste Morocco's Best"
  }, [])

  const [activeSection, setActiveSection] = useState<ActiveSection>("information")

  // Authentication guard - show this if user is not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-whitetheme dark:bg-bgdarktheme flex items-center justify-center p-4">
        <div className="text-center max-w-lg mx-auto p-8 bg-white dark:bg-darkthemeitems rounded-xl shadow-lg border border-softgreytheme dark:border-gray-600">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-blacktheme dark:text-textdarktheme mb-4">
            Profile Access Restricted
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            You need to be signed in to access your profile. Your session may have expired or you haven't signed in yet. Please sign in to view your profile, reservations, favorites, and reviews.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => router.push('/')}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-softgreytheme dark:border-gray-600 text-blacktheme dark:text-textdarktheme font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <Home className="w-5 h-5 mr-2" />
              Go to Home
            </button>
            
            <button
              onClick={() => router.push('/?showAuth=true')}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-greentheme hover:bg-greentheme/80 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </button>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
            New to Tabla? Sign in to create your account and start making reservations.
          </p>
        </div>
      </div>
    )
  }

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-whitetheme dark:bg-bgdarktheme flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-greentheme mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your profile...</p>
        </div>
      </div>
    )
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case "information":
        return <MyInformation />
      case "reservations":
        return <MyReservations />
      case "favorites":
        return <MyFavorites />
      case "reviews":
        return <MyReviews />
      default:
        return <MyInformation />
    }
  }

  return (
    <div className=" bg-whitetheme min-h-[88vh] py-4 dark:bg-bgdarktheme rounded-lg shadow-md">
        <div className="flex flex-col gap-3 md:flex-row  max-w-[1200px] mx-auto bg-whitetheme dark:bg-bgdarktheme transition-colors duration-200">
            <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />

            <main className="flex-1 ">
                <div className="bg-white dark:bg-darkthemeitems rounded-lg shadow-md p-6 transition-colors duration-200">
                {renderActiveSection()}
                </div>
            </main>
        </div>
    </div>
  )
}

export default ProfilePage
