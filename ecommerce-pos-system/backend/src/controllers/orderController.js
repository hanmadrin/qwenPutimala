const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Generate unique order number
const generateOrderNumber = async () => {
  const date = new Date();
  const prefix = `ORD${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  
  const todayOrders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lt: new Date(date.setHours(23, 59, 59, 999))
      }
    },
    select: { orderNumber: true }
  });
  
  const sequence = String(todayOrders.length + 1).padStart(4, '0');
  return `${prefix}-${sequence}`;
};

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const {
      customerId,
      branchId,
      orderType,
      paymentMethod,
      items,
      couponCode,
      customerNote,
      shippingAddress
    } = req.body;

    // Validate required fields
    if (!branchId || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Branch and items are required' });
    }

    // Verify branch exists
    const branch = await prisma.branch.findUnique({
      where: { id: branchId }
    });

    if (!branch || branch.status === 'inactive') {
      return res.status(404).json({ success: false, message: 'Branch not found or inactive' });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true }
      });

      if (!variant || variant.status === 'inactive') {
        return res.status(404).json({ 
          success: false, 
          message: `Product variant ${item.variantId} not found or inactive` 
        });
      }

      // Check stock availability
      const branchStock = await prisma.branchStock.findUnique({
        where: {
          branchId_variantId: {
            branchId,
            variantId: item.variantId
          }
        }
      });

      if (!branchStock || branchStock.quantity < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for ${variant.product.nameEn}` 
        });
      }

      const unitPrice = variant.priceOverride || variant.product.discountPrice || variant.product.price;
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      orderItemsData.push({
        variantId: item.variantId,
        productName: variant.product.nameEn,
        sku: variant.sku,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        attributes: variant.attributes
      });
    }

    // Apply coupon if provided
    let discountAmount = 0;
    let couponId = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode }
      });

      if (coupon && coupon.status === 'active') {
        const now = new Date();
        if (now >= coupon.validFrom && now <= coupon.validUntil) {
          if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {
            if (!coupon.minOrderAmount || subtotal >= coupon.minOrderAmount) {
              if (coupon.type === 'percentage') {
                discountAmount = (subtotal * coupon.value) / 100;
                if (coupon.maxDiscount) {
                  discountAmount = Math.min(discountAmount, coupon.maxDiscount);
                }
              } else {
                discountAmount = Math.min(coupon.value, subtotal);
              }
              couponId = coupon.id;
            }
          }
        }
      }
    }

    const total = subtotal - discountAmount + (shippingAddress?.shippingCharge || 0);

    // Create transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: await generateOrderNumber(),
          customerId: customerId || null,
          branchId,
          orderType: orderType || 'online',
          status: 'pending',
          paymentStatus: 'unpaid',
          paymentMethod: paymentMethod || 'cod',
          subtotal,
          discountAmount,
          shippingCharge: shippingAddress?.shippingCharge || 0,
          total,
          couponId,
          customerNote,
          shippingName: shippingAddress?.name || '',
          shippingPhone: shippingAddress?.phone || '',
          shippingAddressLine1: shippingAddress?.addressLine1 || '',
          shippingArea: shippingAddress?.area || '',
          shippingCity: shippingAddress?.city || '',
          shippingPostcode: shippingAddress?.postcode || null,
          shippingAddressId: shippingAddress?.id || null,
          orderItems: {
            create: orderItemsData
          },
          orderStatusHistory: {
            create: {
              newStatus: 'pending',
              changedBy: req.user?.id || 1,
              note: 'Order created'
            }
          }
        },
        include: {
          orderItems: true,
          branch: true,
          customer: true
        }
      });

      // Update stock quantities
      for (const item of items) {
        await tx.branchStock.update({
          where: {
            branchId_variantId: {
              branchId,
              variantId: item.variantId
            }
          },
          data: {
            quantity: {
              decrement: item.quantity
            }
          }
        });
      }

      // Update coupon usage count
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: {
            usedCount: {
              increment: 1
            }
          }
        });
      }

      return newOrder;
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// Get all orders with filtering and pagination
exports.getOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      orderType,
      paymentStatus,
      branchId,
      customerId,
      search,
      startDate,
      endDate
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};

    if (status) {
      where.status = status;
    }

    if (orderType) {
      where.orderType = orderType;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (branchId) {
      where.branchId = parseInt(branchId);
    }

    if (customerId) {
      where.customerId = parseInt(customerId);
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { shippingName: { contains: search } },
        { shippingPhone: { contains: search } }
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true
            }
          },
          branch: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          orderItems: {
            include: {
              variant: {
                include: {
                  product: {
                    select: {
                      nameEn: true,
                      slug: true
                    }
                  }
                }
              }
            }
          },
          coupon: {
            select: {
              code: true,
              type: true,
              value: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / take),
        totalItems: total,
        itemsPerPage: take
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Get single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        },
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
            address: true,
            phone: true
          }
        },
        orderItems: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    nameEn: true,
                    nameBn: true,
                    slug: true
                  }
                }
              }
            }
          }
        },
        coupon: true,
        payments: true,
        shipments: true,
        invoice: true,
        orderStatusHistory: {
          include: {
            user: {
              select: {
                name: true,
                role: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'complete', 'cancelled', 'returned'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Prevent status change for completed/cancelled orders
    if (['complete', 'cancelled', 'returned'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change status of completed/cancelled/returned orders'
      });
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update order status
      const updated = await tx.order.update({
        where: { id: parseInt(id) },
        data: { status }
      });

      // Add status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: parseInt(id),
          oldStatus: order.status,
          newStatus: status,
          changedBy: req.user?.id || 1,
          note: note || `Status changed from ${order.status} to ${status}`
        }
      });

      // If order is cancelled, restore stock
      if (status === 'cancelled') {
        const orderItems = await tx.orderItem.findMany({
          where: { orderId: parseInt(id) }
        });

        for (const item of orderItems) {
          await tx.branchStock.update({
            where: {
              branchId_variantId: {
                branchId: order.branchId,
                variantId: item.variantId
              }
            },
            data: {
              quantity: {
                increment: item.quantity
              }
            }
          });
        }
      }

      return updated;
    });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

// Update order payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, transactionId, metadata } = req.body;

    const validStatuses = ['unpaid', 'paid', 'partial', 'refunded'];
    
    if (!paymentStatus || !validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status value'
      });
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update order payment status
      const updated = await tx.order.update({
        where: { id: parseInt(id) },
        data: { paymentStatus }
      });

      // Create payment record if paid
      if (paymentStatus === 'paid' || paymentStatus === 'partial') {
        await tx.payment.create({
          data: {
            orderId: parseInt(id),
            method: order.paymentMethod,
            transactionId: transactionId || null,
            amount: order.total,
            status: 'success',
            metadata: metadata || {}
          }
        });
      }

      return updated;
    });

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message
    });
  }
};

// Delete order (only pending orders)
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending orders can be deleted'
      });
    }

    await prisma.$transaction(async (tx) => {
      // Restore stock
      const orderItems = await tx.orderItem.findMany({
        where: { orderId: parseInt(id) }
      });

      for (const item of orderItems) {
        await tx.branchStock.update({
          where: {
            branchId_variantId: {
              branchId: order.branchId,
              variantId: item.variantId
            }
          },
          data: {
            quantity: {
              increment: item.quantity
            }
          }
        });
      }

      // Delete order (cascade will handle related records)
      await tx.order.delete({
        where: { id: parseInt(id) }
      });
    });

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete order',
      error: error.message
    });
  }
};

// Get order statistics
exports.getOrderStats = async (req, res) => {
  try {
    const { startDate, endDate, branchId } = req.query;

    const where = {};
    
    if (branchId) {
      where.branchId = parseInt(branchId);
    }

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
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      ordersByStatus
    ] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.count({ where: { ...where, status: 'pending' } }),
      prisma.order.count({ where: { ...where, status: 'complete' } }),
      prisma.order.count({ where: { ...where, status: 'cancelled' } }),
      prisma.order.aggregate({
        where: { ...where, status: 'complete', paymentStatus: 'paid' },
        _sum: { total: true }
      }),
      prisma.order.groupBy({
        by: ['status'],
        where,
        _count: true
      })
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        ordersByStatus: ordersByStatus.map(item => ({
          status: item.status,
          count: item._count
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics',
      error: error.message
    });
  }
};
