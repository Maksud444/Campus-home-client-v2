export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-housing-backend.vercel.app'

export const API_ENDPOINTS = {
  properties: `${API_URL}/api/properties`,
  auth: `${API_URL}/api/auth`,
  users: `${API_URL}/api/users`,
  upload: `${API_URL}/api/upload`,
  services: `${API_URL}/api/services`,
  bookings: `${API_URL}/api/bookings`,
  dashboard: `${API_URL}/api/dashboard`,
}