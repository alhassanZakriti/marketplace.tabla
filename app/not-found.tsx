import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Page Not Found - Tabla | Taste Morocco's Best",
  description: "The page you're looking for doesn't exist. Return to Tabla to find the best restaurants in Morocco.",
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-whitetheme dark:bg-bgdarktheme flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        <div className="w-32 h-32 mx-auto mb-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <svg
            className="w-16 h-16 text-gray-400 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47.901-6.063 2.381C5.482 15.888 5.99 14 8 14h8c2.01 0 2.518 1.888 2.063 3.381z"
            />
          </svg>
        </div>
        
        <h1 className="text-4xl font-bold text-blacktheme dark:text-textdarktheme mb-4">
          404
        </h1>
        
        <h2 className="text-2xl font-semibold text-blacktheme dark:text-textdarktheme mb-4">
          Page Not Found
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </p>
        
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block w-full px-6 py-3 bg-greentheme hover:bg-greentheme/80 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Go Back Home
          </Link>
          
          <Link
            href="/search"
            className="inline-block w-full px-6 py-3 border border-greentheme text-greentheme hover:bg-greentheme hover:text-white font-medium rounded-lg transition-colors duration-200"
          >
            Find Restaurants
          </Link>
        </div>
      </div>
    </div>
  )
}
