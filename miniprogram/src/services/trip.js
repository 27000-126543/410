import { get, post, put } from '../utils/request'

export const publishTrip = (data) => post('/trips', data)
export const getTripList = (params) => get('/trips', params)
export const searchTrips = (params) => get('/trips/search', params)
export const getMyTrips = (params) => get('/trips/my', params)
export const getTripDetail = (id) => get(`/trips/${id}`)
export const updateTrip = (id, data) => put(`/trips/${id}`, data)
export const cancelTrip = (id, data) => put(`/trips/${id}/cancel`, data)
export const startTrip = (id) => put(`/trips/${id}/start`)
export const completeTrip = (id, data) => put(`/trips/${id}/complete`, data)

export const requestJoinTrip = (tripId, data) => post(`/trips/${tripId}/join`, data)
export const handlePassengerRequest = (tripPassengerId, data) => put(`/trips/passengers/${tripPassengerId}/handle`, data)
export const passengerConfirmTrip = (tripPassengerId) => put(`/trips/passengers/${tripPassengerId}/confirm`)
export const boardPassenger = (tripPassengerId) => put(`/trips/passengers/${tripPassengerId}/board`)

export default {
  publishTrip,
  getTripList,
  searchTrips,
  getMyTrips,
  getTripDetail,
  updateTrip,
  cancelTrip,
  startTrip,
  completeTrip,
  requestJoinTrip,
  handlePassengerRequest,
  passengerConfirmTrip,
  boardPassenger
}
