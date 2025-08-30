/**
 * Time Slots API Response Format
 * 
 * Endpoint: /api/v1/mp/restaurants/1/time_slots/?date=2025-08-25&number_of_guests=4
 * 
 * The API returns available time slots grouped by meal periods.
 * This file documents the actual response format.
 */

// ACTUAL API Response Format:
const timesSlotsResponse = {
  "Lunch": [
    "12:00",
    "12:15", 
    "12:30",
    "12:45",
    "13:00",
    "13:15",
    "13:30",
    "13:45",
    "14:00",
    "14:15",
    "14:30",
    "14:45",
    "15:00"
  ],
  "dinner": [] // Empty array means no dinner slots available
}

// The app processes this into:
const processedResponse = {
  "date": "2025-08-25",
  "available_slots": [
    { "time": "12:00", "available": true },
    { "time": "12:15", "available": true },
    { "time": "12:30", "available": true },
    { "time": "12:45", "available": true },
    { "time": "13:00", "available": true },
    { "time": "13:15", "available": true },
    { "time": "13:30", "available": true },
    { "time": "13:45", "available": true },
    { "time": "14:00", "available": true },
    { "time": "14:15", "available": true },
    { "time": "14:30", "available": true },
    { "time": "14:45", "available": true },
    { "time": "15:00", "available": true }
  ]
}

/*
 * Key Changes Made:
 * 
 * 1. Updated TimeSlotsResponse interface to match meal period format
 * 2. Added ProcessedTimeSlotsResponse for component consumption
 * 3. Updated getTimeSlots function to convert meal periods to flat array
 * 4. All returned time slots are marked as available=true
 * 
 * The app now correctly shows lunch slots instead of "restaurant is closed"
 */
