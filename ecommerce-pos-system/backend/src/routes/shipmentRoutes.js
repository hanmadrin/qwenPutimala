const express = require('express');
const router = express.Router();
const {
  createShipment,
  getShipments,
  getShipmentById,
  updateShipmentStatus,
  trackShipment,
  deleteShipment,
  getShipmentStats
} = require('../controllers/shipmentController');
const authMiddleware = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Shipment routes
router.post('/', createShipment);
router.get('/', getShipments);
router.get('/stats', getShipmentStats);
router.get('/track/:trackingNumber', trackShipment);
router.get('/:id', getShipmentById);
router.put('/:id/status', updateShipmentStatus);
router.delete('/:id', deleteShipment);

module.exports = router;
