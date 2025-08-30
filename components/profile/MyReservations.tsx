"use client"
import type React from "react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useReservations, useCancelReservation } from "@/hooks/api/useReservations"
import { useAuth } from "../auth/AuthProvider"
import type { Reservation } from "@/lib/dataProvider"

export const MyReservations: React.FC = () => {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  // Fetch reservations using React Query
  const { data: reservationsData, isLoading, error } = useReservations()
  const cancelReservationMutation = useCancelReservation()

  const handleCancelReservation = async (reservationId: number) => {
    if (window.confirm(t("profile.myReservations.cancelConfirm", "Are you sure you want to cancel this reservation?"))) {
      try {
        await cancelReservationMutation.mutateAsync(reservationId)
        // Success feedback could be added here (toast notification)
      } catch (error) {
        console.error('Failed to cancel reservation:', error)
        alert(t("profile.myReservations.cancelError", "Failed to cancel reservation. Please try again."))
      }
    }
  }

  const handleViewReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setIsViewModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsViewModalOpen(false)
    setSelectedReservation(null)
  }

  // If user is not authenticated, show login message
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme">
          {t("profile.myReservations.title", "My Reservations")}
        </h2>
        <div className="text-center py-8">
          <div className="text-greytheme dark:text-textdarktheme mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-4 opacity-50"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </div>
          <p className="text-greytheme dark:text-textdarktheme text-lg">
            {t("profile.myReservations.notLoggedIn", "Please log in to see your reservations.")}
          </p>
          <button className="mt-4 px-6 py-2 bg-greentheme text-white rounded-lg hover:bg-opacity-90 transition-colors">
            {t("auth.login", "Log In")}
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme">
          {t("profile.myReservations.title", "My Reservations")}
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-softgreytheme dark:divide-darkthemeitems">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-greytheme dark:text-textdarktheme">
                  {t("profile.myReservations.restaurant")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-greytheme dark:text-textdarktheme">
                  {t("profile.myReservations.date")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-greytheme dark:text-textdarktheme">
                  {t("profile.myReservations.time")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-greytheme dark:text-textdarktheme">
                  {t("profile.myReservations.people")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-greytheme dark:text-textdarktheme">
                  {t("profile.myReservations.specialRequests", "Special Requests")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-greytheme dark:text-textdarktheme">
                  {t("profile.myReservations.status.title")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-greytheme dark:text-textdarktheme">
                  {t("profile.myReservations.actions.title")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-softgreytheme dark:divide-darkthemeitems">
              {/* Loading skeleton rows */}
              {[...Array(3)].map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="px-4 py-4"><div className="h-4 bg-softgreytheme dark:bg-darkthemeitems rounded"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-softgreytheme dark:bg-darkthemeitems rounded"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-softgreytheme dark:bg-darkthemeitems rounded"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-softgreytheme dark:bg-darkthemeitems rounded"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-softgreytheme dark:bg-darkthemeitems rounded"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-softgreytheme dark:bg-darkthemeitems rounded"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-softgreytheme dark:bg-darkthemeitems rounded"></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme">
          {t("profile.myReservations.title", "My Reservations")}
        </h2>
        <div className="text-center py-8">
          <div className="text-greytheme dark:text-textdarktheme mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-4 opacity-50"
            >
              <path d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"></path>
            </svg>
          </div>
          <p className="text-greytheme dark:text-textdarktheme text-lg">
            {t("profile.myReservations.error", "Failed to load your reservations.")}
          </p>
          <p className="text-greytheme dark:text-textdarktheme text-sm mt-2">
            Error: {error?.message || "Unknown error occurred"}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-6 py-2 bg-greentheme text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            {t("common.retry", "Try Again")}
          </button>
        </div>
      </div>
    )
  }

  const reservations = reservationsData || []

  if (!isLoading && reservations.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme">
          {t("profile.myReservations.title", "My Reservations")}
        </h2>
        <div className="text-center py-8">
          <div className="text-greytheme dark:text-textdarktheme mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-4 opacity-50"
            >
              <path d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"></path>
            </svg>
          </div>
          <p className="text-greytheme dark:text-textdarktheme text-lg">
            {t("profile.myReservations.empty", "You don't have any reservations yet.")}
          </p>
          <p className="text-greytheme dark:text-textdarktheme text-sm mt-2">
            {t("profile.myReservations.emptyHint", "Browse restaurants and make a reservation to see them here.")}
          </p>
        </div>
      </div>
    )
  }
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const getStatusColor = (status: string) => {
    if(status){
      switch (status.toLowerCase()) {
        case "pending":
          return "bg-softbluetheme text-bluetheme dark:bg-bluetheme dark:text-whitetheme"
        case "confirmed":
        case "approved": // Handle both CONFIRMED and APPROVED status
          return "bg-softgreentheme text-greentheme dark:bg-greentheme dark:text-whitetheme"
        case "cancelled":
          return "bg-softredtheme text-redtheme dark:bg-redtheme dark:text-whitetheme"
        case "no_show":
          return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
        case "seated":
          return "bg-softpurpletheme text-purpletheme dark:bg-purpletheme dark:text-whitetheme"
        case "fulfilled":
          return "bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100"
        default:
          return "bg-softgreytheme text-greytheme dark:bg-greytheme dark:text-whitetheme"
      }
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme">
        {t("profile.myReservations.title", "My Reservations")}
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-softgreytheme dark:divide-darkthemeitems">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-greytheme dark:text-textdarktheme">
                {t("profile.myReservations.restaurant")}
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-greytheme dark:text-textdarktheme">
                {t("profile.myReservations.date")}
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-greytheme dark:text-textdarktheme">
                {t("profile.myReservations.time")}
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-greytheme dark:text-textdarktheme">
                {t("profile.myReservations.people")}
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-greytheme dark:text-textdarktheme">
                {t("profile.myReservations.specialRequests", "Special Requests")}
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-greytheme dark:text-textdarktheme">
                {t("profile.myReservations.status.title")}
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-greytheme dark:text-textdarktheme">
                {t("profile.myReservations.actions.title")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-softgreytheme dark:divide-darkthemeitems">
            {reservations.map((reservation) => (
              <tr key={reservation.id}>
                <td className="px-4 py-4 text-sm text-blacktheme dark:text-textdarktheme">{reservation.restaurant}</td>
                <td className="px-4 py-4 text-sm text-blacktheme dark:text-textdarktheme">
                  {formatDate(reservation.date)}
                </td>
                <td className="px-4 py-4 text-sm text-blacktheme dark:text-textdarktheme">{reservation.time}</td>
                <td className="px-4 py-4 text-sm text-blacktheme dark:text-textdarktheme">{reservation.number_of_guests}</td>
                <td className="px-4 py-4 text-sm text-blacktheme dark:text-textdarktheme">
                  {reservation.preferences || "-"}
                </td>
                <td className="px-4 py-4 text-sm">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}
                  >
                    {reservation.status === "PENDING"
                      ? t("profile.myReservations.status.pending")
                      : reservation.status === "APPROVED"
                      ? t("profile.myReservations.status.confirmed")
                      : reservation.status === "CANCELLED"
                      ? t("profile.myReservations.status.cancelled")
                      : reservation.status === "NO_SHOW"
                      ? t("profile.myReservations.status.noShow")
                      : reservation.status === "SEATED"
                      ? t("profile.myReservations.status.seated")
                      : reservation.status === "FULFILLED"
                      ? t("profile.myReservations.status.fulfilled")
                      : reservation.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm">
                  <button 
                    onClick={() => handleViewReservation(reservation)}
                    className="text-greentheme hover:text-opacity-80 dark:text-whitetheme dark:hover:text-opacity-80 mr-3"
                  >
                    {t("profile.myReservations.actions.view")}
                  </button>
                  {reservation.status !== "fulfilled" &&
                    reservation.status !== "cancelled" && 
                    reservation.status !== "no show" &&
                    reservation.status !== "noshow" &&
                    reservation.status !== "no_show" && (
                      <button 
                        onClick={() => handleCancelReservation(reservation.id)}
                        disabled={cancelReservationMutation.isPending}
                        className="text-redtheme hover:text-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cancelReservationMutation.isPending ? 
                          t("profile.myReservations.actions.cancelling", "Cancelling...") : 
                          t("profile.myReservations.actions.cancel")
                        }
                      </button>
                    )}
                  {reservation.status === "fulfilled" && (
                    <button className="text-purpletheme hover:text-opacity-80">{t("profile.myReservations.actions.review")}</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reservation Detail Modal */}
      {isViewModalOpen && selectedReservation && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full h-full opacity-0 z-0" onClick={handleCloseModal}/>
          <div className="bg-whitetheme absolute dark:bg-darktheme rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme">
                  {t("profile.myReservations.details.title", "Reservation Details")}
                </h3>
                <button 
                  onClick={handleCloseModal}
                  className="text-greytheme hover:text-blacktheme dark:text-textdarktheme dark:hover:text-whitetheme"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18"></path>
                    <path d="M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              {/* Reservation Details */}
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h4 className="text-lg font-medium text-blacktheme dark:text-textdarktheme mb-3">
                    {t("profile.myReservations.details.basicInfo", "Basic Information")}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-greytheme dark:text-textdarktheme">
                        {t("profile.myReservations.details.reservationId", "Reservation ID")}
                      </label>
                      <p className="text-blacktheme dark:text-textdarktheme">#{selectedReservation.seq_id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-greytheme dark:text-textdarktheme">
                        {t("profile.myReservations.details.status", "Status")}
                      </label>
                      <p className="text-blacktheme dark:text-textdarktheme">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedReservation.status)}`}>
                          {selectedReservation.status === "PENDING"
                            ? t("profile.myReservations.status.pending")
                            : selectedReservation.status === "APPROVED"
                            ? t("profile.myReservations.status.confirmed")
                            : selectedReservation.status === "CANCELLED"
                            ? t("profile.myReservations.status.cancelled")
                            : selectedReservation.status === "NO_SHOW"
                            ? t("profile.myReservations.status.noShow")
                            : selectedReservation.status === "SEATED"
                            ? t("profile.myReservations.status.seated")
                            : selectedReservation.status === "FULFILLED"
                            ? t("profile.myReservations.status.fulfilled")
                            : selectedReservation.status}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-greytheme dark:text-textdarktheme">
                        {t("profile.myReservations.details.date", "Date")}
                      </label>
                      <p className="text-blacktheme dark:text-textdarktheme">{formatDate(selectedReservation.date)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-greytheme dark:text-textdarktheme">
                        {t("profile.myReservations.details.time", "Time")}
                      </label>
                      <p className="text-blacktheme dark:text-textdarktheme">{selectedReservation.time}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-greytheme dark:text-textdarktheme">
                        {t("profile.myReservations.details.guests", "Number of Guests")}
                      </label>
                      <p className="text-blacktheme dark:text-textdarktheme">{selectedReservation.number_of_guests}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-greytheme dark:text-textdarktheme">
                        {t("profile.myReservations.details.source", "Source")}
                      </label>
                      <p className="text-blacktheme dark:text-textdarktheme">{selectedReservation.source}</p>
                    </div>
                  </div>
                </div>

                {/* Guest Information */}
                <div>
                  <h4 className="text-lg font-medium text-blacktheme dark:text-textdarktheme mb-3">
                    {t("profile.myReservations.details.guestInfo", "Guest Information")}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-greytheme dark:text-textdarktheme">
                        {t("profile.myReservations.details.name", "Name")}
                      </label>
                      <p className="text-blacktheme dark:text-textdarktheme">
                        {selectedReservation.title} {selectedReservation.first_name} {selectedReservation.last_name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-greytheme dark:text-textdarktheme">
                        {t("profile.myReservations.details.email", "Email")}
                      </label>
                      <p className="text-blacktheme dark:text-textdarktheme">{selectedReservation.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-greytheme dark:text-textdarktheme">
                        {t("profile.myReservations.details.phone", "Phone")}
                      </label>
                      <p className="text-blacktheme dark:text-textdarktheme">{selectedReservation.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Special Requests & Notes */}
                {(selectedReservation.preferences || selectedReservation.allergies || selectedReservation.internal_note) && (
                  <div>
                    <h4 className="text-lg font-medium text-blacktheme dark:text-textdarktheme mb-3">
                      {t("profile.myReservations.details.additionalInfo", "Additional Information")}
                    </h4>
                    <div className="space-y-4">
                      {selectedReservation.preferences && (
                        <div>
                          <label className="text-sm font-medium text-greytheme dark:text-textdarktheme">
                            {t("profile.myReservations.details.preferences", "Preferences")}
                          </label>
                          <p className="text-blacktheme dark:text-textdarktheme">{selectedReservation.preferences}</p>
                        </div>
                      )}
                      {selectedReservation.allergies && (
                        <div>
                          <label className="text-sm font-medium text-greytheme dark:text-textdarktheme">
                            {t("profile.myReservations.details.allergies", "Allergies")}
                          </label>
                          <p className="text-blacktheme dark:text-textdarktheme">{selectedReservation.allergies}</p>
                        </div>
                      )}
                      {selectedReservation.internal_note && (
                        <div>
                          <label className="text-sm font-medium text-greytheme dark:text-textdarktheme">
                            {t("profile.myReservations.details.internalNote", "Internal Note")}
                          </label>
                          <p className="text-blacktheme dark:text-textdarktheme">{selectedReservation.internal_note}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Cancellation Information */}
                {(selectedReservation.status === "cancelled" && selectedReservation.cancellation_note) && (
                  <div>
                    <h4 className="text-lg font-medium text-blacktheme dark:text-textdarktheme mb-3">
                      {t("profile.myReservations.details.cancellationInfo", "Cancellation Information")}
                    </h4>
                    <div>
                      <label className="text-sm font-medium text-greytheme dark:text-textdarktheme">
                        {t("profile.myReservations.details.cancellationNote", "Cancellation Note")}
                      </label>
                      <p className="text-blacktheme dark:text-textdarktheme">{selectedReservation.cancellation_note}</p>
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div>
                  <h4 className="text-lg font-medium text-blacktheme dark:text-textdarktheme mb-3">
                    {t("profile.myReservations.details.timestamps", "Timestamps")}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-greytheme dark:text-textdarktheme">
                        {t("profile.myReservations.details.createdAt", "Created At")}
                      </label>
                      <p className="text-blacktheme dark:text-textdarktheme">
                        {new Date(selectedReservation.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-greytheme dark:text-textdarktheme">
                        {t("profile.myReservations.details.lastEdited", "Last Edited")}
                      </label>
                      <p className="text-blacktheme dark:text-textdarktheme">
                        {new Date(selectedReservation.edit_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-softgreytheme dark:border-darkthemeitems">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-greytheme text-whitetheme rounded-lg hover:bg-opacity-80 transition-colors"
                >
                  {t("common.close", "Close")}
                </button>
                {selectedReservation.status !== "fulfilled" &&
                  selectedReservation.status !== "cancelled" && 
                  selectedReservation.status !== "no show" &&
                  selectedReservation.status !== "noshow" &&
                  selectedReservation.status !== "no_show" && (
                    <button 
                      onClick={() => {
                        handleCancelReservation(selectedReservation.id)
                        handleCloseModal()
                      }}
                      disabled={cancelReservationMutation.isPending}
                      className="px-4 py-2 bg-redtheme text-whitetheme rounded-lg hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {cancelReservationMutation.isPending ? 
                        t("profile.myReservations.actions.cancelling", "Cancelling...") : 
                        t("profile.myReservations.actions.cancel")
                      }
                    </button>
                  )}
                {selectedReservation.status === "fulfilled" && (
                  <button className="px-4 py-2 bg-purpletheme text-whitetheme rounded-lg hover:bg-opacity-80 transition-colors">
                    {t("profile.myReservations.actions.review")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
