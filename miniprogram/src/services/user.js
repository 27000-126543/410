import { get, post, put, del } from '../utils/request'

export var addFavoriteRoute = function (data) { return post('/user/favorite-routes', data) }
export var getFavoriteRoutes = function () { return get('/user/favorite-routes') }
export var updateFavoriteRoute = function (id, data) { return put('/user/favorite-routes/' + id, data) }
export var deleteFavoriteRoute = function (id) { return del('/user/favorite-routes/' + id) }

export var createComplaint = function (data) { return post('/user/complaints', data) }
export var getMyComplaints = function (params) { return get('/user/complaints/my', params) }
export var getComplaintDetail = function (id) { return get('/user/complaints/' + id) }

export var getNotifications = function (params) { return get('/user/notifications', params) }
export var markNotificationRead = function (id) { return put('/user/notifications/' + id + '/read') }
export var markAllNotificationsRead = function () { return put('/user/notifications/read-all') }
export var getUnreadCount = function () { return get('/user/notifications/unread-count') }

export var updateLocation = function (data) { return post('/user/locations', data) }
export var getTripLocations = function (tripId, params) { return get('/user/locations/trip/' + tripId, params) }

export var getReputationHistory = function (params) { return get('/user/reputation/history', params) }
export var getMyReviews = function (params) { return get('/user/reviews/my', params) }

export default {
  addFavoriteRoute: addFavoriteRoute,
  getFavoriteRoutes: getFavoriteRoutes,
  updateFavoriteRoute: updateFavoriteRoute,
  deleteFavoriteRoute: deleteFavoriteRoute,
  createComplaint: createComplaint,
  getMyComplaints: getMyComplaints,
  getComplaintDetail: getComplaintDetail,
  getNotifications: getNotifications,
  markNotificationRead: markNotificationRead,
  markAllNotificationsRead: markAllNotificationsRead,
  getUnreadCount: getUnreadCount,
  updateLocation: updateLocation,
  getTripLocations: getTripLocations,
  getReputationHistory: getReputationHistory,
  getMyReviews: getMyReviews
}
