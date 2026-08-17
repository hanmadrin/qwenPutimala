const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create coupon
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      type,
      value,
      minOrderAmount,
      maxDiscount,
      validFrom,
      validUntil,
      usageLimit,
      status
    } = req.body;

    // Validate required fields
    if (!code || !type || !value || !validFrom || !validUntil) {
      return res.status(400).json({
        success: false,
        message: 'Code, type, value, validFrom, and validUntil are required'
      });
    }

    // Validate coupon type
    const validTypes = ['percentage', 'fixed'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coupon type. Must be "percentage" or "fixed"'
      });
    }

    // Validate percentage value
    if (type === 'percentage' && (value < 0 || value > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Percentage value must be between 0 and 100'
      });
    }

    // Check if code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (existingCoupon) {
      return res.status(409).json({
        success: false,
        message: 'Coupon code already exists'
      });
    }

    // Validate dates
    const fromDate = new Date(validFrom);
    const untilDate = new Date(validUntil);

    if (untilDate <= fromDate) {
      return res.status(400).json({
        success: false,
        message: 'validUntil must be after validFrom'
      });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        type,
        value: parseFloat(value),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        validFrom: fromDate,
        validUntil: untilDate,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        status: status || 'active'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create coupon',
      error: error.message
    });
  }
};

// Get all coupons with filtering and pagination
exports.getCoupons = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      search,
      activeOnly
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (activeOnly === 'true') {
      where.status = 'active';
      where.validUntil = { gte: new Date() };
    }

    if (search) {
      where.code = { contains: search.toUpperCase(), mode: 'insensitive' };
    }

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.coupon.count({ where })
    ]);

    res.json({
      success: true,
      data: coupons,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / take),
        totalItems: total,
        itemsPerPage: take
      }
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coupons',
      error: error.message
    });
  }
};

// Get single coupon by ID
exports.getCouponById = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await prisma.coupon.findUnique({
      where: { id: parseInt(id) },
      include: {
        orders: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            discountAmount: true,
            createdAt: true
          },
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    res.json({
      success: true,
      data: coupon
    });
  } catch (error) {
    console.error('Error fetching coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coupon',
      error: error.message
    });
  }
};

// Get coupon by code (for validation during checkout)
exports.getCouponByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const { orderAmount } = req.query;

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // Check if coupon is active
    if (coupon.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Coupon is inactive'
      });
    }

    // Check validity period
    const now = new Date();
    if (now < coupon.validFrom) {
      return res.status(400).json({
        success: false,
        message: 'Coupon is not yet valid'
      });
    }

    if (now > coupon.validUntil) {
      return res.status(400).json({
        success: false,
        message: 'Coupon has expired'
      });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'Coupon usage limit reached'
      });
    }

    // Check minimum order amount
    if (coupon.minOrderAmount && orderAmount && parseFloat(orderAmount) < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ${coupon.minOrderAmount} required`
      });
    }

    // Calculate discount
    let discountAmount = 0;
    const orderTotal = orderAmount ? parseFloat(orderAmount) : 0;

    if (coupon.type === 'percentage') {
      discountAmount = (orderTotal * coupon.value) / 100;
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      }
    } else {
      discountAmount = Math.min(coupon.value, orderTotal);
    }

    res.json({
      success: true,
      data: {
        ...coupon,
        applicable: true,
        discountAmount
      }
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate coupon',
      error: error.message
    });
  }
};

// Update coupon
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};

    // Build update object from request body
    const allowedFields = ['type', 'value', 'minOrderAmount', 'maxDiscount', 'validFrom', 'validUntil', 'usageLimit', 'status'];
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'type') {
          const validTypes = ['percentage', 'fixed'];
          if (!validTypes.includes(req.body[field])) {
            return res.status(400).json({
              success: false,
              message: 'Invalid coupon type'
            });
          }
          updateData[field] = req.body[field];
        } else if (['value', 'minOrderAmount', 'maxDiscount'].includes(field)) {
          updateData[field] = parseFloat(req.body[field]);
        } else if (['validFrom', 'validUntil'].includes(field)) {
          updateData[field] = new Date(req.body[field]);
        } else if (['usageLimit'].includes(field)) {
          updateData[field] = parseInt(req.body[field]);
        } else {
          updateData[field] = req.body[field];
        }
      }
    }

    // Validate dates if both provided
    if (updateData.validFrom && updateData.validUntil) {
      if (updateData.validUntil <= updateData.validFrom) {
        return res.status(400).json({
          success: false,
          message: 'validUntil must be after validFrom'
        });
      }
    }

    const coupon = await prisma.coupon.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update coupon',
      error: error.message
    });
  }
};

// Delete coupon
exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await prisma.coupon.findUnique({
      where: { id: parseInt(id) }
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // Check if coupon has been used
    if (coupon.usedCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete coupon that has been used'
      });
    }

    await prisma.coupon.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete coupon',
      error: error.message
    });
  }
};

// Get coupon statistics
exports.getCouponStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [
      totalCoupons,
      activeCoupons,
      expiredCoupons,
      totalUsage,
      totalDiscountGiven
    ] = await Promise.all([
      prisma.coupon.count({ where }),
      prisma.coupon.count({ where: { ...where, status: 'active' } }),
      prisma.coupon.count({
        where: {
          ...where,
          validUntil: { lt: new Date() }
        }
      }),
      prisma.coupon.aggregate({
        where,
        _sum: { usedCount: true }
      }),
      prisma.order.aggregate({
        where: {
          ...where,
          couponId: { not: null }
        },
        _sum: { discountAmount: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalCoupons,
        activeCoupons,
        expiredCoupons,
        totalUsage: totalUsage._sum.usedCount || 0,
        totalDiscountGiven: totalDiscountGiven._sum.discountAmount || 0
      }
    });
  } catch (error) {
    console.error('Error fetching coupon stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coupon statistics',
      error: error.message
    });
  }
};
