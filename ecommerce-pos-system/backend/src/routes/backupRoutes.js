const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');

// Backup management routes
router.post('/create', backupController.createBackup);
router.get('/', backupController.listBackups);
router.get('/:id', backupController.getBackup);
router.delete('/:id', backupController.deleteBackup);
router.get('/:id/download', backupController.downloadBackup);
router.post('/:id/restore', backupController.restoreBackup);
router.post('/schedule', backupController.scheduleBackup);
router.get('/stats', backupController.getBackupStats);

// Default route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Backup API endpoints',
    endpoints: {
      'POST /api/backups/create': 'Create new database backup',
      'GET /api/backups': 'List all backups',
      'GET /api/backups/:id': 'Get backup details',
      'DELETE /api/backups/:id': 'Delete backup',
      'GET /api/backups/:id/download': 'Download backup file',
      'POST /api/backups/:id/restore': 'Restore from backup',
      'POST /api/backups/schedule': 'Schedule automatic backups',
      'GET /api/backups/stats': 'Get backup statistics'
    }
  });
});

module.exports = router;
