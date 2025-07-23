"use client"
import type React from "react"
import { useTranslation } from "react-i18next"
import { useReservations, useCancelReservation } from "@/hooks/api/useReservations"
import { useAuth } from "../auth/AuthProvider"

export const MyReservations: React.FC = () => {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()

  // Fetch reservations using React Query
  const { data: reservationsData, isLoading, error } = useReservations()
  const cancelReservationMutation = useCancelReservation()

  // Debug logging
  console.log('MyReservations Debug:', {
    isAuthenticated,
    reservationsData,
    isLoading,
    error: error?.message || error,
    hasResults: reservationsData?.results?.length,
    rawData: JSON.stringify(reservationsData, null, 2)
  })

  // More detailed debug for data structure
  if (reservationsData) {
    console.log('Raw reservations data:', reservationsData)
    console.log('Results array:', reservationsData.results)
    console.log('Results length:', reservationsData.results?.length)
    if (reservationsData.results && reservationsData.results.length > 0) {
      console.log('First reservation:', reservationsData.results[0])
    }
  }

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

  const reservations = reservationsData?.results || []

  // Debug the reservations array
  console.log('Final reservations array:', reservations)
  console.log('Array length:', reservations.length)
  console.log('isLoading:', isLoading)
  console.log('reservationsData:', reservationsData)

  // Only show empty state if we're not loading AND we have confirmed empty results
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
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-softgreentheme text-greentheme dark:bg-greentheme dark:text-whitetheme"
      case "pending":
        return "bg-softbluetheme text-bluetheme dark:bg-bluetheme dark:text-whitetheme"
      case "fulfilled":
        return "bg-softpurpletheme text-purpletheme dark:bg-purpletheme dark:text-whitetheme"
      case "cancelled":
        return "bg-softredtheme text-redtheme dark:bg-redtheme dark:text-whitetheme"
      default:
        return "bg-softgreytheme text-greytheme dark:bg-greytheme dark:text-whitetheme"
    }
  }


  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme">
        {t("profile.myReservations.title", "My Reservations")}
      </h2>

      {/* DEBUG: Show raw data */}
      {reservationsData && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-xs">
          <h3 className="font-bold mb-2">DEBUG: Raw API Response</h3>
          <p><strong>Count:</strong> {reservationsData.count}</p>
          <p><strong>Results Length:</strong> {reservationsData.results?.length || 0}</p>
          <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
          <pre className="whitespace-pre-wrap mt-2">{JSON.stringify(reservationsData, null, 2)}</pre>
        </div>
      )}

      <div className="overflow-x-auto">
        {/* DEBUG: Table rendering debug */}
        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded mb-4 text-xs">
          <p><strong>Rendering table with {reservations.length} reservations</strong></p>
        </div>
        
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
                <td className="px-4 py-4 text-sm text-blacktheme dark:text-textdarktheme">{reservation.restaurant_name}</td>
                <td className="px-4 py-4 text-sm text-blacktheme dark:text-textdarktheme">
                  {formatDate(reservation.reservation_date)}
                </td>
                <td className="px-4 py-4 text-sm text-blacktheme dark:text-textdarktheme">{reservation.reservation_time}</td>
                <td className="px-4 py-4 text-sm text-blacktheme dark:text-textdarktheme">{reservation.party_size}</td>
                <td className="px-4 py-4 text-sm text-blacktheme dark:text-textdarktheme">
                  {reservation.special_request || "-"}
                </td>
                <td className="px-4 py-4 text-sm">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}
                  >
                    {reservation.status === "fulfilled"
                      ? t("profile.myReservations.status.fulfilled")
                      : reservation.status === "cancelled"
                      ? t("profile.myReservations.status.cancelled")
                      : reservation.status === "confirmed"
                      ? t("profile.myReservations.status.confirmed")
                      : t("profile.myReservations.status.pending")}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm">
                  <button className="text-greentheme hover:text-opacity-80 dark:text-whitetheme dark:hover:text-opacity-80 mr-3">
                    {t("profile.myReservations.actions.view")}
                  </button>
                  {reservation.status !== "fulfilled" &&
                    reservation.status !== "cancelled" && (
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
    </div>
  )
}
