const express = require('express');
const router = express.Router();
const {
  getBranchStock,
  getVariantStock,
  upsertStock,
  createAdjustment,
  getAdjustments,
  getLowStockAlerts,
  getStockStats
} = require('../controllers/stockController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Stock routes
router.get('/alerts', getLowStockAlerts);
router.get('/stats', getStockStats);
router.get('/adjustments', getAdjustments);
router.get('/branch/:branchId', getBranchStock);
router.get('/variant/:variantId', getVariantStock);
router.post('/', upsertStock);
router.post('/adjustment', createAdjustment);

module.exports = router;
