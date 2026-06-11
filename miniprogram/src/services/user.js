import { get, post, put, del } from '../utils/request'

export const addFavoriteRoute = (data) => post('/user/favorite-routes', data)
export const getFavoriteRoutes = () => get('/user/favorite-routes')
export const updateFavoriteRoute = (id, data) => put(`/user/favorite-routes/${id}`, data)
export const deleteFavoriteRoute = (id) => del(`/user/favorite-routes/${id}`)

export const createComplaint = (data) => post('/user/complaints', data)
export const getMyComplaints = (params) => get('/user/complaints/my', params)
export const getComplaintDetail = (id) => get(`/user/complaints/${id}`)

export const getNotifications = (params) => get('/user/notifications', params)
export const markNotificationRead = (id) => put(`/user/notifications/${id}/read`)
export const markAllNotificationsRead = () => put('/user/notifications/read-all')
export const getUnreadCount = () => get('/user/notifications/unread-count')

export const updateLocation = (data) => post('/user/locations', data)
export const getTripLocations = (tripId, params) => get(`/user/locations/trip/${tripId}`, params)

export const getReputationHistory = (params) => get('/user/reputation/history', params)
export const getMyReviews = (params) => get('/user/reviews/my', params)

export default {
  addFavoriteRoute,
  getFavoriteRoutes,
  updateFavoriteRoute,
  deleteFavoriteRoute,
  createComplaint,
  getMyComplaints,
  getComplaintDetail,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount,
  updateLocation,
  getTripLocations,
  getReputationHistory,
  getMyReviews
}
