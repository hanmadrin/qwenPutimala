const express = require('express');
const router = express.Router();
const {
  initiateSSLCommerzPayment,
  sslcommerzSuccess,
  sslcommerzFail,
  sslcommerzCancel,
  sslcommerzIPN,
  recordCashPayment,
  getOrderPayments,
  getPayments,
  getPaymentStats
} = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication except SSLCommerz callbacks
router.post('/sslcommerz/initiate', authMiddleware, initiateSSLCommerzPayment);
router.get('/sslcommerz/success', sslcommerzSuccess);
router.get('/sslcommerz/fail', sslcommerzFail);
router.get('/sslcommerz/cancel', sslcommerzCancel);
router.post('/sslcommerz/ipn', sslcommerzIPN);

// Protected routes
router.post('/cash', authMiddleware, recordCashPayment);
router.get('/order/:orderId', authMiddleware, getOrderPayments);
router.get('/', authMiddleware, getPayments);
router.get('/stats', authMiddleware, getPaymentStats);

module.exports = router;
