
import HomeHero from "../components/home/HomeHero"
import PopularSection from "../components/home/PopularSection"
import FeaturesTape from "../components/home/FeaturesTape"
import BestInSection from "../components/home/BestInSection"  
import NewsletterTape from "../components/home/NewsLetterTape"
import JoinSection from "../components/home/JoinSection"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

interface Restaurant {
  id: string
  name: string
  cuisine: string
  rating: number
  image: string
}

const Home = () => {
  

  return (
    <div  className=" bg-whitetheme dark:bg-bgdarktheme text-blacktheme dark:text-textdarktheme">

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

export default Home
