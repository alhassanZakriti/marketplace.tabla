"use client"

import type React from "react"
import { useState } from "react"
import { Star } from "lucide-react"

interface ReviewFormProps {
  onSubmit?: (reviewData: ReviewData) => void
  className?: string
}

export interface ReviewData {
  service: number
  ambiance: number
  food: number
  valueForMoney: number
  comment: string
}

export default function ReviewForm({ onSubmit, className = "" }: ReviewFormProps) {
  const [review, setReview] = useState<ReviewData>({
    service: 0,
    ambiance: 0,
    food: 0,
    valueForMoney: 0,
    comment: "",
  })

  const [hoverRatings, setHoverRatings] = useState({
    service: 0,
    ambiance: 0,
    food: 0,
    valueForMoney: 0,
  })

  const handleRatingChange = (category: keyof Omit<ReviewData, "comment">, rating: number) => {
    setReview((prev) => ({
      ...prev,
      [category]: rating,
    }))
  }

  const handleMouseEnter = (category: keyof Omit<ReviewData, "comment">, rating: number) => {
    setHoverRatings((prev) => ({
      ...prev,
      [category]: rating,
    }))
  }

  const handleMouseLeave = (category: keyof Omit<ReviewData, "comment">) => {
    setHoverRatings((prev) => ({
      ...prev,
      [category]: 0,
    }))
  }

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReview((prev) => ({
      ...prev,
      comment: e.target.value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit(review)
    }
  }

  const categories = [
    { key: "service" as const, label: "Service" },
    { key: "ambiance" as const, label: "Ambiance" },
    { key: "food" as const, label: "Food" },
    { key: "valueForMoney" as const, label: "Value for money" },
  ]

  const isFormValid = () => {
    return (
      review.service > 0 &&
      review.ambiance > 0 &&
      review.food > 0 &&
      review.valueForMoney > 0 &&
      review.comment.trim().length > 0
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      <div className="grid lg:grid-cols-2 grid-cols-1  gap-6">
        <div className="rounded-lg border border-softgreytheme dark:border-darkthemeitems bg-white dark:bg-bgdarktheme2 p-6">
            {categories.map((category) => (
            <div key={category.key} className="mb-4 flex items-center justify-between">
                <span className="text-base font-medium text-blacktheme dark:text-textdarktheme">{category.label}</span>
                <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(category.key, star)}
                    onMouseEnter={() => handleMouseEnter(category.key, star)}
                    onMouseLeave={() => handleMouseLeave(category.key)}
                    className="p-1 focus:outline-none"
                    aria-label={`Rate ${category.label} ${star} out of 5 stars`}
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

        <div className="rounded-lg border border-softgreytheme dark:border-darkthemeitems bg-white dark:bg-bgdarktheme2">
            <textarea
            value={review.comment}
            onChange={handleCommentChange}
            placeholder="Write your review here"
            className="w-full h-full resize-none rounded-lg border-0 bg-transparent p-4 text-blacktheme dark:text-textdarktheme focus:ring-0 min-h-[150px]"
            rows={6}
            />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!isFormValid()}
          className="rounded-lg bg-greentheme px-6 py-3 font-medium text-white transition-colors hover:bg-opacity-90 disabled:bg-opacity-50 disabled:cursor-not-allowed"
        >
          Submit Review
        </button>
      </div>
    </form>
  )
}
