import { get, post, put } from '../utils/request'

export const createOrder = (data) => post('/orders', data)
export const payOrder = (data) => post('/orders/pay', data)
export const getOrderList = (params) => get('/orders', params)
export const getOrderDetail = (id) => get(`/orders/${id}`)
export const cancelOrder = (id, data) => put(`/orders/${id}/cancel`, data)

export const requestInvoice = (data) => post('/orders/invoice', data)
export const getMyInvoices = () => get('/orders/invoices/my')
export const getAgreement = (orderId) => get(`/orders/agreement/${orderId}`)

export default {
  createOrder,
  payOrder,
  getOrderList,
  getOrderDetail,
  cancelOrder,
  requestInvoice,
  getMyInvoices,
  getAgreement
}
