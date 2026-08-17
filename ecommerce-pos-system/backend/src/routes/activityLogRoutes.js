const express = require('express');
const router = express.Router();
const activityLogController = require('../controllers/activityLogController');

// Activity log routes
router.get('/', activityLogController.getActivityLogs);
router.get('/entity/:entityType/:entityId?', activityLogController.getEntityActivityLogs);
router.get('/user-summary', activityLogController.getUserActivitySummary);
router.get('/stats', activityLogController.getActivityStats);
router.post('/clear-old', activityLogController.clearOldLogs);
router.get('/export', activityLogController.exportActivityLogs);

// Default route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Activity Log API endpoints',
    endpoints: {
      'GET /api/activity-logs': 'Get all activity logs with filters',
      'GET /api/activity-logs/entity/:entityType/:entityId?': 'Get logs for specific entity',
      'GET /api/activity-logs/user-summary': 'Get user activity summary',
      'GET /api/activity-logs/stats': 'Get activity statistics',
      'POST /api/activity-logs/clear-old': 'Clear old activity logs (superadmin only)',
      'GET /api/activity-logs/export': 'Export activity logs to CSV'
    }
  });
});

module.exports = router;
