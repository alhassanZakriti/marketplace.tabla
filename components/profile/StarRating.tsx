import type React from "react"

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: "sm" | "md" | "lg"
  showValue?: boolean
  label?: string
}

const StarRating: React.FC<StarRatingProps> = ({ rating, maxRating = 5, size = "md", showValue = false, label }) => {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }

  return (
    <div className="flex items-center gap-2">
      {label && (
        <span className={`text-gray-600 dark:text-gray-400 ${textSizeClasses[size]} min-w-0 flex-shrink-0`}>
          {label}:
        </span>
      )}
      <div className="flex items-center gap-1">
        {[...Array(maxRating)].map((_, index) => (
          <svg
            key={index}
            className={`${sizeClasses[size]} ${
              index < Math.floor(rating)
                ? "text-yellow-400 fill-current"
                : index < rating
                  ? "text-yellow-400 fill-current opacity-50"
                  : "text-gray-300 dark:text-gray-600"
            }`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        {showValue && (
          <span className={`text-gray-600 dark:text-gray-400 ${textSizeClasses[size]} ml-1`}>{rating.toFixed(1)}</span>
        )}
      </div>
    </div>
  )
}

export default StarRating
