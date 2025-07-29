
"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import HomeHero from "../components/home/HomeHero"
import PopularSection from "../components/home/PopularSection"
import FeaturesTape from "../components/home/FeaturesTape"
import BestInSection from "../components/home/BestInSection"  
import NewsletterTape from "../components/home/NewsLetterTape"
import JoinSection from "../components/home/JoinSection"
import AuthPopup from "../components/auth/AuthPopup"
import { useAuth } from "../components/auth/AuthProvider"

interface Restaurant {
  id: string
  name: string
  cuisine: string
  rating: number
  image: string
}

function HomeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [showAuthPopup, setShowAuthPopup] = useState(false)

  // Check for showAuth parameter on mount and when searchParams change
  useEffect(() => {
    const shouldShowAuth = searchParams.get('showAuth') === 'true'
    
    // Only show popup if user is not already authenticated
    if (shouldShowAuth && !isAuthenticated) {
      setShowAuthPopup(true)
    }
  }, [searchParams, isAuthenticated])

  // Handle popup close - remove the URL parameter
  const handleCloseAuthPopup = () => {
    setShowAuthPopup(false)
    
    // Remove the showAuth parameter from URL
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    current.delete('showAuth')
    const search = current.toString()
    const query = search ? `?${search}` : ""
    router.replace(`/${query}`)
  }

  // Handle successful authentication
  const handleAuthSuccess = (data: any) => {
    console.log("Authentication successful:", data)
    // The popup will close automatically and URL param will be removed
  }

  return (
    <div className="bg-whitetheme dark:bg-bgdarktheme text-blacktheme dark:text-textdarktheme">
      {/* Auth Popup controlled by URL parameter */}
      <AuthPopup 
        isOpen={showAuthPopup} 
        onClose={handleCloseAuthPopup} 
        onSuccess={handleAuthSuccess} 
      />

      {/* Hero Section */}
      <HomeHero />

      {/* Popular Section */}
      <PopularSection />

      {/* Features Tape */}
      <FeaturesTape />

      {/* Best In Section */}
      <BestInSection />

      {/* Newsletter Tape */}
      <NewsletterTape />

      {/* Join Section */}
      <JoinSection />
    </div>
  )
}

const Home = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  )
}

export default Home
