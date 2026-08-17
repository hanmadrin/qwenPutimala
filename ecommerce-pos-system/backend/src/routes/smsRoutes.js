const express = require('express');
const router = express.Router();
const {
  sendSMS,
  sendOrderConfirmationSMS,
  sendOTPSMS,
  sendDeliveryNotificationSMS,
  sendPromotionalSMS,
  getSMSLogs,
  getSMSStats
} = require('../controllers/smsController');
const authMiddleware = require('../middlewares/authMiddleware');

// All routes require authentication except specific ones
router.post('/send', authMiddleware, sendSMS);
router.post('/order-confirmation', authMiddleware, sendOrderConfirmationSMS);
router.post('/otp', sendOTPSMS);
router.post('/delivery-notification', authMiddleware, sendDeliveryNotificationSMS);
router.post('/promotional', authMiddleware, sendPromotionalSMS);
router.get('/logs', authMiddleware, getSMSLogs);
router.get('/stats', authMiddleware, getSMSStats);

module.exports = router;
