import { get, post, put } from '../utils/request'

export var publishTrip = function (data) { return post('/trips', data) }
export var getTripList = function (params) { return get('/trips', params) }
export var searchTrips = function (params) { return get('/trips/search', params) }
export var getMyTrips = function (params) { return get('/trips/my', params) }
export var getTripDetail = function (id) { return get('/trips/' + id) }
export var updateTrip = function (id, data) { return put('/trips/' + id, data) }
export var cancelTrip = function (id, data) { return put('/trips/' + id + '/cancel', data) }
export var startTrip = function (id) { return put('/trips/' + id + '/start') }
export var completeTrip = function (id, data) { return put('/trips/' + id + '/complete', data) }

export var requestJoinTrip = function (tripId, data) { return post('/trips/' + tripId + '/join', data) }
export var handlePassengerRequest = function (tripPassengerId, data) { return put('/trips/passengers/' + tripPassengerId + '/handle', data) }
export var passengerConfirmTrip = function (tripPassengerId) { return put('/trips/passengers/' + tripPassengerId + '/confirm') }
export var boardPassenger = function (tripPassengerId) { return put('/trips/passengers/' + tripPassengerId + '/board') }

export default {
  publishTrip: publishTrip,
  getTripList: getTripList,
  searchTrips: searchTrips,
  getMyTrips: getMyTrips,
  getTripDetail: getTripDetail,
  updateTrip: updateTrip,
  cancelTrip: cancelTrip,
  startTrip: startTrip,
  completeTrip: completeTrip,
  requestJoinTrip: requestJoinTrip,
  handlePassengerRequest: handlePassengerRequest,
  passengerConfirmTrip: passengerConfirmTrip,
  boardPassenger: boardPassenger
}
