const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, orderController.createOrder);
router.post('/pay', authMiddleware, orderController.payOrder);
router.get('/', authMiddleware, orderController.getOrderList);
router.get('/:id', authMiddleware, orderController.getOrderDetail);
router.put('/:id/cancel', authMiddleware, orderController.cancelOrder);

router.post('/invoice', authMiddleware, orderController.requestInvoice);
router.get('/invoices/my', authMiddleware, orderController.getMyInvoices);
router.get('/agreement/:orderId', authMiddleware, orderController.getAgreement);

module.exports = router;
