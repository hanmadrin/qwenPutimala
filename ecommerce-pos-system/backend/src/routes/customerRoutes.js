const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public routes
router.post('/register', customerController.registerCustomer);
router.post('/login-with-otp', customerController.loginCustomer);
router.post('/request-otp', customerController.requestOTP);
router.post('/verify-otp', customerController.verifyOTP);
router.post('/login', customerController.loginCustomer);

// Protected routes - require customer authentication
router.get('/profile', authMiddleware, customerController.getProfile);
router.put('/profile', authMiddleware, customerController.updateProfile);
router.get('/orders', authMiddleware, customerController.getOrders);

module.exports = router;
