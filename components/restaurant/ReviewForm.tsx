"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Star, Upload, X, Camera } from "lucide-react"

interface ReviewFormProps {
  restaurantId: string | number
  onSubmit?: (reviewData: FormData) => void
  onCancel?: () => void
  className?: string
  isLoading?: boolean
}

export interface ReviewData {
  service_rating: number
  ambience_rating: number
  food_rating: number
  value_for_money: number
  description: string
  image?: File | null
}

export default function ReviewForm({ 
  restaurantId, 
  onSubmit, 
  onCancel, 
  className = "", 
  isLoading = false 
}: ReviewFormProps) {
  const [review, setReview] = useState<ReviewData>({
    service_rating: 0,
    ambience_rating: 0,
    food_rating: 0,
    value_for_money: 0,
    description: "",
    image: null,
  })

  const [hoverRatings, setHoverRatings] = useState({
    service_rating: 0,
    ambience_rating: 0,
    food_rating: 0,
    value_for_money: 0,
  })

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleRatingChange = (category: keyof Omit<ReviewData, "description" | "image">, rating: number) => {
    setReview((prev) => ({
      ...prev,
      [category]: rating,
    }))
  }

  const handleMouseEnter = (category: keyof Omit<ReviewData, "description" | "image">, rating: number) => {
    setHoverRatings((prev) => ({
      ...prev,
      [category]: rating,
    }))
  }

  const handleMouseLeave = (category: keyof Omit<ReviewData, "description" | "image">) => {
    setHoverRatings((prev) => ({
      ...prev,
      [category]: 0,
    }))
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReview((prev) => ({
      ...prev,
      description: e.target.value,
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB')
        return
      }

      setReview((prev) => ({
        ...prev,
        image: file,
      }))

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setReview((prev) => ({
      ...prev,
      image: null,
    }))
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid()) return

    // Create FormData for API submission
    const formData = new FormData()
    formData.append('service_rating', review.service_rating.toString())
    formData.append('ambience_rating', review.ambience_rating.toString())
    formData.append('food_rating', review.food_rating.toString())
    formData.append('value_for_money', review.value_for_money.toString())
    formData.append('description', review.description.trim())
    
    if (review.image) {
      formData.append('image', review.image)
    }

    if (onSubmit) {
      onSubmit(formData)
    }
  }

  const categories = [
    { key: "service_rating" as const, label: "Service" },
    { key: "ambience_rating" as const, label: "Ambience" },
    { key: "food_rating" as const, label: "Food" },
    { key: "value_for_money" as const, label: "Value for Money" },
  ]

  const isFormValid = () => {
    return (
      review.service_rating > 0 &&
      review.ambience_rating > 0 &&
      review.food_rating > 0 &&
      review.value_for_money > 0 &&
      review.description.trim().length > 0
    )
  }

  return (
    <div className={`bg-white dark:bg-darkthemeitems rounded-xl p-6 shadow-lg h-[80vh] overflow-scroll ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-blacktheme dark:text-textdarktheme mb-2">
          Write a Review
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Share your experience with other diners
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Section */}
        <div className="rounded-lg border border-softgreytheme dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-6">
          <h4 className="text-lg font-semibold text-blacktheme dark:text-textdarktheme mb-4">
            Rate Your Experience
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category) => (
              <div key={category.key} className="flex items-center justify-between">
                <span className="text-base font-medium text-blacktheme dark:text-textdarktheme">
                  {category.label}
                </span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(category.key, star)}
                      onMouseEnter={() => handleMouseEnter(category.key, star)}
                      onMouseLeave={() => handleMouseLeave(category.key)}
                      className="p-1 focus:outline-none focus:ring-2 focus:ring-greentheme rounded"
                      aria-label={`Rate ${category.label} ${star} out of 5 stars`}
                      disabled={isLoading}
                    >
                      <Star
                        className={`h-6 w-6 transition-colors ${
                          (hoverRatings[category.key] || review[category.key]) >= star
                            ? "fill-yellowtheme text-yellowtheme"
                            : "fill-gray-200 text-gray-200 dark:fill-gray-600 dark:text-gray-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Review Text */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-blacktheme dark:text-textdarktheme">
            Your Review *
          </label>
          <textarea
            value={review.description}
            onChange={handleDescriptionChange}
            placeholder="Tell us about your dining experience..."
            className="w-full h-32 resize-none rounded-lg border border-softgreytheme dark:border-gray-600 bg-white dark:bg-gray-800 p-4 text-blacktheme dark:text-textdarktheme placeholder-gray-500 focus:ring-2 focus:ring-greentheme focus:border-transparent"
            disabled={isLoading}
            required
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-blacktheme dark:text-textdarktheme">
            Add a Photo (Optional)
          </label>
          
          {!imagePreview ? (
            <div className="border-2 border-dashed border-softgreytheme dark:border-gray-600 rounded-lg p-6 text-center hover:border-greentheme dark:hover:border-greentheme transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={isLoading}
              />
              <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Add a photo of your meal or the restaurant
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 bg-greentheme hover:bg-greentheme/80 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Photo
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Max size: 5MB • Formats: JPG, PNG, GIF
              </p>
            </div>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Review preview"
                className="w-full h-48 object-cover rounded-lg border border-softgreytheme dark:border-gray-600"
              />
              <button
                type="button"
                onClick={removeImage}
                disabled={isLoading}
                className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-6 py-3 border border-softgreytheme dark:border-gray-600 text-blacktheme dark:text-textdarktheme font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!isFormValid() || isLoading}
            className="flex-1 px-6 py-3 bg-greentheme hover:bg-greentheme/80 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </form>
    </div>
  )
}
