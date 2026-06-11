import { get, post, put } from '../utils/request'

export var createOrder = function (data) { return post('/orders', data) }
export var payOrder = function (data) { return post('/orders/pay', data) }
export var getOrderList = function (params) { return get('/orders', params) }
export var getOrderDetail = function (id) { return get('/orders/' + id) }
export var cancelOrder = function (id, data) { return put('/orders/' + id + '/cancel', data) }

export var requestInvoice = function (data) { return post('/orders/invoice', data) }
export var getMyInvoices = function () { return get('/orders/invoices/my') }
export var getAgreement = function (orderId) { return get('/orders/agreement/' + orderId) }

export default {
  createOrder: createOrder,
  payOrder: payOrder,
  getOrderList: getOrderList,
  getOrderDetail: getOrderDetail,
  cancelOrder: cancelOrder,
  requestInvoice: requestInvoice,
  getMyInvoices: getMyInvoices,
  getAgreement: getAgreement
}
