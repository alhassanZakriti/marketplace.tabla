"use client"

import type React from "react"

import { useEffect, useState, useCallback } from "react"
import { X, ZoomIn, ZoomOut, Download } from "lucide-react"

interface PhotoPopupProps {
  isOpen: boolean
  photoUrl: string
  onClose: () => void
  altText?: string
}

export default function PhotoPopup({ isOpen, photoUrl, onClose, altText = "Photo" }: PhotoPopupProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(1)

  // Handle escape key press
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    },
    [onClose],
  )

  // Add and remove event listeners
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  // Reset states when photo changes
  useEffect(() => {
    if (photoUrl) {
      setIsLoading(true)
      setZoomLevel(1)
    }
  }, [photoUrl])

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation()
    setZoomLevel((prev) => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation()
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))
  }

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    const link = document.createElement("a")
    link.href = photoUrl
    link.download = `photo-${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-blacktheme/20 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Photo Container */}
      <div
        className="relative z-10 max-h-[90vh] max-w-[90vw] overflow-hidden rounded-xl bg-white dark:bg-bgdarktheme2 shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-bgdarktheme2">
            <div className="h-12 w-12 rounded-full border-4 border-softgreytheme border-t-greentheme animate-spin" />
          </div>
        )}

        {/* Image */}
        <div className="relative overflow-hidden">
          <img
            src={photoUrl || "/placeholder.svg"}
            alt={altText}
            className="max-h-[80vh] object-contain transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel})` }}
            onLoad={() => setIsLoading(false)}
          />
        </div>

        {/* Controls */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-white/90 dark:bg-darkthemeitems/90 p-2 shadow-lg">
          <button
            onClick={handleZoomOut}
            className="rounded-full p-2 text-blacktheme dark:text-textdarktheme hover:bg-softgreytheme dark:hover:bg-darkthemeitems transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut size={20} />
          </button>
          <button
            onClick={handleZoomIn}
            className="rounded-full p-2 text-blacktheme dark:text-textdarktheme hover:bg-softgreytheme dark:hover:bg-darkthemeitems transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn size={20} />
          </button>
          <button
            onClick={handleDownload}
            className="rounded-full p-2 text-blacktheme dark:text-textdarktheme hover:bg-softgreytheme dark:hover:bg-darkthemeitems transition-colors"
            aria-label="Download image"
          >
            <Download size={20} />
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-white/90 dark:bg-darkthemeitems/90 p-2 text-blacktheme dark:text-textdarktheme hover:bg-softgreytheme dark:hover:bg-darkthemeitems transition-colors shadow-lg"
          aria-label="Close photo viewer"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  )
}
