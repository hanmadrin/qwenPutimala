const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Sales Reports
router.get('/sales', reportController.getSalesReport);
router.get('/top-products', reportController.getTopProducts);
router.get('/customers', reportController.getCustomerReport);
router.get('/inventory', reportController.getInventoryReport);

// Analytics Dashboard
router.get('/dashboard', reportController.getDashboardAnalytics);
router.get('/order-status-breakdown', reportController.getOrderStatusBreakdown);
router.get('/daily-sales-trend', reportController.getDailySalesTrend);

// Export
router.get('/export', reportController.exportReport);

// Default route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Report API endpoints',
    endpoints: {
      'GET /api/reports/sales': 'Get sales report with date range and interval',
      'GET /api/reports/top-products': 'Get top selling products',
      'GET /api/reports/customers': 'Get customer spending report',
      'GET /api/reports/inventory': 'Get inventory status report',
      'GET /api/reports/dashboard': 'Get dashboard analytics',
      'GET /api/reports/order-status-breakdown': 'Get order status breakdown',
      'GET /api/reports/daily-sales-trend': 'Get daily sales trend',
      'GET /api/reports/export': 'Export report data (type, startDate, endDate)'
    }
  });
});

module.exports = router;
