"use client"

import type React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = []
    // Always show first page
    pages.push(1)

    // Calculate range around current page
    const rangeStart = Math.max(2, currentPage - 1)
    const rangeEnd = Math.min(totalPages - 1, currentPage + 1)

    // Add ellipsis after first page if needed
    if (rangeStart > 2) {
      pages.push("ellipsis1")
    }

    // Add pages in range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i)
    }

    // Add ellipsis before last page if needed
    if (rangeEnd < totalPages - 1) {
      pages.push("ellipsis2")
    }

    // Always show last page if there is more than one page
    if (totalPages > 1) {
      pages.push(totalPages)
    }
    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex justify-center items-center">
      {/* Previous Button */}
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center justify-center w-10 h-10 rounded-full mr-2 ${
          currentPage === 1
            ? "text-greytheme dark:text-textdarktheme/30 cursor-not-allowed"
            : "text-blacktheme dark:text-textdarktheme hover:bg-softgreytheme dark:hover:bg-darkthemeitems"
        }`}
        aria-label="Previous page"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center space-x-1">
        {pageNumbers.map((page, index) => {
          if (page === "ellipsis1" || page === "ellipsis2") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="w-10 h-10 flex items-center justify-center text-greytheme dark:text-textdarktheme/50"
              >
                ...
              </span>
            )
          }
          return (
            <button
              key={`page-${page}`}
              onClick={() => typeof page === "number" && onPageChange(page)}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentPage === page
                  ? "bg-greentheme text-white"
                  : "text-blacktheme dark:text-textdarktheme hover:bg-softgreytheme dark:hover:bg-darkthemeitems"
              }`}
              aria-label={`Page ${page}`}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </button>
          )
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex items-center justify-center w-10 h-10 rounded-full ml-2 ${
          currentPage === totalPages
            ? "text-greytheme dark:text-textdarktheme/30 cursor-not-allowed"
            : "text-blacktheme dark:text-textdarktheme hover:bg-softgreytheme dark:hover:bg-darkthemeitems"
        }`}
        aria-label="Next page"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  )
}

export default Pagination
