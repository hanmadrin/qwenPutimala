const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

// Courier API configuration (example with Pathao - replace with actual courier service)
const COURIER_CONFIG = {
  apiBaseUrl: process.env.COURIER_API_URL || 'https://api.pathaocouriers.com',
  apiKey: process.env.COURIER_API_KEY,
  storeId: process.env.COURIER_STORE_ID,
};

// Create shipment
exports.createShipment = async (req, res) => {
  try {
    const { orderId, courierService, recipientName, recipientPhone, recipientAddress, recipientCity, parcelWeight, parcelDimensions, codAmount } = req.body;

    if (!orderId || !recipientName || !recipientPhone || !recipientAddress || !recipientCity) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, recipient name, phone, address, and city are required'
      });
    }

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        branch: true,
        orderItems: {
          include: {
            variant: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status === 'cancelled' || order.status === 'complete') {
      return res.status(400).json({
        success: false,
        message: 'Cannot create shipment for cancelled or completed orders'
      });
    }

    // Check if shipment already exists
    const existingShipment = await prisma.shipment.findFirst({
      where: { orderId: parseInt(orderId) }
    });

    if (existingShipment) {
      return res.status(400).json({
        success: false,
        message: 'Shipment already exists for this order'
      });
    }

    // Prepare shipment data for courier API
    const courierShipmentData = {
      store_id: COURIER_CONFIG.storeId,
      recipient_name: recipientName,
      recipient_phone: recipientPhone,
      recipient_address: recipientAddress,
      recipient_city: recipientCity,
      parcel_weight: parcelWeight || 1,
      parcel_dimensions: parcelDimensions || '10x10x10',
      cod_amount: codAmount || order.total,
      items: order.orderItems.map(item => ({
        name: item.productName,
        quantity: item.quantity,
        price: item.unitPrice
      }))
    };

    let trackingNumber = null;
    let courierResponse = null;
    let shippingCost = 0;

    // If courier service is specified, call their API
    if (courierService) {
      try {
        const response = await axios.post(
          `${COURIER_CONFIG.apiBaseUrl}/shipments`,
          courierShipmentData,
          {
            headers: {
              'Authorization': `Bearer ${COURIER_CONFIG.apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data && response.data.success) {
          trackingNumber = response.data.tracking_number;
          courierResponse = response.data;
          shippingCost = response.data.shipping_cost || 0;
        }
      } catch (error) {
        console.error('Courier API error:', error.message);
        // Continue without courier API integration (manual shipment)
      }
    }

    // Create shipment in database
    const shipment = await prisma.$transaction(async (tx) => {
      const newShipment = await tx.shipment.create({
        data: {
          orderId: parseInt(orderId),
          trackingNumber: trackingNumber || `TRK${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          courierService: courierService || 'manual',
          courierTrackingUrl: courierResponse?.tracking_url || null,
          status: 'pending',
          shippingCost,
          codAmount: codAmount || order.total,
          recipientName,
          recipientPhone,
          recipientAddress,
          recipientCity,
          parcelWeight: parcelWeight || 1,
          estimatedDeliveryDays: courierResponse?.estimated_days || 3,
          metadata: courierResponse || {}
        }
      });

      // Update order status to processing/shipped
      await tx.order.update({
        where: { id: parseInt(orderId) },
        data: {
          status: 'processing',
          shippedAt: new Date()
        }
      });

      // Add order status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: parseInt(orderId),
          oldStatus: order.status,
          newStatus: 'processing',
          changedBy: req.user?.id || 1,
          note: `Shipment created${trackingNumber ? ` with tracking: ${trackingNumber}` : ''}`
        }
      });

      return newShipment;
    });

    res.status(201).json({
      success: true,
      message: 'Shipment created successfully',
      data: shipment
    });
  } catch (error) {
    console.error('Error creating shipment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create shipment',
      error: error.message
    });
  }
};

// Get all shipments with filtering
exports.getShipments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, courierService, orderId, search } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};

    if (status) {
      where.status = status;
    }

    if (courierService) {
      where.courierService = courierService;
    }

    if (orderId) {
      where.orderId = parseInt(orderId);
    }

    if (search) {
      where.OR = [
        { trackingNumber: { contains: search, mode: 'insensitive' } },
        { recipientName: { contains: search, mode: 'insensitive' } },
        { recipientPhone: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [shipments, total] = await Promise.all([
      prisma.shipment.findMany({
        where,
        skip,
        take,
        include: {
          order: {
            select: {
              orderNumber: true,
              total: true,
              customer: {
                select: {
                  name: true,
                  phone: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.shipment.count({ where })
    ]);

    res.json({
      success: true,
      data: shipments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / take),
        totalItems: total,
        itemsPerPage: take
      }
    });
  } catch (error) {
    console.error('Error fetching shipments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shipments',
      error: error.message
    });
  }
};

// Get single shipment by ID
exports.getShipmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const shipment = await prisma.shipment.findUnique({
      where: { id: parseInt(id) },
      include: {
        order: {
          include: {
            orderItems: {
              include: {
                variant: {
                  include: {
                    product: true
                  }
                }
              }
            },
            customer: true,
            branch: true
          }
        }
      }
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    res.json({
      success: true,
      data: shipment
    });
  } catch (error) {
    console.error('Error fetching shipment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shipment',
      error: error.message
    });
  }
};

// Update shipment status
exports.updateShipmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, location, note } = req.body;

    const validStatuses = ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const shipment = await prisma.shipment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    const updatedShipment = await prisma.$transaction(async (tx) => {
      // Update shipment status
      const updated = await tx.shipment.update({
        where: { id: parseInt(id) },
        data: { status }
      });

      // Add shipment status history
      await tx.shipmentStatusHistory.create({
        data: {
          shipmentId: parseInt(id),
          oldStatus: shipment.status,
          newStatus: status,
          location: location || null,
          note: note || `Status changed from ${shipment.status} to ${status}`,
          changedBy: req.user?.id || 1
        }
      });

      // If delivered, update order status
      if (status === 'delivered') {
        await tx.order.update({
          where: { id: shipment.orderId },
          data: {
            status: 'complete',
            deliveredAt: new Date()
          }
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: shipment.orderId,
            oldStatus: 'shipped',
            newStatus: 'complete',
            changedBy: req.user?.id || 1,
            note: 'Order marked as complete - delivered successfully'
          }
        });
      }

      // If failed/returned, update order status
      if (status === 'failed' || status === 'returned') {
        await tx.order.update({
          where: { id: shipment.orderId },
          data: {
            status: 'returned'
          }
        });
      }

      return updated;
    });

    res.json({
      success: true,
      message: 'Shipment status updated successfully',
      data: updatedShipment
    });
  } catch (error) {
    console.error('Error updating shipment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update shipment status',
      error: error.message
    });
  }
};

// Track shipment by tracking number
exports.trackShipment = async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    const shipment = await prisma.shipment.findFirst({
      where: { trackingNumber },
      include: {
        order: {
          select: {
            orderNumber: true,
            status: true
          }
        },
        shipmentStatusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found with this tracking number'
      });
    }

    // If courier service has tracking API, fetch latest updates
    let courierTrackingData = null;
    if (shipment.courierService !== 'manual' && shipment.courierTrackingUrl) {
      try {
        const response = await axios.get(shipment.courierTrackingUrl, {
          headers: {
            'Authorization': `Bearer ${COURIER_CONFIG.apiKey}`
          }
        });
        courierTrackingData = response.data;
      } catch (error) {
        console.error('Courier tracking API error:', error.message);
      }
    }

    res.json({
      success: true,
      data: {
        ...shipment,
        courierTrackingData,
        trackingHistory: shipment.shipmentStatusHistory.map(h => ({
          status: h.newStatus,
          location: h.location,
          note: h.note,
          timestamp: h.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Error tracking shipment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track shipment',
      error: error.message
    });
  }
};

// Delete shipment (only pending)
exports.deleteShipment = async (req, res) => {
  try {
    const { id } = req.params;

    const shipment = await prisma.shipment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    if (shipment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending shipments can be deleted'
      });
    }

    await prisma.shipment.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Shipment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting shipment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete shipment',
      error: error.message
    });
  }
};

// Get shipment statistics
exports.getShipmentStats = async (req, res) => {
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
      totalShipments,
      pendingShipments,
      inTransitShipments,
      deliveredShipments,
      failedShipments,
      totalShippingCost,
      totalCodAmount,
      shipmentsByCourier
    ] = await Promise.all([
      prisma.shipment.count({ where }),
      prisma.shipment.count({ where: { ...where, status: 'pending' } }),
      prisma.shipment.count({ where: { ...where, status: 'in_transit' } }),
      prisma.shipment.count({ where: { ...where, status: 'delivered' } }),
      prisma.shipment.count({ where: { ...where, status: 'failed' } }),
      prisma.shipment.aggregate({
        where: { ...where, status: 'delivered' },
        _sum: { shippingCost: true }
      }),
      prisma.shipment.aggregate({
        where: { ...where, status: 'delivered' },
        _sum: { codAmount: true }
      }),
      prisma.shipment.groupBy({
        by: ['courierService'],
        where,
        _count: true,
        _sum: { shippingCost: true, codAmount: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalShipments,
        pendingShipments,
        inTransitShipments,
        deliveredShipments,
        failedShipments,
        deliveryRate: totalShipments > 0 ? ((deliveredShipments / totalShipments) * 100).toFixed(2) : 0,
        totalShippingCost: totalShippingCost._sum.shippingCost || 0,
        totalCodAmount: totalCodAmount._sum.codAmount || 0,
        shipmentsByCourier: shipmentsByCourier.map(item => ({
          courier: item.courierService,
          count: item._count,
          totalShippingCost: item._sum.shippingCost || 0,
          totalCodAmount: item._sum.codAmount || 0
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching shipment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shipment statistics',
      error: error.message
    });
  }
};
