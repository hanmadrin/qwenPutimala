const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ===========================
// ACTIVITY LOGGING
// ===========================

// Log an activity
exports.logActivity = async (userId, action, entityType, entityId, details = {}) => {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        details
      }
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

// Get activity logs
exports.getActivityLogs = async (req, res) => {
  try {
    const { 
      userId, 
      entityType, 
      action, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 20 
    } = req.query;

    const where = {};

    if (userId) {
      where.userId = parseInt(userId);
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (action) {
      where.action = action;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      }),
      prisma.activityLog.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity logs',
      error: error.message
    });
  }
};

// Get activity logs for specific entity
exports.getEntityActivityLogs = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const where = {
      entityType,
      entityId: entityId ? parseInt(entityId) : undefined
    };

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      }),
      prisma.activityLog.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching entity activity logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch entity activity logs',
      error: error.message
    });
  }
};

// Get user activity summary
exports.getUserActivitySummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const userActivities = await prisma.activityLog.groupBy({
      by: ['userId'],
      where,
      _count: true,
      _distinct: ['action', 'entityType']
    });

    const usersWithDetails = await Promise.all(
      userActivities
        .filter(activity => activity.userId !== null)
        .map(async (activity) => {
          const user = await prisma.user.findUnique({
            where: { id: activity.userId },
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          });

          const actions = await prisma.activityLog.groupBy({
            by: ['action'],
            where: { userId: activity.userId, ...where },
            _count: true
          });

          const entityTypes = await prisma.activityLog.groupBy({
            by: ['entityType'],
            where: { userId: activity.userId, ...where },
            _count: true
          });

          return {
            ...user,
            totalActions: activity._count,
            actionsBreakdown: actions.map(a => ({
              action: a.action,
              count: a._count
            })),
            entityTypesBreakdown: entityTypes.map(e => ({
              entityType: e.entityType,
              count: e._count
            }))
          };
        })
    );

    const sortedUsers = usersWithDetails
      .sort((a, b) => b.totalActions - a.totalActions);

    res.json({
      success: true,
      data: sortedUsers
    });
  } catch (error) {
    console.error('Error fetching user activity summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activity summary',
      error: error.message
    });
  }
};

// Get activity statistics
exports.getActivityStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [
      totalActivities,
      activitiesByAction,
      activitiesByEntityType,
      activeUsersCount,
      todayActivities
    ] = await Promise.all([
      prisma.activityLog.count({ where }),
      prisma.activityLog.groupBy({
        by: ['action'],
        where,
        _count: true
      }),
      prisma.activityLog.groupBy({
        by: ['entityType'],
        where,
        _count: true
      }),
      prisma.activityLog.findMany({
        where,
        distinct: ['userId'],
        select: { userId: true }
      }),
      prisma.activityLog.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ]);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const hourlyActivities = await prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(created_at, '%H:00') as hour,
        COUNT(*) as count
      FROM activity_logs
      WHERE created_at >= ${todayStart}
      GROUP BY DATE_FORMAT(created_at, '%H:00')
      ORDER BY hour ASC
    `;

    res.json({
      success: true,
      data: {
        totalActivities,
        activeUsers: activeUsersCount.length,
        todayActivities,
        activitiesByAction: activitiesByAction.map(item => ({
          action: item.action,
          count: item._count
        })),
        activitiesByEntityType: activitiesByEntityType.map(item => ({
          entityType: item.entityType,
          count: item._count
        })),
        hourlyToday: hourlyActivities
      }
    });
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity statistics',
      error: error.message
    });
  }
};

// Clear old activity logs
exports.clearOldLogs = async (req, res) => {
  try {
    const { days = 90 } = req.body;
    const userId = req.user?.id || 1;

    // Verify user has permission (superadmin only)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Only superadmins can clear activity logs'
      });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const result = await prisma.activityLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });

    // Log this cleanup action
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'CLEAR_LOGS',
        entityType: 'system',
        entityId: null,
        details: { deletedCount: result.count, daysOlderThan: days }
      }
    });

    res.json({
      success: true,
      message: `Deleted ${result.count} activity logs older than ${days} days`,
      data: {
        deletedCount: result.count,
        cutoffDate
      }
    });
  } catch (error) {
    console.error('Error clearing old logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear old activity logs',
      error: error.message
    });
  }
};

// Export activity logs
exports.exportActivityLogs = async (req, res) => {
  try {
    const { startDate, endDate, entityType, userId } = req.query;

    const where = {};

    if (userId) {
      where.userId = parseInt(userId);
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const logs = await prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const csvRows = [
      ['Timestamp', 'User', 'Email', 'Role', 'Action', 'Entity Type', 'Entity ID', 'Details']
    ];

    logs.forEach(log => {
      csvRows.push([
        log.createdAt.toISOString(),
        log.user?.name || 'System',
        log.user?.email || 'N/A',
        log.user?.role || 'N/A',
        log.action,
        log.entityType,
        log.entityId || '',
        JSON.stringify(log.details)
      ]);
    });

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const filename = `activity_logs_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting activity logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export activity logs',
      error: error.message
    });
  }
};
