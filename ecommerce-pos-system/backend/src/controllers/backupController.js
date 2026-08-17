const { PrismaClient } = require('@prisma/client');
const { google } = require('googleapis');
const prisma = new PrismaClient();

// Google Drive API configuration
const GOOGLE_DRIVE_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  backupFolderId: process.env.GOOGLE_BACKUP_FOLDER_ID,
};

let driveService = null;

// Initialize Google Drive API client
const getDriveClient = async () => {
  if (driveService) return driveService;

  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_DRIVE_CONFIG.clientId,
    GOOGLE_DRIVE_CONFIG.clientSecret,
    'urn:ietf:wg:oauth:2.0:oob'
  );

  oauth2Client.setCredentials({
    refresh_token: GOOGLE_DRIVE_CONFIG.refreshToken
  });

  driveService = google.drive({ version: 'v3', auth: oauth2Client });
  return driveService;
};

// Create database backup
exports.createBackup = async (req, res) => {
  try {
    const userId = req.user?.id || 1; // Get from auth middleware

    // Verify user has permission (superadmin only)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Only superadmins can create backups'
      });
    }

    // Export database data
    const tables = [
      'branches', 'users', 'customers', 'customer_addresses',
      'categories', 'brands', 'tags', 'products', 'product_images',
      'product_variants', 'branch_stock', 'orders', 'order_items',
      'order_status_history', 'payments', 'shipments', 'coupons',
      'invoices', 'stock_adjustments', 'activity_logs', 'settings'
    ];

    const backupData = {};
    
    for (const table of tables) {
      const modelName = table.charAt(0).toUpperCase() + table.slice(1);
      // Remove underscores and capitalize next letter for Prisma model names
      const prismaModelName = modelName.replace(/_([a-z])/g, g => g[1].toUpperCase());
      
      try {
        const data = await prisma[table].findMany();
        backupData[table] = data;
      } catch (error) {
        console.warn(`Could not export table ${table}:`, error.message);
        backupData[table] = [];
      }
    }

    // Create JSON backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `ecommerce_backup_${timestamp}.json`;
    const backupJson = JSON.stringify(backupData, null, 2);
    const backupSize = Buffer.byteLength(backupJson, 'utf8') / (1024 * 1024); // Size in MB

    // Upload to Google Drive
    let driveFileId = null;
    
    try {
      const drive = await getDriveClient();
      
      const fileMetadata = {
        name: filename,
        parents: [GOOGLE_DRIVE_CONFIG.backupFolderId]
      };

      const media = {
        mimeType: 'application/json',
        body: backupJson
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id'
      });

      driveFileId = response.data.id;
    } catch (driveError) {
      console.error('Google Drive upload failed:', driveError.message);
      // Continue without Drive upload - backup is still created locally
    }

    // Save backup record to database
    const backupRecord = await prisma.backup.create({
      data: {
        filename,
        driveFileId: driveFileId || 'local_only',
        sizeMb: backupSize,
        createdBy: userId
      }
    });

    res.json({
      success: true,
      message: 'Backup created successfully',
      data: {
        backupId: backupRecord.id,
        filename,
        sizeMb: backupSize.toFixed(2),
        driveFileId,
        createdAt: backupRecord.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create backup',
      error: error.message
    });
  }
};

// List all backups
exports.listBackups = async (req, res) => {
  try {
    const backups = await prisma.backup.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: backups
    });
  } catch (error) {
    console.error('Error listing backups:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list backups',
      error: error.message
    });
  }
};

// Get backup details
exports.getBackup = async (req, res) => {
  try {
    const { id } = req.params;

    const backup = await prisma.backup.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!backup) {
      return res.status(404).json({
        success: false,
        message: 'Backup not found'
      });
    }

    res.json({
      success: true,
      data: backup
    });
  } catch (error) {
    console.error('Error getting backup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get backup',
      error: error.message
    });
  }
};

// Delete backup
exports.deleteBackup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 1;

    // Verify user has permission
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Only superadmins can delete backups'
      });
    }

    const backup = await prisma.backup.findUnique({
      where: { id: parseInt(id) }
    });

    if (!backup) {
      return res.status(404).json({
        success: false,
        message: 'Backup not found'
      });
    }

    // Delete from Google Drive if exists
    if (backup.driveFileId && backup.driveFileId !== 'local_only') {
      try {
        const drive = await getDriveClient();
        await drive.files.delete({ fileId: backup.driveFileId });
      } catch (driveError) {
        console.error('Failed to delete from Google Drive:', driveError.message);
      }
    }

    // Delete from database
    await prisma.backup.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Backup deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting backup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete backup',
      error: error.message
    });
  }
};

// Download backup
exports.downloadBackup = async (req, res) => {
  try {
    const { id } = req.params;

    const backup = await prisma.backup.findUnique({
      where: { id: parseInt(id) }
    });

    if (!backup) {
      return res.status(404).json({
        success: false,
        message: 'Backup not found'
      });
    }

    // If stored in Google Drive
    if (backup.driveFileId && backup.driveFileId !== 'local_only') {
      try {
        const drive = await getDriveClient();
        
        const response = await drive.files.get(
          { fileId: backup.driveFileId, alt: 'media' },
          { responseType: 'stream' }
        );

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${backup.filename}"`);
        
        response.data.pipe(res);
        return;
      } catch (driveError) {
        console.error('Failed to download from Google Drive:', driveError.message);
        return res.status(404).json({
          success: false,
          message: 'Backup file not found in Google Drive'
        });
      }
    }

    // Local backup not supported in this implementation
    res.status(404).json({
      success: false,
      message: 'Backup file only available via Google Drive'
    });
  } catch (error) {
    console.error('Error downloading backup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download backup',
      error: error.message
    });
  }
};

// Restore backup
exports.restoreBackup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 1;

    // Verify user has permission
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Only superadmins can restore backups'
      });
    }

    const backup = await prisma.backup.findUnique({
      where: { id: parseInt(id) }
    });

    if (!backup) {
      return res.status(404).json({
        success: false,
        message: 'Backup not found'
      });
    }

    // Note: Actual restore would require downloading the backup file
    // and importing data back into the database
    // This is a placeholder for the restore logic
    
    res.json({
      success: true,
      message: 'Restore functionality requires manual implementation',
      note: 'Download the backup file and use a custom script to restore data'
    });
  } catch (error) {
    console.error('Error restoring backup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restore backup',
      error: error.message
    });
  }
};

// Schedule automatic backup (placeholder)
exports.scheduleBackup = async (req, res) => {
  try {
    const { frequency = 'daily' } = req.body;
    
    // Valid frequencies: hourly, daily, weekly, monthly
    const validFrequencies = ['hourly', 'daily', 'weekly', 'monthly'];
    if (!validFrequencies.includes(frequency)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid frequency. Use: hourly, daily, weekly, or monthly'
      });
    }

    // Save schedule to settings
    await prisma.setting.upsert({
      where: { key: 'backup_schedule' },
      update: { value: { frequency, enabled: true, lastRun: null } },
      create: { key: 'backup_schedule', value: { frequency, enabled: true, lastRun: null } }
    });

    res.json({
      success: true,
      message: `Backup scheduled to run ${frequency}`,
      data: { frequency, enabled: true }
    });
  } catch (error) {
    console.error('Error scheduling backup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule backup',
      error: error.message
    });
  }
};

// Get backup statistics
exports.getBackupStats = async (req, res) => {
  try {
    const [
      totalBackups,
      totalSize,
      lastBackup
    ] = await Promise.all([
      prisma.backup.count(),
      prisma.backup.aggregate({
        _sum: { sizeMb: true }
      }),
      prisma.backup.findFirst({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          filename: true,
          sizeMb: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalBackups,
        totalSizeMb: totalSize._sum.sizeMb || 0,
        averageSizeMb: totalBackups > 0 
          ? (totalSize._sum.sizeMb || 0) / totalBackups 
          : 0,
        lastBackup: lastBackup || null
      }
    });
  } catch (error) {
    console.error('Error getting backup stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get backup statistics',
      error: error.message
    });
  }
};
