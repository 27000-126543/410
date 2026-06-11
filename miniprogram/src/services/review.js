import { get, post, put } from '../utils/request'

export var createReview = function (data) { return post('/reviews', data) }
export var getReviews = function (params) { return get('/reviews', params) }
export var getReviewStats = function (userId) { return get('/reviews/stats/' + userId) }
export var replyReview = function (reviewId, data) { return put('/reviews/' + reviewId + '/reply', data) }

export default {
  createReview: createReview,
  getReviews: getReviews,
  getReviewStats: getReviewStats,
  replyReview: replyReview
}
