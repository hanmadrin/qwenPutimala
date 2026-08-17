const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ===========================
// SALES REPORTS
// ===========================

// Get sales report (daily, weekly, monthly, yearly)
exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, branchId, interval = 'daily' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required'
      });
    }

    const where = {
      status: 'complete',
      paymentStatus: 'paid',
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    };

    if (branchId) {
      where.branchId = parseInt(branchId);
    }

    // Group by interval
    let groupByField;
    switch (interval) {
      case 'hourly':
        groupByField = prisma.raw`DATE_FORMAT(created_at, '%Y-%m-%d %H:00')`;
        break;
      case 'daily':
        groupByField = prisma.raw`DATE_FORMAT(created_at, '%Y-%m-%d')`;
        break;
      case 'weekly':
        groupByField = prisma.raw`YEARWEEK(created_at)`;
        break;
      case 'monthly':
        groupByField = prisma.raw`DATE_FORMAT(created_at, '%Y-%m')`;
        break;
      case 'yearly':
        groupByField = prisma.raw`YEAR(created_at)`;
        break;
      default:
        groupByField = prisma.raw`DATE_FORMAT(created_at, '%Y-%m-%d')`;
    }

    const salesData = await prisma.$queryRaw`
      SELECT 
        ${groupByField} as period,
        COUNT(*) as orderCount,
        SUM(total) as totalSales,
        AVG(total) as averageOrderValue
      FROM orders
      WHERE status = 'complete' 
        AND paymentStatus = 'paid'
        AND created_at >= ${new Date(startDate)}
        AND created_at <= ${new Date(endDate)}
        ${branchId ? prisma.sql`AND branch_id = ${branchId}` : prisma.sql``}
      GROUP BY ${groupByField}
      ORDER BY period ASC
    `;

    res.json({
      success: true,
      data: salesData
    });
  } catch (error) {
    console.error('Error fetching sales report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales report',
      error: error.message
    });
  }
};

// Get top selling products
exports.getTopProducts = async (req, res) => {
  try {
    const { startDate, endDate, branchId, limit = 10 } = req.query;

    const where = {
      order: {
        status: 'complete'
      }
    };

    if (startDate || endDate) {
      where.order.createdAt = {};
      if (startDate) where.order.createdAt.gte = new Date(startDate);
      if (endDate) where.order.createdAt.lte = new Date(endDate);
    }

    if (branchId) {
      where.order.branchId = parseInt(branchId);
    }

    const topProducts = await prisma.orderItem.findMany({
      where,
      include: {
        variant: {
          include: {
            product: {
              include: {
                category: true,
                brand: true
              }
            }
          }
        }
      },
      orderBy: { quantity: 'desc' },
      take: parseInt(limit)
    });

    // Aggregate by product
    const productStats = {};
    topProducts.forEach(item => {
      const productId = item.variant.productId;
      if (!productStats[productId]) {
        productStats[productId] = {
          productId,
          productName: item.variant.product.nameEn,
          category: item.variant.product.category.nameEn,
          brand: item.variant.product.brand?.nameEn || 'N/A',
          totalQuantitySold: 0,
          totalRevenue: 0,
          orderCount: 0
        };
      }
      productStats[productId].totalQuantitySold += item.quantity;
      productStats[productId].totalRevenue += item.totalPrice;
      productStats[productId].orderCount += 1;
    });

    const sortedProducts = Object.values(productStats)
      .sort((a, b) => b.totalQuantitySold - a.totalQuantitySold)
      .slice(0, limit);

    res.json({
      success: true,
      data: sortedProducts
    });
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top products',
      error: error.message
    });
  }
};

// Get customer report
exports.getCustomerReport = async (req, res) => {
  try {
    const { startDate, endDate, branchId } = req.query;

    const where = {
      status: 'complete'
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (branchId) {
      where.branchId = parseInt(branchId);
    }

    const customerStats = await prisma.order.groupBy({
      by: ['customerId'],
      where,
      _count: true,
      _sum: { total: true }
    });

    const customersWithDetails = await Promise.all(
      customerStats
        .filter(stat => stat.customerId !== null)
        .map(async (stat) => {
          const customer = await prisma.customer.findUnique({
            where: { id: stat.customerId },
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              createdAt: true
            }
          });

          return {
            ...customer,
            orderCount: stat._count,
            totalSpent: stat._sum.total || 0,
            averageOrderValue: (stat._sum.total || 0) / stat._count
          };
        })
    );

    const sortedCustomers = customersWithDetails
      .sort((a, b) => b.totalSpent - a.totalSpent);

    res.json({
      success: true,
      data: sortedCustomers
    });
  } catch (error) {
    console.error('Error fetching customer report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer report',
      error: error.message
    });
  }
};

// Get inventory report
exports.getInventoryReport = async (req, res) => {
  try {
    const { branchId, lowStockOnly = false } = req.query;

    const where = {};
    if (branchId) {
      where.branchId = parseInt(branchId);
    }

    const stockLevels = await prisma.branchStock.findMany({
      where,
      include: {
        variant: {
          include: {
            product: {
              include: {
                category: true,
                brand: true
              }
            }
          }
        },
        branch: true
      }
    });

    let filteredStock = stockLevels;
    if (lowStockOnly === 'true') {
      filteredStock = stockLevels.filter(stock => 
        stock.quantity <= stock.lowStockThreshold
      );
    }

    const inventorySummary = {
      totalProducts: stockLevels.length,
      lowStockCount: stockLevels.filter(s => s.quantity <= s.lowStockThreshold).length,
      outOfStockCount: stockLevels.filter(s => s.quantity === 0).length,
      totalValue: 0,
      items: filteredStock.map(stock => ({
        branchId: stock.branchId,
        branchName: stock.branch.name,
        productId: stock.variant.productId,
        productName: stock.variant.product.nameEn,
        sku: stock.variant.sku,
        category: stock.variant.product.category.nameEn,
        brand: stock.variant.product.brand?.nameEn || 'N/A',
        quantity: stock.quantity,
        lowStockThreshold: stock.lowStockThreshold,
        status: stock.quantity === 0 ? 'out_of_stock' : 
               stock.quantity <= stock.lowStockThreshold ? 'low_stock' : 'in_stock',
        unitPrice: stock.variant.priceOverride || stock.variant.product.discountPrice || stock.variant.product.price,
        totalValue: stock.quantity * (stock.variant.priceOverride || stock.variant.product.discountPrice || stock.variant.product.price)
      }))
    };

    inventorySummary.totalValue = inventorySummary.items.reduce((sum, item) => sum + item.totalValue, 0);

    res.json({
      success: true,
      data: inventorySummary
    });
  } catch (error) {
    console.error('Error fetching inventory report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory report',
      error: error.message
    });
  }
};

// ===========================
// ANALYTICS DASHBOARD
// ===========================

// Get dashboard analytics
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const { branchId } = req.query;

    const where = {};
    if (branchId) {
      where.branchId = parseInt(branchId);
    }

    // Today's stats
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // This month stats
    const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
    const monthEnd = new Date(todayStart.getFullYear(), todayStart.getMonth() + 1, 0, 23, 59, 59, 999);

    // Last month stats for comparison
    const lastMonthStart = new Date(todayStart.getFullYear(), todayStart.getMonth() - 1, 1);
    const lastMonthEnd = new Date(todayStart.getFullYear(), todayStart.getMonth(), 0, 23, 59, 59, 999);

    const [
      // Today's orders
      todayOrders,
      todayRevenue,
      // This month orders
      thisMonthOrders,
      thisMonthRevenue,
      // Last month orders
      lastMonthOrders,
      lastMonthRevenue,
      // Overall stats
      totalOrders,
      totalRevenue,
      totalCustomers,
      totalProducts,
      // Pending orders
      pendingOrders,
      // Low stock count
      lowStockItems
    ] = await Promise.all([
      // Today
      prisma.order.count({
        where: {
          ...where,
          createdAt: { gte: todayStart, lte: todayEnd }
        }
      }),
      prisma.order.aggregate({
        where: {
          ...where,
          status: 'complete',
          paymentStatus: 'paid',
          createdAt: { gte: todayStart, lte: todayEnd }
        },
        _sum: { total: true }
      }),
      // This month
      prisma.order.count({
        where: {
          ...where,
          createdAt: { gte: monthStart, lte: monthEnd }
        }
      }),
      prisma.order.aggregate({
        where: {
          ...where,
          status: 'complete',
          paymentStatus: 'paid',
          createdAt: { gte: monthStart, lte: monthEnd }
        },
        _sum: { total: true }
      }),
      // Last month
      prisma.order.count({
        where: {
          ...where,
          createdAt: { gte: lastMonthStart, lte: lastMonthEnd }
        }
      }),
      prisma.order.aggregate({
        where: {
          ...where,
          status: 'complete',
          paymentStatus: 'paid',
          createdAt: { gte: lastMonthStart, lte: lastMonthEnd }
        },
        _sum: { total: true }
      }),
      // Overall
      prisma.order.count({ where }),
      prisma.order.aggregate({
        where: { ...where, status: 'complete', paymentStatus: 'paid' },
        _sum: { total: true }
      }),
      prisma.customer.count(),
      prisma.product.count({ where: { status: 'active' } }),
      prisma.order.count({ where: { ...where, status: 'pending' } }),
      prisma.branchStock.count({
        where: {
          ...(branchId ? { branchId: parseInt(branchId) } : {}),
          quantity: { lte: prisma.ref('lowStockThreshold') }
        }
      })
    ]);

    // Calculate growth percentages
    const monthGrowth = lastMonthOrders > 0 
      ? ((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100 
      : 0;
    
    const revenueGrowth = lastMonthRevenue._sum.total && lastMonthRevenue._sum.total > 0
      ? ((thisMonthRevenue._sum.total - lastMonthRevenue._sum.total) / lastMonthRevenue._sum.total) * 100
      : 0;

    res.json({
      success: true,
      data: {
        today: {
          orders: todayOrders,
          revenue: todayRevenue._sum.total || 0
        },
        thisMonth: {
          orders: thisMonthOrders,
          revenue: thisMonthRevenue._sum.total || 0,
          growth: {
            orders: monthGrowth,
            revenue: revenueGrowth
          }
        },
        overall: {
          totalOrders,
          totalRevenue: totalRevenue._sum.total || 0,
          totalCustomers,
          totalProducts,
          pendingOrders,
          lowStockItems
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard analytics',
      error: error.message
    });
  }
};

// Get order status breakdown
exports.getOrderStatusBreakdown = async (req, res) => {
  try {
    const { branchId, startDate, endDate } = req.query;

    const where = {};
    if (branchId) {
      where.branchId = parseInt(branchId);
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const statusBreakdown = await prisma.order.groupBy({
      by: ['status'],
      where,
      _count: true,
      _sum: { total: true }
    });

    const orderTypeBreakdown = await prisma.order.groupBy({
      by: ['orderType'],
      where,
      _count: true,
      _sum: { total: true }
    });

    const paymentStatusBreakdown = await prisma.order.groupBy({
      by: ['paymentStatus'],
      where,
      _count: true,
      _sum: { total: true }
    });

    res.json({
      success: true,
      data: {
        byStatus: statusBreakdown.map(item => ({
          status: item.status,
          count: item._count,
          revenue: item._sum.total || 0
        })),
        byOrderType: orderTypeBreakdown.map(item => ({
          type: item.orderType,
          count: item._count,
          revenue: item._sum.total || 0
        })),
        byPaymentStatus: paymentStatusBreakdown.map(item => ({
          status: item.paymentStatus,
          count: item._count,
          revenue: item._sum.total || 0
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching order status breakdown:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order status breakdown',
      error: error.message
    });
  }
};

// Get daily sales trend (last 30 days)
exports.getDailySalesTrend = async (req, res) => {
  try {
    const { branchId, days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const where = {
      status: 'complete',
      paymentStatus: 'paid',
      createdAt: { gte: startDate }
    };

    if (branchId) {
      where.branchId = parseInt(branchId);
    }

    const dailySales = await prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m-%d') as date,
        COUNT(*) as orderCount,
        SUM(total) as revenue,
        AVG(total) as averageOrderValue
      FROM orders
      WHERE status = 'complete' 
        AND paymentStatus = 'paid'
        AND created_at >= ${startDate}
        ${branchId ? prisma.sql`AND branch_id = ${branchId}` : prisma.sql``}
      GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
      ORDER BY date ASC
    `;

    res.json({
      success: true,
      data: dailySales
    });
  } catch (error) {
    console.error('Error fetching daily sales trend:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch daily sales trend',
      error: error.message
    });
  }
};

// Export report to CSV
exports.exportReport = async (req, res) => {
  try {
    const { type, startDate, endDate, branchId } = req.query;

    let data;
    let headers;
    let filename;

    switch (type) {
      case 'orders':
        data = await prisma.order.findMany({
          where: {
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            },
            ...(branchId ? { branchId: parseInt(branchId) } : {})
          },
          include: {
            customer: true,
            branch: true,
            orderItems: true
          },
          orderBy: { createdAt: 'desc' }
        });
        headers = ['Order Number', 'Date', 'Customer', 'Branch', 'Type', 'Status', 'Total'];
        filename = `orders_report_${startDate}_to_${endDate}.csv`;
        break;

      case 'products':
        data = await prisma.product.findMany({
          include: {
            category: true,
            brand: true,
            productVariants: {
              include: {
                branchStock: true
              }
            }
          }
        });
        headers = ['Product Name', 'SKU', 'Category', 'Brand', 'Price', 'Stock'];
        filename = `products_report_${new Date().toISOString().split('T')[0]}.csv`;
        break;

      case 'customers':
        data = await prisma.customer.findMany({
          include: {
            orders: {
              select: { total: true, createdAt: true }
            }
          }
        });
        headers = ['Name', 'Phone', 'Email', 'Total Orders', 'Total Spent'];
        filename = `customers_report_${new Date().toISOString().split('T')[0]}.csv`;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }

    res.json({
      success: true,
      data: {
        headers,
        rows: data,
        filename
      }
    });
  } catch (error) {
    console.error('Error exporting report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export report',
      error: error.message
    });
  }
};
