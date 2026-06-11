import { get, post, put } from '../utils/request'

export const createReview = (data) => post('/reviews', data)
export const getReviews = (params) => get('/reviews', params)
export const getReviewStats = (userId) => get(`/reviews/stats/${userId}`)
export const replyReview = (reviewId, data) => put(`/reviews/${reviewId}/reply`, data)

export default {
  createReview,
  getReviews,
  getReviewStats,
  replyReview
}
