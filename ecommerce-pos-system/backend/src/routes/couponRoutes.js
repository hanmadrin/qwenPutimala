const express = require('express');
const router = express.Router();
const {
  createCoupon,
  getCoupons,
  getCouponById,
  getCouponByCode,
  updateCoupon,
  deleteCoupon,
  getCouponStats
} = require('../controllers/couponController');
const authMiddleware = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Coupon routes
router.post('/', createCoupon);
router.get('/', getCoupons);
router.get('/stats', getCouponStats);
router.get('/validate/:code', getCouponByCode);
router.get('/:id', getCouponById);
router.put('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);

module.exports = router;
