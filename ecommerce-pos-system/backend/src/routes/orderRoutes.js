const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
  getOrderStats
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Order routes
router.post('/', createOrder);
router.get('/', getOrders);
router.get('/stats', getOrderStats);
router.get('/:id', getOrderById);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/payment', updatePaymentStatus);
router.delete('/:id', deleteOrder);

module.exports = router;
